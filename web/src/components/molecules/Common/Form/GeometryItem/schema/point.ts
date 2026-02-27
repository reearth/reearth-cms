export default {
  properties: {
    coordinates: {
      items: {
        type: "number",
      },
      minItems: 2,
      type: "array",
    },
    type: {
      enum: ["Point"],
      type: "string",
    },
  },
  required: ["type", "coordinates"],
  type: "object",
};
