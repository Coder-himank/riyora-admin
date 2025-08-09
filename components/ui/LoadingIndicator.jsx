import React from "react";
import styles from "@/styles/UI/loadingSpinner.module.css";

const LoadingSpinner = () => {
    return (
        <div className={styles.spinnerOverlay}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default LoadingSpinner;
