import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Bell, Search } from 'lucide-react';

export default function Header({ title, subtitle }) {
    const { theme, toggle } = useTheme();

    return (
        <header className="header">
            <div className="header-left">
                <div>
                    <h2>{title}</h2>
                    {subtitle && <div className="header-breadcrumb">{subtitle}</div>}
                </div>
            </div>
            <div className="header-right">
                <button className="header-btn" title="Search">
                    <Search />
                </button>
                <button className="header-btn" title="Notifications">
                    <Bell />
                </button>
                <button className="header-btn" onClick={toggle} title="Toggle theme">
                    {theme === 'light' ? <Moon /> : <Sun />}
                </button>
            </div>
        </header>
    );
}
