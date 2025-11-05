// components/admin/ShiprocketDashboard.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/orders/ordersIndex.module.css';
import toast from 'react-hot-toast';

export default function ShiprocketDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/admin/orders/summary'); // implement if you want aggregated counts
                const json = await res.json();
                setStats(json);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className={styles.container}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Fulfillment Dashboard</h2>
                <div>
                    <Link href="/admin/orders"><button className={styles.confirmBtn}>Open Orders</button></Link>
                    <Link href="/admin/reports"><button className={styles.courierBtn} style={{ marginLeft: 8 }}>Reports</button></Link>
                </div>
            </header>

            <main style={{ marginTop: 20 }}>
                {loading && <p>Loading...</p>}
                {!loading && !stats && <p>No stats available</p>}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                        <div className={styles.card}>
                            <h3>Orders</h3>
                            <p>{stats.totalOrders}</p>
                        </div>
                        <div className={styles.card}>
                            <h3>Ready to Ship</h3>
                            <p>{stats.readyToShip}</p>
                        </div>
                        <div className={styles.card}>
                            <h3>In Transit</h3>
                            <p>{stats.inTransit}</p>
                        </div>
                        <div className={styles.card}>
                            <h3>Delivered</h3>
                            <p>{stats.delivered}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
