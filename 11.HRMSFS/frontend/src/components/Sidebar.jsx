import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Users, Building2, CalendarDays,
    CalendarOff, Clock, Wallet, UserSearch,
    Target, GraduationCap, Heart, Monitor,
    Receipt, Bell, Scale, DoorOpen,
    FileText, LogOut
} from 'lucide-react';

const sections = [
    {
        title: 'Overview',
        items: [
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        title: 'People',
        items: [
            { to: '/employees', icon: Users, label: 'Employees' },
            { to: '/departments', icon: Building2, label: 'Departments' },
        ],
    },
    {
        title: 'Time',
        items: [
            { to: '/attendance', icon: CalendarDays, label: 'Attendance' },
            { to: '/leave', icon: CalendarOff, label: 'Leave' },
            { to: '/shifts', icon: Clock, label: 'Shifts' },
        ],
    },
    {
        title: 'Compensation',
        items: [
            { to: '/payroll', icon: Wallet, label: 'Payroll' },
            { to: '/benefits', icon: Heart, label: 'Benefits' },
            { to: '/reimbursements', icon: Receipt, label: 'Reimbursements' },
        ],
    },
    {
        title: 'Growth',
        items: [
            { to: '/recruitment', icon: UserSearch, label: 'Recruitment' },
            { to: '/performance', icon: Target, label: 'Performance' },
            { to: '/training', icon: GraduationCap, label: 'Training' },
        ],
    },
    {
        title: 'Operations',
        items: [
            { to: '/assets', icon: Monitor, label: 'Assets' },
            { to: '/notifications', icon: Bell, label: 'Notifications' },
            { to: '/disciplinary', icon: Scale, label: 'Disciplinary' },
            { to: '/audit', icon: FileText, label: 'Audit Trail' },
        ],
    },
];

export default function Sidebar() {
    const { user, signout } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>HRMS</h1>
                <span>Management Suite</span>
            </div>

            <nav className="sidebar-nav">
                {sections.map(sec => (
                    <div key={sec.title}>
                        <div className="nav-section-title">{sec.title}</div>
                        {sec.items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom section — Exit + User + Sign Out */}
            <div className="sidebar-bottom">
                <NavLink to="/exit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <DoorOpen />
                    Exit Management
                </NavLink>

                {user && (
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{user.avatar}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user.full_name}</div>
                            <div className="sidebar-user-role">{user.role}</div>
                        </div>
                    </div>
                )}

                <button className="nav-item" onClick={signout} style={{ width: '100%', cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left' }}>
                    <LogOut />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
