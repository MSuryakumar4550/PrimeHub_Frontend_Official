import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiUser, FiBarChart2, FiMessageSquare, 
  FiSettings, FiStar, FiClock, FiLogOut 
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' },
    { path: '/leaderboard', icon: <FiBarChart2 />, label: 'Leaderboard' },
    { path: '/order', icon: <FiUser />, label: 'Order' }, // Assuming these are placeholders
    { path: '/product', icon: <FiUser />, label: 'Product' },
    { path: '/sales-report', icon: <FiBarChart2 />, label: 'Sales Report' },
    { path: '/message', icon: <FiMessageSquare />, label: 'Message' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
    { path: '/favourite', icon: <FiStar />, label: 'Favourite' },
    { path: '/history', icon: <FiClock />, label: 'History' },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Mac Controls */}
      <div className="mac-controls">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
      </div>

      <nav className="nav-menu">
        {navItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">{item.icon}</div>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item signout-btn">
          <div className="nav-icon"><FiLogOut /></div>
          {!collapsed && <span className="nav-label">Signout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
