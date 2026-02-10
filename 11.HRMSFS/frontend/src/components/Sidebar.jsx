import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Building2, Clock, CalendarOff,
    Wallet, UserSearch, BarChart3, GraduationCap, Heart,
    Monitor, Receipt, Bell, Scale, LogOut, FileText
} from 'lucide-react';

const NAV = [
    {
        section: 'Overview', items: [
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ]
    },
    {
        section: 'People', items: [
            { to: '/employees', icon: Users, label: 'Employees' },
            { to: '/departments', icon: Building2, label: 'Departments' },
        ]
    },
    {
        section: 'Time', items: [
            { to: '/attendance', icon: Clock, label: 'Attendance' },
            { to: '/leave', icon: CalendarOff, label: 'Leave' },
            { to: '/shifts', icon: Clock, label: 'Shifts' },
        ]
    },
    {
        section: 'Compensation', items: [
            { to: '/payroll', icon: Wallet, label: 'Payroll' },
            { to: '/reimbursements', icon: Receipt, label: 'Reimbursements' },
        ]
    },
    {
        section: 'Talent', items: [
            { to: '/recruitment', icon: UserSearch, label: 'Recruitment' },
            { to: '/performance', icon: BarChart3, label: 'Performance' },
            { to: '/training', icon: GraduationCap, label: 'Training' },
        ]
    },
    {
        section: 'Workplace', items: [
            { to: '/benefits', icon: Heart, label: 'Benefits' },
            { to: '/assets', icon: Monitor, label: 'Assets' },
            { to: '/notifications', icon: Bell, label: 'Notifications' },
        ]
    },
    {
        section: 'Compliance', items: [
            { to: '/disciplinary', icon: Scale, label: 'Disciplinary' },
            { to: '/exit', icon: LogOut, label: 'Exit' },
            { to: '/audit', icon: FileText, label: 'Audit Trail' },
        ]
    },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>HRMS</h1>
                <span>Management Suite</span>
            </div>
            <nav className="sidebar-nav">
                {NAV.map(section => (
                    <div key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            >
                                <item.icon />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
