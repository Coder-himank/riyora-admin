"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/blog/blogList.module.css";
import Link from "next/link";
import axios from "axios";

import toast from "react-hot-toast";
export default function BlogListPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
            const res = await axios.get("/api/blogs");
            if (!res.status === 200) {
                toast.error("Error Fetching Blogs Data")
            };
            const data = await res.data;
            setBlogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            const res = await axios.delete(`/api/Blogs?blogId=${id}`);
            if (!res.ok) throw new Error("Failed to delete");
            setBlogs(blogs.filter((b) => b._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    if (loading) return <p className={styles.loading}>Loading blogs...</p>;

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <h1 className={styles.heading}>📚 All Blogs</h1>
                <div>
                    <Link href={`/blogs/new/editor`}>+</Link>
                </div>
            </div>

            {blogs.length === 0 ? (
                <p className={styles.noBlogs}>No blogs found.</p>
            ) : (
                <div className={styles.grid}>
                    {blogs.map((blog) => (
                        <div key={blog._id} className={styles.card}>
                            {blog.sections?.[0]?.image && (
                                <img
                                    src={blog.sections[0].image}
                                    alt={blog.title}
                                    className={styles.image}
                                />
                            )}

                            <h2 className={styles.title}>{blog.title}</h2>
                            <p className={styles.author}>By {blog.author}</p>
                            <p className={styles.preview}>
                                {blog.sections?.[0]?.text?.slice(0, 80) || "No content"}...
                            </p>

                            <div className={styles.actions}>
                                <Link
                                    href={`/blogs/${blog._id}/editor`}
                                    className={`${styles.button} ${styles.buttonPrimary}`}
                                >
                                    ✏ Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(blog._id)}
                                    className={`${styles.button} ${styles.buttonDanger}`}
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
