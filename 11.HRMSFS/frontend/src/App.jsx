import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Shifts from './pages/Shifts';
import Payroll from './pages/Payroll';
import Recruitment from './pages/Recruitment';
import Performance from './pages/Performance';
import Training from './pages/Training';
import Benefits from './pages/Benefits';
import Assets from './pages/Assets';
import Reimbursements from './pages/Reimbursements';
import Notifications from './pages/Notifications';
import Disciplinary from './pages/Disciplinary';
import Exit from './pages/Exit';
import Audit from './pages/Audit';

export default function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="loading"><div className="spinner" /> Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-area">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leave" element={<Leave />} />
                    <Route path="/shifts" element={<Shifts />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/recruitment" element={<Recruitment />} />
                    <Route path="/performance" element={<Performance />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/benefits" element={<Benefits />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/reimbursements" element={<Reimbursements />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/disciplinary" element={<Disciplinary />} />
                    <Route path="/exit" element={<Exit />} />
                    <Route path="/audit" element={<Audit />} />
                </Routes>
            </main>
        </div>
    );
}
