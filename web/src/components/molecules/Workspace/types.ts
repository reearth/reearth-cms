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
  type: keyof typeof TileType;
  props?: UrlResourceProps;
};

type TerrainResource = {
  id: string;
  type: keyof typeof TerrainType;
  props?: CesiumResourceProps;
};

export type TileInput = {
  tile: TileResource;
};

export type TerrainInput = {
  terrain: TerrainResource;
};

export enum TileType {
  DEFAULT = "Default",
  LABELLED = "Labelled",
  ROAD_MAP = "Road Map",
  STAMEN_WATERCOLOR = "Stamen Watercolor",
  STAMEN_TONER = "Stamen Toner",
  OPEN_STREET_MAP = "OpenStreetMap",
  ESRI_TOPOGRAPHY = "ESRI Topography",
  EARTH_AT_NIGHT = "Earth at night",
  JAPAN_GSI_STANDARD_MAP = "Japan GSI Standard Map",
  URL = "URL",
}

export enum TerrainType {
  CESIUM_WORLD_TERRAIN = "Cesium World Terrain",
  ARC_GIS_TERRAIN = "ArcGIS Terrain",
  CESIUM_ION = "Cesium Ion",
}

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
