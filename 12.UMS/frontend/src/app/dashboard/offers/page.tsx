'use client';

import { useState, useEffect } from 'react';
import { drivesAPI } from '@/lib/api';
import { HiOutlinePlus } from 'react-icons/hi';

export default function OffersPage() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubmit, setShowSubmit] = useState(false);
    const [form, setForm] = useState({ company_name: '', stipend: '', ctc: '', duration: '' });
    const [offerFile, setOfferFile] = useState<File | null>(null);

    useEffect(() => { loadOffers(); }, []);

    const loadOffers = async () => {
        try {
            const res = await drivesAPI.independentOffers();
            setOffers(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const submitOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('company_name', form.company_name);
        if (form.stipend) formData.append('stipend', form.stipend);
        if (form.ctc) formData.append('ctc', form.ctc);
        if (form.duration) formData.append('duration', form.duration);
        if (offerFile) formData.append('offer_letter', offerFile);

        try {
            await drivesAPI.submitIndependentOffer(formData);
            setShowSubmit(false);
            setForm({ company_name: '', stipend: '', ctc: '', duration: '' });
            setOfferFile(null);
            loadOffers();
        } catch (err) { console.error(err); }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = { pending: 'badge-warning', approved: 'badge-accent', rejected: 'badge-danger' };
        return map[status] || 'badge-neutral';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Independent Offers</h1>
                <div className="top-bar-actions">
                    <button className="btn btn-primary" onClick={() => setShowSubmit(true)}>
                        <HiOutlinePlus /> Submit Offer
                    </button>
                </div>
            </div>
            <div className="page-content">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : offers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h3 className="empty-state-title">No Independent Offers</h3>
                        <p className="empty-state-text">Submit your off-campus or independent offers for verification.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                        {offers.map((offer: any) => (
                            <div key={offer.id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{offer.company_name}</h3>
                                        <span className={`badge ${getStatusBadge(offer.status)}`}>{offer.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {offer.ctc && <InfoLine label="CTC" value={`₹${offer.ctc} LPA`} />}
                                        {offer.stipend && <InfoLine label="Stipend" value={`₹${offer.stipend}/month`} />}
                                        {offer.duration && <InfoLine label="Duration" value={offer.duration} />}
                                        <InfoLine label="Submitted" value={new Date(offer.submitted_at).toLocaleDateString()} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showSubmit && (
                <div className="modal-overlay" onClick={() => setShowSubmit(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Submit Independent Offer</h3>
                            <button className="btn-icon" onClick={() => setShowSubmit(false)}>✕</button>
                        </div>
                        <form onSubmit={submitOffer}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input className="form-input" required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">CTC (LPA)</label>
                                        <input className="form-input" type="number" step="0.01" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stipend (Monthly)</label>
                                        <input className="form-input" type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duration</label>
                                    <input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 months" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Offer Letter</label>
                                    <input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setOfferFile(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowSubmit(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function InfoLine({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
        </div>
    );
}
