import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/product/edit.module.css";
import { useSession } from "next-auth/react";

import ChipInput from "@/components/ui/ChipInput";
import { setNestedValue, getNestedValue } from "@/lib/utils";
import { MultiImageUploader, ImageUploader } from "@/components/ui/ImageUploader";

export const arrayMainFields = [
  { label: "Name", name: "name" },
  { label: "description", name: "description" },
  { label: "Slug (SEO URL)", name: "slug" },
  { label: "SKU", name: "sku" },
  { label: "MRP", name: "mrp" },
  { label: "Selling Price", name: "price" },
  { label: "Discount Percentage", name: "discountPercentage" },
  { label: "Stock", name: "stock" },
  { label: "Keywords (SEO)", name: "keywords" },
  { label: "Brand", name: "brand" },
  { label: "Currency", name: "currency" },
];

export const arrayFields = [
  [
    { label: "Category", name: "category" },
    { label: "Tags", name: "tags" },
  ],
  [
    { label: "Ingredients", name: "details.ingredients" },
    { label: "Key Ingredients", name: "details.keyIngredients" },
    { label: "Free From", name: "details.freeFrom" },
    { label: "Hair Type", name: "details.hairType" },
    { label: "Benefits", name: "details.benefits" },
    { label: "Item Form", name: "details.itemForm" },
    { label: "Item Volume", name: "details.itemVolume" },
  ],
  [
    { label: "Disclaimers", name: "disclaimers" },
    { label: "Related Blogs", name: "relatedBlogs" },
  ],
  [
    { label: "Brand Name", name: "specifications.brandName" },
    { label: "Product Name", name: "specifications.productName" },
    { label: "Country Of Origin", name: "specifications.countryOfOrigin" },
    { label: "Weight", name: "specifications.weight" },
    { label: "Pack Of", name: "specifications.packOf" },
    { label: "Generic Name", name: "specifications.genericName" },
    { label: "Product Dimension", name: "specifications.productDimensions" },
    { label: "Shelf Life", name: "specifications.shelfLife" }
  ],
  [
    { label: "Variants", name: "variants" },
  ],
  [
    { label: "How To Apply", name: "howToApply" },
  ],
  [
    { label: "Highlights", name: "highlights" },
    { label: "Choose Us", name: "chooseUs" },
    { label: "Suitable For", name: "suitableFor" },
  ],
];

// ...imports remain unchanged

