// pages/api/admin/users.js
import connectDB from "@/lib/database";
import AdminUser from "@/lib/models/adminUser";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const users = await AdminUser.find({});
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    try {
      const { username, password, role, permissions } = req.body;
      const newUser = await AdminUser.create({
        username,
        password,
        role,
        permissions,
      });
      return res.status(201).json(newUser);
    } catch (err) {
      return res.status(400).json({ error: "Failed to create user" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, username, role, permissions } = req.body;
      await AdminUser.findByIdAndUpdate(id, { username, role, permissions });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: "Failed to update user" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      await AdminUser.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: "Failed to delete user" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
