import React, { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/orders/ordersIndex.module.css';
import { motion } from 'framer-motion';
import CourierModal from "@/components/ui/SelectDeliveryPartner";
import toast from 'react-hot-toast';
import Link from 'next/link';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FaTrash } from "react-icons/fa";

// -------- API Helper with Error Handling --------
const apiManage = async (action, orderId, extra = {}) => {
  try {
    const res = await fetch('/api/shiprocket/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, orderId, extra })
    });
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');
    return json;
  } catch (err) {
    throw new Error(err.message || 'API request failed');
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("all");
  const [modalOrder, setModalOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [actionInProgress, setActionInProgress] = useState({}); // track per-order actions

  // -------- Fetch Orders --------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orderApi');
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------- Update local order --------
  const updateOrderLocal = (id, updates) => {
    setOrders(prev => prev.map(o => o._id === id ? ({ ...o, ...updates }) : o));
  };

  // -------- Tabs Filtering --------
  const tabs = ["all", "pending", "confirmed", "ready_to_ship", "in_transit", "out_for_delivery", "delivered"];
  const filteredOrders = useMemo(() => {
    return activeTab === "all"
      ? (showCancelled ? orders : orders.filter(o => o.status !== "cancelled"))
      : orders.filter(o => o.status === activeTab);
  }, [orders, activeTab, showCancelled]);

  // -------- Handle Single Order Action --------
  const handleAction = async (id, action) => {
    if (actionInProgress[id]) return;
    setActionInProgress(prev => ({ ...prev, [id]: true }));
    const toastId = toast.loading(`${action} in progress...`);
    try {
      const json = await apiManage(action, id);
      if (json.status) updateOrderLocal(id, { status: json.status });
      if (json.courier || json.labelUrl) updateOrderLocal(id, { shipping: { ...(orders.find(o => o._id === id)?.shipping || {}), ...json } });
      toast.success(`${action} successful`, { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
      console.log(err);
    } finally {
      setActionInProgress(prev => ({ ...prev, [id]: false }));
    }
  };

  // -------- Handle Bulk Action --------
  const bulkAction = async (action) => {
    if (!selectedOrders.length) return toast.error("No orders selected");
    toast.loading(`Performing ${action} for ${selectedOrders.length} orders...`);
    for (const id of selectedOrders) {
      try {
        await handleAction(id, action);
      } catch {
        // Errors already handled in handleAction
      }
    }
    setSelectedOrders([]);
    toast.success("Bulk action completed");
  };

  // -------- Render --------
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Orders Dashboard</h1>

        <div className={styles.bulkActions}>
          <button onClick={() => bulkAction("create")} className={styles.createBtn} disabled={Object.values(actionInProgress).some(Boolean)}>Bulk Create Shipments</button>
          <button onClick={() => bulkAction("generate_label")} className={styles.labelBtn} disabled={Object.values(actionInProgress).some(Boolean)}>Bulk Generate Labels</button>
        </div>

        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())} ({orders.filter(o => tab === "all" ? true : o.status === tab).length})
            </button>
          ))}
          {activeTab === "all" && (
            <label className={styles.showCancelled}>
              <input type="checkbox" checked={showCancelled} onChange={() => setShowCancelled(s => !s)} />
              Show Cancelled
            </label>
          )}
        </div>
      </header>

      <main className={styles.orderList}>
        {loading && <p className={styles.loading}>Loading orders...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && filteredOrders.length === 0 && <p>No {activeTab} orders found.</p>}

        {filteredOrders.map(order => {
          const ship = order.shipping || {};
          const isProcessing = actionInProgress[order._id] || false;
          return (
            <motion.div key={order._id} className={`${styles.orderCard} ${order.status === "cancelled" ? styles.cancelled : ""}`}>
              <div className={styles.orderHeader}>
                <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={e => {
                  setSelectedOrders(prev => e.target.checked ? [...prev, order._id] : prev.filter(id => id !== order._id));
                }} disabled={isProcessing} />
                <span className={styles.orderId}>#{order._id}</span>
                <span className={`${styles.status} ${styles[order.status.replace(/\s+/g, '')]}`}>{order.status.replace(/_/g, " ")}</span>
                <span className={styles.awb}>{ship?.awb ? `AWB: ${ship.awb}` : ''}</span>
              </div>

              <div className={styles.products}>
                {order.products.map((p, i) => (
                  <div key={i} className={styles.product}>
                    <img src={p.imageUrl} alt={p.name} />
                    <div className={styles.productInfo}>
                      <span>{p.name}</span>
                      <span>Qty: {p.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderDetails}>
                <span>Pincode: {order.address?.pincode || '-'}</span>
                <span>Amount: ₹{order.amount || 0}</span>
                <span>Payment: {order.paymentStatus}</span>
              </div>

              <div className={styles.actions}>
                {(order.status === "pending" || order.status === "hold") && (
                  <button onClick={() => handleAction(order._id, "create")} disabled={isProcessing}>Create Shipment</button>
                )}

                {order.courier?.shipmentId && (
                  <>
                    <button onClick={() => handleAction(order._id, "label")} disabled={isProcessing}>Label</button>
                    <button onClick={() => handleAction(order._id, "pickup")} disabled={isProcessing}>Pickup</button>
                    <button onClick={() => handleAction(order._id, "track")} disabled={isProcessing}>Track</button>
                    <button onClick={() => handleAction(order._id, "cancel")} disabled={isProcessing}>Cancel</button>
                  </>
                )}

                <Link href={`/orders/${order._id}`} className={styles.externalLink}><HiOutlineExternalLink /></Link>
                <button onClick={() => handleAction(order._id, "cancel")} className={styles.deleteBtn} disabled={isProcessing}><FaTrash /></button>
              </div>
            </motion.div>
          );
        })}

        {modalOrder && (
          <CourierModal
            show={!!modalOrder}
            order={modalOrder}
            onClose={() => setModalOrder(null)}
            onConfirm={(cname) => {
              fetch('/api/orderApi/update', { method: 'POST', body: JSON.stringify({ orderId: modalOrder._id, updatedFields: { "shipping.courierName": cname } }) });
              setOrders(prev => prev.map(o => o._id === modalOrder._id ? ({ ...o, shipping: { ...(o.shipping || {}), courierName: cname } }) : o));
              setModalOrder(null);
              toast.success('Courier assigned');
            }}
          />
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
