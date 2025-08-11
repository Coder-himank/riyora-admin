
import { useState } from "react";
import styles from "@/styles/UI/ChipInput.module.css"

export default function ChipInput({ name, values = [], onChange }) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed && !values.includes(trimmed)) {
                onChange([...values, trimmed]);
            }
            setInputValue("");
        }
    };

    const removeChip = (chip) => {
        onChange(values.filter(v => v !== chip));
    };

    return (
        <div className={styles.chipContainer}>
            <div className={styles.chipHolder}>

                {values.map((chip, idx) => (
                    <div key={idx} className={styles.chip}>
                        {chip}
                        <button type="button" onClick={() => removeChip(chip)}>x</button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                name={name}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type and press comma"
            />
        </div>
    );
}