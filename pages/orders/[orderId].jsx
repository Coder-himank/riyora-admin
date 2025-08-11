import React, { useEffect, useState } from "react";
import styles from "@/styles/orders/orderDetail.module.css";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";

// Placeholder loading component
const LoadingIndicator = () => <p className={styles.loading}>Loading...</p>;

const OrderDetails = ({ onAccept, onCancel }) => {
    const router = useRouter();
    const { orderId } = router.query;

    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/orderApi?orderId=${orderId}`);
                if (response.status === 200) {
                    setOrderDetails(response.data);
                } else {
                    toast.error("Failed to fetch order details");
                }
            } catch (e) {
                toast.error("Error occurred while fetching order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [orderId]);

    if (loading) return <LoadingIndicator />;
    if (!orderDetails) return <p className={styles.noOrder}>No order details found.</p>;

    const {
        razorpayOrderId,
        userId,
        status,
        paymentStatus,
        currency,
        products = [],
        amountBreakDown = {},
        address = {},
        paymentDetails,
        orderHistroy = [],
        placedOn,
        expectedDelivery,
        deliveredOn,
        cancelledOn,
        _id,
    } = orderDetails;

    const baseImageUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Order Details</h1>

            {/* General Info */}
            <Section title="General Info">
                <Info label="Order ID" value={razorpayOrderId} />
                <Info label="User ID" value={userId} />
                <Info label="Status" value={status} className={styles.status} />
                <Info label="Payment Status" value={paymentStatus} />
                <Info label="Currency" value={currency} />
            </Section>

            {/* Products */}
            <Section title="Products">
                {products.map((prod, idx) => (
                    <div key={idx} className={styles.productCard}>
                        {prod.imageUrl && <img src={baseImageUrl + prod.imageUrl} alt="" className={styles.productImage} />}
                        <div>
                            <Info label="Product ID" value={prod.productId} />
                            <Info label="Quantity" value={prod.quantity} />
                            <Info label="Price" value={`₹${prod.price}`} />
                        </div>
                    </div>
                ))}
            </Section>

            {/* Amount Breakdown */}
            <Section title="Amount Breakdown">
                <Info label="Subtotal" value={`₹${amountBreakDown.subtotal}`} />
                <Info label="Shipping" value={`₹${amountBreakDown.shipping}`} />
                <Info label="Tax" value={`₹${amountBreakDown.tax}`} />
                <Info label="Discount" value={`₹${amountBreakDown.discount}`} />
                <p className={styles.total}><strong>Total:</strong> ₹{amountBreakDown.total}</p>
            </Section>

            {/* Shipping Address */}
            <Section title="Shipping Address">
                <p>{address.label}</p>
                <p>{address.address}</p>
                <p>{address.city}, {address.state}, {address.pincode}</p>
                <p>{address.country}</p>
            </Section>

            {/* Payment Details */}
            {paymentDetails && (
                <Section title="Payment Details">
                    <Info label="Transaction ID" value={paymentDetails.transactionId} />
                    <Info label="Gateway" value={paymentDetails.paymentGateway} />
                    <Info label="Date" value={paymentDetails.paymentDate ? new Date(paymentDetails.paymentDate).toLocaleString() : "N/A"} />
                </Section>
            )}

            {/* History */}
            <Section title="Order History">
                {orderHistroy.map((h, idx) => (
                    <div key={idx} className={styles.historyItem}>
                        <Info label="Status" value={h.status} />
                        <Info label="Date" value={new Date(h.date).toLocaleString()} />
                        {h.note && <Info label="Note" value={h.note} />}
                    </div>
                ))}
            </Section>

            {/* Dates */}
            <Section title="Dates">
                <Info label="Placed On" value={new Date(placedOn).toLocaleString()} />
                <Info label="Expected Delivery" value={new Date(expectedDelivery).toLocaleString()} />
                {deliveredOn && <Info label="Delivered On" value={new Date(deliveredOn).toLocaleString()} />}
                {cancelledOn && <Info label="Cancelled On" value={new Date(cancelledOn).toLocaleString()} />}
            </Section>

            {/* Buttons */}
            <div className={styles.actions}>
                <button className={styles.acceptBtn} onClick={() => onAccept(_id)}>Accept Order</button>
                <button className={styles.cancelBtn} onClick={() => onCancel(_id)}>Cancel Order</button>
            </div>
        </div>
    );
};

// Reusable Section Component
const Section = ({ title, children }) => (
    <div className={styles.section}>
        <h2>{title}</h2>
        {children}
    </div>
);

// Reusable Info Row
const Info = ({ label, value, className = "" }) => (
    <p className={styles.section_info}>
        <strong>{label}:</strong> <span className={className}>{value}</span>
    </p>
);

export default OrderDetails;
