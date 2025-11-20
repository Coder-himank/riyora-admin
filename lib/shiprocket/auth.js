// lib/shiprocket/auth.js

let cachedToken = null;
let tokenExpiry = 0; // timestamp in ms

export async function getShiprocketToken() {
  const now = Date.now();

  // ✅ If we already have a valid cached token, reuse it
  if (cachedToken && now < tokenExpiry) {
    // console.log("Using cached Shiprocket token");
    return cachedToken;
  }

  // 🧠 Otherwise, request a new one
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_CLIENT_ID,
      password: process.env.SHIPROCKET_CLIENT_SECRET
    })
  });

  const data = await res.json();

  if (!res.ok || !data.token) {
    throw new Error("Shiprocket Auth failed: " + JSON.stringify(data));
  }

  // 🕒 Cache the token (valid for 10 days → we store for 9 to be safe)
  cachedToken = data.token;
  tokenExpiry = now + 9 * 24 * 60 * 60 * 1000; // 9 days in ms

  // console.log("Fetched new Shiprocket token");
  return cachedToken;
}
