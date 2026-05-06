export function dashboardPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}
