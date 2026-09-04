import React from 'react';
import Sidebar from './Sidebar';
import { FiSearch, FiBell } from 'react-icons/fi';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
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
            <div className="profile-btn">
              <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="avatar" />
            </div>
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
