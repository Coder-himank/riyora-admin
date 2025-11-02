import { useState, useEffect } from "react";
import styles from "@/styles/predefined/predefined.module.css";
import ImageManager from "@/components/ui/ImageManager";
import ListEditor from "@/components/ui/Listeditor";

const DATA_TYPES = ["ingredients", "chooseUs", "suitableFor", "faq"];

export default function PredefinedTabbedAdmin() {
    const [activeType, setActiveType] = useState(DATA_TYPES[0]);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAddBox, setShowAddBox] = useState(false);

    const initialForms = {
        ingredients: { name: "", imageUrl: "", description: "", notes: [] },
        chooseUs: { name: "", imageUrl: "" },
        suitableFor: { name: "", imageUrl: "" },
        faq: { question: "", answer: "" },
    };
    const [form, setForm] = useState(initialForms[activeType]);

    useEffect(() => {
        fetchTypeData(activeType);
        setForm(initialForms[activeType]);
        setShowAddBox(false);
    }, [activeType]);

    async function fetchTypeData(type) {
        setLoading(true);
        try {
            const res = await fetch(`/api/predefinedDataApi?type=${type}`);
            const result = await res.json();
            setData((prev) => ({ ...prev, [type]: result?.data?.data || [] }));
        } catch {
            setData((prev) => ({ ...prev, [type]: [] }));
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (index, field, value) => {
        const updated = [...(data[activeType] || [])];
        updated[index][field] = value;
        setData({ ...data, [activeType]: updated });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch(`/api/predefinedDataApi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: activeType, data: data[activeType] }),
            });
            alert("✅ Saved successfully!");
        } catch {
            alert("❌ Failed to save changes");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = (index) => {
        if (!confirm("Delete this item?")) return;
        const updated = (data[activeType] || []).filter((_, i) => i !== index);
        setData({ ...data, [activeType]: updated });
    };

    const handleAdd = async () => {
        const current = data[activeType] || [];
        const updated = [...current, form];
        setData({ ...data, [activeType]: updated });
        setForm(initialForms[activeType]);
        setShowAddBox(false);
        await handleSave();
    };

    const setImageFunction = (urls) => setForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }));
    const removeImageFunction = () => setForm((prev) => ({ ...prev, imageUrl: "" }));

    const renderItemCard = (item, index) => {
        switch (activeType) {
            case "ingredients":
                return (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardLeft}>
                            {/* {item.imageUrl ? ( */}
                            <ImageManager
                                multiple={false}
                                images={item.imageUrl ? [item.imageUrl] : []}
                                fileFolder={activeType}
                                setDataFunction={(urls) => {
                                    const updated = [...(data[activeType] || [])];
                                    updated[index].imageUrl = urls[0] || "";
                                    setData({ ...data, [activeType]: updated });
                                }}
                                removeDataFunction={() => {
                                    const updated = [...(data[activeType] || [])];
                                    updated[index].imageUrl = "";
                                    setData({ ...data, [activeType]: updated });
                                }}
                                className={styles.cardImage}
                            />
                            {/* ) : (
                                <div className={styles.noImage}>No Image</div>
                            )} */}
                        </div>
                        <div className={styles.cardRight}>
                            <input
                                value={item.name || ""}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                className={styles.cardTitle}
                                placeholder="Name"
                            />
                            <textarea
                                value={item.description || ""}
                                onChange={(e) => handleChange(index, "description", e.target.value)}
                                placeholder="Description"
                                className={styles.cardDescription}
                            />
                            <label className={styles.label}>Notes:</label>
                            <ListEditor
                                values={item.notes || []}
                                onChange={(newList) => handleChange(index, "notes", newList)}
                            />
                        </div>
                        <button onClick={() => handleDeleteItem(index)} className={styles.deleteBtn}>
                            ✕
                        </button>
                    </div>
                );

            case "chooseUs":
            case "suitableFor":
                return (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardLeft}>
                            {/* {item.imageUrl ? ( */}
                            <ImageManager
                                multiple={false}
                                images={item.imageUrl ? [item.imageUrl] : []}
                                fileFolder={activeType}
                                setDataFunction={(urls) => {
                                    const updated = [...(data[activeType] || [])];
                                    updated[index].imageUrl = urls[0] || "";
                                    setData({ ...data, [activeType]: updated });
                                }}
                                removeDataFunction={() => {
                                    const updated = [...(data[activeType] || [])];
                                    updated[index].imageUrl = "";
                                    setData({ ...data, [activeType]: updated });
                                }}
                                className={styles.cardImage}
                            />
                            {/* // ) : (
                            //     <div className={styles.noImage}>No Image</div>
                            // )} */}
                        </div>
                        <div className={styles.cardRight}>
                            <input
                                value={item.name || ""}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                className={styles.cardTitle}
                                placeholder="Name"
                            />
                        </div>
                        <button onClick={() => handleDeleteItem(index)} className={styles.deleteBtn}>
                            ✕
                        </button>
                    </div>
                );

            case "faq":
                return (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardFaq}>
                            <input
                                value={item.question || ""}
                                onChange={(e) => handleChange(index, "question", e.target.value)}
                                className={styles.cardTitle}
                                placeholder="Question"
                            />
                            <textarea
                                value={item.answer || ""}
                                onChange={(e) => handleChange(index, "answer", e.target.value)}
                                placeholder="Answer"
                                className={styles.cardDescription}
                            />
                        </div>
                        <button onClick={() => handleDeleteItem(index)} className={styles.deleteBtn}>
                            ✕
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderAddBox = () => {
        switch (activeType) {
            case "ingredients":
                return (
                    <div className={styles.modalContent}>
                        <h3>Add Ingredient</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <ImageManager
                            multiple={false}
                            images={form.imageUrl ? [form.imageUrl] : []}
                            fileFolder="ingredients"
                            setDataFunction={setImageFunction}
                            removeDataFunction={removeImageFunction}
                        />
                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <label className={styles.label}>Notes:</label>
                        <ListEditor
                            values={form.notes || []}
                            onChange={(newList) => setForm((prev) => ({ ...prev, notes: newList }))}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={handleAdd} disabled={loading} className={styles.saveBtn}>
                                ✅ Save Item
                            </button>
                            <button onClick={() => setShowAddBox(false)} className={styles.cancelBtn}>
                                ✖ Cancel
                            </button>
                        </div>
                    </div>
                );

            case "chooseUs":
            case "suitableFor":
                return (
                    <div className={styles.modalContent}>
                        <h3>Add {activeType}</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <ImageManager
                            multiple={false}
                            images={form.imageUrl ? [form.imageUrl] : []}
                            fileFolder={activeType}
                            setDataFunction={setImageFunction}
                            removeDataFunction={removeImageFunction}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={handleAdd} disabled={loading} className={styles.saveBtn}>
                                ✅ Save Item
                            </button>
                            <button onClick={() => setShowAddBox(false)} className={styles.cancelBtn}>
                                ✖ Cancel
                            </button>
                        </div>
                    </div>
                );

            case "faq":
                return (
                    <div className={styles.modalContent}>
                        <h3>Add FAQ</h3>
                        <input
                            type="text"
                            placeholder="Question"
                            value={form.question}
                            onChange={(e) => setForm({ ...form, question: e.target.value })}
                        />
                        <textarea
                            placeholder="Answer"
                            value={form.answer}
                            onChange={(e) => setForm({ ...form, answer: e.target.value })}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={handleAdd} disabled={loading} className={styles.saveBtn}>
                                ✅ Save Item
                            </button>
                            <button onClick={() => setShowAddBox(false)} className={styles.cancelBtn}>
                                ✖ Cancel
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>🧩 Predefined Data Manager</h1>

            {/* Tabs */}
            <div className={styles.tabs}>
                {DATA_TYPES.map((type) => (
                    <button
                        key={type}
                        className={`${styles.tab} ${activeType === type ? styles.activeTab : ""}`}
                        onClick={() => setActiveType(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* List Content */}
            <div className={styles.content}>
                {loading ? (
                    <p className={styles.loading}>Loading...</p>
                ) : (
                    <div className={styles.cardList}>
                        {(data[activeType] || []).length === 0 && (
                            <p className={styles.empty}>No items found. Add one below.</p>
                        )}
                        {(data[activeType] || []).map((item, index) => renderItemCard(item, index))}
                    </div>
                )}
            </div>

            <div className={styles.addNewBar}>
                <button onClick={() => setShowAddBox(true)} className={styles.addNewBtn}>
                    ➕ Add New Item
                </button>
            </div>

            <div className={styles.saveBar}>
                <button onClick={handleSave} disabled={loading}>
                    💾 Save All Changes
                </button>
            </div>

            {showAddBox && <div className={styles.modalOverlay}>{renderAddBox()}</div>}
        </div>
    );
}
