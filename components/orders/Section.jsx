// /components/orders/Section.jsx
import styles from '@/styles/orders/common.module.css';

const Section = ({ title, children }) => (
    <div className={styles.section}>
        <h2>{title}</h2>
        {children}
    </div>
);

export default Section;
