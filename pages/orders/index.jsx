import React, { useEffect, useState, useMemo } from "react";
import styles from "@/styles/orders/ordersIndex.module.css";
import { motion } from "framer-motion";
import CourierModal from "@/components/ui/SelectDeliveryPartner";
import { HiOutlineDotsVertical, HiOutlineExternalLink } from "react-icons/hi";
import { FaTrash } from "react-icons/fa";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [modalOrder, setModalOrder] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null); // track which order dropdown is open

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orderApi");
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
    setActionInProgress((prev) => ({ ...prev, [orderId]: true }));

    try {
      const res = await fetch("/api/external/orderActionApi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, type: action, options }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Action failed");

      updateOrderLocal(orderId, data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const updateOrderLocal = (id, updates) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, ...updates } : o))
    );
  };

  const handleAction = async (order, action, extra = {}) => {
    if (actionInProgress[order._id]) return;

    setActionInProgress((prev) => ({ ...prev, [order._id]: true }));
    try {
      await handleOrderAction(order._id, action, extra);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  const createShipmentWithCourier = async (order, courier) => {
    await handleAction(order, "ship_create", {
      courierId: courier.courier_id,
      courierName: courier.courierName,
    });
    updateOrderLocal(order._id, {
      shipping: { ...(order.shipping || {}), courierName: courier.courierName },
    });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const tabs = [
    "all",
    "pending",
    "confirmed",
    "ready_to_ship",
    "in_transit",
    "out_for_delivery",
    "delivered",
  ];

  const filteredOrders = useMemo(() => {
    const base = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
    return base.filter((o) => o.status !== "cancelled");
  }, [orders, activeTab]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Orders Dashboard</h1>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/_/g, " ")} (
              {orders.filter((o) => tab === "all" || o.status === tab).length})
            </button>
          ))}
        </div>
      </header>

      <main className={styles.orderList}>
        {loading && <p>Loading orders...</p>}

        {filteredOrders.map((order) => {
          const ship = order.shipping || {};
          const isProcessing = actionInProgress[order._id];
          const isExpanded = expandedOrderIds.includes(order._id);

          return (
            <motion.div
              key={order._id}
              className={`${styles.orderCard} ${order.status === "cancelled" ? styles.cancelled : ""
                }`}
            >
              <div className={styles.orderHeader}>
                <div className={styles.orderSummary}>
                  <span className={styles.orderId}>#{order._id}</span>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                  {ship?.awb && <span className={styles.awb}>AWB: {ship.awb}</span>}
                </div>

                <div className="relative">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() =>
                      setMenuOpenId(menuOpenId === order._id ? null : order._id)
                    }
                  >
                    <HiOutlineDotsVertical size={20} />
                  </button>

                  {menuOpenId === order._id && (
                    <div className={styles.menuDropdown}>
                      <ul className={styles.menuList}>
                        {(order.status === "pending" || order.status === "hold") && (
                          <li
                            className={styles.menuItem}
                            onClick={() => setModalOrder(order)}
                          >
                            Create Shipment
                          </li>
                        )}
                        {ship.shipmentId && (
                          <>
                            <li
                              className={styles.menuItem}
                              onClick={() => handleAction(order, "generate_label")}
                            >
                              Generate Label
                            </li>
                            <li
                              className={styles.menuItem}
                              onClick={() => handleAction(order, "pickup")}
                            >
                              Schedule Pickup
                            </li>
                            <li
                              className={styles.menuItem}
                              onClick={() => handleAction(order, "track")}
                            >
                              Track Shipment
                            </li>
                            <li
                              className={styles.menuItem}
                              onClick={() => handleAction(order, "cancel_shipment")}
                            >
                              Cancel Shipment
                            </li>
                          </>
                        )}
                        {order.status !== "cancelled" && (
                          <li
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                            onClick={() =>
                              handleAction(order, "cancelled", { note: "Cancelled by admin" })
                            }
                          >
                            Cancel Order
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                </div>

                <button
                  className={styles.expandBtn}
                  onClick={() => toggleExpand(order._id)}
                >
                  {isExpanded ? "Collapse" : "Expand"}
                </button>
              </div>

              {isExpanded && (
                <div className={styles.orderDetails}>
                  {/* <h4>Products:</h4> */}
                  <ul className={styles.productList}>
                    {order.products.map((p) => (
                      <li key={p.productId} className={styles.productItem}>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className={styles.productImage}
                        />
                        <div className={styles.productInfo}>
                          <p>{p.name}</p>
                          {p.variantName && <p>Variant: {p.variantName}</p>}
                          <p>
                            Qty: {p.quantity} × ₹{p.price}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* <h4>Amount:</h4> */}
                  <div className={styles.amountBreakdown}>
                    <p>Subtotal: ₹{order.amountBreakDown?.subtotal}</p>
                    <p>Shipping: ₹{order.amountBreakDown?.shipping}</p>
                    <p>Tax: ₹{order.amountBreakDown?.tax}</p>
                    <p>Discount: ₹{order.amountBreakDown?.discount}</p>
                    <p>
                      <b>Total: ₹{order.amountBreakDown?.total}</b>
                    </p>
                  </div>

                  {/* <h4>Delivery Address:</h4> */}
                  <div className={styles.address}>
                    <p>{order.address.name}</p>
                    <p>
                      {order.address.address}, {order.address.city},{" "}
                      {order.address.state} - {order.address.pincode}
                    </p>
                    <p>{order.address.phone}</p>
                    {order.address.email && <p>{order.address.email}</p>}
                  </div>
                </div>
              )}

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
