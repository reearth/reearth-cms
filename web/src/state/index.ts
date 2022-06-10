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

export type Project = {
  id: string;
  name: string;
};

const project = atom<Project | undefined>(undefined);
export const useProject = () => useAtom(project);

const unselectProject = atom(null, (_get, set) => {
  set(project, undefined);
  set(workspace, undefined);
});

export const useUnselectProject = () => useAtom(unselectProject)[1];
