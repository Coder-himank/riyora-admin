import { useState } from "react";
import styles from "@/styles/Auth.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import {useRouter} from "next/router";
export default function Authenticate() {
    const { data: session, status } = useSession();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
        });

        if (result.error) {
            setMessage("Invalid credentials");
        } else {
            setMessage("Login successful!");
            router.push("/")
        }
    };


    if (status === "loading") {
        return <p>Loading session...</p>;
    }

    if (session) {
        return (
            <div className={styles.container}>
                <h1>Welcome {session.user?.name}</h1>
                <button onClick={() => signOut()}>Sign out</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>{"Login"}</h1>
            <form
                onSubmit={handleLogin}
                className={styles.form}
            >
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

          

                <button type="submit">Login</button>
            </form>
            <p className={styles.message}>{message}</p>

        </div>
    );
}
