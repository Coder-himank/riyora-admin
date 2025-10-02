// File: components/ComplaintsPage.jsx
// Usage: Place this component in your Next.js / React app and import the CSS module file Complaints.module.css

import React, { useEffect, useState } from "react";
import styles from "@/styles/complaint/index.module.css";
import Link from "next/link";

import Image from "next/image";


export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchComplaints() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/complaintApi");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) setComplaints(Array.isArray(data) ? data : []);
            } catch (err) {
                console.warn("Fetching complaints failed, using mock data:", err);
                // fallback: mock data so page still works while API isn't wired
                if (!cancelled) {
                    setComplaints(mockComplaints);
                    setError("Failed to load from server — showing local sample data.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchComplaints();
        return () => (cancelled = true);
    }, []);

    // Filtering
    const filtered = complaints.filter((c) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
            (c.subject && c.subject.toLowerCase().includes(q)) ||
            (c.message && c.message.toLowerCase().includes(q)) ||
            (c.productName && c.productName.toLowerCase().includes(q)) ||
            (c.orderId && c.orderId.toLowerCase().includes(q))
        );
    });

    function toggleExpand(id) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>All Complaints</h1>
                <p className={styles.subtitle}>Expand any complaint to read the full details.</p>
            </header>

            <div className={styles.controls}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by subject, message, product or order id..."
                    className={styles.search}
                    aria-label="Search complaints"
                />
            </div>

            {loading ? (
                <div className={styles.message}>Loading complaints…</div>
            ) : (
                <>
                    {error && <div className={styles.error}>{error}</div>}

                    {filtered.length === 0 ? (
                        <div className={styles.message}>No complaints found.</div>
                    ) : (
                        <ul className={styles.list} role="list">
                            {filtered.map((c) => (
                                <li key={c._id} className={styles.item}>
                                    <button
                                        className={styles.summary}
                                        aria-expanded={expandedId === c._id}
                                        aria-controls={`complaint-${c._id}`}
                                        onClick={() => toggleExpand(c._id)}
                                    >
                                        <div className={styles.summaryLeft}>
                                            <div className={styles.subject}>{c.reason || "(no subject)"}</div>
                                            <div className={styles.meta}>Order: {c.orderId || "—"} • Product: {c.productName || "—"}</div>
                                        </div>
                                        <div className={styles.summaryRight}>
                                            <div className={styles.status}>{c.status || "open"}</div>
                                            <div className={styles.chev}>{expandedId === c._id ? "▴" : "▾"}</div>
                                        </div>
                                    </button>

                                    <div
                                        id={`complaint-${c._id}`}
                                        className={`${styles.panel} ${expandedId === c._id ? styles.open : ""}`}
                                        role="region"
                                        aria-hidden={expandedId !== c._id}
                                    >
                                        <div className={styles.panelRow}>
                                            <strong>Message</strong>
                                            <p className={styles.messageText}>{c.complaintText || "(no message)"}</p>
                                        </div>

                                        <div className={styles.panelRow}>
                                            <strong>Details</strong>
                                            <div className={styles.detailsGrid}>
                                                <div>
                                                    <div className={styles.detailLabel}>Order ID</div>
                                                    <div className={styles.detailValue}>{c.orderId || "—"}</div>
                                                </div>
                                                <div>
                                                    <div className={styles.detailLabel}>Created</div>
                                                    <div className={styles.detailValue}>{formatDate(c.createdAt)}</div>
                                                </div>
                                                <div>
                                                    <div className={styles.detailLabel}>Status</div>
                                                    <div className={styles.detailValue}>{c.status || "open"}</div>
                                                </div>

                                                <div>
                                                    <div className={styles.detailLabel}>Product</div>
                                                    <div className={styles.detailValue}>{c.productName || "—"}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {c.images && c.images.length > 0 && (
                                            <div className={styles.panelRow}>
                                                <strong>Images</strong>
                                                <div className={styles.imagesRow}>
                                                    {c.images.map((src, i) => (
                                                        <Link key={i} href={src} target="_blank" rel="noopener noreferrer">
                                                            <Image src={src} alt={`complaint image ${i + 1}`} className={styles.thumb} width={150} height={150} />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.panelActions}>

                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}

// --- helpers & mock data ---

function formatDate(d) {
    if (!d) return "—";
    try {
        const date = new Date(d);
        return date.toLocaleString();
    } catch (e) {
        return String(d);
    }
}

function handleOpenInAdmin(c) {
    // If you have an admin UI, adapt this link. For example: `/admin/orders/${c.orderId}`
    const adminUrl = `/admin/complaints/${c._id}`;
    window.open(adminUrl, "_blank");
}

async function copyToClipboard(c) {
    try {
        await navigator.clipboard.writeText(JSON.stringify(c, null, 2));
        alert("Complaint JSON copied to clipboard");
    } catch (e) {
        alert("Failed to copy");
    }
}

const mockComplaints = [
    {
        _id: "c_1",
        orderId: "order_123",
        productId: "prod_1",
        productName: "Classic Tee - Blue",
        sku: "CT-BL-001",
        createdAt: new Date().toISOString(),
        status: "open",
        subject: "Received wrong size",
        message: "I ordered size M but received size L. Please help.",
        images: [],
    },
    {
        _id: "c_2",
        orderId: "order_456",
        productId: "prod_2",
        productName: "Combo Pack - Snacks",
        sku: "CP-SNK-02",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: "processing",
        subject: "Missing item from combo",
        message: "The chips pouch was missing from the combo pack.",
        images: [
            "https://via.placeholder.com/240x160?text=Evidence+1",
        ],
    },
];

