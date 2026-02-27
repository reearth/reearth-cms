export default {
  properties: {
    coordinates: {
      items: {
        items: {
          items: {
            items: {
              type: "number",
            },
            minItems: 2,
            type: "array",
          },
          minItems: 4,
          type: "array",
        },
        type: "array",
      },
      type: "array",
    },
    type: {
      enum: ["MultiPolygon"],
      type: "string",
    },
  },
  required: ["type", "coordinates"],
  type: "object",
};
