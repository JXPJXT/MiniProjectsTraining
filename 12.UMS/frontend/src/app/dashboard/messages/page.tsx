'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { messagingAPI } from '@/lib/api';
import { HiOutlinePaperAirplane, HiOutlineSpeakerphone } from 'react-icons/hi';

export default function MessagesPage() {
    const { user } = useAuth();
    const isAdmin = ['admin', 'super_admin', 'tpc'].includes(user?.role || '');
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastContent, setBroadcastContent] = useState('');
    const [broadcastRole, setBroadcastRole] = useState('');

    useEffect(() => { loadConversations(); }, []);

    const loadConversations = async () => {
        try {
            const res = await messagingAPI.conversations();
            setConversations(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadThread = async (partnerId: string) => {
        setSelectedPartner(partnerId);
        try {
            const res = await messagingAPI.thread(partnerId);
            setMessages(res.data?.data || []);
        } catch (err) { console.error(err); }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedPartner) return;
        try {
            await messagingAPI.send({ receiver_id: selectedPartner, content: newMessage });
            setNewMessage('');
            loadThread(selectedPartner);
        } catch (err) { console.error(err); }
    };

    const sendBroadcast = async () => {
        if (!broadcastContent.trim()) return;
        try {
            await messagingAPI.broadcast({
                content: broadcastContent,
                target_role: broadcastRole || undefined,
            });
            setBroadcastContent('');
            setShowBroadcast(false);
        } catch (err) { console.error(err); }
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Messages</h1>
                <div className="top-bar-actions">
                    {isAdmin && (
                        <button className="btn btn-primary" onClick={() => setShowBroadcast(true)}>
                            <HiOutlineSpeakerphone /> Broadcast
                        </button>
                    )}
                </div>
            </div>
            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: 'calc(100vh - 160px)' }}>
                    {/* Conversation List */}
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header">
                            <h3 className="card-title">Conversations</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
                            ) : conversations.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map((conv: any) => (
                                    <div
                                        key={conv.partner_id}
                                        onClick={() => loadThread(conv.partner_id)}
                                        style={{
                                            padding: '14px 20px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border-color)',
                                            background: selectedPartner === conv.partner_id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                            transition: 'background var(--transition-fast)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                                                {conv.partner_id?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {conv.partner_id?.slice(0, 8)}...
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {conv.last_message}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Message Thread */}
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {!selectedPartner ? (
                            <div className="empty-state" style={{ flex: 1 }}>
                                <div className="empty-state-icon">💬</div>
                                <h3 className="empty-state-title">Select a Conversation</h3>
                                <p className="empty-state-text">Choose a conversation from the left to start messaging</p>
                            </div>
                        ) : (
                            <>
                                <div className="card-header">
                                    <h3 className="card-title">Chat with {selectedPartner.slice(0, 8)}...</h3>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {messages.map((msg: any, i: number) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div key={i} style={{
                                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%',
                                            }}>
                                                <div style={{
                                                    padding: '10px 14px',
                                                    borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                                    background: isMe
                                                        ? 'linear-gradient(135deg, var(--primary-600), var(--primary-700))'
                                                        : 'var(--bg-glass)',
                                                    border: isMe ? 'none' : '1px solid var(--border-color)',
                                                    fontSize: 13.5,
                                                    color: 'var(--text-primary)',
                                                }}>
                                                    {msg.content}
                                                </div>
                                                <div style={{
                                                    fontSize: 10,
                                                    color: 'var(--text-muted)',
                                                    marginTop: 4,
                                                    textAlign: isMe ? 'right' : 'left',
                                                }}>
                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                    {msg.read_at && isMe && ' ✓✓'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex',
                                    gap: 12,
                                }}>
                                    <input
                                        id="message-input"
                                        className="form-input"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-primary" onClick={sendMessage}>
                                        <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showBroadcast && (
                <div className="modal-overlay" onClick={() => setShowBroadcast(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Broadcast Message</h3>
                            <button className="btn-icon" onClick={() => setShowBroadcast(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Target Role</label>
                                <select className="form-select" value={broadcastRole} onChange={(e) => setBroadcastRole(e.target.value)}>
                                    <option value="">All Users</option>
                                    <option value="student">Students</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="tpc">TPC</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea className="form-textarea" value={broadcastContent} onChange={(e) => setBroadcastContent(e.target.value)} placeholder="Type your broadcast message..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowBroadcast(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={sendBroadcast}>Send Broadcast</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
