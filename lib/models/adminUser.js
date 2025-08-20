// models/AdminUser.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// models/AdminUser.js
const AdminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }, // ✅ Add this
    permissions : { type: [String], default: [] },
    active : { type: Boolean, default: false },
});


// Hash password before saving
AdminUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
AdminUserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.AdminUser ||
    mongoose.model("AdminUser", AdminUserSchema);
