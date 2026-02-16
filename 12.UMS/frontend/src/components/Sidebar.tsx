'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    HiOutlineAcademicCap,
    HiOutlineHome,
    HiOutlineUserGroup,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineChatAlt2,
    HiOutlineBell,
    HiOutlineCog,
    HiOutlineClipboardList,
    HiOutlineLogout,
    HiOutlineUserCircle,
    HiOutlineShieldCheck,
    HiOutlineChartBar,
    HiOutlineFolder,
    HiOutlineCheckCircle,
} from 'react-icons/hi';

const navConfig: Record<string, Array<{ section: string; items: Array<{ label: string; href: string; icon: any; roles?: string[] }> }>> = {
    student: [
        {
            section: 'Main',
            items: [
                { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
                { label: 'My Profile', href: '/dashboard/profile', icon: HiOutlineUserCircle },
                { label: 'Placement Profile', href: '/dashboard/placement-profile', icon: HiOutlineClipboardList },
            ],
        },
        {
            section: 'Placements',
            items: [
                { label: 'Browse Drives', href: '/dashboard/drives', icon: HiOutlineBriefcase },
                { label: 'My Registrations', href: '/dashboard/my-drives', icon: HiOutlineCheckCircle },
                { label: 'Documents', href: '/dashboard/documents', icon: HiOutlineDocumentText },
                { label: 'Offers', href: '/dashboard/offers', icon: HiOutlineFolder },
            ],
        },
        {
            section: 'Communication',
            items: [
                { label: 'Messages', href: '/dashboard/messages', icon: HiOutlineChatAlt2 },
                { label: 'Notifications', href: '/dashboard/notifications', icon: HiOutlineBell },
            ],
        },
    ],
    admin: [
        {
            section: 'Overview',
            items: [
                { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
                { label: 'Analytics', href: '/dashboard/analytics', icon: HiOutlineChartBar },
            ],
        },
        {
            section: 'Management',
            items: [
                { label: 'Users', href: '/dashboard/users', icon: HiOutlineUserGroup },
                { label: 'Students', href: '/dashboard/students', icon: HiOutlineAcademicCap },
                { label: 'Drives', href: '/dashboard/drives', icon: HiOutlineBriefcase },
                { label: 'Documents', href: '/dashboard/documents', icon: HiOutlineDocumentText },
            ],
        },
        {
            section: 'Operations',
            items: [
                { label: 'Messages', href: '/dashboard/messages', icon: HiOutlineChatAlt2 },
                { label: 'Notifications', href: '/dashboard/notifications', icon: HiOutlineBell },
                { label: 'Audit Logs', href: '/dashboard/audit', icon: HiOutlineShieldCheck },
            ],
        },
    ],
    tpc: [
        {
            section: 'Overview',
            items: [
                { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
            ],
        },
        {
            section: 'Placement',
            items: [
                { label: 'Students', href: '/dashboard/students', icon: HiOutlineAcademicCap },
                { label: 'Drives', href: '/dashboard/drives', icon: HiOutlineBriefcase },
                { label: 'Documents', href: '/dashboard/documents', icon: HiOutlineDocumentText },
            ],
        },
        {
            section: 'Communication',
            items: [
                { label: 'Messages', href: '/dashboard/messages', icon: HiOutlineChatAlt2 },
                { label: 'Notifications', href: '/dashboard/notifications', icon: HiOutlineBell },
            ],
        },
    ],
    faculty: [
        {
            section: 'Main',
            items: [
                { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
                { label: 'Students', href: '/dashboard/students', icon: HiOutlineAcademicCap },
                { label: 'Drives', href: '/dashboard/drives', icon: HiOutlineBriefcase },
            ],
        },
        {
            section: 'Communication',
            items: [
                { label: 'Messages', href: '/dashboard/messages', icon: HiOutlineChatAlt2 },
                { label: 'Notifications', href: '/dashboard/notifications', icon: HiOutlineBell },
            ],
        },
    ],
    super_admin: [
        {
            section: 'Overview',
            items: [
                { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
                { label: 'Analytics', href: '/dashboard/analytics', icon: HiOutlineChartBar },
            ],
        },
        {
            section: 'Management',
            items: [
                { label: 'Users', href: '/dashboard/users', icon: HiOutlineUserGroup },
                { label: 'Students', href: '/dashboard/students', icon: HiOutlineAcademicCap },
                { label: 'Drives', href: '/dashboard/drives', icon: HiOutlineBriefcase },
                { label: 'Documents', href: '/dashboard/documents', icon: HiOutlineDocumentText },
            ],
        },
        {
            section: 'System',
            items: [
                { label: 'Messages', href: '/dashboard/messages', icon: HiOutlineChatAlt2 },
                { label: 'Notifications', href: '/dashboard/notifications', icon: HiOutlineBell },
                { label: 'Audit Logs', href: '/dashboard/audit', icon: HiOutlineShieldCheck },
                { label: 'Settings', href: '/dashboard/settings', icon: HiOutlineCog },
            ],
        },
    ],
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (!user) return null;

    const sections = navConfig[user.role] || navConfig.student;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <HiOutlineAcademicCap />
                    </div>
                    <div>
                        <div className="sidebar-logo-text">Placement Portal</div>
                        <div className="sidebar-logo-sub">University Management</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {sections.map((section) => (
                    <div className="nav-section" key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <span className="nav-item-icon"><Icon /></span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.email}</div>
                        <div className="sidebar-user-role">{user.role.replace('_', ' ')}</div>
                    </div>
                </div>
                <button
                    id="logout-btn"
                    className="nav-item"
                    onClick={logout}
                    style={{ marginTop: 8, color: 'var(--danger-400)' }}
                >
                    <span className="nav-item-icon"><HiOutlineLogout /></span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
