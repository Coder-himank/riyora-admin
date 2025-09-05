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
    if (!confirm("Are you sure you want to hide this product?")) return;

    try {
      await axios.put(`/api/productApi?productId=${productId}`, { visible: false });

      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item._id === productId ? { ...item, visible: false } : item
        )
      );
    } catch (err) {
      console.error("Failed to hide product", err);
      alert("Failed to hide product");
    }
  };

  const handleRestore = async (productId) => {
    if (!confirm("Are you sure you want to restore this product?")) return;

    try {
      await axios.put(`/api/productApi?productId=${productId}`, { visible: true });

      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item._id === productId ? { ...item, visible: true } : item
        )
      );
    } catch (err) {
      console.error("Failed to restore product", err);
      alert("Failed to restore product");
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
              <div key={item._id} className={`${styles.listItem} ${item.visible ? '' : styles.notVissibleListItem}`}>
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

                    {item.visible ?
                      <button
                        onClick={() => handleDelete(item._id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                      :
                      <button
                        onClick={() => handleRestore(item._id)}
                        className={styles.restoreBtn}
                      >
                        Restore
                      </button>

                    }
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
