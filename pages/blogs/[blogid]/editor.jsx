import { useState } from "react";
import styles from "@/styles/blog/blogEditor.module.css";
import toast from "react-hot-toast";
import ChipInput from "@/components/ui/ChipInput";
import ImageManager from "@/components/ui/ImageManager";
import ListEditor from "@/components/ui/Listeditor";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import connectDB from "@/lib/database";
import Blog from "@/lib/models/blog"

export function BlogSection({ section, index, updateSection, removeImage }) {

    const handleTextAreaChange = (e) => {
        updateSection(index, "content", e.target.value)

        // Reset height first so shrink works too
        e.target.style.height = "auto";
        // Set new height based on scrollHeight
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <div className={styles.section}>
            <select
                value={section.type || "text"}
                onChange={(e) => updateSection(index, "type", e.target.value)}
                className={styles.select}
            >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="list">List</option>
                <option value="quote">Quote</option>
            </select>

            <input
                type="text"
                placeholder="Section Heading"
                value={section.heading}
                onChange={(e) => updateSection(index, "heading", e.target.value)}
                className={styles.input}
            />

            {section.type === "text" && (
                <textarea
                    placeholder="Section Text"
                    value={section.content || ""}
                    onChange={(e) => handleTextAreaChange(e)}
                    className={styles.textarea}
                    rows="4"
                />
            )}

            {section.type === "quote" && (
                <textarea
                    placeholder="Quote"
                    value={section.content || ""}
                    onChange={(e) => handleTextAreaChange(e)}
                    className={styles.textarea}
                    rows="2"
                />
            )}

            {section.type === "list" && (
                <ListEditor
                    values={section.listItems || []}
                    onChange={(newList) => updateSection(index, "listItems", newList)}
                />
            )}

            {section.type === "image" && (
                <ImageManager
                    multiple={false}
                    images={section?.images?.[0]?.url ? [section.images[0].url] : []}
                    setDataFunction={(url) =>
                        updateSection(index, "images", [{ url: url[0], alt: section.heading }])
                    }
                    removeDataFunction={() => removeImage(index)}
                    fileFolder={"Blogs"}
                />
            )}
        </div>
    );
}

export default function BlogEditor({ existingBlog }) {

    const [blogData, setBlogData] = useState({
        imageUrl: existingBlog?.imageUrl || null,
        title: existingBlog?.title || "",
        author: existingBlog?.author || "",
        sections: existingBlog?.sections || [],
        tags: existingBlog?.tags || [],
        description: existingBlog?.description || ""
    });

    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setBlogData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    
  const handleTextAreaChange = (e, field, value) => {
    handleChange(field, value);

    // Reset height first so shrink works too
    e.target.style.height = "auto";
    // Set new height based on scrollHeight
    e.target.style.height = `${e.target.scrollHeight}px`;
  };


    const addSection = () => {
        setBlogData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                { type: "text", heading: "", content: "", images: [], listItems: [] }
            ]
        }));
    };

    const updateSection = (index, field, value) => {
        setBlogData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) =>
                i === index ? { ...sec, [field]: value } : sec
            )
        }));
    };

    const removeImage = (index) => {
        setBlogData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) =>
                i === index ? { ...sec, images: [] } : sec
            )
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let res;
            if (existingBlog) {
                res = await axios.put(`/api/blogsApi?blogId=${existingBlog._id}`, blogData)
            } else {
                res = await axios.post(`/api/blogsApi`, blogData)
            }

            if ([200, 201].includes(res.status)) {
                toast.success("Saved Successfully");
                router.push("/blogs");
            } else {
                toast.error("Failed");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error Saving the blog")
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>
                {existingBlog ? "Edit Blog" : "Create Blog"}
            </h1>

            <ImageManager
                images={blogData.imageUrl ? [blogData.imageUrl] : []}
                setDataFunction={(url) => handleChange("imageUrl", url[0])}
                removeDataFunction={() => handleChange("imageUrl", "")}
                fileFolder={"Blogs"}
            />

            <input
                type="text"
                placeholder="Blog Title"
                value={blogData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={styles.input}

            />

            <ChipInput
                name="tags"
                values={blogData.tags}
                onChange={(newValues) => handleChange("tags", newValues)}
            />

            <textarea
                name="description"
                placeholder="Description"
                value={blogData.description}
                onChange={(e) => handleTextAreaChange(e, "description", e.target.value)}
                className={styles.input}
            />

            <input
                type="text"
                placeholder="Author"
                value={blogData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                className={styles.input}
            />

            {blogData.sections.map((section, idx) => (
                <BlogSection
                    key={idx}
                    section={section}
                    index={idx}
                    updateSection={updateSection}
                    removeImage={removeImage}
                />
            ))}

            <button
                onClick={addSection}
                className={`${styles.button} ${styles.buttonPrimary}`}
            >
                Add Section
            </button>

            <button
                onClick={handleSubmit}
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={loading}
            >
                {loading ? "Saving..." : "Save Blog"}
            </button>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { blogid } = context.params;
    await connectDB()

    if (blogid !== "new") {
        try {
            const blog = await Blog.findById(blogid);

            if (!blog) return { props: { existingBlog: null } };

            return { props: { existingBlog: JSON.parse(JSON.stringify(blog)) } };
        } catch (err) {
            console.log(err);
        }
    }

    return { props: { existingBlog: null } };
}
