import { atom, useAtom } from "jotai";

import { Model } from "@reearth-cms/components/molecules/Schema/types";

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

const model = atom<Model | undefined>(undefined);
export const useModel = () => useAtom(model);
