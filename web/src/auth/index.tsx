import { PropsWithChildren, ReactNode } from "react";

import { useAuthenticationRequired } from "./useAuth";

export { AuthProvider } from "./AuthProvider";
export { useAuth } from "./useAuth";

export function AuthenticationRequiredPage({
  children,
}: PropsWithChildren<unknown>): ReactNode {
  const [isAuthenticated] = useAuthenticationRequired(); // TODO: show error
  return isAuthenticated && children ? <>{children}</> : null;
}
