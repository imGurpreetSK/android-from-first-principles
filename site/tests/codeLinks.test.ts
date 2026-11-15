import { expect, test } from 'vitest';
import { unpinned } from '../src/codeLinks';

const sha = '0123456789abcdef0123456789abcdef01234567';
// A fake git ls-remote --tags result for each repo. 1.10.2 is a lightweight tag. parent-4.12.0 is an annotated tag, so it also has a ^{} line.
const tags: Record<string, string> = {
  'https://github.com/Kotlin/kotlinx.coroutines': `${sha}\trefs/tags/1.10.2\n`,
  'https://github.com/square/okhttp': `${sha}\trefs/tags/parent-4.12.0\n${sha}\trefs/tags/parent-4.12.0^{}\n`,
};

// Runs unpinned with the fake tags, and records each repo that it gives to lsRemote.
function check(sources: string[]) {
  const repos: string[] = [];
  const result = unpinned(sources, (repo) => {
    repos.push(repo);
    return tags[repo] ?? '';
  });
  return { result, repos };
}

test('accepts a GitHub link at a tag, also an annotated tag', () => {
  const sources = [
    'https://github.com/Kotlin/kotlinx.coroutines/blob/1.10.2/kotlinx-coroutines-core/common/src/Builders.common.kt',
    'https://github.com/square/okhttp/tree/parent-4.12.0/okhttp',
  ];
  expect(check(sources).result).toEqual([]);
});

test('rejects a GitHub link at a branch or a short SHA, and at a ref that is a tag only with ^{}', () => {
  const sources = [
    'https://github.com/Kotlin/kotlinx.coroutines/blob/master/README.md',
    'https://github.com/Kotlin/kotlinx.coroutines/blame/0123456/README.md',
    'https://github.com/square/okhttp/raw/parent-4.12.0^{}/README.md',
  ];
  expect(check(sources).result).toEqual(sources);
});

test('accepts a GitHub link at a full SHA, and does not run git ls-remote for it', () => {
  expect(check([`https://github.com/Kotlin/kotlinx.coroutines/blob/${sha}/README.md`])).toEqual({ result: [], repos: [] });
});

test('runs git ls-remote one time for each repo', () => {
  const { repos } = check([
    'https://github.com/Kotlin/kotlinx.coroutines/blob/1.10.2/README.md',
    'https://github.com/Kotlin/kotlinx.coroutines/blob/master/README.md',
    'https://github.com/square/okhttp/blob/parent-4.12.0/README.md',
  ]);
  expect(repos).toEqual(['https://github.com/Kotlin/kotlinx.coroutines', 'https://github.com/square/okhttp']);
});

test('skips a link that is not a GitHub code link', () => {
  const sources = [
    'https://github.com/Kotlin/kotlinx.coroutines/issues/1',
    'https://github.com/Kotlin/kotlinx.coroutines',
    'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java',
  ];
  expect(check(sources)).toEqual({ result: [], repos: [] });
});
