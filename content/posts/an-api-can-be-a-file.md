---
title: "Building news-api: fresh news from static JSON"
description: "How a scheduled Python scraper evolved around API quotas, empty country feeds, compatibility, downtime, and honest refresh timestamps."
date: "2026-11-06"
category: "Building"
featured: true
---

news-api started with a small arrangement: fetch headlines on a schedule, write them into JSON files, and commit the result to GitHub. Anyone consuming the published files could read the data without supplying an API key.

Keeping that arrangement useful over time meant dealing with upstream limits, unsuccessful refreshes, and clients that already depended on the original URLs. The history stretches from February 2022 to the current Python scraper, with an actual downtime report along the way.

## The first version published twenty-one files

The [initial source commit](https://github.com/pranav256/news-api/commit/2e19411e0124d8d16f3cf5300990e4b815edea68), on 26 February 2022, looped over three countries and seven categories. It called NewsAPI and wrote each response to a country/category path.

India used `in`, the United States `us`, and the United Kingdom `gb`. Categories included general, business, health, science, sports, technology, and entertainment.

The first GitHub Actions workflow was added the same day. The publishing model kept collection separate from reading:

~~~text
GitHub Actions
  -> run the Python scraper
  -> write country/category JSON
  -> commit changed files

Consumer
  -> request the published JSON file
~~~

The current public paths preserve that structure. One example is:

~~~text
https://raw.githubusercontent.com/pranav256/news-api/main/us/general.json
~~~

No application server in this repository has to handle that request. GitHub serves the file, and the scheduled job does the collection beforehand.

The tradeoff is freshness. A consumer receives the last published result, which may be older than the latest attempted run.

## Downtime became a public issue

On 27 February 2023, someone opened [issue #1, “api stopped working”](https://github.com/pranav256/news-api/issues/1). The report asked for a fix but did not include diagnostics.

My February 2024 reply said that the API was operational again after temporary downtime. The issue is closed.

That establishes a real availability problem and a later report of recovery. It does not establish the root cause, exact outage duration, or the commit that repaired it. The later quota and feed changes should not be presented as a proven explanation of that earlier incident.

It does show why a scheduled data project needs something more informative than a successful download. A client can fetch an old file successfully even while collection has stopped.

## Expanding collection exposed a budget problem

The original script mapped one environment-variable API key to each category. A [July 2026 rewrite](https://github.com/pranav256/news-api/commit/bc800a75ae4768f276aeab43cd8d081490843881) moved toward key rotation, retries, paginated headlines, and deeper category searches.

That version printed a projected daily request count. Its budget was mainly a calculation shown in the logs; the current code places a limit on requests before they happen.

The [October rewrite](https://github.com/pranav256/news-api/commit/23fc4433e34ed4257e678c5162289070ce45ee0d) introduced a request-budget object. Each attempted NewsAPI call consumes budget, including retries. Exhausted or invalid keys can be disabled for the remainder of the run.

The code uses a budget assumption of 100 requests per day per key, twelve scheduled runs per day, and a 20 percent reserve:

~~~text
run budget = floor(keys × 100 × 0.80 / 12)
~~~

With one configured key, that permits six NewsAPI attempts in a run. RSS requests use a separate path and do not consume that counter.

This is an application-side cap, not a ledger of every request ever made with a key. Manual runs and other applications using the same credentials still need consideration. The key point is that collection now has an enforceable bound instead of only a forecast.

## Empty successful responses defeated the old fallback

The July version tried country-based headline queries and switched to source-based queries when the request failed.

An empty response with `status: "ok"` could pass through that logic. There was no exception to trigger the fallback, even though the feed had no useful stories. The current source specifically identifies empty successful results for India and the UK as a reason to collect RSS.

The October approach uses RSS feeds for every country/category pair and NewsAPI for US headline requests and deeper searches when budget permits. Publisher feeds include sources such as NDTV and The Hindu for India, and BBC feeds for the UK.

RSS, or Really Simple Syndication, is a publisher's structured feed of articles. The parser handles RSS and Atom formats, turns their entries into NewsAPI-shaped article objects, cleans text, and normalizes dates where possible.

Articles from the providers are merged and deduplicated by URL. Missing links are excluded, and results are bounded. Deep-search files can use the cached RSS category result when NewsAPI supplies no useful articles.

The architecture can continue producing data without a configured NewsAPI key:

~~~bash
python main.py --rss-only
~~~

That is also a useful local mode. The public reader needs no key, and RSS-only collection gives the producer a route that does not need one either.

## Compatibility meant keeping two kinds of output

The July code wrote enriched files under `data/`, while existing consumers used the original country/category paths. The October rewrite restored and preserved that original response contract alongside richer output.

The root files contain `status`, `totalResults`, and `articles`. Additional metadata lives in:

~~~text
data/{country}/{category}_headlines.json
data/{country}/{category}_everything.json
data/status.json
~~~

Headline files include the collection timestamp and providers. The deeper files include category searches or their RSS fallback. The status file records the run's outcomes.

This separation let the collection pipeline grow without requiring every existing consumer to adopt a new response shape at the same time. The old environment-variable key names are supported too, alongside `NEWSAPI_KEYS`, and duplicate or empty keys are filtered out.

## A failed refresh must not look like fresh data

The most focused reliability change was [6 October's feed-freshness commit](https://github.com/pranav256/news-api/commit/840f29cf45dd8af24ba3a9b9007b7b697a3ee4b3).

The earlier October implementation already avoided replacing headline files when every provider failed. The follow-up added per-feed outcomes and preserved the last successful timestamp in the status report.

It separates three situations:

- At least one provider succeeds with articles: publish the new feed and its refresh time.
- A provider succeeds with an empty feed: publish an empty result with the real refresh time.
- Every provider fails: retain the previous files and their previous successful refresh time.

A timestamp saying when a status file was generated cannot stand in for when a feed last refreshed successfully. The report therefore distinguishes `generated_at`, `run_started_at`, `attempted_at`, and `last_successful_refresh`.

The per-feed status is `updated` or `retained`. Where old metadata is unavailable, the successful refresh time remains unavailable too.

This makes a partial failure visible without discarding the last useful data. It also lets a reader show that a feed was retained after a failed attempt.

## Defensive parsing and file writes needed verification

The freshness commit hardened provider parsing as well. An `articles` collection might be a list containing invalid items, or might have the wrong type altogether. The code checks the collection and each item before using them.

The [fixture tests](https://github.com/pranav256/news-api/blob/840f29cf45dd8af24ba3a9b9007b7b697a3ee4b3/tests/test_main.py) cover those malformed collections, RSS and Atom parsing, deduplication, key loading, and request budgets.

Two persistence tests are especially relevant. One compares the old feed before and after a failed refresh and checks that its successful timestamp is retained. Another verifies that a successful empty feed is actually published.

JSON files are written through a temporary file in the destination directory and then replaced. That reduces the risk of a partially written file. The root file, rich feed, and status file are still separate writes; the implementation does not make the entire set one filesystem transaction.

## The schedule is a target, not a freshness guarantee

The [current workflow](https://github.com/pranav256/news-api/blob/23fc4433e34ed4257e678c5162289070ce45ee0d/.github/workflows/main.yml) requests a run every two hours and applies a fifteen-minute job timeout. It uses a concurrency group and commits only when generated files change.

The history includes gaps longer than two hours between data commits. Changed-file commits are evidence of publication, not a complete record of attempted or successful collection. Consumers should inspect feed timestamps rather than infer age from the cron expression.

The current status file can also report `partial` while the script exits successfully. That permits usable partial results to be published, but a green workflow alone does not prove that every provider or country refreshed.

The next improvements should make retained-feed age easy for consumers to interpret, monitor repeated provider failures, and check behavior when publishing is interrupted between files. The twenty-one public paths can stay simple while the pipeline becomes more explicit about the data behind them.

[Read news-api's source](https://github.com/pranav256/news-api/tree/840f29cf45dd8af24ba3a9b9007b7b697a3ee4b3) and [commit history](https://github.com/pranav256/news-api/commits/main/). This article uses the public code, issue discussion, and recorded commits reviewed on 6 November 2026.
