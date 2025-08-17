// pages/authenticate.js
import { useState } from "react";
import styles from "@/styles/Auth.module.css";

export default function Authenticate() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // default role
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        const body = isLogin
            ? { username, password }
            : { username, password, role }; // send role only when registering

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        setMessage(data.message);

        if (isLogin && res.ok) {
            window.location.href = "/";
        }
    };

    return (
        <div className={styles.container}>
            <h1>{isLogin ? "Login" : "Register"}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* Show role selection only on Register */}
                {!isLogin && (
                    <div className={styles.roleGroup}>
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="user"
                                checked={role === "user"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            User
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="admin"
                                checked={role === "admin"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            Admin
                        </label>
                    </div>
                )}

                <button type="submit">{isLogin ? "Login" : "Register"}</button>
            </form>
            <p className={styles.message}>{message}</p>
            <button
                className={styles.toggle}
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin
                    ? "Need an account? Register"
                    : "Already have an account? Login"}
            </button>
        </div>
    );
}
