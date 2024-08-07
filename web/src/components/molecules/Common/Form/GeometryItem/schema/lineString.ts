export default {
  type: "object",
  required: ["type", "coordinates"],
  properties: {
    type: {
      type: "string",
      enum: ["LineString"],
    },
    coordinates: {
      type: "array",
      minItems: 2,
      items: {
        type: "array",
        minItems: 2,
        items: {
          type: "number",
        },
      },
    },
  },
};
