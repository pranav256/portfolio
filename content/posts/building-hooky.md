---
title: "Building Hooky: turning long videos into short clips"
description: "How a Python video pipeline grew into a local studio, with fixes for captions, authentication, slow processing, and duplicate outputs."
date: "2026-11-06"
category: "Building"
featured: true
---

Hooky brings video discovery, moment selection, vertical framing, captions, and publishing preparation into one pipeline. Making those jobs work together produced a much longer list of problems than simply cutting a video.

The public history starts with a resumable reel pipeline in September 2026. The code initially lived under `reelclip`, then became Ziv, and was renamed to Hooky in October. This is a build log of that progression, including the fixes that explain how the project reached its current shape.

## Start with a pipeline that can resume

The [first recorded commit](https://github.com/pranav256/Hooky/commit/7c9beebb18b020d4416fbba0363ff76324294411), on 16 September, established a resumable Instagram reel pipeline. Recovery was part of the foundation.

A video workflow is expensive to repeat. Downloads, transcription, model requests, subtitle generation, and encoding can each succeed before a later stage fails. Restarting every stage throws away useful work. Hooky's core separates those responsibilities into modules for downloading, transcripts, highlight selection, cutting, checkpoints, cleanup, and the publishing queue.

The basic path is:

~~~text
Video source
  -> timed transcript
  -> selected moments
  -> captions
  -> vertical encoding
  -> saved clips
  -> optional publishing
~~~

The source list eventually became two ordinary files: `channels.txt` for discovery and `links.txt` for specific videos or local files. October commits moved source management into text files and made the links file the default workflow. That gave the pipeline inputs that could be inspected and edited outside the application.

Rendering and publishing remain separate concerns. A rendered file is useful even if an upload cannot finish, and an uncertain upload result needs review before a retry can safely proceed.

## YouTube authentication needed its own diagnosis

One of the earliest fixes was [YouTube cookie authentication](https://github.com/pranav256/Hooky/commit/f3e4eb77f9a595a65b4b4753ea97706881288323).

A request rejected by YouTube can look like a broken downloader. Re-running FFmpeg or changing a Python dependency does not address a request that requires a valid signed-in session. The fix introduced an authentication-specific error, recognized messages such as “sign in to confirm,” and printed instructions tied to the configured cookie method.

It also validated the configuration. Browser-cookie extraction and an exported cookie file were made mutually exclusive; unsupported browser names and missing cookie files received direct errors. A metadata probe could check access without downloading the video.

That distinction helps locate a failure. Download access, caption availability, model configuration, and encoding each need their own diagnosis. A single “pipeline failed” message leaves too much work for the person trying to recover.

## Reusing captions reduced unnecessary work

The same September fix skipped the full-video analysis proxy when source transcripts were already available. A later [caption and cleanup change](https://github.com/pranav256/Hooky/commit/c24a8ad9d568042d8e52b5f2e803bc7dd5efdbff) extended the use of source captions and disposable-media cleanup.

Timed captions already contain information the selection stage needs: what was said and when. Turning a long master video into a lower-resolution proxy adds processing before that text analysis can begin.

The optimisation continued in [October's analysis-budget change](https://github.com/pranav256/Hooky/commit/92777a8e291d96e488ea8bc77366d034e03d038f). Visual fallback sampling became bounded, and extracted frames were cached using the source revision and analysis settings. A retry could reuse frames; replacing the source changed the cache identity.

On 29 October, the Web Studio gained a [selective download pipeline](https://github.com/pranav256/Hooky/commit/dd392ccc513979eca9c554b559d395e03fe64e9e). It fetched metadata and captions first, ranked non-overlapping scenes, and used yt-dlp's section download support to obtain the chosen intervals before encoding them.

Videos without captions needed another route. The next [audio fallback commit](https://github.com/pranav256/Hooky/commit/c9e44511c1354a2e7521fa1b2a2adf6fd9eb7a72) downloaded the audio stream and transcribed it with faster-whisper. The resulting words were grouped into timed dialogue cues for scene selection.

These changes reduce the work the application asks for. The repository does not provide a controlled benchmark, so I would describe the approach rather than attach a speed multiplier to it.

## Captions overflowed the vertical frame

Large animated captions can look good on a short phrase and break on a long one. The [25 October subtitle fix](https://github.com/pranav256/Hooky/commit/0654f15340e6234f04c38e5242f4c891e297dfd8) explicitly addressed text overflowing the screen.

The implementation reduced several preset sizes, introduced safer margins, and calculated a line's character budget from the video width and font size. Long phrases could wrap, and unusually wide text received additional scaling. Font-size and word-count overrides were parsed defensively.

The useful detail is the combination. Smaller type alone cannot handle every phrase. Wrapping alone cannot handle a single wide word. Caption fitting needs rules for the frame, the chosen style, and the actual text.

This also makes subtitle generation a distinct stage. Its inputs include timed words and the clip interval; its output is an ASS subtitle file that FFmpeg can burn into the video. Timing and layout can be examined before the final encode.

## Windows exposed assumptions in the queue

The [Windows compatibility fix](https://github.com/pranav256/Hooky/commit/618332f74c2268ff59dbbfd132945064c2af04b1) removed a pinned Python version and adjusted queue file handling.

The queue reader and atomic replacement code gained short, bounded retries for `PermissionError`. If access continued to fail, the application reported a queue error rather than silently resetting its history.

Path identity also needed care. The change preserved resolved paths while using case-normalized comparisons to recognize an existing clip or an alias on Windows. That matters when queue state refers to a file whose spelling differs only by letter case.

A nearby [CI change](https://github.com/pranav256/Hooky/commit/a3514d90fec3c88d3827c5b44c098311cd5d0eda) ran pytest and builds through `uv run`, so those commands used the project's virtual environment. The fixes covered both application behavior and the environment used to verify it.

## Adding a browser studio created new failure modes

The Web Studio arrived on 26 October. It provided controls for source analysis, candidate inspection, framing, subtitle settings, and output browsing. All-in-one launchers followed, checking dependencies and opening the local interface.

Once the browser could edit configuration and start processes, the local server needed tighter boundaries. The [first security change](https://github.com/pranav256/Hooky/commit/d6167c37d150db37a4b1178df15f08cb10ae72d3) restricted permitted browser origins, masked the Instagram password, and added `--` before user URLs in yt-dlp commands. That separator prevents a URL from being interpreted as another command option.

A [follow-up hardening commit](https://github.com/pranav256/Hooky/commit/af7d2f46c5fd2e0152c5a2155e1525bad76698de) added local host checks and API token authentication. It also masked the Gemini key and validated video URLs and timestamp ranges.

Those controls then exposed a usability problem: the studio could return HTTP 401 because the browser and server disagreed about the active token. The [29 October authentication fix](https://github.com/pranav256/Hooky/commit/e66bf03794a01c5cec882d9d54c298e27eb7e9d7) adjusted token delivery and credential handling.

A [second fix](https://github.com/pranav256/Hooky/commit/b9bc5f2488fd9e48dffa6c97a089454586542254) persisted the local token across restarts and gave the freshly injected server token precedence over a stale URL token. Keeping the browser and server in sync was part of making the protection usable.

## Progress logs and job inputs needed clear ownership

Two smaller fixes explain why the studio needed more than a progress bar.

The frontend polled a job and appended its entire log array repeatedly. The [log polling fix](https://github.com/pranav256/Hooky/commit/20ba6c808f820ad7a2a1d9a501570f69a82f593b) tracked the last consumed index and appended only new lines. The same commit guarded against an empty Gemini model setting.

The [subprocess and input fix](https://github.com/pranav256/Hooky/commit/8239f2f50e540fec6838c8b7ac6b526429ac55e2) launched Python with unbuffered output so logs reached the studio while work was happening.

It also wrote a dedicated links file for a single-target job. Previously, submitting one URL could add it to the shared source list before running the pipeline. A job-specific file made the submitted target explicit and avoided pulling unrelated pending sources into that run.

## The output gallery was showing intermediate footage

The latest recorded feature commit, [gallery organisation](https://github.com/pranav256/Hooky/commit/f13da8e053471b541d0a1ff19b25d97b84213b26), addressed duplicate-looking clips and a growing output directory.

The gallery's recursive scan had included cached snippets and downloaded media. The fix excluded internal cache and download folders, temporary filenames, and unfinished outputs. Finished clips were grouped into folders named after the source video, with title sanitisation for filesystem compatibility.

After a successful render, the intermediate landscape snippet was removed. Serving an output also used its relative path, with a resolved-path check to keep it inside the output directory.

This fixed a distinction the gallery needed to understand: some MP4 files are working material, and some are the result a person came to download.

## What still needs work

The main pipeline includes Gemini-backed selection, but the newer Web Studio scene ranker also uses transcript heuristics. In the reviewed code, a field named `retention_score` is assigned from rank rather than measured audience behavior. It should be understood as an internal ordering signal. It cannot establish how a published video will perform.

Likewise, selective downloading still depends on source access and caption or transcription quality. Local authentication changes do not establish that the studio is ready to expose publicly. The code and tests document particular protections, not a complete deployment assessment.

The next steps should make candidate scores easier to interpret and partial rendering outcomes clearer. The complete browser-to-process workflow also needs checks under failures and restarts.

[Browse Hooky's source](https://github.com/pranav256/Hooky/tree/f13da8e053471b541d0a1ff19b25d97b84213b26) and [development history](https://github.com/pranav256/Hooky/commits/main/). This article follows the public commits and code reviewed on 6 November 2026; the development dates above are recorded commit dates.
