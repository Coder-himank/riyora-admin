// pages/api/products/index.js
import connectDB from "@/lib/database"; // MongoDB connection
import ProductInfo from "@/lib/models/productInfo";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const { productId } = req.query;

      if (productId) {
        // Fetch ProductInfo by reference Product._id
        const productInfo = await ProductInfo.findOne({ productId });
        return res.status(200).json(productInfo || null);
      } else {
        // Fetch all ProductInfo
        const products = await ProductInfo.find({});
        return res.status(200).json(products);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  if (req.method === "POST") {
    try {
      const { productId, title, description, ingredients, benefits, suitability, imageUrl } =
        req.body;

      if (!productId || !title) {
        return res.status(400).json({ error: "productId and title are required" });
      }

      // Check if ProductInfo for this productId already exists
      const existing = await ProductInfo.findOne({ productId });
      if (existing) {
        return res.status(400).json({ error: "ProductInfo for this productId already exists" });
      }

      const newProduct = await ProductInfo.create({
        productId,
        title,
        description,
        ingredients,
        benefits,
        suitability,
        imageUrl,
      });

      return res.status(201).json(newProduct);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create product info" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id } = req.query; // _id of ProductInfo document
      if (!id) return res.status(400).json({ error: "ProductInfo _id is required" });

      const updatedProduct = await ProductInfo.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      if (!updatedProduct) return res.status(404).json({ error: "ProductInfo not found" });
      return res.status(200).json(updatedProduct);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update product info" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
