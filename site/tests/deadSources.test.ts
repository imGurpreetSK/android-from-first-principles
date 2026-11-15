import { expect, test } from 'vitest';
import { deadSources, reportDeadSources } from '../src/deadSources';

const page = 'https://developer.android.com/guide/components/activities/activity-lifecycle';
const code = 'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java';

const status = (value: number, retryAfter?: string) => new Response(null, { status: value, headers: retryAfter ? { 'retry-after': retryAfter } : {} });

// Runs deadSources with a fake fetch and a fake sleep. The fake fetch gives the next result in the list of the URL.
// It records each URL that it fetches and each wait.
async function check(sources: string[], results: Record<string, (Response | Error)[]>) {
  const fetched: string[] = [];
  const waits: number[] = [];
  const fetch = async (url: string) => {
    fetched.push(url);
    const result = results[url].shift();
    if (!result) throw new Error(`No more results for ${url}`);
    if (result instanceof Error) throw result;
    return result;
  };
  const dead = await deadSources(sources, fetch, async (ms) => waits.push(ms));
  return { dead: Object.fromEntries(dead), fetched, waits };
}

test('accepts a source that loads, and fetches each source one time', async () => {
  expect(await check([page, code, page], { [page]: [status(200)], [code]: [status(204)] })).toEqual({ dead: {}, fetched: [page, code], waits: [] });
});

test('rejects a source with status 404 or 410, and does not fetch it again', async () => {
  expect(await check([page, code], { [page]: [status(404)], [code]: [status(410)] })).toEqual({
    dead: { [page]: 'status 404', [code]: 'status 410' },
    fetched: [page, code],
    waits: [],
  });
});

test('fetches a source again after a rate limit or a 5xx: it waits the Retry-After seconds, at most 60 s, or 1 s, 2 s, 4 s', async () => {
  const results = { [page]: [status(429, '5'), status(429), status(503, '3600'), status(200)], [code]: [status(429, 'Fri, 31 Dec 1999 23:59:59 GMT'), status(200)] };
  expect(await check([page, code], results)).toEqual({ dead: {}, fetched: [page, page, page, page, code, code], waits: [5000, 2000, 60000, 0] });
});

test('rejects a source that still has a rate limit after 3 retries', async () => {
  expect(await check([page], { [page]: [status(429), status(429), status(429), status(429)] })).toEqual({
    dead: { [page]: 'status 429' },
    fetched: [page, page, page, page],
    waits: [1000, 2000, 4000],
  });
});

test('rejects a source whose fetch fails each time, for example a host that DNS does not know', async () => {
  const host = 'https://no-such-host.example.invalid/';
  const error = () => new TypeError('fetch failed', { cause: new Error('getaddrinfo ENOTFOUND no-such-host.example.invalid') });
  expect(await check([host], { [host]: [error(), error(), error(), error()] })).toEqual({
    dead: { [host]: 'Error: getaddrinfo ENOTFOUND no-such-host.example.invalid' },
    fetched: [host, host, host, host],
    waits: [1000, 2000, 4000],
  });
});

test('accepts a source whose first fetch fails with ECONNRESET and whose second fetch gives 200', async () => {
  const error = new TypeError('fetch failed', { cause: new Error('read ECONNRESET') });
  expect(await check([page], { [page]: [error, status(200)] })).toEqual({ dead: {}, fetched: [page, page], waits: [1000] });
});

test('fetches a YouTube video through the YouTube oEmbed endpoint, because the watch page gives 200 for a video that does not exist', async () => {
  const watch = 'https://www.youtube.com/watch?v=zzzzzzzzzzz';
  const short = 'https://youtu.be/zzzzzzzzzzz';
  const mobile = 'https://m.youtube.com/watch?v=zzzzzzzzzzz';
  const plain = 'http://www.youtube.com/watch?v=zzzzzzzzzzz';
  const live = 'https://www.youtube.com/live/zzzzzzzzzzz';
  const oembed = (url: string) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const sources = [watch, short, mobile, plain, live];
  expect(await check(sources, Object.fromEntries(sources.map((source, i) => [oembed(source), [status(i === 1 ? 404 : 400)]])))).toEqual({
    dead: { [watch]: 'status 400', [short]: 'status 404', [mobile]: 'status 400', [plain]: 'status 400', [live]: 'status 400' },
    fetched: sources.map(oembed),
    waits: [],
  });
});

test('does not fetch a YouTube page that is not a video through the oEmbed endpoint', async () => {
  const channel = 'https://www.youtube.com/@AndroidDevelopers';
  expect(await check([channel], { [channel]: [status(200)] })).toEqual({ dead: {}, fetched: [channel], waits: [] });
});

const title = 'Sources that do not load';

// Runs reportDeadSources for two chapters with a fake of the issue calls. The fake gives the open issues, and records each other call.
function report(dead: Record<string, string>, open: { number: number; title: string }[]) {
  const calls: unknown[][] = [];
  const chapters = [
    { file: 'site/src/content/docs/a.md', sources: [page, code] },
    { file: 'site/src/content/docs/b.md', sources: [code] },
  ];
  reportDeadSources(new Map(Object.entries(dead)), chapters, {
    open: () => open,
    create: (...args) => calls.push(['create', ...args]),
    edit: (...args) => calls.push(['edit', ...args]),
    close: (...args) => calls.push(['close', ...args]),
  });
  return calls;
}

const body = (lines: string) => `The weekly source check found sources that do not load. Each line gives the chapter, the source and the reason.

${lines}

If a source loads in a browser, do not change the chapter. If a source moved, make a fix PR. In the PR, make a plan amendment with the new URL, and change each citation of the source to the new URL. If a source does not exist, make a fix PR. In the PR, make a plan amendment with a new source, and cite the new source for each claim.

Each run of the weekly source check updates this issue. If all sources load, the run closes this issue.`;

test('opens one issue with each source that does not load in each chapter, if no open issue has the title', () => {
  expect(report({ [page]: 'status 410', [code]: 'status 404' }, [{ number: 3, title: 'Challenge a claim' }])).toEqual([
    ['create', title, body(`- \`site/src/content/docs/a.md\`: ${page} (status 410)\n- \`site/src/content/docs/a.md\`: ${code} (status 404)\n- \`site/src/content/docs/b.md\`: ${code} (status 404)`)],
  ]);
});

test('updates the body of the first open issue with the title, and opens no issue', () => {
  const open = [{ number: 3, title: 'Challenge a claim' }, { number: 9, title }, { number: 7, title }];
  expect(report({ [page]: 'status 410' }, open)).toEqual([['edit', 9, body(`- \`site/src/content/docs/a.md\`: ${page} (status 410)`)]]);
});

test('closes the open issue with a comment if all sources load', () => {
  expect(report({}, [{ number: 9, title }])).toEqual([['close', 9, 'All sources load. The weekly source check closes this issue.']]);
});

test('changes no issue if all sources load and no open issue has the title', () => {
  expect(report({}, [{ number: 3, title: 'Challenge a claim' }])).toEqual([]);
});
