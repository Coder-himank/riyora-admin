import { useMemo, useEffect, useRef, useState } from "react";
import styles from "@/styles/blog/blogEditor.module.css";
import toast from "react-hot-toast";
import ChipInput from "@/components/ui/ChipInput";
import ImageManager from "@/components/ui/ImageManager";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import connectDB from "@/lib/database";
import Blog from "@/lib/models/blog";
import { useCallback } from "react";
function slugify(text = "") {
    return text
        .toString()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function EditorToolbar({ onCommand, onInsertImage, toggleHTML, htmlMode }) {
    const createLink = () => {
        const url = prompt("Enter full URL (https://...)");
        if (url) onCommand("createLink", url);
    };

    const insertHTML = () => {
        const html = prompt("Paste HTML snippet to insert:");
        if (html) onCommand("insertHTML", html);
    };

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
                <button onClick={() => onCommand("bold")}><b>B</b></button>
                <button onClick={() => onCommand("italic")}><i>I</i></button>
                <button onClick={() => onCommand("underline")}><u>U</u></button>
                <button onClick={() => onCommand("strikeThrough")}>S</button>
            </div>

            <div className={styles.toolbarGroup}>
                <button onClick={() => onCommand("formatBlock", "H1")}>H1</button>
                <button onClick={() => onCommand("formatBlock", "H2")}>H2</button>
                <button onClick={() => onCommand("formatBlock", "H3")}>H3</button>
                <button onClick={() => onCommand("formatBlock", "P")}>P</button>
            </div>

            <div className={styles.toolbarGroup}>
                <button onClick={() => onCommand("insertUnorderedList")}>• List</button>
                <button onClick={() => onCommand("insertOrderedList")}>1. List</button>
            </div>

            <div className={styles.toolbarGroup}>
                <button onClick={createLink}>🔗</button>
                <button onClick={onInsertImage}>🖼</button>
                <button onClick={() => onCommand("formatBlock", "BLOCKQUOTE")}>❝</button>
                <button onClick={() => onCommand("formatBlock", "PRE")}>{"</>"}</button>
            </div>

            <div className={styles.toolbarGroup}>
                <input
                    type="color"
                    onChange={(e) => onCommand("foreColor", e.target.value)}
                    title="Text color"
                />
                <select onChange={(e) => onCommand("fontSize", e.target.value)} defaultValue="">
                    <option value="">Size</option>
                    <option value="3">Normal</option>
                    <option value="4">Large</option>
                    <option value="5">X-Large</option>
                    <option value="6">Huge</option>
                </select>
                <button onClick={insertHTML}>Insert HTML</button>
            </div>

            <div className={styles.toolbarGroup}>
                <button className={styles.htmlToggle} onClick={toggleHTML}>
                    {htmlMode ? "Switch to Visual" : "Edit HTML"}
                </button>
            </div>
        </div>
    );
}