const EditProductPage = () => {
  const router = useRouter();
  const { productId } = router.query;
  const { data: session } = useSession();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    if (productId === "new") {
      setProduct({
        name: "", slug: "", sku: "", mrp: "", price: "", discountPercentage: 0,
        stock: "", currency: "INR", keywords: [], brand: "", imageUrl: [],
        tags: [], category: [], details: { ingredients: [], keyIngredients: [], freeFrom: [], hairType: [], benefits: [], itemForm: "Oil", itemVolume: "100 ml", shelfLife: "" },
        specifications: { brandName: "", productName: "", countryOfOrigin: "India", weight: "", packOf: "1", genericName: "", productDimensions: "", shelfLife: "" },
        variants: [], howToApply: [], highlights: [], chooseUs: [], suitableFor: [], disclaimers: [], relatedBlogs: []
      });
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/productApi?productId=${productId}`);
        setProduct(res.data);
      } catch (err) {
        toast.error("Failed to load product: " + err);
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

  const handleSubmit = async () => {
    try {
      if (productId === "new") {
        await axios.post(`/api/productApi`, product);
        toast.success("Product Created");
        // router.push("/" + session?.user?.id + "/products");
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

  const setImage = (urls) => setProduct(prev => ({ ...prev, imageUrl: [...(prev.imageUrl || []), ...urls] }));
  const removeImage = (idx) => setProduct(prev => ({ ...prev, imageUrl: (prev.imageUrl || []).filter((_, i) => i !== idx) }));

  const isArrayField = (fieldName) => Array.isArray(getNestedValue(product, fieldName));

  // Auto-calculation functions
  const calculateDiscount = () => {
    const mrp = parseFloat(product?.mrp) || 0;
    const price = parseFloat(product?.price) || 0;
    if (mrp && price) {
      const discountPercentage = Math.round(((mrp - price) * 100) / mrp);
      setProduct(prev => ({ ...prev, discountPercentage }));
    }
  };
  const calculatePriceFromDiscount = () => {
    const mrp = parseFloat(product?.mrp) || 0;
    const discount = parseFloat(product?.discountPercentage) || 0;
    if (mrp && discount >= 0 && discount <= 100) {
      const price = Math.round(mrp - (mrp * discount) / 100);
      setProduct(prev => ({ ...prev, price }));
    }
  };

  const setVariantsImage = (url, idx) => {

    const updated = [...product.variants];
    updated[idx].imageUrl = url[0];
    setProduct({ ...product, variants: updated });
  }

  const setApplyImage = (url, idx) => {
    const updated = [...product.howToApply];
    updated[idx].imageUrl = url[0];
    setProduct({ ...product, howToApply: updated });
  }
  const setFieldImage = (url, idx, fieldName) => {
    const updated = [...product[fieldName]];
    updated[idx].imageUrl = url[0];
    setProduct({ ...product, [fieldName]: updated });
  }

  const removeVariantImage = (idx) => {
    const updated = [...product.howToApply];
    updated[idx].imageUrl = null;
    setProduct({ ...product, howToApply: updated });
  }


  const removeApplyImage = (idx) => {
    const updated = [...product.howToApply];
    updated[idx].imageUrl = null;
    setProduct({ ...product, howToApply: updated });
  }
  const removeFieldImage = (fieldName) => {
    const updated = [...product[fieldName]];
    updated[idx].imageUrl = null;
    setProduct({ ...product, [fieldName]: updated });
  }


  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <div>
          <h2>{productId === "new" ? "Create New Product" : `Editing Product: ${product.name}`}</h2>
          <p><strong>Last Modified:</strong> {Date(product.lastModifiedAt) || "N/A"}</p>
        </div>
        {productId !== "new" && (<div><p>Rating: {product.averageRating}</p><p>Reviews: {product.numReviews}</p></div>)}
      </section>

      <div className={styles.form_container}>
        {/* Left: Main fields */}
        <div className={styles.form_1}>
          {arrayFields.map((sec, i) => (
            <section key={i} className={styles.section}>
              {sec.map((field, j) => {
                const value = getNestedValue(product, field.name);

                // Variants
                if (field.name === "variants") {
                  return (
                    <div key={j} className={styles.variants}>
                      <div className={styles.section_head}>
                        <label>{field.label}</label>
                        <button type="button" onClick={() => setProduct({ ...product, variants: [...product.variants, {}] })}>Add Variant</button>
                      </div>
                      {product.variants.map((v, idx) => (
                        <div key={idx} className={styles.variantBox}>
                          <input placeholder="Variant Name" value={v.name || ""} onChange={e => { const updated = [...product.variants]; updated[idx].name = e.target.value; setProduct({ ...product, variants: updated }); }} />
                          <input type="number" placeholder="mrp" value={v.mrp || ""} onChange={e => { const updated = [...product.variants]; updated[idx].mrp = e.target.value; setProduct({ ...product, variants: updated }); }} />
                          <input type="number" placeholder="Price" value={v.price || ""} onChange={e => { const updated = [...product.variants]; updated[idx].price = e.target.value; setProduct({ ...product, variants: updated }); }} />
                          <input type="number" placeholder="Stock" value={v.stock || ""} onChange={e => { const updated = [...product.variants]; updated[idx].stock = e.target.value; setProduct({ ...product, variants: updated }); }} />
                          <input placeholder="Quantity" value={v.quantity || ""} onChange={e => { const updated = [...product.variants]; updated[idx].quantity = e.target.value; setProduct({ ...product, variants: updated }); }} />
                          <ImageUploader
                            image={v.imageUrl || ""}
                            setDataFunction={url => setVariantsImage(url, idx)}
                            removeDataFunction={() => removeVariantImage(idx)}
                            fileFolder={"allImages"}
                          />
                          <button type="button" onClick={() => { const updated = [...product.variants]; updated.splice(idx, 1); setProduct({ ...product, variants: updated }); }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  );
                }

                // How To Apply
                if (field.name === "howToApply") {
                  return (
                    <div key={j} className={styles.applySection}>
                      <div className={styles.section_head}>
                        <label>{field.label}</label>
                        <button type="button" onClick={() => setProduct({ ...product, howToApply: [...(product.howToApply || []), {}] })}>Add Step</button>
                      </div>
                      {(product.howToApply || []).map((step, idx) => (
                        <div key={idx} className={styles.applyStepBox}>
                          <input type="number" placeholder="Step Number" value={step.step || ""} onChange={e => { const updated = [...product.howToApply]; updated[idx].step = e.target.value; setProduct({ ...product, howToApply: updated }); }} />
                          <input placeholder="Title" value={step.title || ""} onChange={e => { const updated = [...product.howToApply]; updated[idx].title = e.target.value; setProduct({ ...product, howToApply: updated }); }} />
                          <input placeholder="Description" value={step.description || ""} onChange={e => { const updated = [...product.howToApply]; updated[idx].description = e.target.value; setProduct({ ...product, howToApply: updated }); }} />
                          <ImageUploader
                            image={step.imageUrl || ""}
                            setDataFunction={url => setApplyImage(url, idx)}
                            removeDataFunction={() => removeApplyImage(idx)}
                            fileFolder={"allImages"}
                          />
                          <button type="button" onClick={() => { const updated = [...product.howToApply]; updated.splice(idx, 1); setProduct({ ...product, howToApply: updated }); }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Highlights / Choose Us / Suitable For
                if (["highlights", "chooseUs", "suitableFor"].includes(field.name)) {
                  return (
                    <div key={j} className={styles.applySection}>
                      <div className={styles.section_head}>
                        <label>{field.label}</label>
                        <button type="button" onClick={() => setProduct({ ...product, [field.name]: [...(product[field.name] || []), {}] })}>Add</button>
                      </div>
                      {(product[field.name] || []).map((item, idx) => (
                        <div key={idx} className={styles.applyStepBox}>
                          {field.name === "highlights" ? (
                            <>
                              <input placeholder="Title" value={item.title || ""} onChange={e => { const updated = [...product.highlights]; updated[idx].title = e.target.value; setProduct({ ...product, highlights: updated }); }} />
                              <ChipInput values={item.content || []} onChange={vals => { const updated = [...product.highlights]; updated[idx].content = vals; setProduct({ ...product, highlights: updated }); }} />
                            </>
                          ) : (
                            <>
                              <input placeholder="Text" value={item.text || item.img || ""} onChange={e => { const updated = [...product[field.name]]; updated[idx].text = e.target.value; setProduct({ ...product, [field.name]: updated }); }} />
                              <ImageUploader
                                image={item.imageUrl || ""}
                                setDataFunction={url => setFieldImage(url, idx, field.name)}
                                removeDataFunction={() => removeFieldImage(idx)}
                                fileFolder={"allImages"}
                              />
                            </>
                          )}
                          <button type="button" onClick={() => { const updated = [...product[field.name]]; updated.splice(idx, 1); setProduct({ ...product, [field.name]: updated }); }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Default input fields
                return (
                  <div key={j} className={styles.inputDiv}>
                    <label>{field.label}</label>
                    {isArrayField(field.name) ? (
                      <ChipInput values={value || []} onChange={vals => { setNestedValue(product, field.name, vals); setProduct({ ...product }); }} />
                    ) : (
                      <input name={field.name} value={value || ""} onChange={handleChange}
                        onBlur={() => {
                          if (["mrp", "price"].includes(field.name)) calculateDiscount();
                          if (field.name === "discountPercentage") calculatePriceFromDiscount();
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </section>
          ))}

          <section className={styles.section}>
            <MultiImageUploader
              images={product.imageUrl || []}
              setDataFunction={setImage}
              removeDataFunction={removeImage} fileFolder="Products" />
          </section>
        </div>

        {/* Right panel */}
        <div className={styles.form_2}>
          <h2>SEO & Pricing</h2>
          {arrayMainFields.map((field, i) => {
            const value = getNestedValue(product, field.name);
            return (
              <div key={i} className={styles.inputDiv}>
                <label>{field.label}</label>
                {isArrayField(field.name) ? (
                  <ChipInput values={value || []} onChange={vals => { setNestedValue(product, field.name, vals); setProduct({ ...product }); }} />
                ) : field.name === "description" ? <textarea name={field.name}
                  value={value || ""}
                  onChange={handleChange}></textarea> : (
                  <input
                    name={field.name}
                    value={value || ""}
                    onChange={handleChange}
                    onBlur={() => {
                      if (["mrp", "price"].includes(field.name)) calculateDiscount();
                      if (field.name === "discountPercentage") calculatePriceFromDiscount();
                    }}
                  />
                )}
              </div>
            )
          })}
          <button className={styles.saveBtn} onClick={handleSubmit}>{productId === "new" ? "Create Product" : "Save Product"}</button>
          {productId !== "new" && <button className={styles.deleteBtn} onClick={handleDelete}>Delete Product</button>}
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;
