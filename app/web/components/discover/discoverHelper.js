
export const standardRoutes = [
  // { key: 'feed', title: 'Subscriptions' },
  { key: 'new', title: 'New' },
  { key: 'top', title: 'Trending' },
];

export const tagRoutes = [
  { key: 'new', title: 'New' },
  { key: 'top', title: 'Trending' },
  // { key: 'people', title: 'People' },
];

export function getDiscoverState(nextProps, prevState) {
  const sort = nextProps.params.sort;
  const routes = nextProps.params.tag ? tagRoutes : standardRoutes;
  if (sort && sort !== prevState.sort) {
    const tabIndex = prevState.routes.findIndex(tab => tab.key === sort);
    return { tabIndex, routes, sort };
  }
  if (!sort) return { tabIndex: -1, routes, sort };
  return null;
}
