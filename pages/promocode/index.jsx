// PromoDashboard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "@/styles/promocode/promocode.module.css";
import axios from "axios";

export default function PromoDashboard() {
    const [promos, setPromos] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        code: "",
        description: "",
        discount: 0,
        validFrom: "",
        expiry: "",
        applicableProducts: [],
        usageLimit: 0,
        minimumOrderValue: 0,
        maxDiscount: 0,
    });

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/productApi");
            setProducts(res.data || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/promocodeApi");
            setPromos(res.data || []);
        } catch (err) {
            console.error("Failed to fetch promo codes:", err);
        }
        setLoading(false);
    };

    const createOrUpdatePromo = async () => {
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`/api/promocodeApi?id=${editingId}`, form);
                setEditingId(null);
            } else {
                await axios.post("/api/promocodeApi", form);
            }
        } catch (err) {
            console.error("Failed to save promo code:", err);
        }
        fetchPromos();
        resetForm();
        setLoading(false);
    };

    const resetForm = () => {
        setForm({
            code: "",
            description: "",
            discount: 0,
            validFrom: "",
            expiry: "",
            applicableProducts: [],
            usageLimit: 0,
            minimumOrderValue: 0,
            maxDiscount: 0,
        });
    };

    const deleteOrActivatePromo = async (id, body) => {
        setLoading(true);
        try {
            await axios.put(`/api/promocodeApi?id=${id}`, body);

        } catch (err) {
            console.error("Failed to delete promo:", err);
        }
        fetchPromos();
        setLoading(false);
    };

    const startEdit = (promo) => {
        setEditingId(promo._id);
        console.log(promo);
        setForm({
            code: promo.code,
            discount: promo.discount,
            validFrom: promo.validFrom?.slice(0, 10),
            expiry: promo.expiry?.slice(0, 10),
            applicableProducts: promo.applicableProducts || [],
            usageLimit: promo.usageLimit,
            minimumOrderValue: promo.minimumOrderValue,
        });
    };

    useEffect(() => {
        fetchProducts();
        fetchPromos();
    }, []);

    return (
        <div className={styles.dashboard}>
            <div className={styles.card}>
                <h2 className={styles.cardTitle}>{editingId ? "Edit Promo Code" : "Create Promo Code"}</h2>

                <div className={styles.fieldGroup}>
                    <label>Code</label>
                    <input
                        className={styles.input}
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label>Description</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Discount (%)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={form.discount}
                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Valid From</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={form.validFrom}
                        onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Expiry</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={form.expiry}
                        onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Applicable Products</label>
                    <div className={styles.checkboxGroup}>
                        {products.map((p) => (
                            <label key={p.id} className={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    checked={form.applicableProducts?.includes(p._id)}
                                    onChange={(e) => {
                                        let updated = [...form.applicableProducts];
                                        if (e.target.checked) {
                                            updated.push(p._id);
                                        } else {
                                            updated = updated.filter((id) => id !== p._id);
                                        }
                                        setForm({ ...form, applicableProducts: updated });
                                    }}
                                />
                                <span>{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Usage Limit</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={form.usageLimit}
                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Minimum Order Value</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={form.minimumOrderValue}
                        onChange={(e) => setForm({ ...form, minimumOrderValue: e.target.value })}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label>Max Discount</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={form.maxDiscount}
                        onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    />
                </div>

                <button className={styles.button} onClick={createOrUpdatePromo}>
                    {loading ? "Saving..." : editingId ? "Update Promo" : "Create Promo"}
                </button>
            </div>


            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Promo Codes</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className={styles.promoList}>
                        {promos.map((promo) => (
                            <motion.div
                                key={promo._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${styles.promoItem} ${!promo.active ? styles.inactivePromo : ""}`}
                            >
                                <div onClick={() => startEdit(promo)} className={styles.promoClickArea}>
                                    <p className={styles.promoCode}>{promo.code}</p>
                                    <p className={styles.promoDiscount}>{promo.discount}% off</p>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => deleteOrActivatePromo(promo._id, { active: !promo.active })}
                                >
                                    {promo.active ? "Deactivate" : "Activate"}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
