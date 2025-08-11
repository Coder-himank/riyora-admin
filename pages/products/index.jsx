// components/ProductsIndex.js
import styles from "@/styles/product/productIndex.module.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

export const ProductsIndex = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        // Replace with your actual API endpoint
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const res = await axios.get("/api/productApi");
                setProducts(res.data || []);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false)

            }
        };

        fetchProducts();
    }, []);

    const baseImageUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Products</h1>
            </div>
            {loading ? <p>Loding</p> : (

                <div className={styles.productList}>
                    {products.length === 0 ? (
                        <p className={styles.noProducts}>No products available</p>
                    ) : (
                        products.map((item) => (
                            <div key={item._id} className={styles.listItem}>
                                <div className={styles.itemImageWrapper}>
                                    <Image
                                        src={item?.imageUrl[0]}
                                        width={100}
                                        height={100}
                                        alt={item.name || "Product Image"}
                                    />
                                </div>
                                <div className={styles.itemTextContent}>
                                    <h2>{item.name}</h2>
                                    <div className={styles.itemDataDisplay}>
                                        <p>Price: ₹{item.price}</p>
                                        <p>Sold: {item.sold || 0}</p>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <Link href={`/products/edit/${item._id}`}>
                                            <button>Edit</button>
                                        </Link>
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
