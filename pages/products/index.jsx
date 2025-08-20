// components/ProductsIndex.js
import styles from "@/styles/product/productIndex.module.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

export const ProductsIndex = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/productApi");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/api/productApi?productId=${productId}`);
      setProducts(products.filter((item) => item._id !== productId));
      alert("Product deleted successfully");
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Failed to delete product");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Products</h1>
        <Link href={"products/new/edit"} className={styles.newBtn}>
          + New Product
        </Link>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <div className={styles.productList}>
          {products.length === 0 ? (
            <p className={styles.noProducts}>No products available</p>
          ) : (
            products.map((item) => (
              <div key={item._id} className={styles.listItem}>
                <div className={styles.itemImageWrapper}>
                  <Image
                    src={item?.imageUrl?.[0] || "/placeholder.png"}
                    width={120}
                    height={120}
                    alt={item.name || "Product Image"}
                  />
                </div>
                <div className={styles.itemTextContent}>
                  <h2 className={styles.productName}>{item.name}</h2>
                  <div className={styles.itemDataDisplay}>
                    <p>Sold: {item.sold || 0}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <Link href={`/products/${item._id}/edit`}>
                      <button className={styles.editBtn}>Edit</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsIndex;
