import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_BASE_URL = "https://prime-hub-student-management-system-for.onrender.com";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "announcements", label: "Announcements" },
  { id: "leaves", label: "Leave Monitor" },
  { id: "tasks", label: "Tasks" },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("primehub_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data states
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });

  const currentAdminName = localStorage.getItem("primehub_name") || "Admin";

  const handleApiError = async (res) => {
    if (!res.ok) {
      let message = `Request failed with ${res.status}`;
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // ignore
      }
      if (res.status === 401 || res.status === 403) {
        message = "You are not authorized. Please login again as admin.";
      }
      throw new Error(message);
    }
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) return res.json();
    return null;
  };

  // ── FETCH HELPERS ──────────────────────────────────────────────

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const data = await handleApiError(res);
      setUsers(data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/school/announcements`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const data = await handleApiError(res);
      setAnnouncements(data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/school/leave/pending`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const data = await handleApiError(res);
      setAllLeaves(data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const data = await handleApiError(res);
      setTasks(data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUsers(),
      fetchAnnouncements(),
      fetchAllLeaves(),
      fetchTasks(),
    ]).finally(() => setLoading(false));
  }, []);

  // ── ACTIONS ────────────────────────────────────────────────────

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newUser),
      });
      await handleApiError(res);
      setNewUser({ name: "", email: "", password: "", role: "STUDENT" });
      fetchUsers();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const updateUser = async (id, updated) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updated),
      });
      await handleApiError(res);
      fetchUsers();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const deleteUser = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      await handleApiError(res);
      fetchUsers();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const adminId = getStoredUser().id || getStoredUser().userId;
      const res = await fetch(`${API_BASE_URL}/api/school/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ ...newAnnouncement, teacherId: adminId }),
      });
      await handleApiError(res);
      setNewAnnouncement({ title: "", content: "" });
      fetchAnnouncements();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const deleteTask = async (taskId) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      await handleApiError(res);
      fetchTasks();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ── RENDER HELPERS ─────────────────────────────────────────────

  const renderOverview = () => {
    const studentCount = users.filter((u) => u.role === "STUDENT").length;
    const teacherCount = users.filter((u) => u.role === "TEACHER").length;
    return (
      <div className="admin-panels-grid">
        <div className="admin-panel-card">
          <h3>Total Users</h3>
          <p className="admin-panel-number">{users.length}</p>
          <p className="admin-panel-muted">
            {studentCount} students · {teacherCount} teachers
          </p>
        </div>
        <div className="admin-panel-card">
          <h3>Leave Requests</h3>
          <p className="admin-panel-number">{allLeaves.length}</p>
          <p className="admin-panel-muted">Pending teacher review.</p>
        </div>
        <div className="admin-panel-card">
          <h3>Tasks</h3>
          <p className="admin-panel-number">{tasks.length}</p>
          <p className="admin-panel-muted">Active in system.</p>
        </div>
        <div className="admin-panel-card">
          <h3>Announcements</h3>
          <p className="admin-panel-number">{announcements.length}</p>
          <p className="admin-panel-muted">Live on bulletin board.</p>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Manage Users</h2>
        <p className="admin-panel-muted">
          Add, edit, or remove users. Assign roles on creation.
        </p>
      </div>

      <form className="admin-form" onSubmit={createUser}>
        <div className="admin-form-row">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit">Add User</button>
        </div>
      </form>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.userId || u.id}
                user={u}
                onSave={updateUser}
                onDelete={deleteUser}
              />
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Announcements</h2>
        <p className="admin-panel-muted">
          Post system-wide notices — maintenance, downtime, events.
        </p>
      </div>

      <form className="admin-form" onSubmit={createAnnouncement}>
        <input
          type="text"
          placeholder="Title (e.g. System Maintenance on Sunday)"
          value={newAnnouncement.title}
          onChange={(e) =>
            setNewAnnouncement((a) => ({ ...a, title: e.target.value }))
          }
          required
        />
        <textarea
          placeholder="Announcement details..."
          value={newAnnouncement.content}
          onChange={(e) =>
            setNewAnnouncement((a) => ({ ...a, content: e.target.value }))
          }
          required
        />
        <button type="submit">Post Announcement</button>
      </form>

      <div className="admin-card-list">
        {announcements.map((a) => (
          <div
            key={a.announcementId || a.id}
            className="admin-panel-card admin-panel-card--full"
          >
            <h3>{a.title}</h3>
            <p className="admin-panel-muted">{a.content}</p>
            {a.postedAt && (
              <p className="admin-panel-muted" style={{ fontSize: "0.75rem", marginTop: "6px" }}>
                {new Date(a.postedAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="admin-empty">No announcements yet.</div>
        )}
      </div>
    </div>
  );

  // READ-ONLY monitoring — approve/reject is teacher's job
  const renderLeaves = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Leave Monitor</h2>
        <p className="admin-panel-muted">
          Read-only view of all pending leave requests. Teachers approve or reject.
        </p>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Leave ID</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Reason</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allLeaves.map((l) => (
              <tr key={l.leaveId || l.id}>
                <td>{l.leaveId || l.id}</td>
                <td>{l.student?.name || "-"}</td>
                <td>{l.student?.userId || "-"}</td>
                <td>{l.reason}</td>
                <td>{l.startDate}</td>
                <td>{l.endDate}</td>
                <td>
                  <span className={`admin-status-badge admin-status-${(l.status || "").toLowerCase()}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
            {allLeaves.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">
                  No pending leave requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Admin can only VIEW and DELETE tasks — teachers create them
  const renderTasks = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Tasks</h2>
        <p className="admin-panel-muted">
          View all tasks in the system. Delete if needed. Teachers create tasks.
        </p>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Due Date</th>
              <th>Description</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.taskId || t.id}>
                <td>{t.taskId || t.id}</td>
                <td>{t.title}</td>
                <td>
                  {t.dueDate
                    ? typeof t.dueDate === "string"
                      ? t.dueDate.split("T")[0]
                      : t.dueDate
                    : "—"}
                </td>
                <td>{t.description}</td>
                <td>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteTask(t.taskId || t.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  No tasks in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "users":        return renderUsers();
      case "announcements": return renderAnnouncements();
      case "leaves":       return renderLeaves();
      case "tasks":        return renderTasks();
      default:             return renderOverview();
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-bg-overlay" />

      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <span className="admin-brand-dot" />
            <div>
              <div className="admin-brand-title">PRIME HUB</div>
              <div className="admin-brand-subtitle">Admin Space</div>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`admin-nav-item ${activeSection === s.id ? "active" : ""}`}
              onClick={() => { setActiveSection(s.id); setIsSidebarOpen(false); }}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-version">Prime Hub · Admin v1.0</span>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            className="admin-hamburger"
            onClick={() => setIsSidebarOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>

          <div className="admin-header-text">
            <h1>Admin Overview</h1>
            <span className="admin-breadcrumb">
              Admin · Prime Hub ·{" "}
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </span>
          </div>

          <div className="admin-header-status">
            <div className="admin-admin-info">
              <span className="admin-admin-name">{currentAdminName}</span>
              <span className="admin-admin-role">Administrator</span>
            </div>
            <div className="admin-status-pill">
              <span className="dot" />
              <span>Online</span>
            </div>
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="admin-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`admin-tab ${activeSection === s.id ? "active" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <main className="admin-content">
          {loading && <div className="admin-loading">Loading data…</div>}
          {error && (
            <div className="admin-error">
              {error}
              <button
                style={{ marginLeft: "10px", background: "none", border: "none", color: "#fca5a5", cursor: "pointer" }}
                onClick={() => setError("")}
              >
                ✕
              </button>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// ── USER ROW (editable) ────────────────────────────────────────────
const UserRow = ({ user, onSave, onDelete }) => {
  const id = user.userId || user.id;
  const [edit, setEdit] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "STUDENT",
  });
  const [dirty, setDirty] = useState(false);

  const handleChange = (field, value) => {
    setEdit((e) => ({ ...e, [field]: value }));
    setDirty(true);
  };

  const save = () => { onSave(id, edit); setDirty(false); };

  return (
    <tr>
      <td>{id}</td>
      <td>
        <input
          className="admin-table-input"
          value={edit.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </td>
      <td>
        <input
          className="admin-table-input"
          value={edit.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </td>
      <td>
        <select
          className="admin-table-input"
          value={edit.role}
          onChange={(e) => handleChange("role", e.target.value)}
        >
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>
      </td>
      <td>
        <div className="admin-button-group">
          <button type="button" disabled={!dirty} onClick={save}>Save</button>
          <button type="button" className="danger" onClick={() => onDelete(id)}>Delete</button>
        </div>
      </td>
    </tr>
  );
};

export default AdminDashboard;
