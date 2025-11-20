export const shiprocketAction = async (action, orderId, extra = {}) => {
  const res = await fetch('/api/shiprocket/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, orderId, extra })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Shiprocket API error');
  return data;
};
