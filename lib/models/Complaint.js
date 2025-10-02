import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId : {
      
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Damaged Product",
        "Wrong Item",
        "Late Delivery",
        "Poor Quality",
        "Other",
      ],
      required: true,
    },
    complaintText: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String, // will store image path/URL
      },
    ],
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

export default mongoose.models.Complaint ||
  mongoose.model("Complaint", ComplaintSchema);
