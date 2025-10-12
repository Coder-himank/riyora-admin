import React, { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/orders/ordersIndex.module.css';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CourierModal from "@/components/ui/SelectDeliveryPartner";
import toast from 'react-hot-toast';
import Link from 'next/link';
import { HiOutlineExternalLink } from 'react-icons/hi';
import updateStatus, { fetchLabel, updateOrder } from '@/lib/orderUtils';
import { FaTrash } from "react-icons/fa";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("all");
  const [modalOrder, setModalOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orderApi');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ✅ Filtering with memo to prevent unnecessary renders
  const filteredOrders = useMemo(() => {
    return activeTab === "all"
      ? orders
      : orders.filter((order) => order.status?.toLowerCase() === activeTab);
  }, [activeTab, orders]);

  const tabs = ["all", "hold", "pending", "confirmed", "ready to ship", "shipped", "delivered"];
  const getCount = (status) =>
    status === "all"
      ? orders.length
      : orders.filter((o) => o.status?.toLowerCase() === status).length;

  const updateOrderStatus = (orderId, updates) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, ...updates } : o))
    );
  };

  // ✅ Handlers
  const handleConfirmOrder = async (id) => {
    try {
      await updateStatus(id, "confirmed");
      updateOrderStatus(id, { status: "confirmed" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm order");
    }
  };

  const handleConfirmPartner = async (cname, orderId) => {
    try {
      await updateOrder({
        orderId,
        updatedFields: { courier: { courier_name: cname } }
      });

      updateOrderStatus(orderId, {
        courier: { courier_name: cname }
      });

      setModalOrder(null);
      toast.success("Courier assigned!");
    } catch (err) {
      toast.error("Failed to assign courier");
    }
  };

  const downloadLabel = async (orderId = null) => {
    if (downloading) return;
    setDownloading(true);
    try {
      const data = await fetchLabel({
        orderIds: orderId ? [orderId] : selectedOrders
      });


      if (data?.labels?.length) {
        data.labels.forEach((label) => {
          const link = document.createElement("a");
          link.href = label.labelUrl;
          link.download = `label-${label.orderId}.pdf`;
          //   link.click();
          updateOrderStatus(label.orderId, { status: "ready to ship" });
        });
        toast.success("Labels downloaded!");
      } else {
        toast.error("No labels found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch labels");
    } finally {
      setDownloading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await updateOrder({
        orderId,
        updatedFields: { status: "cancelled" }
      });

      updateOrderStatus(orderId, { status: "cancelled" });
      toast.success("Order cancelled");
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Orders</h1>

        {/* ✅ Tabs with counts */}
        <div className={styles.tabs}>
          <div className={styles.tabs_in}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getCount(tab)})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.orderList}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p>No {activeTab} orders found</p>
        ) : (
          <>
            <div className={`${styles.head_row}`}>
              <span>Image</span>
              <span className={styles.orderId}>ProductName</span>
              <span>Pincode</span>
              <span>Quantity</span>
              <span>Amount</span>
              <span>Payment</span>
              <span className={styles.actionBtnHead}>Action</span>
            </div>

            {filteredOrders.map((item) => (
              <motion.div key={item._id} className={styles.orderItem}>
                {/* 🔥 Product Images Stack */}
                <div className={styles.imageStack}>
                  {item.products?.slice(0, 4).map((p, idx) => (
                    <img
                      key={idx}
                      src={p.imageUrl}
                      alt="product"
                      className={styles.orderImage}
                    />
                  ))}
                  {item.products?.length > 4 && (
                    <span className={styles.moreImages}>
                      +{item.products.length - 4}
                    </span>
                  )}
                </div>

                <span className={styles.productsName}>
                  <ul>

                    {item.products.map((p, idx) => {
                      return (
                        <li>
                          {p.name}
                        </li>
                      )
                    })}
                  </ul>
                </span>
                <span>{item.address?.pincode || "-"}</span>
                <span>
                  {item.products.reduce((total, product) => total + product.quantity, 0)}
                </span>

                <span>₹{item.amount || 0}</span>
                <span>{item.paymentStatus}</span>

                {/* Actions */}
                <div className={styles.actionBtn}>
                  {(item.status === "pending" || item.status === "hold") && (
                    <button
                      className={`${styles.confirmBtn} ${styles.actionBigBtn}`}
                      onClick={() => handleConfirmOrder(item._id)}
                    >
                      Confirm
                    </button>
                  )}

                  {item.status === "confirmed" ? (
                    <button
                      className={` ${styles.actionBigBtn} ${styles.partnerBtn}`}
                      onClick={() => setModalOrder(item)}
                    >
                      {item?.courier?.courier_name || "Select Partner"}
                    </button>
                  ) : item.status === "ready to ship" ? (
                    <p className={styles.deliveryPartnerName}>
                      {item?.courier?.courier_name}
                    </p>
                  ) : null}

                  <button
                    onClick={() => downloadLabel(item._id)}
                    className={`${styles.actionBigBtn} ${styles.labelBtn}`}
                    disabled={!(item.courier?.courier_name) || downloading}
                  >
                    Label
                  </button>

                  <Link href={`/orders/${item._id}`} className={styles.open}>
                    <HiOutlineExternalLink />
                  </Link>

                  <button
                    className={styles.cancelBtn}
                    onClick={() => cancelOrder(item._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* ✅ Single Courier Modal */}
            {modalOrder && (
              <CourierModal
                show={!!modalOrder}
                order={modalOrder}
                onClose={() => setModalOrder(null)}
                onConfirm={(cname) => handleConfirmPartner(cname, modalOrder._id)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
