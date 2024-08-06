import geometryCollection from "./geometryCollection";
import lineString from "./lineString";
import multiLineString from "./multiLineString";
import multiPoint from "./multiPoint";
import multiPolygon from "./multiPolygon";
import point from "./point";
import polygon from "./polygon";

export default {
  oneOf: [
    point,
    lineString,
    polygon,
    multiPoint,
    multiLineString,
    multiPolygon,
    geometryCollection,
  ],
};
