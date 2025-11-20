// /components/orders/OrderActions.jsx
import React from 'react';
import { shiprocketAction } from '@/lib/shiprocket/shiprocketApi';
import toast from 'react-hot-toast';

const OrderActions = ({ order, isProcessing, onUpdate, onOpenCourier }) => {

    const handleAction = async (action, extra = {}) => {
        if (isProcessing) return;
        const toastId = toast.loading(`${action} in progress...`);
        try {
            const data = await shiprocketAction(action, order._id, extra);
            onUpdate(data); // pass updated info to parent
            toast.success(`${action} successful`, { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    return (
        <div className="order-actions">
            {!order.shipping?.shipmentId && (
                <button onClick={onOpenCourier} disabled={isProcessing}>Assign Courier & Create Shipment</button>
            )}

            {order.shipping?.shipmentId && (
                <>
                    <button onClick={() => handleAction('generate_label')} disabled={isProcessing}>Label</button>
                    <button onClick={() => handleAction('pickup')} disabled={isProcessing}>Pickup</button>
                    <button onClick={() => handleAction('track')} disabled={isProcessing}>Track</button>
                    <button onClick={() => handleAction('cancel')} disabled={isProcessing}>Cancel</button>
                </>
            )}

            <button onClick={() => handleAction('refund')} disabled={isProcessing}>Refund</button>
            <button onClick={() => handleAction('invalid_address')} disabled={isProcessing}>Invalid Address</button>
        </div>
    );
};

export default OrderActions;
