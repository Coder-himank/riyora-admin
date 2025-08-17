import { useEffect, useState } from "react";
import styles from "@/styles/UI/deliveryPartnerList.module.css";

const CourierModal = ({
    show,
    order,
    onClose,
    onConfirm
}) => {
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourirePartner, setSelectedCourirePartner] = useState(null)

    useEffect(() => {
        if (!show || !order) return;

        const fetchCouriers = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/courierRates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pincode: order.address?.pincode,
                        weight: order.weight || 500,
                        amount: order.amount,
                    }),
                });
                const data = await res.json();
                setCouriers(data.options || []);
            } catch (err) {
                console.error("Error fetching couriers:", err);
            }
            setLoading(false);
        };

        fetchCouriers();
    }, [show, order]); // ✅ re-fetch if modal is reopened with a different order

    if (!show) return null;

    return (
        <div
            className={styles.modalBackdrop}
            onClick={onClose} // ✅ close when clicking backdrop
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()} // ✅ prevent close when clicking inside
            >

                <div className={styles.header}>

                    <h2>Select Delivery Partner</h2>
                    <button onClick={onClose} className={styles.close}>Close</button>
                </div>

                {loading && <p>Loading...</p>}

                {!loading && couriers.length === 0 && (
                    <p>No courier options available</p>
                )}

                {!loading &&
                    couriers.map((c, i) => (
                        <div
                            key={i}
                            className={`${styles.courierOption} ${selectedCourirePartner === c.name ? styles.selected : ""}`}
                        >
                            <span>{c.name}</span>
                            <span>₹{c.price}</span>
                            <span>{c.estDelivery}</span>
                            <button
                                onClick={() => {
                                    setSelectedCourirePartner(c.name)
                                }}
                            >
                                {selectedCourirePartner === c.name ? "Selected" : "Choose"}
                            </button>
                        </div>
                    ))}

                <button className={styles.confirm} onClick={() => onConfirm(selectedCourirePartner)}>Confirm</button>
            </div>
        </div>
    );
};

export default CourierModal;
