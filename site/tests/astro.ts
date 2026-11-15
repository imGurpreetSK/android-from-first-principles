import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));

// Runs astro build with these arguments in production mode, as the CI build does.
// Vitest sets process.env.MODE to test, and a child process inherits it. Astro loads all of process.env, so without this env, import.meta.env.MODE is test. Then Starlight builds draft pages, and the progress tracker counts draft chapters.
// spawnSync blocks the thread, so the Vitest timeout cannot stop a stuck build. The spawnSync timeout stops it.
export const build = (...args: string[]) =>
  spawnSync(astro, ['build', ...args], { encoding: 'utf8', timeout: 60_000, env: { ...process.env, MODE: 'production' } });
