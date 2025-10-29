import mongoose from "mongoose";

const PredefinedDataSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true }, // category name
    data: {
      type: mongoose.Schema.Types.Mixed, // can store anything — array, object, string, etc.
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PredefinedData ||
  mongoose.model("PredefinedData", PredefinedDataSchema);
