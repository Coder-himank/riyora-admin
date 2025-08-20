import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/product/edit.module.css";

import ChipInput from "@/components/ui/ChipInput";
import { setNestedValue, getNestedValue } from "@/lib/utils";
import { MultiImageUploader } from "@/components/ui/ImageUploader";

export const arrayMainFields = [
  { label: "Name", name: "name" },
  { label: "Description", name: "description" },
  { label: "MRP", name: "mrp" },
  { label: "Selling Price", name: "sellingPrice" },
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
    // { label: "Image URLs", name: "imageUrl" },
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
  [{ label: "Related Blogs", name: "relatedBlogs" }],
  [
    { label: "Brand", name: "details.brand" },
    { label: "Type", name: "details.type" },
    { label: "Container Material", name: "details.container_material" },
    { label: "Container Type", name: "details.container_type" },
    { label: "Container Dispenser", name: "details.container_dispenser" },
    { label: "Container Size", name: "details.container_size" },
  ],
];

const EditProductPage = () => {
  const router = useRouter();
  const { productId } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    if (productId === "new") {
      // Initialize empty product for new creation
      setProduct({
        name: "",
        description: "",
        mrp: "",
        sellingPrice: "",
        stock: "",
        promotionCode: "",
        discountPercentage: "",
        imageUrl: [],
        tags: [],
        category: [],
        details: {},
        relatedBlogs: [],
      });
      setLoading(false);
      return;
    }

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
    setProduct((prev) => {
      const updated = { ...prev };
      setNestedValue(updated, name, value);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    try {
      if (productId === "new") {
        await axios.post(`/api/productApi`, product);
        toast.success("Product Created");
      } else {
        await axios.put(`/api/productApi?productId=${productId}`, product);
        toast.success("Product updated");
      }
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (productId === "new") return;
    try {
      await axios.delete(`/api/productApi?productId=${productId}`);
      toast.success("Product deleted");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const setImage = (urls) => {
    setProduct((prev) => ({
      ...prev,
      imageUrl: [...(prev.imageUrl || []), ...urls],
    }));
  };

  const removeImage = (idx) => {
    setProduct((prev) => ({
      ...prev,
      imageUrl: (prev.imageUrl || []).filter((_, i) => i !== idx),
    }));
  };

  const calculateDiscount = () => {
    const mrp = parseFloat(product?.mrp) || 0;
    const sp = parseFloat(product?.sellingPrice) || 0;
    if (mrp > 0 && sp > 0) {
      const discountPercentage = Math.round(((mrp - sp) * 100) / mrp);
      setProduct((prev) => ({ ...prev, discountPercentage }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <div>
          <h2>
            {productId === "new"
              ? "Create New Product"
              : `Editing Product: ${product.name}`}
          </h2>
          <p>
            <strong>Last Modified:</strong> {product.lastModifiedAt || "N/A"}
          </p>
        </div>
        {productId !== "new" && (
          <div>
            <p>{product.averageRating}</p>
            <p>{product.numReviews}</p>
          </div>
        )}
      </section>
        <div className={styles.form_container}>
          {/* Main Product Fields */}
          <div className={styles.form_1}>
            {arrayFields.map((sec, i) => (
              <section key={i} className={styles.section}>
                {sec.map((field, j) => (
                  <div key={j} className={styles.inputDiv}>
                    <label htmlFor={field.name}>{field.label}</label>
                    {[
                      "tags",
                      "relatedBlogs",
                      "category",
                      "details.ingredients",
                      "details.keyIngredients",
                      "suitableFor",
                      "details.freeFrom",
                      "details.hairType",
                      "details.scalpType",
                      "details.benefits",
                      "details.certifications",
                      "details.availableSizes",
                    ].includes(field.name) ? (
                      <ChipInput
                        name={field.name}
                        values={getNestedValue(product, field.name) || []}
                        onChange={(newValues) => {
                          setProduct((prev) => {
                            const updated = { ...prev };
                            setNestedValue(updated, field.name, newValues);
                            return updated;
                          });
                        }}
                      />
                    ) :  (
                      <input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={getNestedValue(product, field.name) || ""}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}
              </section>
            ))}

            {/* Image Uploader */}
            <section className={styles.section}>
              <MultiImageUploader
                images={product.imageUrl || []}
                setDataFunction={setImage}
                removeDataFunction={removeImage}
                fileFolder={"Products"}
              />
            </section>
          </div>

          {/* SEO + Price Section */}
          <div className={styles.form_2}>
            <h2>SEO</h2>
            {arrayMainFields.map((field, i) => (
              <div key={i} className={styles.inputDiv}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={getNestedValue(product, field.name) || ""}
                  onChange={handleChange}
                  onKeyUp={
                    field.name === "mrp" || field.name === "sellingPrice"
                      ? calculateDiscount
                      : () => {}
                  }
                />
              </div>
            ))}
            <button className={styles.saveBtn}
                onClick={handleSubmit}
            >
              {productId === "new" ? "Create Product" : "Save Product"}
            </button>
            {productId !== "new" && (
              <button
                type="button"
                onClick={handleDelete}
                className={styles.deleteBtn}
              >
                Delete Product
              </button>
            )}
          </div>
        </div>
    </div>
  );
};

export default EditProductPage;
