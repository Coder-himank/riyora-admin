// pages/api/auth/login.js

import AdminUser from "@/lib/models/adminUser";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import connectDB from "@/lib/database";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    try {
        await connectDB();
        const { username, password } = req.body;

        const user = await AdminUser.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.setHeader(
            "Set-Cookie",
            cookie.serialize("auth-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24,
                path: "/",
            })
        );

        return res.status(200).json({ message: "Login successful" });
    } catch (err) {

        console.log(err.message);


        return res.status(500).json({ message: "Server error", error: err.message });
    }
}
