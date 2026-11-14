import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

export const onRequest = defineRouteMiddleware(({ locals }) => {
  const route = locals.starlightRoute;
  // The sidebar config has a group for each section. A section without a published chapter gets no group.
  route.sidebar = route.sidebar.filter((entry) => entry.type === 'link' || entry.entries.length > 0);
});
