import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "@/styles/AdminProfile.module.css";
import { signOut, useSession } from "next-auth/react";

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [subAdmins, setSubAdmins] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const res = await axios.get("/api/AdminusersApi"); // fetching all users
      const admins = res.data.filter((u) => u.role === "admin");

      // assuming first one is superadmin
      setAdmin(admins.find((a) => a.username === "superadmin") || admins[0]);
      setSubAdmins(admins.filter((a) => a.username !== "superadmin"));
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    if (!newPassword) return alert("Enter a new password");

    try {
      await axios.put("/api/AdminusersApi", {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
        password: newPassword,
      });
      alert("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error("Failed to update password", err);
      alert("Password update failed");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Profile</h1>

      {admin ? (
        <div className={styles.profileCard}>
          <h2>{admin.username}</h2>
          <p><strong>Role:</strong> {admin.role}</p>

          <div className={styles.permissions}>
            <h3>Permissions</h3>
            <ul>
              {admin.permissions && admin.permissions.length > 0 ? (
                admin.permissions.map((perm, i) => <li key={i}>{perm}</li>)
              ) : (
                <li>No permissions assigned</li>
              )}
            </ul>
          </div>

          <form onSubmit={handlePasswordUpdate} className={styles.passwordForm}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit">Update Password</button>
          </form>

          <button
            className={styles.redirectBtn}
            onClick={() => router.push(`/${session?.user?._id}/addUser`)}
          >
            Manage Users
          </button>
          <button
            className={styles.signout}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <p>Loading admin info...</p>
      )}

      <div className={styles.subAdminSection}>
        <h2>Sub-Admins</h2>
        {subAdmins.length === 0 ? (
          <p>No sub-admins available</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Permissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.username}</td>
                  <td>{sub.permissions?.join(", ") || "None"}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        sub.active ? styles.active : styles.inactive
                      }`}
                    >
                      {sub.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
