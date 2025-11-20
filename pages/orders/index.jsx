import React, { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/orders/ordersIndex.module.css';
import { motion } from 'framer-motion';
import CourierModal from "@/components/ui/SelectDeliveryPartner";
import Link from 'next/link';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FaTrash } from "react-icons/fa";




const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [modalOrder, setModalOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [actionInProgress, setActionInProgress] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orderApi');
        const data = await res.json();
        setOrders(data.stats.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const handleOrderAction = async (orderId, action, options = {}) => {
    if (actionInProgress[orderId]) return;
    setActionInProgress(prev => ({ ...prev, [orderId]: true }));

    try {
      const res = await fetch('/api/external/orderActionApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, type: action, options }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Action failed");

      updateOrderLocal(orderId, data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(prev => ({ ...prev, [orderId]: false }));
    }
  };
  const updateOrderLocal = (id, updates) => {
    setOrders(prev => prev.map(o => (o._id === id ? { ...o, ...updates } : o)));
  };

  const handleAction = async (order, action, extra = {}) => {
    if (actionInProgress[order._id]) return;

    setActionInProgress(prev => ({ ...prev, [order._id]: true }));
    try {
      await handleOrderAction(order._id, action, extra);
    } catch { }
    finally {
      setActionInProgress(prev => ({ ...prev, [order._id]: false }));
    }
  };

  const createShipmentWithCourier = async (order, courier) => {
    await handleAction(order, 'create', { courierId: courier.courier_id, courierName: courier.courierName });
    updateOrderLocal(order._id, { shipping: { ...(order.shipping || {}), courierName: courier.courierName } });
  };

  // Tabs & filtering
  const tabs = ["all", "pending", "confirmed", "ready_to_ship", "in_transit", "out_for_delivery", "delivered"];
  const filteredOrders = useMemo(() => {
    const base = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);
    return showCancelled ? base : base.filter(o => o.status !== "cancelled");
  }, [orders, activeTab, showCancelled]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Orders Dashboard</h1>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/_/g, " ")} ({orders.filter(o => tab === "all" || o.status === tab).length})
            </button>
          ))}
          {activeTab === "all" && (
            <label className={styles.showCancelled}>
              <input type="checkbox" checked={showCancelled} onChange={() => setShowCancelled(x => !x)} />
              Show Cancelled
            </label>
          )}
        </div>
      </header>

      <main className={styles.orderList}>
        {loading && <p>Loading orders...</p>}
        {filteredOrders.map(order => {
          const ship = order.shipping || {};
          const isProcessing = actionInProgress[order._id];
          return (
            <motion.div key={order._id} className={`${styles.orderCard} ${order.status === "cancelled" ? styles.cancelled : ""}`}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{order._id}</span>
                <span className={`${styles.status} ${styles[order.status]}`}>{order.status.replace(/_/g, " ")}</span>
                {ship?.awb && <span className={styles.awb}>AWB: {ship.awb}</span>}
              </div>

              <div className={styles.actions}>
                {(order.status === "pending" || order.status === "hold") && (
                  <button onClick={() => setModalOrder(order)} disabled={isProcessing}>Select Courier & Create Shipment</button>
                )}
                {ship.shipmentId && (
                  <>
                    <button onClick={() => handleAction(order, "generate_label")} disabled={isProcessing}>Label</button>
                    <button onClick={() => handleAction(order, "pickup")} disabled={isProcessing}>Pickup</button>
                    <button onClick={() => handleAction(order, "track")} disabled={isProcessing}>Track</button>
                    <button onClick={() => handleAction(order, "cancel")} disabled={isProcessing}>Cancel</button>
                  </>
                )}
              </div>

              {modalOrder && (
                <CourierModal
                  show={!!modalOrder}
                  order={modalOrder}
                  onClose={() => setModalOrder(null)}
                  onConfirm={(courier) => {
                    createShipmentWithCourier(modalOrder, courier);
                    setModalOrder(null);
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </main>
    </div>
  );
};

export default OrdersPage;
