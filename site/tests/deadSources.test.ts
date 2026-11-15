import { expect, test } from 'vitest';
import { deadSources } from '../src/deadSources';

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

test('rejects a source whose fetch fails, for example a host that DNS does not know', async () => {
  const host = 'https://no-such-host.example.invalid/';
  const error = new TypeError('fetch failed', { cause: new Error('getaddrinfo ENOTFOUND no-such-host.example.invalid') });
  expect(await check([host], { [host]: [error] })).toEqual({ dead: { [host]: 'Error: getaddrinfo ENOTFOUND no-such-host.example.invalid' }, fetched: [host], waits: [] });
});

test('fetches a YouTube video through the YouTube oEmbed endpoint, because the watch page gives 200 for a video that does not exist', async () => {
  const watch = 'https://www.youtube.com/watch?v=zzzzzzzzzzz';
  const short = 'https://youtu.be/zzzzzzzzzzz';
  const mobile = 'https://m.youtube.com/watch?v=zzzzzzzzzzz';
  const oembed = (url: string) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  expect(await check([watch, short, mobile], { [oembed(watch)]: [status(400)], [oembed(short)]: [status(404)], [oembed(mobile)]: [status(400)] })).toEqual({
    dead: { [watch]: 'status 400', [short]: 'status 404', [mobile]: 'status 400' },
    fetched: [oembed(watch), oembed(short), oembed(mobile)],
    waits: [],
  });
});
