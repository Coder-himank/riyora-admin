// utils/getDragHandler.js
export function getDragHandler(onImageLoaded) {
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                onImageLoaded(reader.result); // Send Base64 string back
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                onImageLoaded(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return { handleDragOver, handleDrop, handleFileSelect };
}
