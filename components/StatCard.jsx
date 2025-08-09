import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import styles from "@/styles/UI/statCard.module.css";

export default function StatCard({ title, value, change }) {
    return (
        <motion.div whileHover={{ scale: 1.05 }}>
            <Card className={styles.statCard}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={styles.statValue}>{value}</p>
                    <p className={`${styles.statChange} ${change.includes('-') ? styles.negative : styles.positive}`}>
                        {change}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
