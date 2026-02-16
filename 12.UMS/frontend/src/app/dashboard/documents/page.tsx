'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { documentsAPI } from '@/lib/api';
import { HiOutlineUpload, HiOutlineEye, HiOutlineRefresh } from 'react-icons/hi';

export default function DocumentsPage() {
    const { user } = useAuth();
    const isAdmin = ['admin', 'super_admin', 'tpc'].includes(user?.role || '');
    const [docs, setDocs] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(isAdmin ? 'pending' : 'my');
    const [showUpload, setShowUpload] = useState(false);
    const [docType, setDocType] = useState('resume');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => { loadDocuments(); }, [tab]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            if (tab === 'my' || !isAdmin) {
                const res = await documentsAPI.my();
                setDocs(res.data?.data || []);
            } else {
                const res = await documentsAPI.pendingVerifications();
                setPending(res.data?.data || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('document_type', docType);
        formData.append('file', file);
        try {
            await documentsAPI.upload(formData);
            setShowUpload(false);
            setFile(null);
            loadDocuments();
        } catch (err) { console.error(err); }
    };

    const verifyDoc = async (docId: number, status: string) => {
        try {
            await documentsAPI.verify(docId, { soft_skill_status: status, technical_status: status });
            loadDocuments();
        } catch (err) { console.error(err); }
    };

    const getVerificationBadge = (status: string) => {
        const map: Record<string, string> = { pending: 'badge-warning', approved: 'badge-accent', rejected: 'badge-danger' };
        return map[status] || 'badge-neutral';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Documents</h1>
                <div className="top-bar-actions">
                    {user?.role === 'student' && (
                        <button id="upload-doc-btn" className="btn btn-primary" onClick={() => setShowUpload(true)}>
                            <HiOutlineUpload /> Upload Document
                        </button>
                    )}
                </div>
            </div>
            <div className="page-content">
                {isAdmin && (
                    <div className="tabs">
                        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
                            Pending Verification
                        </button>
                        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
                            All Documents
                        </button>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : (
                    <>
                        {(tab === 'my' || !isAdmin) && (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Uploaded</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {docs.length === 0 ? (
                                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No documents uploaded yet</td></tr>
                                        ) : docs.map((doc: any) => {
                                            const verification = doc.document_verifications?.[0];
                                            return (
                                                <tr key={doc.id}>
                                                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{doc.document_type}</td>
                                                    <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge ${getVerificationBadge(verification?.soft_skill_status || 'pending')}`}>
                                                            {verification?.soft_skill_status || 'pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button className="btn btn-ghost btn-sm" onClick={async () => {
                                                                const res = await documentsAPI.getUrl(doc.id);
                                                                window.open(res.data?.url, '_blank');
                                                            }}>
                                                                <HiOutlineEye /> View
                                                            </button>
                                                            {verification?.soft_skill_status === 'rejected' && (
                                                                <button className="btn btn-primary btn-sm" onClick={() => {/* re-upload flow */ }}>
                                                                    <HiOutlineRefresh /> Re-upload
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {tab === 'pending' && isAdmin && (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Reg No</th>
                                            <th>Document Type</th>
                                            <th>Uploaded</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No pending verifications</td></tr>
                                        ) : pending.map((item: any) => {
                                            const doc = item.student_documents;
                                            const student = doc?.students;
                                            return (
                                                <tr key={item.id}>
                                                    <td style={{ fontWeight: 600 }}>{student?.full_name || 'N/A'}</td>
                                                    <td>{student?.reg_no || 'N/A'}</td>
                                                    <td style={{ textTransform: 'capitalize' }}>{doc?.document_type || 'N/A'}</td>
                                                    <td>{doc?.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button className="btn btn-accent btn-sm" onClick={() => verifyDoc(item.document_id, 'approved')}>
                                                                Approve
                                                            </button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => verifyDoc(item.document_id, 'rejected')}>
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Upload Document</h3>
                            <button className="btn-icon" onClick={() => setShowUpload(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Document Type</label>
                                    <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                                        <option value="resume">Resume</option>
                                        <option value="id_card">ID Card</option>
                                        <option value="marksheet">Marksheet</option>
                                        <option value="certificate">Certificate</option>
                                        <option value="photo">Photo</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">File</label>
                                    <input
                                        className="form-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={!file}>Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