export default function BlogEditor({ existingBlog }) {
    const { data: session } = useSession();
    const router = useRouter();
    const editorRef = useRef(null);

    const [showImageManager, setShowImageManager] = useState(false);

    useEffect(() => {
        // This runs only on the client after hydration
        setShowImageManager(true);
    }, []);

    const [blogData, setBlogData] = useState({
        title: existingBlog?.title || "",
        slug: existingBlog?.slug || "",
        author: existingBlog?.author || session?.user?.name || "",
        description: existingBlog?.description || "",
        keywords: existingBlog?.tags || [],
        featuredImage: existingBlog?.imageUrl || "",
        published: existingBlog?.published || false,
        content: existingBlog?.content || "<p></p>",
        seoTitle: existingBlog?.seoTitle || "",
        seoDescription: existingBlog?.seoDescription || "",
    });

    const [loading, setLoading] = useState(false);
    const [htmlMode, setHtmlMode] = useState(false);

    useEffect(() => {
        if (editorRef.current && blogData.content) {
            editorRef.current.innerHTML = blogData.content;
        }
    }, []);

    const updateContent = () => {
        const html = htmlMode
            ? editorRef.current.value
            : editorRef.current?.innerHTML || "";
        setBlogData((p) => ({ ...p, content: html }));
    };

    const runCommand = (command, value = null) => {
        if (htmlMode) return; // disable commands in HTML mode
        document.execCommand(command, false, value);
        updateContent();
    };

    const toggleHTML = () => {
        // Always capture current content before switching modes
        const currentContent = htmlMode
            ? editorRef.current.value
            : editorRef.current.innerHTML;

        setBlogData((prev) => ({ ...prev, content: currentContent }));

        if (htmlMode) {
            // Switching to visual mode
            const div = document.createElement("div");
            div.innerHTML = currentContent; // use up-to-date content
            div.className = styles.editor;
            div.contentEditable = true;
            div.spellcheck = true;
            div.oninput = updateContent;

            editorRef.current.replaceWith(div);
            editorRef.current = div;
            setHtmlMode(false);
        } else {
            // Switching to HTML mode
            const textarea = document.createElement("textarea");
            textarea.value = currentContent; // use up-to-date content
            textarea.className = styles.htmlEditor;
            textarea.oninput = updateContent;

            editorRef.current.replaceWith(textarea);
            editorRef.current = textarea;
            setHtmlMode(true);
        }
    };


    // Image insertion with dragging + resizing
    const handleInsertImage = () => {
        if (htmlMode) {
            alert("Switch to visual mode to insert images");
            return;
        }

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "YOUR_UPLOAD_PRESET");
            formData.append("folder", "Blogs");

            try {
                const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                const imageUrl = data.secure_url;
                if (!imageUrl) return;

                const wrapper = document.createElement("div");
                wrapper.style.display = "inline-block";
                wrapper.style.position = "relative";
                wrapper.className = styles.resizableImageWrapper;

                const img = document.createElement("img");
                img.src = imageUrl;
                img.style.maxWidth = "100%";
                img.draggable = true;
                img.style.display = "block";

                // Dragging
                img.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", "dragging-image");
                    e.dataTransfer.setDragImage(img, 0, 0);
                    img.classList.add(styles.dragging);
                });
                img.addEventListener("dragend", () => img.classList.remove(styles.dragging));

                // Resizing handle
                const handle = document.createElement("div");
                handle.className = styles.resizeHandle;
                let isResizing = false, startX, startY, startWidth, startHeight;

                handle.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = img.offsetWidth;
                    startHeight = img.offsetHeight;

                    const onMove = (e2) => {
                        if (!isResizing) return;
                        img.style.width = startWidth + (e2.clientX - startX) + "px";
                        img.style.height = startHeight + (e2.clientY - startY) + "px";
                    };

                    const onUp = () => {
                        isResizing = false;
                        document.removeEventListener("mousemove", onMove);
                        document.removeEventListener("mouseup", onUp);
                        updateContent();
                    };

                    document.addEventListener("mousemove", onMove);
                    document.addEventListener("mouseup", onUp);
                });

                wrapper.appendChild(img);
                wrapper.appendChild(handle);

                // Insert at cursor
                const sel = window.getSelection();
                if (sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(wrapper);
                    // Move cursor after the image
                    range.setStartAfter(wrapper);
                    range.setEndAfter(wrapper);
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    editorRef.current.appendChild(wrapper);
                }

                // Always update content from editorRef.current
                updateContent();
            } catch (err) {
                console.error("Cloudinary upload failed", err);
                toast.error("Image upload failed");
            }
        };

        input.click();
    };

    const autoAdjustTextArea = (e) => {
        e.target.style.height = "auto"; // reset height first
        e.target.style.height = `${e.target.scrollHeight}px`; // then set to scroll height
    };


    const handleSave = async (publish = false) => {
        // Always capture latest editor content before saving
        const currentContent = htmlMode
            ? editorRef.current.value
            : editorRef.current.innerHTML;

        setBlogData((p) => ({ ...p, content: currentContent }));

        setLoading(true);
        try {
            const payload = {
                ...blogData,
                content: currentContent,
                slug: blogData.slug || slugify(blogData.title),
                published: publish,
            };

            const res = existingBlog
                ? await axios.put(`/api/blogsApi?blogId=${existingBlog._id}`, payload)
                : await axios.post(`/api/blogsApi`, payload);

            if ([200, 201].includes(res.status)) {
                toast.success("Saved Successfully!");
                router.push("/blogs");
            } else {
                toast.error("Failed to save blog");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving blog");
        } finally {
            setLoading(false);
        }
    };


    const handleSetImage = useCallback(
        (url) => setBlogData((prev) => ({ ...prev, featuredImage: url[0] })),
        []
    );

    const handleRemoveImage = useCallback(
        () => setBlogData((prev) => ({ ...prev, featuredImage: "" })),
        []
    );



    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>{existingBlog ? "Edit Blog" : "Create Blog"}</h1>
                <div className={styles.actionBtns}>
                    <button onClick={() => handleSave(false)} disabled={loading}>
                        {loading ? "Saving..." : "Save Draft"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className={styles.primary}>
                        {loading ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>

            <div className={styles.layout}>
                <main className={styles.editorPanel}>
                    <EditorToolbar
                        onCommand={runCommand}
                        onInsertImage={handleInsertImage}
                        toggleHTML={toggleHTML}
                        htmlMode={htmlMode}
                    />
                    <input
                        className={styles.titleInput}
                        placeholder="Blog title..."
                        value={blogData.title}
                        onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                    />

                    <div
                        ref={editorRef}
                        className={styles.editor}
                        contentEditable
                        spellCheck
                        onInput={updateContent}
                        suppressContentEditableWarning
                    ></div>
                </main>

                <aside className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <div className={styles.inputBox}>

                            <label>SEO Title</label>
                            <input
                                value={blogData.seoTitle}
                                onChange={(e) => setBlogData({ ...blogData, seoTitle: e.target.value })}
                            />
                        </div>
                        <div className={styles.inputBox}>

                            <label>Slug</label>
                            <input
                                value={blogData.slug}
                                onChange={(e) => setBlogData({ ...blogData, slug: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputBox}>

                            <label>SEO Description</label>
                            <textarea
                                rows={3}
                                value={blogData.seoDescription}
                                onChange={(e) => {

                                    setBlogData({ ...blogData, seoDescription: e.target.value })
                                    autoAdjustTextArea(e)
                                }
                                }
                            ></textarea>
                        </div>
                    </div>

                    <div className={styles.inputBox}>

                        <div className={styles.sideCard}>
                            <label>Short Description</label>
                            <textarea
                                rows={3}
                                value={blogData.description}
                                onChange={(e) => {

                                    setBlogData({ ...blogData, description: e.target.value })
                                    autoAdjustTextArea(e)
                                }
                                }
                            ></textarea>
                        </div>
                    </div>
                    <div className={styles.sideCard}>
                        <label>Featured Image</label>
                        {showImageManager && (
                            <ImageManager
                                multiple={false}
                                images={blogData.featuredImage ? [blogData.featuredImage] : []}
                                setDataFunction={handleSetImage}
                                removeDataFunction={handleRemoveImage}
                                fileFolder="Blogs"
                            />
                        )}
                    </div>

                    <div className={styles.sideCard}>
                        <h3>Tags / Keywords</h3>
                        <ChipInput
                            name="keywords"
                            values={blogData.keywords}
                            onChange={(newValues) => setBlogData({ ...blogData, keywords: newValues })}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { blogid } = context.params;
    await connectDB();

    if (blogid && blogid !== "new") {
        try {
            const blog = await Blog.findById(blogid);
            if (!blog) return { props: { existingBlog: null } };
            return { props: { existingBlog: JSON.parse(JSON.stringify(blog)) } };
        } catch (err) {
            console.error(err);
        }
    }
    return { props: { existingBlog: null } };
}
