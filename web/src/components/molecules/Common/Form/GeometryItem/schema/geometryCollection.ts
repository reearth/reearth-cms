import lineString from "./lineString";
import multiLineString from "./multiLineString";
import multiPoint from "./multiPoint";
import multiPolygon from "./multiPolygon";
import point from "./point";
import polygon from "./polygon";

export default {
  properties: {
    geometries: {
      items: {
        oneOf: [point, lineString, polygon, multiPoint, multiLineString, multiPolygon],
      },
      type: "array",
    },
    type: {
      enum: ["GeometryCollection"],
      type: "string",
    },
  },
  required: ["type", "geometries"],
  type: "object",
};
