import styles from "@/styles/UI/ImageUploader.module.css"
import { handleFileSelect, handleImageDrop } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";


const uploadImage = async (e, ftype, setUploading, setDataFunction, fileFolder, setDragOver) => {

    try {
        setUploading(true)
        if (ftype === "Image Drop") {
            await handleImageDrop(e, setDataFunction, fileFolder, setDragOver)
        }
        if (ftype === "File Select") {
            await handleFileSelect(e, setDataFunction, fileFolder)
        }
    } catch (err) {
        toast.error("Error Uploading the Image")

    } finally {
        setUploading(false)
    }
}
export const ImageUploader = ({ image, setDataFunction, removeDataFunction, fileFolder }) => {

    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false)

    return (
        <>
            {/* Drag & Drop Zone */}
            <div
                className={`${styles.dropZone} ${dragOver ? styles.dragOver : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => uploadImage(e, "Image Drop", setUploading, setDataFunction, fileFolder, setDragOver)}
            >

                < input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }
                    }
                    // id={`fileInput-${idx}`}
                    onChange={(e) => uploadImage(e, "File Select", setDataFunction, fileFolder)}
                />
                <label
                    // htmlFor={`fileInput-${idx}`}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    style={{ marginLeft: "8px", cursor: "pointer" }}
                >
                    {uploading ? "Uploading..." : "Drag & drop image here or Choose File"}
                </label>

                {uploading && (

                    <div className={styles.imageWrapper}>

                        <div
                            className={styles.previewImageLoading}
                        />
                    </div>
                )}

                {
                    image && (
                        <div className={styles.imageWrapper}>
                            <img
                                src={image}
                                alt="Preview"
                                className={styles.previewImage}
                            />
                            <button
                                type="button"
                                className={styles.removeImageBtn}
                                onClick={removeDataFunction}
                            >
                                X
                            </button>
                        </div>
                    )
                }
            </div >
        </>

    )
}
export const MultiImageUploader = ({ images, setDataFunction, removeDataFunction, fileFolder }) => {

    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false)
    return (
        <>
            {/* Drag & Drop Zone */}
            {/* Image Drop Zone */}
            {/* File Picker */}
            <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                // id="fileInput"
                onChange={(e) => uploadImage(e, "File Select", setDataFunction, fileFolder)}
            />

            <div
                className={`${styles.MultiDropZone} ${dragOver ? styles.dragOver : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => uploadImage(e, "Image Drop", setUploading, setDataFunction, fileFolder, setDragOver)}
            >
                <label
                    // htmlFor="fileInput"
                    className={styles.filePickerBtn}>
                    {uploading ? "Uploading..." : "drag and drop OR click here to upload images"}
                </label>
                {images?.length > 0 && (
                    <div className={styles.MultiImagePreview}>
                        {images.map((url, idx) => (
                            <div key={idx} className={styles.MultiImageWrapper}>
                                <img src={url} alt={`Preview ${idx}`} />
                                <button
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={() => removeDataFunction(idx)}
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </>

    )
}

export default ImageUploader;