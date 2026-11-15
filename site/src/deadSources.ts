// docs/DESIGN.md "Code samples": the link check fetches each source one time. On a PR, a source that does not load blocks the PR.

// After 429 Too Many Requests (RFC 6585, section 4) or 503 Service Unavailable (RFC 9110, section 15.6.4), a later request can succeed.
// Another 5xx status can be temporary or permanent (RFC 9110, section 15.6), so the check also retries it.
const retry = (status: number) => status === 429 || status >= 500;
const retries = 3;
// The longest wait before a retry. A Retry-After value can be one hour or more, for example 3600 in RFC 6585, section 4.
const maxWait = 60_000;
// A YouTube watch page gives status 200 also for a video that does not exist. The YouTube oEmbed endpoint gives a 4xx status for it.
const video = /^https:\/\/((www|m)\.)?youtube\.com\/watch\?|^https:\/\/youtu\.be\//i;

// Returns the wait in ms before the retry after the given attempt (0 for the first fetch).
// Retry-After (RFC 9110, section 10.2.3) is a number of seconds or an HTTP date. Without a valid Retry-After, the waits are 1 s, 2 s and 4 s.
function wait(retryAfter: string | null, attempt: number) {
  const ms = retryAfter === null ? NaN : /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now();
  return Math.min(Number.isNaN(ms) ? 1000 * 2 ** attempt : Math.max(ms, 0), maxWait);
}

// Returns why the URL does not load: the last HTTP status, or the error of fetch. Returns undefined if the URL gives a 2xx status.
async function failure(url: string, fetch: (url: string) => Promise<Response>, sleep: (ms: number) => Promise<unknown>) {
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      // Node fetch gives the error "fetch failed". Its cause has the system error, for example ENOTFOUND for a host that DNS does not know.
      return String((error as Error).cause ?? error);
    }
    // The check needs only the status, so it does not download the body.
    await response.body?.cancel();
    if (response.ok) return undefined;
    if (attempt === retries || !retry(response.status)) return `status ${response.status}`;
    await sleep(wait(response.headers.get('retry-after'), attempt));
  }
}

// Returns each source that does not load, with the reason. It fetches each source one time, one source after the other.
// After a 429 or a 5xx status, it waits and fetches the source again, up to 3 times.
export async function deadSources(sources: readonly string[], fetch: (url: string) => Promise<Response>, sleep: (ms: number) => Promise<unknown>) {
  const dead = new Map<string, string>();
  for (const source of new Set(sources)) {
    const url = video.test(source) ? `https://www.youtube.com/oembed?url=${encodeURIComponent(source)}&format=json` : source;
    const reason = await failure(url, fetch, sleep);
    if (reason) dead.set(source, reason);
  }
  return dead;
}
