import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
// Vitest sets these keys in process.env, and each child process inherits them. Astro copies process.env into import.meta.env.
// With these keys, a build is not a production build. Starlight builds draft pages and shows no search box, and the progress tracker counts draft chapters.
// Without these keys, astro build uses its default mode, production, as the CI build does.
const env = { ...process.env };
for (const key of ['MODE', 'NODE_ENV', 'DEV', 'PROD', 'SSR', 'BASE_URL']) delete env[key];

// Runs astro build with these arguments in production mode.
// spawnSync blocks the thread, so the Vitest timeout cannot stop a stuck build. The spawnSync timeout stops it.
export const build = (...args: string[]) =>
  spawnSync(astro, ['build', ...args], { encoding: 'utf8', timeout: 60_000, env });
