import React, { useEffect, useState } from 'react';
import { getPromocodes, createPromocode, updatePromocode, deletePromocode } from '@/pages/api/promocodeApi';
import styles from '@/styles/promocode/promocode.module.css';

import axios from 'axios';
export default function PromocodeManager() {


    const API_URL = '/api/promocode';

    const getPromocodes = async () => {
        const res = await axios.get(API_URL);
        return res.data;
    };

    const createPromocode = async (data) => {
        const res = await axios.post(API_URL, data);
        return res.data;
    };

    const updatePromocode = async (id, data) => {
        const res = await axios.put(`${API_URL}/${id}`, data);
        return res.data;
    };

    const deletePromocode = async (id) => {
        const res = await axios.delete(`${API_URL}/${id}`);
        return res.data;
    };

    const [promocodes, setPromocodes] = useState([]);
    const [form, setForm] = useState({ code: '', discount: '', expiry: '' });

    useEffect(() => {
        loadPromocodes();
    }, []);

    const loadPromocodes = async () => {
        const data = await getPromocodes();
        setPromocodes(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createPromocode(form);
        setForm({ code: '', discount: '', expiry: '' });
        loadPromocodes();
    };

    const handleDelete = async (id) => {
        await deletePromocode(id);
        loadPromocodes();
    };

    const handleUpdate = async (id, updated) => {
        await updatePromocode(id, updated);
        loadPromocodes();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Promocode Management</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                <input placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                <button type="submit">Create</button>
            </form>

            <div className={styles.list}>
                {promocodes.map((p) => (
                    <div key={p._id} className={styles.card}>
                        <h2>{p.code}</h2>
                        <p>Discount: {p.discount}%</p>
                        <p>Expires: {new Date(p.expiry).toLocaleDateString()}</p>

                        <button onClick={() => handleDelete(p._id)}>Delete</button>
                        <button onClick={() => handleUpdate(p._id, { ...p, active: !p.active })}>
                            {p.active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}