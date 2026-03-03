export default {
  properties: {
    coordinates: {
      items: {
        items: {
          type: "number",
        },
        minItems: 2,
        type: "array",
      },
      type: "array",
    },
    type: {
      enum: ["MultiPoint"],
      type: "string",
    },
  },
  required: ["type", "coordinates"],
  type: "object",
};
