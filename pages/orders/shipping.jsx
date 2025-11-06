import { useState, useEffect } from "react";

export default function ShippingDashboard() {
    const [orders, setOrders] = useState([]);

    useEffect(() => { fetch("/api/orderApi").then(r => r.json()).then(d => setOrders(d.orders)); }, []);

    return (
        <div style={{ padding: 20 }}>
            <h2>Shipments</h2>
            <table border={1} cellPadding={8}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Courier</th>
                        <th>AWB</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o._id}>
                            <td>{o._id}</td>
                            <td>{o.status}</td>
                            <td>{o.courier?.courierId || "-"}</td>
                            <td>{o.courier?.shipmentId || "-"}</td>
                            <td>
                                <button onClick={() => handleAction(o._id, "track")}>Track</button>
                                <button onClick={() => handleAction(o._id, "cancel")}>Cancel</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
