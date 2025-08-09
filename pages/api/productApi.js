import connectDB from "@/lib/database";
import Product from "@/lib/models/product";

export default async function handler(req, res) {
    await connectDB();

    const { productId } = req.query;
    console.log(productId);


    if (req.method === "PUT") {
        try {
            console.log(req.body);

            const updated = await Product.findByIdAndUpdate(productId, { $set: req.body }, { new: true });

            res.status(200).json(updated);
        } catch (err) {
            console.error("Update failed:", err);
            res.status(500).json({ error: "Failed to update product" });
        }
    } else if (req.method === "GET") {
        try {
            if (productId) {

                const product = await Product.findById(productId);
                res.status(200).json(product);
            } else {
                const products = await Product.find({});
                res.status(200).json(products);
            }
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch product" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
