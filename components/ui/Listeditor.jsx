import React from "react";
import styles from "@/styles/UI/ListEditor.module.css";

export const ListEditor = ({ values, onChange }) => {
    const handleAddValue = () => {
        onChange([...values, ""]);
    };

    const handleRemoveValue = (idx) => {
        const newValues = values.filter((_, i) => i !== idx);
        onChange(newValues);
    };

    const handleChangeValue = (idx, newValue) => {
        const newValues = [...values];
        newValues[idx] = newValue;
        onChange(newValues);
    };

    return (
        <div className={styles.container}>
            {values.map((val, idx) => (
                <div key={idx} className={styles.row}>
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => handleChangeValue(idx, e.target.value)}
                        className={styles.input}
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveValue(idx)}
                        className={styles.removeBtn}
                    >
                        ✕
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={handleAddValue}
                className={styles.addBtn}
            >
                + Add
            </button>
        </div>
    );
};

export default ListEditor;
