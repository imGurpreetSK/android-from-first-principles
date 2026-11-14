import { expect, test } from 'vitest';
import config from '../astro.config.mjs';

test('Vitest runs and the Astro config lists Starlight', () => {
  expect(config.integrations?.flat().map((i) => i && i.name)).toContain('@astrojs/starlight');
});
