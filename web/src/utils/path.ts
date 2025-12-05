export function splitPathname(pathname: string) {
  const splitPathname: (string | undefined)[] = pathname.split("/");
  const primaryRoute = splitPathname[1];
  const secondaryRoute = splitPathname[3];
  const subRoute = secondaryRoute === "project" ? splitPathname[5] : secondaryRoute;
  return [primaryRoute, secondaryRoute, subRoute];
}

export function joinPaths(...paths: string[]) {
  if (paths.length === 0) return "";
  const m = paths[0].match(/^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)(.*)$/);
  const protocol = m ? m[1] : "";
  const firstRest = m ? m[2] : paths[0];
  const joined = [firstRest, ...paths.slice(1)]
    .join("/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/(\?|#)/g, "$1")
    .replace(/(?<!:)\/+$/, "");
  return protocol ? protocol + joined : joined;
}
