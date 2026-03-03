import { ProjectAccessibility } from "@reearth-cms/components/molecules/Accessibility/types";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { Role, User } from "@reearth-cms/components/molecules/Member/types";

export type Project = {
  accessibility?: ProjectAccessibility;
  alias: string;
  description: string;
  id: string;
  license: string;
  name: string;
  readme: string;
  requestRoles: Role[];
};

export type UpdateProjectInput = {
  accessibility?: ProjectAccessibility;
  alias?: string;
  description?: string;
  license?: string;
  name?: string;
  projectId: string;
  readme?: string;
  requestRoles?: Role[];
};

export type ProjectListItem = {
  accessibility?: ProjectAccessibility;
} & Pick<Project, "description" | "id" | "name">;

export type UserMember = {
  role: Role;
  user: User;
  userId: string;
};

export type Member = IntegrationMember | UserMember;

export type MemberInput = {
  role: Role;
  userId: string;
};

export type Workspace = {
  alias?: string;
  id: string;
  members?: Member[];
  name: string;
  personal?: boolean;
};

export type WorkspaceSettings = {
  terrains?: ResourceList<TerrainResource>;
  tiles?: ResourceList<TileResource>;
};

type ResourceList<T> = {
  enabled?: boolean;
  resources: T[];
  selectedResource?: string;
};

export type Resource = TerrainResource | TileResource;

export type TileResource = {
  id: string;
  props: UrlResourceProps;
  type: TileType;
};

export type TerrainResource = {
  id: string;
  props: CesiumResourceProps;
  type: TerrainType;
};

export type TileInput = {
  tile: TileResource;
};

export type TerrainInput = {
  terrain: TerrainResource;
};

export type TileType =
  | "DEFAULT"
  | "EARTH_AT_NIGHT"
  | "ESRI_TOPOGRAPHY"
  | "JAPAN_GSI_STANDARD_MAP"
  | "LABELLED"
  | "OPEN_STREET_MAP"
  | "ROAD_MAP"
  | "URL";

export type TerrainType = "ARC_GIS_TERRAIN" | "CESIUM_ION" | "CESIUM_WORLD_TERRAIN";

export type UrlResourceProps = {
  image: string;
  name: string;
  url: string;
};

export type CesiumResourceProps = {
  cesiumIonAccessToken: string;
  cesiumIonAssetId: string;
  image: string;
  name: string;
  url: string;
};

export type SortBy = "id" | "name" | "updatedat";

export type SortOption = {
  key: SortBy;
  label: string;
};
