import lineString from "./lineString";
import multiLineString from "./multiLineString";
import multiPoint from "./multiPoint";
import multiPolygon from "./multiPolygon";
import point from "./point";
import polygon from "./polygon";

export default {
  type: "object",
  required: ["type", "geometries"],
  properties: {
    type: {
      type: "string",
      enum: ["GeometryCollection"],
    },
    geometries: {
      type: "array",
      items: {
        oneOf: [point, lineString, polygon, multiPoint, multiLineString, multiPolygon],
      },
    },
  },
};
