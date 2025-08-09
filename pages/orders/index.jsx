import React, { useEffect, useState } from 'react';
import styles from '@/styles/orders/ordersIndex.module.css';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orderApi');
                if (!res.ok) throw new Error('Failed to fetch orders');
                const data = await res.json();
                setOrders(data.orders);
                console.log(data);
            } catch (err) {
                setError(err.message || 'Error fetching orders');
                // Demo orders

            } finally {

                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Orders</h1>
                <div className={styles.dropdown}>
                    <label htmlFor="filter">Filter By</label>
                    <select id='filter'>
                        <option value="all">All</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="Pending">Pending</option>
                        <option value="unconfirmed">Unconfirmed</option>
                    </select>
                </div>
            </div>

            <div className={styles.orderList}>

                {orders.length === 0 ? (<p>No Orders Found</p>) : (
                    <>

                        <div
                            className={`${styles.head_row}`}
                        >
                            <span>Sr. no.</span>
                            <span>Order ID</span>
                            <span>status</span>
                            <span>User ID</span>
                            <span>Amount</span>
                            <span>Payment</span>
                        </div>

                        {orders.map((item, index) => (

                            <motion.div

                                className={`${styles.orderItem}`}
                                onClick={(e) => router.push(`/orders/${item._id}`)}
                            >
                                <span>{index + 1}</span>
                                <span>{item._id}</span>
                                <span>{item.status}</span>
                                <span>{item.userId}</span>
                                <span>₹{item.amount}</span>
                                <span>{item.paymentStatus}</span>
                            </motion.div>
                        ))}

                    </>
                )
                }
            </div >
        </div >
    ); {/*return*/ }
} /* function end */

export default OrdersPage;