// docs/DESIGN.md "Code samples": the link check fetches each source one time. On a PR, a source that does not load blocks the PR.

// After 429 Too Many Requests (RFC 6585, section 4) or 503 Service Unavailable (RFC 9110, section 15.6.4), a later request can succeed.
// Another 5xx status can be temporary or permanent (RFC 9110, section 15.6), so the check also retries it.
const retry = (status: number) => status === 429 || status >= 500;
const retries = 3;
// The longest wait before a retry. A Retry-After value can be one hour or more, for example 3600 in RFC 6585, section 4.
const maxWait = 60_000;
// A YouTube watch page gives status 200 also for a video that does not exist. The YouTube oEmbed endpoint gives a 4xx status for it.
const video = /^https?:\/\/((www|m)\.)?youtube\.com\/(watch\?|live\/)|^https?:\/\/youtu\.be\//i;

// Returns the wait in ms before the retry after the given attempt (0 for the first fetch).
// Retry-After (RFC 9110, section 10.2.3) is a number of seconds or an HTTP date. Without a valid Retry-After, the waits are 1 s, 2 s and 4 s.
function wait(retryAfter: string | null, attempt: number) {
  const ms = retryAfter === null ? NaN : /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now();
  return Math.min(Number.isNaN(ms) ? 1000 * 2 ** attempt : Math.max(ms, 0), maxWait);
}

// Returns why the URL does not load: the last HTTP status, or the last error of fetch. Returns undefined if the URL gives a 2xx status.
async function failure(url: string, fetch: (url: string) => Promise<Response>, sleep: (ms: number) => Promise<unknown>) {
  for (let attempt = 0; ; attempt++) {
    let reason: string;
    let retryAfter: string | null = null;
    try {
      const response = await fetch(url);
      // The check needs only the status. It cancels the body, so that fetch frees the connection.
      await response.body?.cancel();
      if (response.ok) return undefined;
      reason = `status ${response.status}`;
      if (!retry(response.status)) return reason;
      retryAfter = response.headers.get('retry-after');
    } catch (error) {
      // Node fetch gives the error "fetch failed". Its cause has the system error, for example ECONNRESET. A network error can be temporary, so the check fetches again.
      reason = String((error as Error).cause ?? error);
    }
    if (attempt === retries) return reason;
    await sleep(wait(retryAfter, attempt));
  }
}

// Returns each source that does not load, with the reason. It fetches each source one time, one source after the other.
// After a 429, a 5xx status or an error of fetch, it waits and fetches the source again, up to 3 times.
export async function deadSources(sources: readonly string[], fetch: (url: string) => Promise<Response>, sleep: (ms: number) => Promise<unknown>) {
  const dead = new Map<string, string>();
  for (const source of new Set(sources)) {
    const url = video.test(source) ? `https://www.youtube.com/oembed?url=${encodeURIComponent(source)}&format=json` : source;
    const reason = await failure(url, fetch, sleep);
    if (reason) dead.set(source, reason);
  }
  return dead;
}

// The weekly source check keeps the sources that do not load in one open issue with this title.
const issueTitle = 'Sources that do not load';

// The GitHub issue calls of the weekly source check. open() gives the open issues of the repo, the newest issue first.
export interface Issues {
  open(): { number: number; title: string; body: string }[];
  create(title: string, body: string): void;
  edit(number: number, body: string): void;
  comment(number: number, body: string): void;
  close(number: number, comment: string): void;
}

// Reports the result of the weekly source check in the newest open issue with the title issueTitle.
// If a source does not load, it updates the body of that issue, or opens the issue if no open issue has the title.
// If the body of that issue does not list a source that does not load, it also adds a comment with the source.
// If all sources load, it closes the issue. Thus an open issue shows only the sources that did not load at the last run. If a source does not load later, the run opens a new issue.
export function reportDeadSources(dead: ReadonlyMap<string, string>, chapters: readonly { file: string; sources: readonly string[] }[], issues: Issues) {
  const issue = issues.open().find((open) => open.title === issueTitle);
  if (dead.size === 0) {
    if (issue) issues.close(issue.number, 'All sources load. The weekly source check closes this issue.');
    return;
  }
  const lines = chapters.flatMap(({ file, sources }) => sources.filter((source) => dead.has(source)).map((source) => `- \`${file}\`: ${source} (${dead.get(source)})`));
  const body = [
    'The weekly source check found sources that do not load. Each line gives the chapter, the source and the reason.',
    lines.join('\n'),
    'If a source loads in a browser, do not change the chapter. If a source moved, make a fix PR. In the PR, make a plan amendment with the new URL, and change each citation of the source to the new URL. If a source does not exist, make a fix PR. In the PR, make a plan amendment with a new source, and cite the new source for each claim.',
    'Each run of the weekly source check updates this issue. If a source does not load and this issue does not list it, the run also adds a comment. If all sources load, the run closes this issue.',
  ].join('\n\n');
  if (!issue) {
    issues.create(issueTitle, body);
    return;
  }
  // A comment on the issue tells the maintainer about each source that the body did not list.
  const added = [...dead.keys()].filter((source) => !issue.body.includes(` ${source} (`));
  issues.edit(issue.number, body);
  if (added.length > 0) issues.comment(issue.number, `These sources do not load, and the last run did not list them:\n\n${added.map((source) => `- ${source}`).join('\n')}`);
}
