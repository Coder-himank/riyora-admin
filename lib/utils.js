
import axios from "axios";
import toast from "react-hot-toast";
export const uploadFile = async (e, setDataFunction, files, fileFolder) => {

    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => {
        formData.append("file", file); // same field name for multiple
    });

    try {
        const res = await axios.post(`/api/uploadImageApi?fileFolder=${fileFolder}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const uploadedUrls = res.data.urls; // array from API

        setDataFunction(uploadedUrls);
        toast.success("Images uploaded successfully");

        return true;
    } catch (err) {
        console.error("Upload failed", err);
        toast.error("Upload failed");
        return false;
    }
}

export const handleImageDrop = async (e, setDataFunction, fileFolder) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    return uploadFile(e, setDataFunction, files, fileFolder)

};


export const handleFileSelect = async (e, setDataFunction, fileFolder) => {
    const files = Array.from(e.target.files);
    return uploadFile(e, setDataFunction, files, fileFolder)

};


export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const deepRef = keys.reduce((acc, key) => {
        if (!acc[key]) acc[key] = {};
        return acc[key];
    }, obj);
    deepRef[lastKey] = value;
};
