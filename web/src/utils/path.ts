export function splitPathname(pathname: string) {
  const splitPathname: (string | undefined)[] = pathname.split("/");
  const primaryRoute = splitPathname[1];
  const secondaryRoute = splitPathname[3];
  const subRoute = secondaryRoute === "project" ? splitPathname[5] : secondaryRoute;
  return [primaryRoute, secondaryRoute, subRoute];
}
