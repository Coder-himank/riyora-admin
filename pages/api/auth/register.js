// pages/api/auth/register.js
import connectDB from "@/lib/database";
import AdminUser from "@/lib/models/adminUser";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    try {
        await connectDB();
        const { username, password, role } = req.body;

        const existingUser = await AdminUser.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new AdminUser({ username, password, role });
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log(JSON.stringify(err));

        return res.status(500).json({ message: "Server error", error: err.message });
    }
}
