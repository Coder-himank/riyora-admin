import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/product/edit.module.css";

export const arrayMainFields = [
    { label: "Name", name: "name" },
    { label: "Description", name: "description" },
    { label: "Price", name: "price" },
    { label: "Stock", name: "stock" },
    { label: "Promotion Codes", name: "promotionCode" },
    { label: "Discount Percentage", name: "discountPercentage" },
];

export const arrayFields = [
    [
        { label: "Name", name: "name" },
        { label: "Description", name: "description" },
        { label: "Quantity", name: "quantity" },
    ],
    [
        { label: "Category", name: "category" },
        { label: "Image URLs", name: "imageUrl" },
        { label: "Tags", name: "tags" },
    ],
    [
        { label: "Ingredients", name: "details.ingredients" },
        { label: "Key Ingredients", name: "details.keyIngredients" },
        { label: "Suitable For", name: "suitableFor" },
        { label: "Free From", name: "details.freeFrom" },
        { label: "Hair Type", name: "details.hairType" },
        { label: "Scalp Type", name: "details.scalpType" },
        { label: "Usage Frequency", name: "details.usage_frequency" },
        { label: "Rinse Required", name: "details.rinseRequired" },
        { label: "Patch Test Recommended", name: "details.patchTestRecommended" },
        { label: "Shelf Life", name: "details.shelfLife" },
        { label: "Benefits", name: "details.benefits" },
        { label: "Certifications", name: "details.certifications" },
        { label: "Available Sizes", name: "details.availableSizes" },
    ],
    [
        { label: "Related Blogs", name: "relatedBlogs" }
    ],
    [
        { label: "Brand", name: "details.brand" },
        { label: "Type", name: "details.type" },
        { label: "Container Material", name: "details.container_material" },
        { label: "Container Type", name: "details.container_type" },
        { label: "Container Dispenser", name: "details.container_dispenser" },
        { label: "Container Size", name: "details.container_size" },
    ]
];

/** ChipInput component inside same file */
function ChipInput({ name, values = [], onChange }) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed && !values.includes(trimmed)) {
                onChange([...values, trimmed]);
            }
            setInputValue("");
        }
    };

    const removeChip = (chip) => {
        onChange(values.filter(v => v !== chip));
    };

    return (
        <div className={styles.chipContainer}>
            <div className={styles.chipHolder}>

                {values.map((chip, idx) => (
                    <div key={idx} className={styles.chip}>
                        {chip}
                        <button type="button" onClick={() => removeChip(chip)}>×</button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                name={name}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type and press comma"
            />
        </div>
    );
}

const EditProductPage = () => {
    const router = useRouter();
    const { productId } = router.query;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dragOver, setDragOver] = useState(false);
    const baseImageUrl = process.env.IMAGE_BASE_URL;

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/api/productApi?productId=${productId}`);
                setProduct(res.data);
            } catch (err) {
                toast.error("Failed to load product " + err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => {
            const updated = { ...prev };
            setNestedValue(updated, name, value);
            return updated;
        });
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const urls = files.map(file => URL.createObjectURL(file));
        setProduct(prev => ({ ...prev, imageUrl: [...(prev.imageUrl || []), ...urls] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(product);

            await axios.put(`/api/productApi?productId=${productId}`, product);
            toast.success("Product updated");
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const deepRef = keys.reduce((acc, key) => {
            if (!acc[key]) acc[key] = {};
            return acc[key];
        }, obj);
        deepRef[lastKey] = value;
    };

    if (loading) return <p>Loading...</p>;
    if (!product) return <p>Product not found</p>;

    return (
        <div className={styles.container}>
            <section className={styles.header}>
                <div>

                    <h2>Editing Product: {product.name}</h2>
                    <p><strong>Last Modified:</strong> {product.lastModifiedAt || 'N/A'}</p>
                </div>
                <div>
                    <p>{product.averageRating}</p>
                    <p>{product.numReviews}</p>
                </div>
            </section>

            <div className={styles.form_container}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    {arrayFields.map((sec, i) => (
                        <section key={i} className={styles.section}>
                            {sec.map((field, j) => (
                                <div key={j} className={styles.inputDiv}>
                                    <label htmlFor={field.name}>{field.label}</label>
                                    {field.name === "tags" || field.name === "relatedBlogs" || field.name === "category" || field.name === "details.ingredients" || field.name === "details.keyIngredients" || field.name === "suitableFor" || field.name === "details.freeFrom" || field.name === "details.hairType" || field.name === "details.scalpType" || field.name === "details.benefits" || field.name === "details.certifications" || field.name === "details.availableSizes" ? (
                                        <ChipInput
                                            name={field.name}
                                            values={getNestedValue(product, field.name) || []}
                                            onChange={(newValues) => {
                                                setProduct(prev => {
                                                    const updated = { ...prev };
                                                    setNestedValue(updated, field.name, newValues);
                                                    return updated;
                                                });
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            id={field.name}
                                            name={field.name}
                                            value={getNestedValue(product, field.name) || ''}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </section>
                    ))}

                    {/* Image Drop Zone */}
                    <div
                        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleImageDrop}
                    >
                        <p>Drag & Drop Images Here</p>
                        {product.imageUrl?.length > 0 && (
                            <div className={styles.imagePreview}>
                                {product.imageUrl.map((url, idx) => (
                                    <img key={idx} src={baseImageUrl + url} alt={`Preview ${idx}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className={styles.saveBtn}>Save Product</button>
                </form>

                {/* Aside SEO Section */}
                <div className={styles.aside}>
                    <h2>SEO</h2>
                    <form className={styles.form}>
                        {arrayMainFields.map((field, i) => (
                            <div key={i} className={styles.inputDiv}>
                                <label htmlFor={field.name}>{field.label}</label>
                                <input
                                    type="text"
                                    id={field.name}
                                    name={field.name}
                                    value={getNestedValue(product, field.name) || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;
