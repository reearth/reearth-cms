export type Project = {
  id: string;
  name: string;
  description: string;
  requestRoles?: Role[] | null;
};

export type User = {
  name: string;
};

export type Member = {
  userId: string;
  role: Role;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type MemberInput = {
  userId: string;
  role: Role;
};

export type Role = "WRITER" | "READER" | "MAINTAINER" | "OWNER";

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
};

export type WorkspaceSettings = {
  id: string;
  tiles?: ResourceList<TileResource>;
  terrains?: ResourceList<TerrainResource>;
};

type ResourceList<T> = {
  resources: T[];
  selectedResource?: string;
  enabled?: boolean;
};

export type Resource = TileResource | TerrainResource;

type TileResource = {
  id: string;
  type: TileType;
  props: UrlResourceProps;
};

type TerrainResource = {
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

type UrlResourceProps = {
  name: string;
  url: string;
  image: string;
};

type CesiumResourceProps = {
  name: string;
  url: string;
  image: string;
  cesiumIonAssetId: string;
  cesiumIonAccessToken: string;
};
