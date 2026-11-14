import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

export const onRequest = defineRouteMiddleware(({ locals }) => {
  const route = locals.starlightRoute;
  // The sidebar config has a group for each section. A section without a published chapter gets no group.
  route.sidebar = route.sidebar.filter((entry) => entry.type === 'link' || entry.entries.length > 0);
  // The display number of a chapter is its position in the sidebar, for example "05 Main thread".
  const links = route.sidebar.flatMap((entry) => (entry.type === 'group' ? entry.entries : [entry])).filter((entry) => entry.type === 'link');
  links.forEach((link, i) => (link.label = `${String(i + 1).padStart(2, '0')} ${link.label}`));
});
