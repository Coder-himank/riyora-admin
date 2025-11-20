// NEXT.JS (pages/api/promocode.js)

import connectDB from '@/lib/database';
import Promocode from '@/lib/models/promocode';

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const codes = await Promocode.find();
        return res.status(200).json(codes);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }

    case 'POST':
      try {
        const promo = await Promocode.create(req.body);
        return res.status(201).json(promo);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

    case 'PUT':
      try {
        const { id } = req.query;
        const updated = await Promocode.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updated);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;
        await Promocode.findByIdAndDelete(id);
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }

    default:
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
