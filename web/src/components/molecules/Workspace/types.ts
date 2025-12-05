import { ProjectAccessibility } from "@reearth-cms/components/molecules/Accessibility/types";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { User, Role } from "@reearth-cms/components/molecules/Member/types";

export type Project = {
  id: string;
  name: string;
  description: string;
  alias: string;
  readme: string;
  license: string;
  requestRoles: Role[];
  accessibility?: ProjectAccessibility;
};

export type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string;
  alias?: string;
  readme?: string;
  license?: string;
  requestRoles?: Role[];
  accessibility?: ProjectAccessibility;
};

export type ProjectListItem = Pick<Project, "id" | "name" | "description"> & {
  accessibility?: ProjectAccessibility;
};

export type UserMember = {
  userId: string;
  role: Role;
  user: User;
};

export type Member = UserMember | IntegrationMember;

export type MemberInput = {
  userId: string;
  role: Role;
};

export type Workspace = {
  id: string;
  name: string;
  alias?: string;
  personal?: boolean;
  members?: Member[];
};

export type WorkspaceSettings = {
  tiles?: ResourceList<TileResource>;
  terrains?: ResourceList<TerrainResource>;
};

type ResourceList<T> = {
  resources: T[];
  selectedResource?: string;
  enabled?: boolean;
};

export type Resource = TileResource | TerrainResource;

export type TileResource = {
  id: string;
  type: TileType;
  props: UrlResourceProps;
};

export type TerrainResource = {
  id: string;
  type: TerrainType;
  props: CesiumResourceProps;
};

export type TileInput = {
  tile: TileResource;
};

export type TerrainInput = {
  terrain: TerrainResource;
};

export type TileType =
  | "DEFAULT"
  | "LABELLED"
  | "ROAD_MAP"
  | "OPEN_STREET_MAP"
  | "ESRI_TOPOGRAPHY"
  | "EARTH_AT_NIGHT"
  | "JAPAN_GSI_STANDARD_MAP"
  | "URL";

export type TerrainType = "CESIUM_WORLD_TERRAIN" | "ARC_GIS_TERRAIN" | "CESIUM_ION";

export type UrlResourceProps = {
  name: string;
  url: string;
  image: string;
};

export type CesiumResourceProps = {
  name: string;
  url: string;
  image: string;
  cesiumIonAssetId: string;
  cesiumIonAccessToken: string;
};

export type SortBy = "id" | "updatedat" | "name";

export type SortOption = {
  key: SortBy;
  label: string;
};
