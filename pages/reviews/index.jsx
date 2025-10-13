import styles from "@/styles/reviews/reviewindex.module.css";
import { useState } from "react";
import connectDB from "@/lib/database";
import Product from "@/lib/models/product";
import StarRating from "@/components/ui/StarRating";
import Image from "next/image";
import axios from "axios";

const ReviewIndex = ({ reviews }) => {
    const [selectedProduct, setSelectedProduct] = useState("all");
    const [selectedRating, setSelectedRating] = useState("all");
    const [replyInputs, setReplyInputs] = useState({});
    const [mediaPreview, setMediaPreview] = useState(null);
    const [displayReviews, setDisplayReviews] = useState([...reviews]);

    const productNames = [...new Set(displayReviews.map((r) => r.productName))];

    // --- Filtering ---
    const filteredReviews = displayReviews.filter((review) => {
        const productMatch =
            selectedProduct === "all" || review.productName === selectedProduct;

        const ratingCategory = getRatingCategory(review.rating);
        const ratingMatch =
            selectedRating === "all" || selectedRating === ratingCategory;

        return productMatch && ratingMatch;
    });

    function getRatingCategory(rating) {
        if (rating >= 4.5) return "excellent";
        if (rating >= 3.5) return "good";
        if (rating >= 2.5) return "average";
        if (rating >= 1.5) return "bad";
        return "worst";
    }

    // --- ADD REPLY ---
    const handleReplySubmit = async (reviewId) => {
        const reply = replyInputs[reviewId];
        if (!reply?.trim()) return;

        try {
            const res = await fetch("/api/reviewApi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, reply }),
            });

            const data = await res.json();

            if (res.ok) {
                // Update local state with new reply
                setDisplayReviews((prev) =>
                    prev.map((r) =>
                        r._id === reviewId
                            ? {
                                ...r,
                                replies: [
                                    ...(r.replies || []),
                                    {
                                        _id:
                                            data?.review?.replies?.[data.review.replies.length - 1]
                                                ?._id || Date.now().toString(),
                                        comment: reply,
                                        date: new Date(),
                                    },
                                ],
                            }
                            : r
                    )
                );

                setReplyInputs({ ...replyInputs, [reviewId]: "" });
                alert("Reply added successfully!");
            } else {
                alert(data.message || "Failed to add reply");
            }
        } catch (error) {
            console.error(error);
            alert("Error posting reply");
        }
    };

    // --- DELETE REPLY ---
    const handleDeleteReply = async (reviewId, replyId) => {
        try {
            const res = await axios.delete("/api/reviewApi", {
                data: { reviewId, replyId },
            });

            if (res.status === 200) {
                setDisplayReviews((prev) =>
                    prev.map((r) =>
                        r._id === reviewId
                            ? {
                                ...r,
                                replies: r.replies.filter((reply) => reply._id !== replyId),
                            }
                            : r
                    )
                );

                alert("Reply deleted successfully!");
            } else {
                alert(res.data.message || "Failed to delete reply");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting reply");
        }
    };

    // --- RENDER ---
    return (
        <div className={styles.reviewContainer}>
            <h1>Product Reviews</h1>

            {/* Filters */}
            <div className={styles.filters}>
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                >
                    <option value="all">All Products</option>
                    {productNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                >
                    <option value="all">All Ratings</option>
                    <option value="excellent">Excellent (4.5–5)</option>
                    <option value="good">Good (3.5–4.4)</option>
                    <option value="average">Average (2.5–3.4)</option>
                    <option value="bad">Bad (1.5–2.4)</option>
                    <option value="worst">Worst (0–1.4)</option>
                </select>
            </div>

            {/* Review List */}
            <div className={styles.reviewList}>
                {filteredReviews.map((review) => (
                    <div key={review._id} className={styles.reviewItem}>
                        <div className={styles.itemHeader}>
                            <div className={styles.names}>
                                <strong>{review.name}</strong>
                                <strong>({review.productName})</strong>
                            </div>
                            <div className={styles.rating}>
                                <StarRating rating={review.rating} />
                                <span className={styles.ratingText}>
                                    ({getRatingCategory(review.rating)})
                                </span>
                            </div>
                        </div>

                        <div className={styles.itemBody}>
                            <p className={styles.comment}>{review.comment}</p>

                            {/* Review Media (images/videos) */}
                            {review?.images?.length > 0 && (
                                <div className={styles.mediaContainer}>
                                    {review.images.map((file, i) => {
                                        const isVideo =
                                            file.endsWith(".mp4") || file.endsWith(".webm");
                                        return isVideo ? (
                                            <video
                                                key={i}
                                                src={file}
                                                width={120}
                                                height={120}
                                                onClick={() =>
                                                    setMediaPreview({ type: "video", src: file })
                                                }
                                                className={styles.mediaThumb}
                                                muted
                                            />
                                        ) : (
                                            <Image
                                                key={i}
                                                src={file}
                                                alt="review media"
                                                width={120}
                                                height={120}
                                                onClick={() =>
                                                    setMediaPreview({ type: "image", src: file })
                                                }
                                                className={styles.mediaThumb}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* Replies */}
                            {review?.replies?.length > 0 && (
                                <div className={styles.replies}>
                                    {review.replies.map((reply) => (
                                        <div key={reply._id} className={styles.reply}>
                                            <div className={styles.replyHeader}>
                                                <strong>You</strong>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteReply(review._id, reply._id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <p>{reply.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Box */}
                            <div className={styles.replySection}>
                                <textarea
                                    placeholder="Write a reply..."
                                    value={replyInputs[review._id] || ""}
                                    onChange={(e) =>
                                        setReplyInputs({
                                            ...replyInputs,
                                            [review._id]: e.target.value,
                                        })
                                    }
                                />
                                <button onClick={() => handleReplySubmit(review._id)}>
                                    Post Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Media Preview Modal */}
            {mediaPreview && (
                <div
                    className={styles.modalBackdrop}
                    onClick={() => setMediaPreview(null)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {mediaPreview.type === "image" ? (
                            <Image
                                src={mediaPreview.src}
                                alt="Full view"
                                width={800}
                                height={800}
                                className={styles.fullMedia}
                            />
                        ) : (
                            <video
                                src={mediaPreview.src}
                                controls
                                autoPlay
                                className={styles.fullMedia}
                            />
                        )}
                        <button
                            className={styles.closeButton}
                            onClick={() => setMediaPreview(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SERVER SIDE DATA FETCH ---
export const getServerSideProps = async () => {
    try {
        await connectDB();
        const products = await Product.find({}).sort({ createdAt: -1 }).lean();

        const normalizedReviews = products.flatMap((product) =>
            product.reviews
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((review) => ({
                    ...review,
                    productId: product._id.toString(),
                    productName: product.name,
                }))
        );


        return {
            props: {
                reviews: JSON.parse(JSON.stringify(normalizedReviews)),
            },
        };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return {
            props: {
                reviews: [],
                error: "Failed to fetch reviews",
            },
        };
    }
};

export default ReviewIndex;
