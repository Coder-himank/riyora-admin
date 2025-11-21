// /lib/notifications.js
export async function sendNotificationToUser(userId, message, email, phone) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message, email, phone }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[Notification Helper] Error:", err);
    return { success: false, error: err.message };
  }
}


export default sendNotificationToUser