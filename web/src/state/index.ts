import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { UserRights } from "@reearth-cms/components/molecules/Member/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { UploaderState } from "@reearth-cms/components/molecules/Uploader/types";
import { Project, Workspace } from "@reearth-cms/components/molecules/Workspace/types";

const workspace = atom<undefined | Workspace>(undefined);
export const useWorkspace = () => useAtom(workspace);

const workspaceId = atomWithStorage<string | undefined>("workspaceId", undefined);
export const useWorkspaceId = () => useAtom(workspaceId);

const userId = atomWithStorage<string | undefined>("userId", undefined);
export const useUserId = () => useAtom(userId);

const project = atom<Project | undefined>(undefined);
export const useProject = () => useAtom(project);

const model = atom<Model | undefined>(undefined);
export const useModel = () => useAtom(model);

const collapsedModelMenu = atomWithStorage<boolean>("collapsedModelMenu", false);
export const useCollapsedModelMenu = () => useAtom(collapsedModelMenu);

const collapsedMainMenu = atomWithStorage<boolean>("collapsedMainMenu", false);
export const useCollapsedMainMenu = () => useAtom(collapsedMainMenu);

const userRights = atom<undefined | UserRights>(undefined);
export const useUserRights = () => useAtom(userRights);

const uploader = atom<UploaderState>({
  isOpen: false,
  queue: [],
  showBadge: true,
});
export const useUploader = () => useAtom(uploader);
