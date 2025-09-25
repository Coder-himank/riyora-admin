"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/ui/ImageUploader"; // your uploader
import styles from "@/styles/UI/ImageManager.module.css";

const ImageManager = ({
    multiple = true,
    images,
    fileFolder,
    setDataFunction,
    removeDataFunction,
}) => {
    const [cloudedImages, setCloudedImages] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Fetch images from Cloudinary
    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/listImages");
            setCloudedImages(res.data.resources || []);
        } catch (err) {
            console.error("Failed to load images", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchImages();
    }, [open]);

    // Toggle selection
    const toggleSelect = (url) => {
        let updated;
        if (multiple) {
            updated = selected.includes(url)
                ? selected.filter((i) => i !== url)
                : [...selected, url];
        } else {
            updated = selected.includes(url) ? [] : [url];
        }
        setSelected(updated);
    };

    // Delete from Cloudinary
    const deleteImage = async (publicId) => {
        if (!confirm("Delete this image?")) return;
        try {
            await axios.delete("/api/cloudinary/delete", { data: { publicId } });
            setCloudedImages((prev) => prev.filter((img) => img.public_id !== publicId));
            setSelected((prev) => prev.filter((url) => !url.includes(publicId)));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete image.");
        }
    };

    // Confirm selection
    const confirmSelection = () => {
        setDataFunction?.(selected);
        setOpen(false);
    };

    return (
        <div>
            {/* Compact Button with Preview */}
            <div className={styles.previewBar} onClick={() => setOpen(true)}>
                {images.length === 0 ? (
                    <button className={styles.openBtn}>Select Images</button>
                ) : (
                    <div className={styles.previewRow}>
                        {images.map((url) => (
                            <img key={url} src={url} alt="preview" className={styles.previewThumb} />
                        ))}
                        <button className={styles.openBtn}>Manage</button>
                    </div>
                )}
            </div>

            {/* Enlarged Manager */}
            {open && (
                <div className={styles.overlay}>
                    <div className={styles.manager}>
                        <div className={styles.header}>
                            <h3>Image Manager</h3>
                            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                                ✕
                            </button>
                        </div>

                        {/* Upload Section */}
                        <div className={styles.uploadSection}>
                            <ImageUploader
                                images={images}
                                setDataFunction={() => fetchImages()}
                                removeDataFunction={removeDataFunction}
                                fileFolder={fileFolder}
                            />
                        </div>

                        {/* Gallery */}
                        {loading ? (
                            <p>Loading images...</p>
                        ) : (
                            <div className={styles.grid}>
                                {cloudedImages.map((img) => (
                                    <div
                                        key={img.asset_id}
                                        className={`${styles.card} ${selected.includes(img.secure_url) ? styles.selected : ""
                                            }`}
                                    >
                                        <img
                                            src={img.secure_url}
                                            alt={img.public_id}
                                            onClick={() => toggleSelect(img.secure_url)}
                                        />
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => deleteImage(img.public_id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.footer}>
                            <button onClick={() => setOpen(false)}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={confirmSelection}>
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageManager;
