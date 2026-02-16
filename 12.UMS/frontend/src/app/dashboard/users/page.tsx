'use client';

import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';
import { HiOutlineSearch, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [editUser, setEditUser] = useState<any>(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => { loadUsers(); }, [roleFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 200 };
            if (roleFilter) params.role = roleFilter;
            const res = await usersAPI.list(params);
            setUsers(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateRole = async () => {
        if (!editUser || !newRole) return;
        try {
            await usersAPI.updateRole(editUser.id, newRole);
            setEditUser(null);
            loadUsers();
        } catch (err) { console.error(err); }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await usersAPI.delete(userId);
            loadUsers();
        } catch (err) { console.error(err); }
    };

    const getRoleBadge = (role: string) => {
        const map: Record<string, string> = {
            student: 'badge-primary', faculty: 'badge-accent', tpc: 'badge-warning',
            admin: 'badge-danger', super_admin: 'badge-danger',
        };
        return map[role] || 'badge-neutral';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">User Management</h1>
            </div>
            <div className="page-content">
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 200 }}>
                        <option value="">All Roles</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="tpc">TPC</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Role</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
                                ) : users.map((u: any) => (
                                    <tr key={u.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.id}</td>
                                        <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role.replace('_', ' ')}</span></td>
                                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditUser(u); setNewRole(u.role); }}>
                                                    <HiOutlinePencil /> Role
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Update User Role</h3>
                            <button className="btn-icon" onClick={() => setEditUser(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p className="text-muted mb-16" style={{ fontSize: 13 }}>User: {editUser.id}</p>
                            <div className="form-group">
                                <label className="form-label">New Role</label>
                                <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="tpc">TPC</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={updateRole}>Update Role</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
