import { PublicScope } from "@reearth-cms/components/molecules/Accessibility/types";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";

export interface Project {
  id: string;
  name: string;
  description?: string;
  alias?: string;
  scope?: PublicScope;
  assetPublic?: boolean;
  requestRoles?: Role[];
}

export interface User {
  name: string;
}

export interface UserMember {
  userId: string;
  role: Role;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export type Member = UserMember | IntegrationMember;

export interface MemberInput {
  userId: string;
  role: Role;
}

export type Role = "WRITER" | "READER" | "MAINTAINER" | "OWNER";

export interface Workspace {
  id: string;
  name: string;
  personal?: boolean;
  members?: Member[];
}

export interface WorkspaceSettings {
  id: string;
  tiles?: ResourceList<TileResource>;
  terrains?: ResourceList<TerrainResource>;
}

interface ResourceList<T> {
  resources: T[];
  selectedResource?: string;
  enabled?: boolean;
}

export type Resource = TileResource | TerrainResource;

export interface TileResource {
  id: string;
  type: TileType;
  props: UrlResourceProps;
}

export interface TerrainResource {
  id: string;
  type: TerrainType;
  props: CesiumResourceProps;
}

export interface TileInput {
  tile: TileResource;
}

export interface TerrainInput {
  terrain: TerrainResource;
}

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

export interface UrlResourceProps {
  name: string;
  url: string;
  image: string;
}

export interface CesiumResourceProps {
  name: string;
  url: string;
  image: string;
  cesiumIonAssetId: string;
  cesiumIonAccessToken: string;
}
