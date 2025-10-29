import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import ListEditor from "@/components/ui/Listeditor";
import styles from "@/styles/productInfo/editor.module.css";

/* ===============================
   SECTION COMPONENTS
   =============================== */

// 🔹 Ingredients Section
function IngredientsSection({ preDefinedIngredients, form, setForm, styles }) {
  const handleAddIngredient = (ing) => {
    if (form.ingredients.find((obj) => obj.name === ing.name)) return;
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: ing.name, imageUrl: ing.imageUrl, notes: [ing.note || ""] },
      ],
    }));
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.label}>Ingredients</h2>
      <div className={styles.ingredientButtons}>
        {preDefinedIngredients.map((ing) => {
          const isSelected = form.ingredients.some((i) => i.name === ing.name);
          return (
            <button
              key={ing.name}
              type="button"
              className={`${styles.ingredientButton} ${isSelected ? styles.selectedIngredient : ""
                }`}
              onClick={() => handleAddIngredient(ing)}
            >
              <Image
                src={ing.imageUrl}
                alt={ing.name}
                width={80}
                height={80}
                className={styles.ingImage}
              />
              <div className={styles.ingText}>
                <strong>{ing.name}</strong>
                <small>{ing.note}</small>
              </div>
            </button>
          );
        })}
      </div>

      {form.ingredients.length > 0 && (
        <div className={styles.selectedList}>
          <h4>Selected Ingredients:</h4>
          <ul>
            {form.ingredients.map((ing, i) => (
              <li key={i} className={styles.selectedItem}>
                <Image
                  src={ing.imageUrl}
                  alt={ing.name}
                  width={40}
                  height={40}
                />
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 🔹 Benefits Section
function BenefitsSection({ form, setForm, styles }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.label}>Benefits</h2>
      <input
        className={styles.input}
        placeholder="Heading"
        value={form.benefits.heading}
        onChange={(e) =>
          setForm({
            ...form,
            benefits: { ...form.benefits, heading: e.target.value },
          })
        }
      />
      <ListEditor
        values={form.benefits.list}
        onChange={(newList) =>
          setForm((prev) => ({
            ...prev,
            benefits: { ...prev.benefits, list: newList },
          }))
        }
      />
    </div>
  );
}

// 🔹 Suitability Section
function SuitabilitySection({ form, setForm, styles }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.label}>Suitable For</h2>
      <ListEditor
        values={form.suitability}
        onChange={(list) => setForm({ ...form, suitability: list })}
      />
    </div>
  );
}

/* ===============================
   MAIN EDITOR PAGE
   =============================== */

export default function EditorPage() {
  const router = useRouter();
  const { productId } = router.query;

  const [preDefinedIngredients, setPredefinedIngredients] = useState([]);
  const [mainProduct, setMainProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    _id: "",
    productId: "",
    title: "",
    description: "",
    price: "",
    ingredients: [],
    benefits: { heading: "", list: [] },
    suitability: [],
    slug: "",
  });

  // 🔹 Fetch product info and product
  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [infoRes, productRes] = await Promise.all([
          axios.get(`/api/productInfoApi?productId=${productId}`).catch(() => null),
          axios.get(`/api/productApi?productId=${productId}`).catch(() => null),
        ]);

        const productInfo = infoRes?.data;
        const product = productRes?.data;

        setForm({
          _id: productInfo?._id || "",
          productId,
          title: productInfo?.title || product?.name || "",
          description: productInfo?.description || product?.description || "",
          price: productInfo?.price || product?.price || "",
          ingredients: productInfo?.ingredients || [],
          benefits: productInfo?.benefits || { heading: "", list: [] },
          suitability: productInfo?.suitability || [],
          imageUrl: product?.imageUrl,
          slug: product?.slug || productInfo?.slug || "",
        });

        setMainProduct(product || null);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // 🔹 Fetch predefined ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await axios.get("/api/predefinedDataApi?type=ingredients");
        const pdi = res.data?.data?.data || [];
        setPredefinedIngredients(pdi);
      } catch (e) {
        console.error("Failed to load predefined ingredients.");
      }
    };
    fetchIngredients();
  }, []);

  // 🔹 Submit Product Info
  const handleSubmit = async () => {
    if (!form.productId) return alert("No product selected");
    setLoading(true);
    try {
      const payload = {
        ...form,
        imageUrl: mainProduct?.imageUrl,
        slug: mainProduct?.slug,
        productId: mainProduct?._id,
        title: mainProduct?.name,
      };

      if (form._id) {
        await axios.put(`/api/productInfoApi?id=${form._id}`, payload);
        alert("✅ Product info updated!");
      } else {
        await axios.post("/api/productInfoApi", payload);
        alert("✅ Product info created!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error saving product info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🧩 Admin Product Info Editor</h1>

      {mainProduct && (
        <div className={styles.selectedProduct}>
          <img
            src={mainProduct.imageUrl?.[0] || "/images/placeholder.png"}
            alt={mainProduct.title}
            className={styles.selectedImage}
          />
          <div>
            <h3>{mainProduct.title}</h3>
            <p>Product ID: {mainProduct._id}</p>
            {form._id && <p>ProductInfo ID: {form._id}</p>}
          </div>
        </div>
      )}

      <label className={styles.label}>Description</label>
      <textarea
        className={styles.textarea}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <IngredientsSection
        preDefinedIngredients={preDefinedIngredients}
        form={form}
        setForm={setForm}
        styles={styles}
      />

      <BenefitsSection form={form} setForm={setForm} styles={styles} />
      <SuitabilitySection form={form} setForm={setForm} styles={styles} />

      <button
        className={styles.saveButton}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : form._id ? "Update Product Info" : "Create Product Info"}
      </button>
    </div>
  );
}
