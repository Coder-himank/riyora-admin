// pages/product/edit.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/product/edit.module.css";
import { useSession } from "next-auth/react";

import ChipInput from "@/components/ui/ChipInput";
import { setNestedValue, getNestedValue } from "@/lib/utils";
import { MultiImageUploader, ImageUploader } from "@/components/ui/ImageUploader";

// ===== Field Definitions =====
export const arrayMainFields = [
  { label: "Name", name: "name" },
  { label: "Description", name: "description" },
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
    { label: "Shelf Life", name: "specifications.shelfLife" },
  ],
  [
    { label: "Variants", name: "variants" }, // added for variants
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

// ===== Helper Functions =====
const isArrayField = (product, fieldName) => Array.isArray(getNestedValue(product, fieldName));
const normalizeToArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const createEmptyVariant = (product) => ({
  name: "",
  sku: "",
  mrp: product.mrp || 0,
  price: product.price || 0,
  stock: 0,
  quantity: "",
  imageUrl: [],
});

const createEmptyStep = () => ({
  step: "",
  title: "",
  description: "",
  imageUrl: "",
});

const createEmptyItem = () => ({
  text: "",
  imageUrl: "",
});

const createEmptyHighlight = () => ({
  title: "",
  content: [],
});

// ===== Main Component =====
const EditProductPage = () => {
  const router = useRouter();
  const { productId } = router.query;
  const { data: session } = useSession();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== Fetch or Initialize Product =====
  useEffect(() => {
    if (!productId) return;

    if (productId === "new") {
      setProduct({
        name: "",
        slug: "",
        sku: "",
        mrp: "",
        price: "",
        discountPercentage: 0,
        stock: "",
        currency: "INR",
        keywords: [],
        brand: "",
        imageUrl: [],
        tags: [],
        category: [],
        details: { ingredients: [], keyIngredients: [], freeFrom: [], hairType: [], benefits: [], itemForm: "Oil", itemVolume: "100 ml" },
        specifications: { brandName: "", productName: "", countryOfOrigin: "India", weight: "", packOf: "1", genericName: "", productDimensions: "", shelfLife: "" },
        variants: [],
        howToApply: [],
        highlights: [],
        chooseUs: [],
        suitableFor: [],
        disclaimers: [],
        relatedBlogs: [],
      });
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/productApi?productId=${productId}`);
        const data = res.data;

        // Normalize image arrays
        data.imageUrl = normalizeToArray(data.imageUrl);
        data.variants = data.variants?.map((v) => ({ ...v, imageUrl: normalizeToArray(v.imageUrl) })) || [];
        data.howToApply = data.howToApply?.map((s) => ({ ...s, imageUrl: s.imageUrl || "" })) || [];
        data.chooseUs = data.chooseUs?.map((c) => ({ ...c, imageUrl: c.imageUrl || "" })) || [];
        data.suitableFor = data.suitableFor?.map((s) => ({ ...s, imageUrl: s.imageUrl || "" })) || [];

        setProduct(data);
      } catch (err) {
        toast.error("Failed to load product: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ===== Handlers =====
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
      } else {
        await axios.put(`/api/productApi?productId=${productId}`, product);
        toast.success("Product Updated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Save Failed");
    }
  };

  const handleDelete = async () => {
    if (productId === "new") return;
    try {
      await axios.delete(`/api/productApi?productId=${productId}`);
      toast.success("Product Deleted");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  // ===== Image Handlers =====
  const setImage = (urls) => setProduct((prev) => ({ ...prev, imageUrl: [...(prev.imageUrl || []), ...urls] })); // multi
  const removeImage = (idx) => setProduct((prev) => ({ ...prev, imageUrl: (prev.imageUrl || []).filter((_, i) => i !== idx) }));

  const setVariantsImage = (urls, idx) => {
    const updated = [...(product.variants || [])];
    updated[idx] = { ...(updated[idx] || {}), imageUrl: [...(updated[idx]?.imageUrl || []), ...urls] };
    setProduct({ ...product, variants: updated });
  };

  const removeVariantImage = (variantIdx, imgIdx) => {
    const updated = [...(product.variants || [])];
    if (!updated[variantIdx]) return;
    updated[variantIdx].imageUrl = (updated[variantIdx].imageUrl || []).filter((_, i) => i !== imgIdx);
    setProduct({ ...product, variants: updated });
  };

  const setApplyImage = (urls, idx) => {
    const updated = [...(product.howToApply || [])];
    updated[idx] = { ...(updated[idx] || {}), imageUrl: urls[0] || "" }; // only first
    setProduct({ ...product, howToApply: updated });
  };

  const removeApplyImage = (idx) => {
    const updated = [...(product.howToApply || [])];
    if (!updated[idx]) return;
    updated[idx].imageUrl = "";
    setProduct({ ...product, howToApply: updated });
  };

  const setFieldImage = (urls, idx, fieldName) => {
    const updated = [...(product[fieldName] || [])];
    updated[idx] = { ...(updated[idx] || {}), imageUrl: urls[0] || "" }; // only first
    setProduct({ ...product, [fieldName]: updated });
  };

  const removeFieldImage = (fieldName, idx, imgIdx) => {
    const updated = [...(product[fieldName] || [])];
    if (!updated[idx]) return;
    updated[idx].imageUrl = ""; // single image
    setProduct({ ...product, [fieldName]: updated });
  };

  // ===== Auto-calculation =====
  const calculateDiscount = () => {
    const mrp = parseFloat(product?.mrp) || 0;
    const price = parseFloat(product?.price) || 0;
    if (mrp && price) {
      const discountPercentage = Math.round(((mrp - price) * 100) / mrp);
      setProduct((prev) => ({ ...prev, discountPercentage }));
    }
  };

  const calculatePriceFromDiscount = () => {
    const mrp = parseFloat(product?.mrp) || 0;
    const discount = parseFloat(product?.discountPercentage) || 0;
    if (mrp && discount >= 0 && discount <= 100) {
      const price = Math.round(mrp - (mrp * discount) / 100);
      setProduct((prev) => ({ ...prev, price }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  // ===== Render =====
  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <div>
          <h2>{productId === "new" ? "Create New Product" : `Editing Product: ${product.name}`}</h2>
          <p><strong>Last Modified:</strong> {product.lastModifiedAt ? new Date(product.lastModifiedAt).toLocaleString() : "N/A"}</p>
        </div>
        {productId !== "new" && (<div><p>Rating: {product.averageRating}</p><p>Reviews: {product.numReviews}</p></div>)}
      </section>

      <div className={styles.form_container}>
        {/* Left Panel */}
        <div className={styles.form_1}>
          <section className={styles.section}>
            <MultiImageUploader
              images={product.imageUrl || []}
              setDataFunction={setImage}
              removeDataFunction={removeImage}
              fileFolder="Products"
            />
          </section>

          {arrayFields.map((sec, i) => (
            <section key={i} className={styles.section}>
              {sec.map((field, j) => (
                <FieldRenderer
                  key={j}
                  field={field}
                  product={product}
                  setProduct={setProduct}
                  handleChange={handleChange}
                  setVariantsImage={setVariantsImage}
                  removeVariantImage={removeVariantImage}
                  setApplyImage={setApplyImage}
                  removeApplyImage={removeApplyImage}
                  setFieldImage={setFieldImage}
                  removeFieldImage={removeFieldImage}
                />
              ))}
            </section>
          ))}
        </div>

        {/* Right Panel */}
        <div className={styles.form_2}>
          <h2>SEO & Pricing</h2>
          {arrayMainFields.map((field, i) => {
            const value = getNestedValue(product, field.name);
            return (
              <div key={i} className={styles.inputDiv}>
                <label>{field.label}</label>
                {isArrayField(product, field.name) ? (
                  <ChipInput values={value || []} onChange={vals => { setNestedValue(product, field.name, vals); setProduct({ ...product }); }} />
                ) : field.name === "description" ? (
                  <textarea name={field.name} value={value || ""} onChange={handleChange}></textarea>
                ) : (
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

// ===== Modular Components =====

// Render any field based on type
const FieldRenderer = ({ field, product, setProduct, handleChange, setVariantsImage, removeVariantImage, setApplyImage, removeApplyImage, setFieldImage, removeFieldImage }) => {
  const value = getNestedValue(product, field.name);

  if (field.name === "variants") return <VariantSection product={product} setProduct={setProduct} setVariantsImage={setVariantsImage} removeVariantImage={removeVariantImage} />;
  if (field.name === "howToApply") return <ApplySection product={product} setProduct={setProduct} setApplyImage={setApplyImage} removeApplyImage={removeApplyImage} />;
  if (["highlights", "chooseUs", "suitableFor"].includes(field.name)) return <ArraySection product={product} setProduct={setProduct} field={field} setFieldImage={setFieldImage} removeFieldImage={removeFieldImage} />;

  return (
    <div className={styles.inputDiv}>
      <label>{field.label}</label>
      {isArrayField(product, field.name) ? (
        <ChipInput values={value || []} onChange={vals => { setNestedValue(product, field.name, vals); setProduct({ ...product }); }} />
      ) : (
        <input name={field.name} value={value || ""} onChange={handleChange} />
      )}
    </div>
  );
};


// ===== Variant Section =====
const VariantSection = ({ product, setProduct, setVariantsImage, removeVariantImage }) => {
  const addVariant = () => setProduct(prev => ({ ...prev, variants: [...(prev.variants || []), createEmptyVariant(prev)] }));
  const removeVariant = (idx) => {
    const updated = [...(product.variants || [])];
    updated.splice(idx, 1);
    setProduct({ ...product, variants: updated });
  };

  return (
    <div className={styles.variants}>
      <div className={styles.section_head}>
        <label>Variants</label>
        <button type="button" onClick={addVariant}>Add Variant</button>
      </div>
      {(product.variants || []).map((v, idx) => (
        <div key={idx} className={styles.inputBox}>
          <div className={styles.boxHeader}>
            <button type="button" onClick={() => removeVariant(idx)}>Remove</button>
          </div>
          <div className={styles.boxContent}>
            <div className={styles.fieldsInput}>
              <input placeholder="Variant Name" value={v.name || ""} onChange={e => { const updated = [...product.variants]; updated[idx].name = e.target.value; setProduct({ ...product, variants: updated }); }} />
              <input placeholder="SKU" value={v.sku || ""} onChange={e => { const updated = [...product.variants]; updated[idx].sku = e.target.value; setProduct({ ...product, variants: updated }); }} />
              <input type="number" placeholder="MRP" value={v.mrp || ""} onChange={e => { const updated = [...product.variants]; updated[idx].mrp = Number(e.target.value); setProduct({ ...product, variants: updated }); }} />
              <input type="number" placeholder="Price" value={v.price || ""} onChange={e => { const updated = [...product.variants]; updated[idx].price = Number(e.target.value); setProduct({ ...product, variants: updated }); }} />
              <input type="number" placeholder="Stock" value={v.stock || ""} onChange={e => { const updated = [...product.variants]; updated[idx].stock = Number(e.target.value); setProduct({ ...product, variants: updated }); }} />
              <input placeholder="Quantity (e.g., 1 pc, 100 ml)" value={v.quantity || ""} onChange={e => { const updated = [...product.variants]; updated[idx].quantity = e.target.value; setProduct({ ...product, variants: updated }); }} />
            </div>
            <div className={styles.boxImageWrapper}>
              <MultiImageUploader
                images={v.imageUrl || []}
                multiple
                setDataFunction={(urls) => setVariantsImage(urls, idx)}
                removeDataFunction={(imgIdx) => removeVariantImage(idx, imgIdx)}
                fileFolder={`products/${product.slug || 'tmp'}/variants`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== Apply Section =====
const ApplySection = ({ product, setProduct, setApplyImage, removeApplyImage }) => {
  const addStep = () => setProduct(prev => ({ ...prev, howToApply: [...(prev.howToApply || []), createEmptyStep()] }));
  const removeStep = (idx) => { const updated = [...product.howToApply]; updated.splice(idx, 1); setProduct({ ...product, howToApply: updated }); };

  return (
    <div className={styles.applySection}>
      <div className={styles.section_head}>
        <label>How To Apply</label>
        <button type="button" onClick={addStep}>Add Step</button>
      </div>
      {(product.howToApply || []).map((step, idx) => (
        <div key={idx} className={styles.inputBox}>
          <div className={styles.boxHeader}>
            <button type="button" onClick={() => removeStep(idx)}>Remove</button>
          </div>
          <div className={styles.boxContent}>
            <div className={styles.fieldsInput}>
              <input type="number" placeholder="Step Number" value={step.step || ""} onChange={e => { const updated = [...product.howToApply]; updated[idx].step = Number(e.target.value); setProduct({ ...product, howToApply: updated }); }} />
              <input placeholder="Title" value={step.title || ""} onChange={e => { const updated = [...product.howToApply]; updated[idx].title = e.target.value; setProduct({ ...product, howToApply: updated }); }} />
              <input placeholder="Description" value={step.description || ""} onChange={e => { const updated = [...product.howToApply]; updated[idx].description = e.target.value; setProduct({ ...product, howToApply: updated }); }} />
            </div>
            <div className={styles.boxImageWrapper}>
              <ImageUploader
                image={step.imageUrl || ""}
                multiple
                setDataFunction={(urls) => setApplyImage(urls, idx)}
                removeDataFunction={() => removeApplyImage(idx)}
                fileFolder="allImages"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== Array Section (Highlights, ChooseUs, SuitableFor) =====
const ArraySection = ({ product, setProduct, field, setFieldImage, removeFieldImage }) => {
  const addItem = () => {
    const empty = field.name === "highlights" ? createEmptyHighlight() : createEmptyItem();
    setProduct(prev => ({ ...prev, [field.name]: [...(prev[field.name] || []), empty] }));
  };

  const removeItem = (idx) => {
    const updated = [...(product[field.name] || [])];
    updated.splice(idx, 1);
    setProduct({ ...product, [field.name]: updated });
  };

  return (
    <div className={styles.applySection}>
      <div className={styles.section_head}>
        <label>{field.label}</label>
        <button type="button" onClick={addItem}>Add</button>
      </div>
      {(product[field.name] || []).map((item, idx) => (
        <div key={idx} className={styles.inputBox}>
          <div className={styles.boxHeader}>
            <button type="button" onClick={() => removeItem(idx)}>Remove</button>
          </div>
          <div className={styles.boxContent}>
            {field.name === "highlights" ? (
              <>
                <input placeholder="Title" value={item.title || ""} onChange={e => { const updated = [...product.highlights]; updated[idx].title = e.target.value; setProduct({ ...product, highlights: updated }); }} />
                <ChipInput values={item.content || []} onChange={vals => { const updated = [...product.highlights]; updated[idx].content = vals; setProduct({ ...product, highlights: updated }); }} />
              </>
            ) : (
              <>
                <input placeholder="Text" value={item.text || ""} onChange={e => { const updated = [...product[field.name]]; updated[idx].text = e.target.value; setProduct({ ...product, [field.name]: updated }); }} />
                <div className={styles.boxImageWrapper}>
                  <ImageUploader
                    image={item.imageUrl || []}
                    multiple
                    setDataFunction={(urls) => setFieldImage(urls, idx, field.name)}
                    removeDataFunction={(imgIdx) => removeFieldImage(field.name, idx, imgIdx)}
                    fileFolder="allImages"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
