import Product from "@/lib/models/product";

export const updateStock = async (products) => {
  for (const p of products) {
    await Product.findByIdAndUpdate(p._id, { $inc: { stock: -p.quantity } });
  }
};

export const restockProducts = async (products) => {
  for (const p of products) {
    await Product.findByIdAndUpdate(p._id, { $inc: { stock: p.quantity } });
  }
};
