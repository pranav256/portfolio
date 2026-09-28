---
title: "An API can be a file."
description: "A small argument for scheduled jobs, ordinary JSON, and fewer moving parts."
date: "2026-11-05"
category: "Building"
featured: true
---

An API does not always need a server waiting for a request. Sometimes it needs a file that is fresh enough to be useful.

That is the idea behind [news-api](https://github.com/pranav256/news-api): global news as JSON, refreshed every two hours with GitHub Actions. A reader fetches the published data. The work of collecting it happens separately.

## Separate the work from the request

A conventional API might fetch a source, transform its response, and send the result back while a person waits. A scheduled pipeline performs the first two steps ahead of time.

The request becomes much less interesting. That can be a useful property.

```text
Scheduled job
  → collect source data
  → normalize and validate
  → publish JSON

Reader
  → request the published file
```

This is a pattern, not a claim that every dataset should be static. It works when many readers can share the same result and the data does not need to change with every request.

## Freshness is part of the interface

Two hours is a tradeoff. A news reader should show when its data was last updated. A successful request does not prove that the news is current.

An update-time field can make that distinction explicit:

```json
{
  "updatedAt": "2026-11-05T08:00:00Z",
  "articles": []
}
```

This example illustrates a possible response contract. Consumers should use the actual fields documented by the source they choose.

## Keep the last useful result

An upstream service can be unavailable. A scheduled job can be delayed. A feed can arrive with an unexpected shape.

A resilient publishing pipeline validates a candidate before replacing the last successful output. Its failure mode should preserve usable data and make its age visible. An empty response that looks successful is often harder for a reader to understand than an explicit stale-data message.

The same idea applies to release indexes, documentation search, public datasets, and small dashboards. If the expensive work can happen before a request, it is worth considering.

## Less infrastructure, more clarity

There are still things to maintain: source permissions, scheduling, validation, hosting limits, and attribution. A static file does not remove those responsibilities. It gives each one a clear place to live.

That is the appeal of this approach. The architecture is small enough to explain, inspect, and improve without having to understand a service fleet first.

[Explore the news-api repository ↗](https://github.com/pranav256/news-api)
