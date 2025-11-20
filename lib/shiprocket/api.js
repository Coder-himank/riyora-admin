// /lib/shiprocket/api.js
import { getShiprocketToken } from "@/lib/shiprocket/auth";

/**
 * Generic Shiprocket fetch wrapper
 * - url: full URL
 * - body: JS object (will be JSON-stringified for POST/PUT)
 * - method: GET | POST | PUT (default POST)
 */
export async function shiprocketRequest(url, body = null, method = "POST") {
  const token = await getShiprocketToken();
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body && (method === "POST" || method === "PUT")) {
    opts.body = JSON.stringify(body);
  }

  const r = await fetch(url, opts);
  let parsed;
  try {
    parsed = await r.json();
  } catch (e) {
    parsed = { raw: await r.text() };
  }

  return { ok: r.ok, status: r.status, data: parsed };
}
