import * as React from "react";
import styles from "@/styles/UI/card.module.css";

const Card = React.forwardRef(function Card({ className = "", ...props }, ref) {
    return (
        <div
            ref={ref}
            className={`${styles.card} ${className}`}
            {...props}
        />
    );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(function CardHeader({ className = "", ...props }, ref) {
    return (
        <div
            ref={ref}
            className={`${styles.cardHeader} ${className}`}
            {...props}
        />
    );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(function CardTitle({ className = "", ...props }, ref) {
    return (
        <h3
            ref={ref}
            className={`${styles.cardTitle} ${className}`}
            {...props}
        />
    );
});
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef(function CardContent({ className = "", ...props }, ref) {
    return (
        <div
            ref={ref}
            className={`${styles.cardContent} ${className}`}
            {...props}
        />
    );
});
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
