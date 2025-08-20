// pages/admin/index.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
    permissions: [],
  });
  const [editingUser, setEditingUser] = useState(null);
const availablePermissions = {
  Products: [
    "manage_products",
    "create_products",
    "edit_products",
    "delete_products",
  ],
  Users: ["manage_users", "create_users", "edit_users", "delete_users"],
  Orders: ["manage_orders", "create_orders", "edit_orders", "delete_orders"],
};


  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await axios.get("/api/AdminusersApi"); // make sure API path matches
    setUsers(res.data);
    console.log(res.data);
    
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePermissionChange(e) {
    const { value, checked } = e.target;

    let updatedpermissions = [...form.permissions];

    if (checked) {
      updatedpermissions.push(value);
    } else {
      updatedpermissions = updatedpermissions.filter((p) => p !== value);
    }

    console.log(updatedpermissions);
    

    setForm({ ...form, permissions: updatedpermissions });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingUser) {
      await axios.put("/api/AdminusersApi", { id: editingUser._id, ...form });
      setEditingUser(null);
    } else {
      await axios.post("/api/AdminusersApi", form);
    }
    setForm({ username: "", password: "", role: "user", permissions: [] });
    fetchUsers();
  }

  async function handleDelete(id) {
    await axios.delete(`/api/AdminusersApi?id=${id}`);
    fetchUsers();
  }

  function handleEdit(user) {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: "",
      role: user.role,
      permissions: user.permissions || [],
    });
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Admin Dashboard</h2>

      <form onSubmit={handleSubmit} className={styles.form}>

        <section>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required={!editingUser}
          />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        
                  </section>


        {/* permissions Checkboxes */}
        <div className={styles.permissionsBox}>
  {Object.entries(availablePermissions).map(([group, perms]) => (
    <div key={group} className={styles.permissionGroup}>
      <h4 className={styles.permissionGroupTitle}>{group}</h4>
      <div className={styles.permissionsList}>
        {perms.map((perm) => (
          <label key={perm} className={styles.permissionItem}>
            <input
              type="checkbox"
              value={perm}
              checked={form.permissions.includes(perm)}
              onChange={handlePermissionChange}
            />
            {perm}
          </label>
        ))}
      </div>
    </div>
  ))}
</div>

        <button type="submit" className={styles.btn}>
          {editingUser ? "Update User" : "Create User"}
        </button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>permissions</th>
            <th className={styles.actions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{u?.permissions?.join(", ")}</td>
              <td className={styles.actions}>
                <button
                  onClick={() => handleEdit(u)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u._id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
