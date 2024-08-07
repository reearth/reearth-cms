export default {
  type: "object",
  required: ["type", "coordinates"],
  properties: {
    type: {
      type: "string",
      enum: ["Point"],
    },
    coordinates: {
      type: "array",
      minItems: 2,
      items: {
        type: "number",
      },
    },
  },
};
