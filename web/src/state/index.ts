import { atom, useAtom } from "jotai";

// useError is needed for Apollo provider error only.
const error = atom<string | undefined>(undefined);
export const useError = () => useAtom(error);

export type Wrokspace = {
  id: string;
  name: string;
  members?: Array<any>;
  assets?: any;
  projects?: any;
  personal?: boolean;
};
const workspace = atom<Wrokspace | undefined>(undefined);
export const useWorkspace = () => useAtom(workspace);
