// /pages/orders/[orderId].jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Section from '@/components/orders/Section';
import Info from '@/components/orders/Info';
import OrderActions from '@/components/orders/OrderActions';
import CourierModal from '@/components/ui/SelectDeliveryPartner';
import { shiprocketAction } from '@/lib/shiprocket/shiprocketApi';

const OrderDetails = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        (async () => {
            try {
                const res = await fetch(`/api/orderApi?orderId=${orderId}`);
                const data = await res.json();
                setOrder(data.order || data);
            } catch {
                toast.error('Failed to fetch order');
            } finally {
                setLoading(false);
            }
        })();
    }, [orderId]);

    const updateOrder = (updates) => setOrder(prev => ({ ...prev, ...updates }));

    if (loading) return <p>Loading...</p>;
    if (!order) return <p>No order found.</p>;

    return (
        <div>
            <h1>Order Details</h1>

            <Section title="General Info">
                <Info label="Order ID" value={order.razorpayOrderId} />
                <Info label="Status" value={order.status} status />
                <Info label="Payment" value={order.paymentStatus} />
            </Section>

            <Section title="Products">
                {order.products.map((p, i) => (
                    <div key={i}>
                        <span>{p.name}</span> - <span>Qty: {p.quantity}</span>
                    </div>
                ))}
            </Section>

            <Section title="Actions">
                <OrderActions
                    order={order}
                    isProcessing={false}
                    onUpdate={updateOrder}
                    onOpenCourier={() => setModalOpen(true)}
                />
            </Section>

            {modalOpen && (
                <CourierModal
                    show={modalOpen}
                    order={order}
                    onClose={() => setModalOpen(false)}
                    onConfirm={(courierName) => {
                        shiprocketAction('create', order._id, { courierName });
                        setModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default OrderDetails;
