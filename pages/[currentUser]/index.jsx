import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import styles from "@/styles/AdminProfile.module.css";

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;
    try {
      const res = await axios.get("/api/AdminusersApi");
      const admins = res.data.filter((u) => u.role === "admin");

      // current logged-in user
      const currentUser = admins.find((a) => a._id === session.user._id);
      setUser(currentUser);

      // store all admins/sub-admins
      setAllAdmins(admins);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword) return alert("Enter a new password");

    try {
      await axios.put("/api/AdminusersApi", {
        id: user._id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        password: newPassword,
      });
      alert("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error("Failed to update password", err);
      alert("Password update failed");
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className={styles.container}>
      {/* User Profile Section */}
      <div className={styles.profileCard}>
        <h1>Welcome, {user.username}</h1>
        <p><strong>Role:</strong> {user.role}</p>

        <div className={styles.permissions}>
          <h3>Your Permissions</h3>
          {user.permissions && user.permissions.length > 0 ? (
            <div className={styles.chipContainer}>
              {user.permissions.map((perm, i) => (
                <span key={i} className={styles.chip}>
                  {perm.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          ) : (
            <p>No permissions assigned</p>
          )}
        </div>

        {/* Update Password */}
        <form onSubmit={handlePasswordUpdate} className={styles.passwordForm}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit">Update Password</button>
        </form>

        {/* Only admin can manage users */}
        {user.username === "admin" && (
          <button
            className={styles.manageUsersBtn}
            onClick={() => router.push(`/${session?.user?._id}/addUser`)}
          >
            Manage Users
          </button>
        )}

        <button
          className={styles.signoutBtn}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </button>
      </div>

      {/* Admins and Sub-Admins */}
      <div className={styles.adminSection}>
        <h2>All Admins</h2>
        {allAdmins.length === 0 ? (
          <p>No admins available</p>
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
              {allAdmins.map((a) => (
                <tr key={a._id}>
                  <td>{a.username}</td>
                  <td>
                    {a.permissions && a.permissions.length > 0 ? (
                      <div className={styles.chipContainer}>
                        {a.permissions.map((perm, idx) => (
                          <span key={idx} className={styles.chip}>
                            {perm.replaceAll("_", " ")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td>
                    {a._id === user._id ? (
                      <span className={`${styles.status} ${styles.current}`}>
                        You
                      </span>
                    ) : (
                      <span className={styles.status}>Sub-Admin</span>
                    )}
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
