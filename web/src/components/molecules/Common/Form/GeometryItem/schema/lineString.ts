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
      minItems: 2,
      type: "array",
    },
    type: {
      enum: ["LineString"],
      type: "string",
    },
  },
  required: ["type", "coordinates"],
  type: "object",
};
