'use client';

export default function SettingsPage() {
    return (
        <>
            <div className="top-bar"><h1 className="top-bar-title">Settings</h1></div>
            <div className="page-content">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">⚙️ System Settings</h3>
                    </div>
                    <div className="card-body">
                        <div className="empty-state" style={{ padding: 40 }}>
                            <div className="empty-state-icon">🔧</div>
                            <h3 className="empty-state-title">Coming Soon</h3>
                            <p className="empty-state-text">System settings and configuration will be available here. Features include SMTP configuration, storage settings, and placement policies.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
