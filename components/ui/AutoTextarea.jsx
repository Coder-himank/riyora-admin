import { useEffect, useRef, useState } from "react";

export default function AutoTextarea({ value, onChange, name, ...props }) {
    const textareaRef = useRef(null);
    const [height, setHeight] = useState("auto");

    // Adjust height whenever value changes
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // reset
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value]);

    const handleChange = (e) => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
        onChange(e);
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            name={name}
            style={{ height, overflow: "auto", resize: "none" }}
            {...props}
        />
    );
}
