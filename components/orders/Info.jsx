// /components/orders/Info.jsx
import styles from '@/styles/orders/common.module.css';

const Info = ({ label, value, status }) => (
    <p className={styles.sectionInfo}>
        <strong>{label}:</strong> <span className={status ? styles.statusText : ''}>{value || 'N/A'}</span>
    </p>
);

export default Info;
