// pages/product/edit.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/product/edit.module.css";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ChipInput from "@/components/ui/ChipInput";
import { setNestedValue, getNestedValue } from "@/lib/utils";
import Image from "next/image";
import ImageManager from "@/components/ui/ImageManager";
import Tabs from "@/components/ui/Tabs";
import AutoTextarea from "@/components/ui/AutoTextarea";
// import predefinedValues from "@/lib/models/predefinedValues";


const FIELD_GROUPS = {
  "General Info": [
    { label: "Brand", name: "brand" },
    { label: "SKU", name: "sku" },
    { label: "Name", name: "name" },
    { label: "Description", name: "description" },
  ],

  "Pricing & Stock": [
    { label: "Currency", name: "currency" },
    { label: "MRP", name: "mrp" },
    { label: "Selling Price", name: "price" },
    { label: "Discount %", name: "discountPercentage" },
    { label: "Stock", name: "stock" },
  ],

  "Details": [
    { label: "Ingredients", name: "details.ingredients" },
    { label: "Key Ingredients", name: "details.keyIngredients" },
    { label: "Free From", name: "details.freeFrom" },
    { label: "Hair Type", name: "details.hairType" },
    { label: "Benefits", name: "details.benefits" },
    { label: "Item Form", name: "details.itemForm" },
    { label: "Item Volume", name: "details.itemVolume" },
  ],

  "Specifications": [
    { label: "Category", name: "category" },
    { label: "Brand Name", name: "specifications.brandName" },
    { label: "Product Name", name: "specifications.productName" },
    { label: "Country Of Origin", name: "specifications.countryOfOrigin" },
    { label: "Weight", name: "specifications.weight" },
    { label: "Pack Of", name: "specifications.packOf" },
    { label: "Generic Name", name: "specifications.genericName" },
    { label: "Product Dimensions", name: "specifications.productDimensions" },
    { label: "Shelf Life", name: "specifications.shelfLife" },
  ],

  "How To Apply": [{ label: "How To Apply", name: "howToApply" }],

  "Highlights & Features": [
    { label: "Highlights", name: "highlights" },
    { label: "Choose Us", name: "chooseUs" },
    { label: "Suitable For", name: "suitableFor" },
  ],

  "SEO & Relations": [
    { label: "Tags", name: "tags" },
    { label: "Slug (SEO URL)", name: "slug" },
    { label: "Keywords (SEO)", name: "keywords" },
    { label: "Disclaimers", name: "disclaimers" },
    { label: "Related Blogs", name: "relatedBlogs" },
  ],

  "Variants": [{ label: "Variants", name: "variants" }],
};
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
  dimensions: "",
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
        banners: []
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
      await axios.put(`/api/productApi?productId=${productId}`, {
        visible: false
      });
      toast.success("Product set to invisble");
      // router.push("/admin/products");
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



  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;


  const tabs = Object.entries(FIELD_GROUPS).reduce((acc, [label, fields]) => {
    acc[label] = (
      <div className={styles.section}>
        {fields.map((field, i) => (
          <FieldRenderer
            key={`${label}-${i}`}
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
      </div>
    );
    return acc;
  }, {});

  // Add Images tab separately
  tabs["Images"] = (
    <>
      <section className={styles.productImageWrapper}>

        <ImageManager
          images={product.imageUrl || []}
          setDataFunction={(urls) => setProduct((p) => ({ ...p, imageUrl: [...(p.imageUrl || []), ...urls] }))}
          removeDataFunction={(idx) =>
            setProduct((p) => ({ ...p, imageUrl: p.imageUrl.filter((_, i) => i !== idx) }))
          }
          fileFolder="Products"
        />
      </section>

      <BannerSection product={product} setProduct={setProduct} />
    </>
  );


  // ===== Render =====
  return (
    <div className={styles.container}>
      <section className={styles.header}>

        <div>
          <h2>{productId === "new" ? "Create New Product" : `Editing Product: ${product.name}`}</h2>
          <p><strong>Last Modified:</strong> {product.lastModifiedAt ? new Date(product.lastModifiedAt).toLocaleString() : "N/A"}</p>
        </div>
        {productId !== "new" && (<div><p>Rating: {product.averageRating}</p><p>Reviews: {product.numReviews}</p></div>)}

        <div>

          <Link href={`/products/${productId}/productInfoeditor`} className={styles.editInfo_btn}>Edit Info</Link>
          <button className={styles.saveBtn} onClick={handleSubmit}>{productId === "new" ? "Create Product" : "Save Product"}</button> {productId !== "new" && <button className={styles.deleteBtn} onClick={handleDelete}>Delete Product</button>}
        </div>
      </section>

      <div className={styles.form_container}>
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};

export default EditProductPage;

// ===== Modular Components =====

// Render any field based on type
const FieldRenderer = ({ field, product, setProduct, handleChange, setVariantsImage, removeVariantImage, setApplyImage, removeApplyImage, setFieldImage, removeFieldImage }) => {
  const value = getNestedValue(product, field.name);

  // ===== Auto-calculation =====
  const calculateDiscount = (e) => {
    const mrp = parseFloat(product?.mrp) || 0;
    const price = parseFloat(e?.target?.value) || 0;
    if (mrp && price) {
      const discountPercentage = Math.round(((mrp - price) * 100) / mrp);
      setProduct((prev) => ({ ...prev, discountPercentage }));
    }
  };

  const calculatePriceFromDiscount = (e) => {

    const mrp = parseFloat(product?.mrp) || 0;
    const discount = parseFloat(e?.target?.value) || 0;
    if (mrp && discount >= 0 && discount <= 100) {
      const price = Math.round(mrp - (mrp * discount) / 100);
      setProduct((prev) => ({ ...prev, price }));
    }
  };

  if (field.name === "variants") return <VariantSection product={product} setProduct={setProduct} setVariantsImage={setVariantsImage} removeVariantImage={removeVariantImage} />;
  if (field.name === "howToApply") return <ApplySection product={product} setProduct={setProduct} setApplyImage={setApplyImage} removeApplyImage={removeApplyImage} />;
  if (["highlights", "chooseUs", "suitableFor"].includes(field.name)) return <ArraySection product={product} setProduct={setProduct} field={field} setFieldImage={setFieldImage} removeFieldImage={removeFieldImage} />;

  return (
    <div className={styles.inputDiv}>
      <label>{field.label}</label>
      {isArrayField(product, field.name) ? (
        <ChipInput values={value || []} onChange={vals => { setNestedValue(product, field.name, vals); setProduct({ ...product }); }} />
      ) : field.name === "description" ?
        <AutoTextarea name={field.name} value={value || ""} onChange={handleChange} />
        : (
          <input name={field.name} value={value || ""} onChange={(e) => {
            handleChange(e)
            if (field.name === "discountPercentage") calculatePriceFromDiscount(e);
            if (field.name === "price") calculateDiscount(e);
          }
          } />
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
              <label htmlFor={`v${idx}-name`}>Varinat Name</label>
              <input placeholder="Variant Name" value={v.name || ""} onChange={e => { const updated = [...product.variants]; updated[idx].name = e.target.value; setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-sku`}>Varinat SKU</label>
              <input placeholder="SKU" value={v.sku || ""} onChange={e => { const updated = [...product.variants]; updated[idx].sku = e.target.value; setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-mrp`}>MRP</label>
              <input type="number" placeholder="MRP" value={v.mrp || ""} onChange={e => { const updated = [...product.variants]; updated[idx].mrp = Number(e.target.value); setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-price`}>price</label>
              <input type="number" placeholder="Price" value={v.price || ""} onChange={e => { const updated = [...product.variants]; updated[idx].price = Number(e.target.value); setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-stock`}>Stock</label>
              <input type="number" placeholder="Stock" value={v.stock || ""} onChange={e => { const updated = [...product.variants]; updated[idx].stock = Number(e.target.value); setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-qty`}>Quantity</label>
              <input placeholder="Quantity / volume (e.g., 100 ml)" value={v.quantity || ""} onChange={e => { const updated = [...product.variants]; updated[idx].quantity = e.target.value; setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-weight`}>Weight</label>
              <input placeholder="Weight (e.g., 100g)" value={v.weight || ""} onChange={e => { const updated = [...product.variants]; updated[idx].weight = e.target.value; setProduct({ ...product, variants: updated }); }} />
              <label htmlFor={`v${idx}-size`}>Dimension</label>
              <input placeholder="Dimension (e.g., L x b x h)" value={v.dimensions || ""} onChange={e => { const updated = [...product.variants]; updated[idx].dimensions = e.target.value; setProduct({ ...product, variants: updated }); }} />
            </div>
            <div className={styles.boxImageWrapper}>
              <ImageManager
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

// Predefined steps
const PREDEFINED_STEPS = [
  {
    imageUrl: "/images/step1.png",
    title: "Warm the Oil",
    description: "Slightly warm the oil for better absorption.",
  },
  {
    imageUrl: "/images/step2.png",
    title: "Apply on Scalp",
    description: "Massage gently on scalp in circular motions.",
  },
  {
    imageUrl: "/images/step3.png",
    title: "Leave Overnight",
    description: "Let the oil stay overnight for maximum nourishment.",
  },
  {
    imageUrl: "/images/step4.png",
    title: "Wash with Mild Shampoo",
    description: "Rinse your hair with a natural, sulfate-free shampoo.",
  },
];

export function ApplySection({ product, setProduct }) {
  const [selected, setSelected] = useState(product.howToApply || []);

  const toggleStep = (step) => {
    const exists = selected.find((s) => s.title === step.title);

    let updated;
    if (exists) {
      // Remove if already selected
      updated = selected.filter((s) => s.title !== step.title);
    } else {
      // Add new step at end
      updated = [
        ...selected,
        { ...step, step: selected.length + 1 },
      ];
    }

    // Recalculate step numbers based on order
    updated = updated.map((s, i) => ({ ...s, step: i + 1 }));

    setSelected(updated);
    setProduct((prev) => ({ ...prev, howToApply: updated }));
  };

  const isSelected = (title) =>
    selected.some((s) => s.title === title);

  return (
    <div className={styles.container}>
      <div className={styles.section_head}>
        <label>How To Apply</label>
      </div>

      <div className={styles.cardsWrapper}>
        {PREDEFINED_STEPS.map((step, idx) => (
          <div
            key={idx}
            className={`${styles.card} ${isSelected(step.title) ? styles.selected : ""
              }`}
            onClick={() => toggleStep(step)}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={step.imageUrl}
                alt={step.title}
                width={120}
                height={120}
              />
            </div>
            <div className={styles.cardContent}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {isSelected(step.title) && (
                <span className={styles.stepNumber}>
                  Step {selected.findIndex((s) => s.title === step.title) + 1}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const ArraySection = ({ product, setProduct, field }) => {
  // ===== Highlights Section (unchanged) =====
  if (field.name === "highlights") {
    const addHighlight = () => {
      const empty = { title: "", content: [] };
      setProduct((prev) => ({
        ...prev,
        highlights: [...(prev.highlights || []), empty],
      }));
    };

    const removeHighlight = (idx) => {
      const updated = [...(product.highlights || [])];
      updated.splice(idx, 1);
      setProduct({ ...product, highlights: updated });
    };

    return (
      <div className={styles.applySection}>
        <div className={styles.section_head}>
          <label>{field.label}</label>
          <button type="button" onClick={addHighlight}>Add</button>
        </div>

        {(product.highlights || []).map((item, idx) => (
          <div key={idx} className={styles.highlightsBox}>
            <div className={styles.boxHeader}>
              <button type="button" onClick={() => removeHighlight(idx)}>Remove</button>
            </div>
            <div className={`${styles.boxContent} ${styles.fieldBox}`}>
              <input
                placeholder="Title"
                value={item.title || ""}
                onChange={(e) => {
                  const updated = [...product.highlights];
                  updated[idx].title = e.target.value;
                  setProduct({ ...product, highlights: updated });
                }}
              />
              <ChipInput
                values={item.content || []}
                onChange={(vals) => {
                  const updated = [...product.highlights];
                  updated[idx].content = vals;
                  setProduct({ ...product, highlights: updated });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }


  if (["chooseUs", "suitableFor"].includes(field.name)) {
    const predefined = {
      chooseUs: [
        { imageUrl: "/images/choose_us_icon_1.png", text: "Cruelty Free" },
        { imageUrl: "/images/choose_us_icon_2.png", text: "Eco Friendly" },
        { imageUrl: "/images/choose_us_icon_3.png", text: "Non Sticky" },
        { imageUrl: "/images/choose_us_icon_4.png", text: "Vegan" },
        { imageUrl: "/images/choose_us_icon_5.png", text: "No Artificial Color" },
        { imageUrl: "/images/choose_us_icon_7.png", text: "With Plant Extract" },
        { imageUrl: "/images/choose_us_icon_6.png", text: "Gluten Free" },
        { imageUrl: "/images/choose_us_icon_8.png", text: "Dermatology tested" },
        { imageUrl: "/images/choose_us_icon_9.png", text: "Chemical Free" },
        { imageUrl: "/images/choose_us_icon_10.png", text: "Mineral Free" },
      ],
      suitableFor: [
        { text: "Promotes Hair Growth", imageUrl: "/images/suitable_1.png" },
        { text: "Dandruff", imageUrl: "/images/suitable_2.png" },
        { text: "Reduces Hair Breakage", imageUrl: "/images/suitable_3.png" },
        { text: "Reduces Hair Thinig", imageUrl: "/images/suitable_4.png" },
        { text: "Nourish Scalp", imageUrl: "/images/suitable_5.png" },
        { text: "Reduces Frizz", imageUrl: "/images/suitable_6.png" },
      ],
    };

    const options = predefined[field.name];
    const selected = product[field.name] || [];

    // Normalize: string ya object dono accept
    const isSelected = (itemText) =>
      selected.some((v) =>
        typeof v === "string" ? v.toLowerCase() === itemText?.toLowerCase() : v.text?.toLowerCase() === itemText?.toLowerCase()
      );

    const handleCheckboxChange = (item) => {
      const exists = isSelected(item.text);

      const updated = exists
        ? selected.filter((v) =>
          typeof v === "string" ? v !== item.text : v.text !== item.text
        )
        : [...selected, item];

      setProduct((prev) => ({
        ...prev,
        [field.name]: updated,
      }));
    };

    return (
      <div className={styles.applySection}>
        <div className={styles.section_head}>
          <label>{field.label}</label>
        </div>
        <div className={styles.checkBoxes}>
          {options.map((item, idx) => (
            <div key={idx} className={`${styles.checkPlate} ${isSelected(item.text) ? styles.selected : ''}`}>
              <label htmlFor={`${field.name}-${idx}`}>

                <Image src={`${item.imageUrl}`} alt={item.text} width={100} height={100} />

                {console.log(item.imageUrl)}
                {/* <Image src={"/images/logo.png"} alt={item.text} width={100} height={100} /> */}
              </label>

              <div>

                <input
                  type="checkbox"
                  id={`${field.name}-${idx}`}
                  checked={isSelected(item.text)}
                  onChange={() => handleCheckboxChange(item)}
                />
                <label htmlFor={`${field.name}-${idx}`}>{item.text}</label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const POSITIONS = ["top", "mid", "bottom"];

const BannerSection = ({ product, setProduct }) => {
  const addBanner = () => {
    setProduct((prev) => ({
      ...prev,
      banners: [...(prev.banners || []), { position: "", imageUrl: "" }],
    }));
  };

  const removeBanner = (index) => {
    setProduct((prev) => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index),
    }));
  };

  const setImageFunction = (urls, index) => {
    setProduct((prev) => {
      const updated = [...prev.banners];
      updated[index] = { ...updated[index], imageUrl: urls[0] };
      return { ...prev, banners: updated };
    });
  };

  const removeImageFunction = (index) => {
    setProduct((prev) => {
      const updated = [...prev.banners];
      updated[index] = { ...updated[index], imageUrl: null };
      return { ...prev, banners: updated };
    });
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    setProduct((prev) => {
      const updated = [...prev.banners];
      updated[index] = { ...updated[index], position: value };
      return { ...prev, banners: updated };
    });
  };

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerSectionHeader}>
        <h3>Banners</h3>
      </div>

      {product?.banners?.map((banner, index) => (
        <div className={styles.bannerBox} key={index}>
          <select
            onChange={(e) => handleChange(e, index)}
            value={banner.position || ""}
          >
            <option value="" disabled>
              Select position
            </option>
            {POSITIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <button
            onClick={() => removeBanner(index)}
            className={styles.removeBannerBtn}
          >
            x
          </button>

          <ImageManager
            multiple={false}
            images={banner.imageUrl ? [banner.imageUrl] : []}
            fileFolder="banners"
            setDataFunction={(urls) => setImageFunction(urls, index)}
            removeDataFunction={() => removeImageFunction(index)}
          />
        </div>
      ))}

      <button onClick={addBanner} className={styles.addBannerBtn}>
        +
      </button>
    </section>
  );
};
