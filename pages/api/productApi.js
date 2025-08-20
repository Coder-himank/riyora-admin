// pages/api/products.js
import connectDB from "@/lib/database";
import Product from "@/lib/models/product";

export default async function handler(req, res) {
  await connectDB();
  const { productId } = req.query;

  try {
    switch (req.method) {
      case "GET":
        if (productId) {
          const product = await Product.findById(productId);
          if (!product) {
            return res.status(404).json({ error: "Product not found" });
          }
          return res.status(200).json(product);
        } else {
          const products = await Product.find({});
          return res.status(200).json(products);
        }

      case "POST":
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        return res.status(201).json(savedProduct);

      case "PUT":
        if (!productId) {
          return res.status(400).json({ error: "Product ID is required" });
        }
        const updated = await Product.findByIdAndUpdate(
          productId,
          { $set: req.body },
          { new: true, runValidators: true }
        );
        if (!updated) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(updated);

      case "DELETE":
        if (!productId) {
          return res.status(400).json({ error: "Product ID is required" });
        }
        const deleted = await Product.findByIdAndDelete(productId);
        if (!deleted) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json({ message: "Product deleted successfully" });

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
