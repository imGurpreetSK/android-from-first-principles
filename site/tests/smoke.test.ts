import { expect, test } from 'vitest';
import config from '../astro.config.mjs';

test('the Astro config loads the Starlight integration', () => {
  expect(config.integrations?.flat().map((i) => i && i.name)).toContain('@astrojs/starlight');
});
