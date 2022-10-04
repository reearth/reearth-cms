import { atom, useAtom } from "jotai";

// useError is needed for Apollo provider error only.
const error = atom<string | undefined>(undefined);
export const useError = () => useAtom(error);

export type Workspace = {
  id: string;
  name: string;
  members?: Array<any>;
  assets?: any;
  projects?: any;
  personal?: boolean;
};
const workspace = atom<Workspace | undefined>(undefined);
export const useWorkspace = () => useAtom(workspace);

type MenuKey = "home" | "schema" | "settings" | "asset" | "Accessibility" | "Settings";
const selectedMenuKey = atom<MenuKey | undefined>(undefined);
export const useSelectedMenuKey = () => useAtom(selectedMenuKey);
