import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ChipInput from "@/components/ui/ChipInput";
import styles from "@/styles/productInfo/editor.module.css";
import Image from "next/image";

const INGREDIENTS = {
  AloeVera: { name: "Aloe Vera", image: "/images/aloe.png", note: "Soothing and hydrating." },
  Turmeric: { name: "Turmeric", image: "/images/turmeric.png", note: "Anti-inflammatory." },
  Honey: { name: "Honey", image: "/images/honey.png", note: "Moisturizing & antibacterial." },
  Neem: { name: "Neem", image: "/images/neem.png", note: "Purifying & antifungal." },
  Lavender: { name: "Lavender", image: "/images/lavender.png", note: "Calming aroma." },
};

export default function EditorPage() {
  const router = useRouter();
  const { productId } = router.query;

  const [form, setForm] = useState({
    _id: "", // ProductInfo._id
    productId: productId || "", // reference Product._id
    title: "",
    description: "",
    price: "",
    ingredients: [],
    benefits: { heading: "", list: [] },
    suitability: [],
  });

  const [loading, setLoading] = useState(false);
  const [mainProduct, setMainProduct] = useState(null);

  // Fetch ProductInfo or fallback to Product
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
          productId: productId,
          title: productInfo?.title || product?.title || "",
          description: productInfo?.description || product?.description || "",
          price: productInfo?.price || product?.price || "",
          ingredients: productInfo?.ingredients || [],
          benefits: productInfo?.benefits || { heading: "", list: [] },
          suitability: productInfo?.suitability || [],
          imageUrl: product?.imageUrl
        });

        setMainProduct(product || null);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleAddIngredient = (ing) => {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: ing.name, image: ing.image, notes: [ing.note] }],
    }));
  };

  const handleSubmit = async () => {
    if (!form.productId) return alert("No product selected");

    setLoading(true);
    try {
      console.log(mainProduct);

      const payload = { ...form, imageUrl: mainProduct?.imageUrl };
      if (form._id) {
        await axios.put(`/api/productInfoApi?id=${form._id}`, payload);
        alert("Product info updated successfully!");
      } else {
        await axios.post("/api/productInfoApi", payload);
        alert("Product info created successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Product Info Editor</h1>

      {mainProduct && (
        <div className={styles.selectedProduct}>
          <img src={mainProduct.imageUrl?.[0] || "/images/placeholder.png"} alt={mainProduct.title} className={styles.selectedImage} />
          <div>
            <h3>{mainProduct.title}</h3>
            <p>Product ID: {mainProduct._id}</p>
            {form._id && <p>ProductInfo ID: {form._id}</p>}
          </div>
        </div>
      )}

      <label className={styles.label}>Product Title</label>
      <input className={styles.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <label className={styles.label}>Description</label>
      <textarea className={styles.textarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <div className={styles.section}>
        <h2 className={styles.label}>Ingredients</h2>
        <div className={styles.ingredientButtons}>
          {Object.values(INGREDIENTS).map((ing) => (
            <button key={ing.name} type="button" className={styles.ingredientButton} onClick={() => handleAddIngredient(ing)}>
              <Image src={ing.image} alt={ing.name} width={100} height={100} />
              <div>{ing.name}</div>
              <small>{ing.note}</small>
            </button>
          ))}
        </div>
        <ul className={styles.selectedIngredients}>
          {form.ingredients.map((ing, idx) => (
            <li key={idx} className={styles.ingredientItem}>
              <img src={ing.image} alt={ing.name} />
              <span>{ing.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.label}>Benefits</h2>
        <input className={styles.input} value={form.benefits.heading} onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, heading: e.target.value } })} />
        <ChipInput placeholder="Add benefit" values={form.benefits.list} onChange={(list) => setForm({ ...form, benefits: { ...form.benefits, list } })} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.label}>Suitable For</h2>
        <ChipInput placeholder="Add suitability" values={form.suitability} onChange={(list) => setForm({ ...form, suitability: list })} />
      </div>

      <button className={styles.saveButton} onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : form._id ? "Update Product Info" : "Create Product Info"}
      </button>
    </div>
  );
}
