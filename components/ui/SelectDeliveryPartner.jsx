import { useEffect, useState } from "react";
import styles from "@/styles/UI/deliveryPartnerList.module.css";

const CourierModal = ({ show, order, onClose, onConfirm }) => {
    const [couriers, setCouriers] = useState([]);
    const [cheapest, setCheapest] = useState(null);
    const [fastest, setFastest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState(null);

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
                        weight: order.weight || 0.5,
                        amount: order.amount,
                    }),
                });

                const data = await res.json();

                if (!res.ok || !data.options) {
                    setCouriers([]);
                } else {
                    setCouriers(data.options);
                    setCheapest(data.cheapestOption);
                    setFastest(data.fastestOption);
                }
            } catch (err) {
                console.error("Error fetching couriers:", err);
                setCouriers([]);
            }
            setLoading(false);
        };

        fetchCouriers();
    }, [show, order]);

    if (!show) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Select Delivery Partner</h2>
                    <button onClick={onClose} className={styles.close}>Close</button>
                </div>

                {loading && <p>Loading...</p>}
                {!loading && couriers.length === 0 && <p>No courier options available</p>}

                {!loading && couriers.length > 0 && (
                    <>
                        {/* ✅ Highlight Cheapest & Fastest */}
                        {cheapest && (
                            <div className={styles.highlight}>
                                💸 Cheapest: {cheapest.courier} — ₹{cheapest.totalCost}
                            </div>
                        )}

                        {fastest && (
                            <div className={styles.highlight}>
                                ⚡ Fastest: {fastest.courier} — {fastest.estDelivery}
                            </div>
                        )}

                        {/* ✅ Courier List */}
                        {couriers.map((c, i) => (
                            <div
                                key={i}
                                className={`${styles.courierOption} ${selectedCourier === c.courier ? styles.selected : ""
                                    }`}
                            >
                                <span>{c.courier}</span>
                                <span>₹{c.totalCost}</span>
                                <span>{c.estDelivery}</span>

                                <button onClick={() => setSelectedCourier(c.courier)}>
                                    {selectedCourier === c.courier ? "Selected" : "Choose"}
                                </button>
                            </div>
                        ))}

                        <button
                            className={styles.confirm}
                            disabled={!selectedCourier}
                            onClick={() => onConfirm(selectedCourier)}
                        >
                            Place Order with {selectedCourier}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CourierModal;
