import connectDB from "@/lib/database";
import Product from "@/lib/models/product";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { reviewId, reply, replyId } = req.body;
    console.log(reviewId);

    // Validate required data
    if (!reviewId) {
      return res.status(400).json({ message: "reviewId is required" });
    }

    // Find the product that contains the review
    const product = await Product.findOne({ "reviews._id": reviewId.toString() });
    if (!product) {
      return res.status(404).json({ message: "Product or review not found" });
    }

    // Find the review within the product
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // --- POST: Add a reply ---
    if (req.method === "POST") {
      if (!reply) {
        return res.status(400).json({ message: "Reply content is required" });
      }

      review.replies = review.replies || [];
      review.replies.push({
        comment: reply,
      });

      await product.save();
      return res.status(200).json({ message: "Reply added successfully", review });
    }

    // --- DELETE: Remove a reply ---
    else if (req.method === "DELETE") {
      if (!replyId) {
        return res.status(400).json({ message: "replyId is required for delete" });
      }

      // Remove reply by its ID
      const beforeCount = review.replies?.length || 0;
      review.replies = review.replies?.filter((r) => r._id === replyId);

      // Save if something changed
      if (review.replies.length < beforeCount) {
        await product.save();
        return res.status(200).json({ message: "Reply deleted successfully" });
      } else {
        return res.status(404).json({ message: "Reply not found" });
      }
    }

    // --- Other Methods ---
    else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling reply:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
