export default async function assignCourier(shipmentId, courierId) {
  if (!shipmentId || !courierId) {
    return { ok: false, error: "shipmentId and courierId required" };
  }
    const payload = {
    shipment_id: shipmentId,
    courier_id: courierId,
  };
  return shiprocketRequest("https://apiv2.shiprocket.in/v1/external/courier/assign", payload, "POST");
}   