import { useState } from "react";
import styles from "@/styles/blog/blogEditor.module.css";
import toast from "react-hot-toast";
import ChipInput from "@/components/ui/ChipInput";
import ImageManager from "@/components/ui/ImageManager";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import connectDB from "@/lib/database";
import Blog from "@/lib/models/blog"

export function BlogSection({ section, index, updateSection, removeImage }) {
    return (
        <div className={styles.section}>
            <input
                type="text"
                placeholder="Section Heading"
                value={section.heading}
                onChange={(e) => updateSection(index, "heading", e.target.value)}
                className={styles.input}
            />

            <Fil
                image={section.image}
                setDataFunction={(url) => updateSection(index, "image", url[0])}
                removeDataFunction={() => removeImage(index)}
                fileFolder={"Blogs"}
            />

            <textarea
                placeholder="Section Text"
                value={section.text}
                onChange={(e) => updateSection(index, "text", e.target.value)}
                className={styles.textarea}
                rows="4"
            />
        </div>
    );
}

export default function BlogEditor({ existingBlog }) {


    const [blogData, setBlogData] = useState({
        imgUrl: existingBlog?.imgUrl || null,
        title: existingBlog?.title || "",
        author: existingBlog?.author || "",
        sections: existingBlog?.sections || [],
        tags: existingBlog?.tags || [],
        description: existingBlog?.description || ""
    });

    const { data: session } = useSession();
    const router = useRouter();

    const handleChange = (field, value) => {
        setBlogData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addSection = () => {
        setBlogData(prev => ({
            ...prev,
            sections: [...prev.sections, { heading: "", image: "", text: "" }]
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
                i === index ? { ...sec, image: "" } : sec
            )
        }));
    };

    const handleSubmit = async () => {
        const method = existingBlog ? "PUT" : "POST";

        let res;
        if (existingBlog) {
            res = await axios.put(`/api/blogsApi?blogId=${existingBlog._id}`, blogData)
        } else {
            res = await axios.post(`/api/blogsApi`, blogData)
        }


        toast.success(res.status);
        if ([200, 201].includes(res.status)) {
            toast.success("Saved Successfully");
            router.push(session?.user?.id + "/blogs");
        } else {
            toast.error("Failed");
        }

    };




    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>
                {existingBlog ? "Edit Blog" : "Create Blog"}
            </h1>

            <ImageManager
                images={blogData.imgUrl}
                setDataFunction={(url) => handleChange("imgUrl", url[0])}
                removeDataFunction={(idx) => handleChange("imgUrl", "")}
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
                onChange={(e) => handleChange("description", e.target.value)}
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

            >
                Save Blog
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