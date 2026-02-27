export default {
  properties: {
    coordinates: {
      items: {
        items: {
          items: {
            type: "number",
          },
          minItems: 2,
          type: "array",
        },
        minItems: 2,
        type: "array",
      },
      type: "array",
    },
    type: {
      enum: ["MultiLineString"],
      type: "string",
    },
  },
  required: ["type", "coordinates"],
  type: "object",
};
