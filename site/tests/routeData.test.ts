import { expect, test } from 'vitest';
import { onRequest } from '../src/routeData';

test('numbers the links in the section groups, but not a link at the top level of the sidebar', () => {
  const about = { type: 'link', label: 'About' };
  const mainThread = { type: 'link', label: 'Main thread' };
  const looper = { type: 'link', label: 'Looper' };
  const sidebar = [about, { type: 'group', label: 'The Launch Path', entries: [mainThread, looper] }];
  // The middleware reads and changes only locals.starlightRoute.sidebar.
  onRequest({ locals: { starlightRoute: { sidebar } } } as never, async () => {});
  expect([about.label, mainThread.label, looper.label]).toEqual(['About', '01 Main thread', '02 Looper']);
});
