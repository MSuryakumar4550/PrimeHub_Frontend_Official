import React, { useState } from 'react';
import { FiHome, FiUsers, FiBell, FiCheckSquare, FiLogOut, FiMenu, FiSearch, FiFileText } from 'react-icons/fi';
import './AppDashboardLayout.css';

const getIconForSection = (id) => {
  if (id.includes('overview') || id.includes('dashboard')) return <FiHome />;
  if (id.includes('user')) return <FiUsers />;
  if (id.includes('announcement')) return <FiBell />;
  if (id.includes('task')) return <FiCheckSquare />;
  if (id.includes('leave')) return <FiFileText />;
  return <FiMenu />;
};

const AppDashboardLayout = ({ 
  children, 
  sections, 
  activeSection, 
  setActiveSection, 
  userName = "User", 
  userRole = "Role",
  onLogout 
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div className="mac-controls">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>

        <div className="sidebar-brand">
          {!collapsed && <h2>Prime Hub</h2>}
        </div>

        <nav className="nav-menu">
          {sections.map((s) => (
            <button 
              key={s.id} 
              className={`nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <div className="nav-icon">{getIconForSection(s.id)}</div>
              {!collapsed && <span className="nav-label">{s.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item signout-btn" onClick={onLogout}>
            <div className="nav-icon"><FiLogOut /></div>
            {!collapsed && <span className="nav-label">Signout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search here..." />
          </div>
          <div className="header-right">
            <button className="icon-btn">
              <FiBell />
              <span className="badge"></span>
            </button>
            <div className="profile-info">
              <div className="profile-text">
                <span className="profile-name">{userName}</span>
                <span className="profile-role">{userRole}</span>
              </div>
              <div className="profile-avatar">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="section-title">{sections.find(s => s.id === activeSection)?.label || "Dashboard"}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppDashboardLayout;
