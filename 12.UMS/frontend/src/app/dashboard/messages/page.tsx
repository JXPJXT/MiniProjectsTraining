'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { messagingAPI, usersAPI } from '@/lib/api';
import { HiOutlinePaperAirplane, HiOutlineSpeakerphone, HiOutlinePlusCircle, HiOutlineSearch } from 'react-icons/hi';

export default function MessagesPage() {
    const { user } = useAuth();
    const isAdmin = ['admin', 'super_admin', 'tpc'].includes(user?.role || '');
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
    const [selectedPartnerName, setSelectedPartnerName] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [showNewConvo, setShowNewConvo] = useState(false);
    const [broadcastContent, setBroadcastContent] = useState('');
    const [broadcastRole, setBroadcastRole] = useState('');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadConversations(); }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await messagingAPI.conversations();
            setConversations(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadThread = async (partnerId: string, name?: string) => {
        setSelectedPartner(partnerId);
        if (name) setSelectedPartnerName(name);
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
            loadConversations();
        } catch (err) { console.error(err); }
    };

    const sendBroadcast = async () => {
        if (!broadcastContent.trim()) return;
        try {
            await messagingAPI.broadcast({ content: broadcastContent, target_role: broadcastRole || undefined });
            setBroadcastContent('');
            setShowBroadcast(false);
        } catch (err) { console.error(err); }
    };

    const openNewConvo = async () => {
        setShowNewConvo(true);
        try {
            const res = await usersAPI.list();
            const users = (res.data?.data || res.data || []).filter((u: any) => u.id !== user?.id);
            setAllUsers(users);
        } catch (err) { console.error(err); }
    };

    const startConvo = (u: any) => {
        setShowNewConvo(false);
        setUserSearch('');
        loadThread(u.id, u.full_name || u.email);
    };

    const filteredUsers = allUsers.filter((u: any) => {
        const q = userSearch.toLowerCase();
        return (u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
    });

    const getPartnerDisplay = (conv: any) => {
        return conv.partner_name || conv.partner_email || conv.partner_id?.slice(0, 8) + '...';
    };

    const getInitials = (conv: any) => {
        const name = conv.partner_name || conv.partner_email || conv.partner_id || '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Messages</h1>
                <div className="top-bar-actions" style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-accent" onClick={openNewConvo}>
                        <HiOutlinePlusCircle /> New Chat
                    </button>
                    {isAdmin && (
                        <button className="btn btn-primary" onClick={() => setShowBroadcast(true)}>
                            <HiOutlineSpeakerphone /> Broadcast
                        </button>
                    )}
                </div>
            </div>
            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 140px)' }}>
                    {/* Sidebar: Conversations */}
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ padding: '14px 16px' }}>
                            <h3 className="card-title" style={{ fontSize: 14 }}>Conversations</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
                            ) : conversations.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                    No conversations yet.<br />Click "New Chat" to start one.
                                </div>
                            ) : conversations.map((conv: any) => (
                                <div
                                    key={conv.partner_id}
                                    onClick={() => loadThread(conv.partner_id, conv.partner_name || conv.partner_email)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        borderBottom: '1px solid var(--border-color)',
                                        background: selectedPartner === conv.partner_id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 12, flexShrink: 0 }}>
                                            {getInitials(conv)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getPartnerDisplay(conv)}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                                                {conv.last_message || 'No messages yet'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {!selectedPartner ? (
                            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Select a Conversation</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Choose a conversation or start a new chat</p>
                            </div>
                        ) : (
                            <>
                                <div className="card-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                                    <h3 className="card-title" style={{ fontSize: 14 }}>
                                        {selectedPartnerName || selectedPartner.slice(0, 8) + '...'}
                                    </h3>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {messages.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 40 }}>
                                            No messages yet. Send the first one!
                                        </div>
                                    )}
                                    {messages.map((msg: any, i: number) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                                <div style={{
                                                    padding: '10px 14px',
                                                    borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                                    background: isMe ? 'linear-gradient(135deg, var(--primary-600), var(--primary-700))' : 'var(--bg-glass)',
                                                    border: isMe ? 'none' : '1px solid var(--border-color)',
                                                    fontSize: 13.5, color: 'var(--text-primary)',
                                                }}>
                                                    {msg.content}
                                                </div>
                                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.read_at && isMe && ' ✓✓'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
                                    <input
                                        id="message-input" className="form-input" placeholder="Type a message..."
                                        value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-primary" onClick={sendMessage} style={{ padding: '8px 14px' }}>
                                        <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* New Conversation Modal */}
            {showNewConvo && (
                <div className="modal-overlay" onClick={() => setShowNewConvo(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Start New Chat</h3>
                            <button className="btn-icon" onClick={() => setShowNewConvo(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: 400, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', marginBottom: 12 }}>
                                <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
                                <input
                                    className="form-input" placeholder="Search by name, email, or role..."
                                    value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {filteredUsers.map((u: any) => (
                                    <div
                                        key={u.id} onClick={() => startConvo(u)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                                            {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.full_name || 'Unnamed'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email} • {u.role}</div>
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontSize: 13 }}>No users found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Modal */}
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
