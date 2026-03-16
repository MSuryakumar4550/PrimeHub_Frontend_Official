import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const api = axios.create({ baseURL: "http://localhost:8080" });

api.interceptors.request.use(
  (config) => {
    try {
      const token = window.localStorage.getItem("primehub_token"); // ✅ FIXED
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const STUDENT_TABS = {
  OVERVIEW: "Overview",
  TASKS: "Directive Center",
  TEAM: "Team Hub",
  LEAVE: "Leave Application",
  INBOX: "Inbox",
  BULLETIN: "Bulletin Board",
  PROFILE: "Profile", 
};

const safeInitials = (name) => {
  if (!name || typeof name !== "string") return "ST";
  const trimmed = name.trim();
  if (!trimmed) return "ST";
  const parts = trimmed.split(" ").filter(Boolean);
  const first = parts[0]?.charAt(0) || "";
  const second = parts[1]?.charAt(0) || "";
  return (first + second || first).toUpperCase();
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(STUDENT_TABS.OVERVIEW);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ FIXED: Read from "user" object in localStorage
  const { studentName, studentId } = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const name = u.name || "Student";
      const id = u.id || u.userId;
      return { studentName: name, studentId: id };
    } catch {
      return { studentName: "Student", studentId: null };
    }
  }, []);

  // ✅ FIXED: Check correct token key
  useEffect(() => {
    try {
      const token = window.localStorage.getItem("primehub_token");
      if (!token) navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [nowString, setNowString] = useState(
    new Date().toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setNowString(new Date().toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Overview
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overview, setOverview] = useState({ completed: 0, pending: 0, attendance: "—" });

  // Tasks
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [submitTaskId, setSubmitTaskId] = useState("");
  const [submitPayload, setSubmitPayload] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Team
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [team, setTeam] = useState(null);

  // Leave
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveHistoryLoading, setLeaveHistoryLoading] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ reason: "", start: "", end: "" });

  // Inbox (notes)
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [notes, setNotes] = useState([]);

  // Bulletin (announcements)
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [announcements, setAnnouncements] = useState([]);


  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  // ── FETCH HELPERS ──────────────────────────────────────────────

  const loadTasks = async () => {
    if (!studentId) return;
    setTasksLoading(true);
    setTasksError("");
    try {
      const res = await api.get(`/api/student/${encodeURIComponent(studentId)}/tasks`);
      const list = Array.isArray(res.data) ? res.data : res.data?.tasks || [];
      setTasks(list);
      const completed = list.filter((t) => (t.status || "").toLowerCase() === "completed").length;
      const pending = list.filter((t) => (t.status || "").toLowerCase() !== "completed").length;
      setOverview((prev) => ({ ...prev, completed, pending }));
    } catch {
      setTasksError("Failed to load tasks.");
    } finally {
      setTasksLoading(false);
    }
  };

  const loadTeam = async () => {
    if (!studentId) return;
    setTeamLoading(true);
    setTeamError("");
    try {
      const res = await api.get(`/api/student/${encodeURIComponent(studentId)}/team`);
      setTeam(res.data || null);
    } catch {
      setTeamError("Failed to load team.");
    } finally {
      setTeamLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!studentId) return;
    setNotesLoading(true);
    setNotesError("");
    try {
      // ✅ FIXED: correct endpoint with studentId as query param
      const res = await api.get(`/api/school/notes?studentId=${studentId}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.notes || [];
      setNotes(list);
    } catch {
      setNotesError("Failed to load inbox.");
    } finally {
      setNotesLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError("");
    try {
      const res = await api.get("/api/school/announcements");
      const list = Array.isArray(res.data) ? res.data : res.data?.announcements || [];
      setAnnouncements(list);
    } catch {
      setAnnouncementsError("Failed to load announcements.");
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadLeaveHistory = async () => {
    if (!studentId) return;
    setLeaveHistoryLoading(true);
    try {
      const res = await api.get(`/api/school/leave/history/${studentId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setLeaveHistory(list);
    } catch {
      // silently fail
    } finally {
      setLeaveHistoryLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setOverviewLoading(true);
      try {
        await Promise.all([loadTasks(), loadTeam(), loadNotes(), loadAnnouncements(), loadLeaveHistory()]);
      } finally {
        setOverviewLoading(false);
      }
    };
    init();
  }, []);

  // ── HANDLERS ──────────────────────────────────────────────────

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitStatus("");
    if (!submitTaskId.trim() || !submitPayload.trim()) {
      setSubmitStatus("Pick an assignment and add your work.");
      return;
    }

    console.log("Submitting assignment", submitTaskId, submitPayload);

    try {
      setSubmitLoading(true);
      setSubmitStatus("Submitting work...");
      await api.post("/api/tasks/submit/" + submitTaskId, {
        content: submitPayload.trim(),
      });
      setSubmitPayload("");
      setSubmitTaskId("");
      await loadTasks();
      setSubmitStatus("Submission uploaded successfully.");
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("Submit assignment error:", { status, data, err });
      const message = data?.message || err?.message;
      setSubmitStatus(
        status === 403
          ? `Failed to submit assignment (403). Ensure you have the correct assignment ID and role.`
          : `Failed to submit assignment. ${message || ""}`
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✅ FIXED: correct endpoint + sends studentId from logged-in user
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveStatus("");
    if (!leaveForm.reason.trim() || !leaveForm.start || !leaveForm.end) {
      setLeaveStatus("All fields are required.");
      return;
    }
    if (!studentId) {
      setLeaveStatus("Student ID missing. Please re-login.");
      return;
    }
    try {
      setLeaveSubmitting(true);
      setLeaveStatus("Sending leave request...");
      await api.post("/api/school/leave/apply", {  // ✅ FIXED: correct endpoint
        studentId: studentId,                        // ✅ FIXED: sends studentId
        reason: leaveForm.reason.trim(),
        startDate: leaveForm.start,                 // ✅ FIXED: matches LeaveRequest.java
        endDate: leaveForm.end,                     // ✅ FIXED: matches LeaveRequest.java
      });
      setLeaveForm({ reason: "", start: "", end: "" });
      setLeaveStatus("Leave request submitted successfully. Status: PENDING.");
      setOverview((prev) => ({ ...prev, attendance: "Leave Pending" }));
      await loadLeaveHistory();
    } catch {
      setLeaveStatus("Failed to submit leave request.");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setProfileStatus("");

    if (!newPassword.trim()) {
      setProfileStatus("Password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileStatus("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setProfileStatus("Password must be at least 6 characters.");
      return;
    }
    if (!studentId) {
      setProfileStatus("Student ID missing. Please re-login.");
      return;
    }

    try {
      setProfileSubmitting(true);
      setProfileStatus("Updating password...");

      const formData = new FormData();
      formData.append("password", newPassword);

      await api.put(`/api/student/profile/${studentId}`, formData);

      setNewPassword("");
      setConfirmPassword("");
      setProfileStatus("Password updated successfully!");
    } catch {
      setProfileStatus("Failed to update password.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("primehub_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };


  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const pendingTasks = tasks.filter((t) => (t.status || "").toUpperCase() !== "COMPLETED");
  const completedTasks = tasks.filter((t) => (t.status || "").toUpperCase() === "COMPLETED");
  // ── RENDER HELPERS ─────────────────────────────────────────────

  const renderOverview = () => (
    <div className="student-main-body">
      <div className="student-overview-grid">
        <div className="student-overview-card student-glass-panel">
          <div className="student-overview-title">Tasks Completed</div>
          <div className="student-overview-value">
            {overviewLoading ? <div className="student-skeleton-line" /> : overview.completed}
          </div>
          <div className="student-overview-foot">Finished assignments recorded in PrimeHub.</div>
        </div>
        <div className="student-overview-card student-glass-panel">
          <div className="student-overview-title">Pending Assignments</div>
          <div className="student-overview-value">
            {overviewLoading ? <div className="student-skeleton-line" /> : overview.pending}
          </div>
          <div className="student-overview-foot">Work still waiting for your submission.</div>
        </div>
        <div className="student-overview-card student-glass-panel">
          <div className="student-overview-title">Attendance / Leave</div>
          <div className="student-overview-value">
            {overviewLoading ? <div className="student-skeleton-line" /> : overview.attendance}
          </div>
          <div className="student-overview-foot">Current high-level status for today.</div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="student-main-body">
      <div className="student-section-header">
        <div>
          <div className="student-section-title">Directive Center</div>
          <div className="student-section-subtitle">See what needs your attention and submit work.</div>
        </div>
        <button className="student-btn-ghost" type="button" onClick={loadTasks}>Refresh</button>
      </div>
      {tasksError && <div className="student-text-error">{tasksError}</div>}
      <div className="student-tasks-grid">
        <div className="student-glass-panel" style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="student-section-subtitle">Pending</span>
            <span className="student-badge student-badge-danger">{pendingTasks.length}</span>
          </div>
          {tasksLoading ? (
            <div className="student-text-muted">Loading...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="student-text-muted">Nothing pending. You're all caught up.</div>
          ) : (
            pendingTasks.map((t, idx) => {
              const key = t.assignmentId ?? t.task?.taskId ?? t.taskId ?? t.id ?? idx;
              const title = t.task?.title || t.title || "Untitled Task";
              const dueDate = t.task?.dueDate || t.dueDate || "No deadline";
              return (
                <div key={key} className="student-list-card">
                  <div className="student-list-title">{title}</div>
                  <div className="student-list-meta">Due {dueDate}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="student-glass-panel" style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="student-section-subtitle">Completed</span>
            <span className="student-badge student-badge-success">{completedTasks.length}</span>
          </div>
          {tasksLoading ? (
            <div className="student-text-muted">Loading...</div>
          ) : completedTasks.length === 0 ? (
            <div className="student-text-muted">No completed tasks yet.</div>
          ) : (
            completedTasks.map((t, idx) => {
              const key = t.assignmentId ?? t.task?.taskId ?? t.taskId ?? t.id ?? idx;
              const title = t.task?.title || t.title || "Task";
              return (
                <div key={key} className="student-list-card">
                  <div className="student-list-title">{title}</div>
                  <div className="student-list-meta">
                    Completed
                    {t.score != null && (
                      <span style={{ color: "#4ade80", marginLeft: 8 }}>
                        Score: {t.score}
                      </span>
                    )}
                    {t.feedback && (
                      <span style={{ color: "#94a3b8", marginLeft: 8 }}>
                        — {t.feedback}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="student-glass-panel" style={{ padding: 12 }}>
        <div className="student-section-subtitle" style={{ marginBottom: 6 }}>Submit Work</div>
        <form onSubmit={handleSubmitAssignment} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,2fr) auto", gap: 10 }}>
          <select className="student-select" value={submitTaskId} onChange={(e) => setSubmitTaskId(e.target.value)}>
            <option value="">Pick assignment…</option>
            {pendingTasks.map((t) => (
              <option key={t.assignmentId || t.id || t.taskId} value={t.assignmentId || t.id || t.taskId}>
                {t.task?.title || t.title || "Task"}
                {t.task?.dueDate ? ` (due ${t.task.dueDate})` : ""}
              </option>
            ))}
          </select>
          <input className="student-input" type="text" placeholder="Paste your answer or link…" value={submitPayload} onChange={(e) => setSubmitPayload(e.target.value)} />
          <button className="student-btn-primary" type="submit" disabled={submitLoading}>
            {submitLoading ? "Submitting…" : "Submit"}
          </button>
        </form>
        {submitStatus && (
          <div style={{ marginTop: 6 }} className={submitStatus.toLowerCase().includes("fail") ? "student-text-error" : "student-text-success"}>
            {submitStatus}
          </div>
        )}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="student-main-body">
      <div className="student-section-header">
        <div>
          <div className="student-section-title">Team Hub</div>
          <div className="student-section-subtitle">See who you collaborate with on group work.</div>
        </div>
        <button className="student-btn-ghost" type="button" onClick={loadTeam}>Refresh</button>
      </div>
      {teamError && <div className="student-text-error">{teamError}</div>}
      {teamLoading ? (
        <div className="student-text-muted">Loading team...</div>
      ) : !team ? (
        <div className="student-text-muted">You are not yet assigned to a team.</div>
      ) : (
        <div className="student-glass-panel" style={{ padding: 12 }}>
          <div className="student-section-subtitle" style={{ marginBottom: 6 }}>{team.teamName || team.name || "Your Team"}</div>
          {team.description && <div className="student-text-muted" style={{ marginBottom: 8 }}>{team.description}</div>}
          {Array.isArray(team.members) && team.members.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {team.members.map((m) => (
                <div key={m.userId || m.id || m.name} className="student-list-card" style={{ minWidth: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "999px", background: "radial-gradient(circle at 0 0,#a5b4fc,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                      {safeInitials(m.name)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                  </div>
                  <div className="student-list-meta">{m.role || "Member"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="student-text-muted">No teammates listed.</div>
          )}
        </div>
      )}
    </div>
  );

  // ✅ FIXED: correct endpoint, correct field names, shows leave history
  const renderLeave = () => (
    <div className="student-main-body">
      <div className="student-section-header">
        <div>
          <div className="student-section-title">Leave Application</div>
          <div className="student-section-subtitle">Request planned days off. Status starts as PENDING.</div>
        </div>
      </div>
      <div className="student-glass-panel" style={{ padding: 12 }}>
        <form onSubmit={handleApplyLeave} style={{ display: "grid", gridTemplateColumns: "minmax(0,2.4fr) minmax(0,1.2fr) minmax(0,1.2fr) auto", gap: 10, alignItems: "center" }}>
          <input
            className="student-input"
            type="text"
            placeholder="Reason (exam, health, travel...)"
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
          />
          <input
            className="student-input"
            type="date"
            value={leaveForm.start}
            onChange={(e) => setLeaveForm({ ...leaveForm, start: e.target.value })}
          />
          <input
            className="student-input"
            type="date"
            value={leaveForm.end}
            onChange={(e) => setLeaveForm({ ...leaveForm, end: e.target.value })}
          />
          <button className="student-btn-primary" type="submit" disabled={leaveSubmitting}>
            {leaveSubmitting ? "Sending…" : "Apply"}
          </button>
        </form>
        {leaveStatus && (
          <div style={{ marginTop: 6 }} className={leaveStatus.toLowerCase().includes("fail") ? "student-text-error" : "student-text-success"}>
            {leaveStatus}
          </div>
        )}
      </div>

      {/* ✅ ADDED: Leave history so student can track status */}
      <div className="student-glass-panel" style={{ padding: 12, marginTop: 12 }}>
        <div className="student-section-subtitle" style={{ marginBottom: 8 }}>My Leave History</div>
        {leaveHistoryLoading ? (
          <div className="student-text-muted">Loading history...</div>
        ) : leaveHistory.length === 0 ? (
          <div className="student-text-muted">No leave applications yet.</div>
        ) : (
          leaveHistory.map((l) => (
            <div key={l.leaveId || l.id} className="student-list-card">
              <div className="student-list-title">{l.reason}</div>
              <div className="student-list-meta">
                {l.startDate} → {l.endDate}
              </div>
              <div className="student-list-meta">
                Status: <strong style={{ color: l.status === "APPROVED" ? "#4ade80" : l.status === "REJECTED" ? "#f87171" : "#fbbf24" }}>{l.status}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderInbox = () => (
    <div className="student-main-body">
      <div className="student-section-header">
        <div>
          <div className="student-section-title">Inbox</div>
          <div className="student-section-subtitle">Private notes and feedback from your teachers.</div>
        </div>
        <button className="student-btn-ghost" type="button" onClick={loadNotes}>Refresh</button>
      </div>
      {notesError && <div className="student-text-error">{notesError}</div>}
      {notesLoading ? (
        <div className="student-text-muted">Loading messages...</div>
      ) : (
        <div className="student-glass-panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.length === 0 ? (
            <div className="student-text-muted">No messages yet.</div>
          ) : (
            notes.map((n) => (
              <div key={n.noteId || n.id} className="student-list-card">
                {/* ✅ FIXED: backend sends "content" not "message" */}
                <div className="student-list-title">{n.title || "Note from Teacher"}</div>
                <div className="student-list-meta">
                  From {n.teacher?.name || n.teacherName || "Teacher"}
                </div>
                <div style={{ fontSize: 13 }}>{n.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ✅ FIXED: correct field names — content, postedAt, announcementId
  const renderBulletin = () => (
    <div className="student-main-body">
      <div className="student-section-header">
        <div>
          <div className="student-section-title">Bulletin Board</div>
          <div className="student-section-subtitle">Institution-wide announcements and broadcasts.</div>
        </div>
        <button className="student-btn-ghost" type="button" onClick={loadAnnouncements}>Refresh</button>
      </div>
      {announcementsError && <div className="student-text-error">{announcementsError}</div>}
      {announcementsLoading ? (
        <div className="student-text-muted">Loading announcements...</div>
      ) : (
        <div className="student-glass-panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {announcements.length === 0 ? (
            <div className="student-text-muted">No announcements yet.</div>
          ) : (
            announcements.map((a) => (
              <div key={a.announcementId || a.id} className="student-list-card">
                <div className="student-list-title">{a.title || "Announcement"}</div>
                <div className="student-list-meta">
                  {/* ✅ FIXED: backend sends postedAt not createdAt */}
                  {a.postedAt ? new Date(a.postedAt).toLocaleString() : "—"}
                  {a.postedBy?.name ? ` · By ${a.postedBy.name}` : ""}
                </div>
                {/* ✅ FIXED: backend sends "content" not "message" or "body" */}
                <div style={{ fontSize: 13 }}>{a.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

    const renderProfile = () => (
      <div className="student-main-body">
        <div className="student-section-header">
          <div>
            <div className="student-section-title">Profile</div>
            <div className="student-section-subtitle">Update your account password.</div>
          </div>
        </div>
        <div className="student-glass-panel" style={{ padding: 16, maxWidth: 400 }}>
          <div className="student-section-subtitle" style={{ marginBottom: 12 }}>
            Logged in as: <strong>{studentName}</strong>
          </div>
          <form onSubmit={handleUpdatePassword}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="student-section-subtitle">New Password</label>
              <input
                className="student-input"
                type="password"
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div>
              <label className="student-section-subtitle">Confirm Password</label>
              <input
                className="student-input"
                type="password"
                placeholder="Confirm new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <button className="student-btn-primary" type="submit"
              disabled={profileSubmitting}>
              {profileSubmitting ? "Updating..." : "Update Password"}
            </button>
            {profileStatus && (
              <div className={profileStatus.includes("fail") || profileStatus.includes("match") || profileStatus.includes("empty") || profileStatus.includes("least")
                ? "student-text-error" : "student-text-success"}>
                {profileStatus}
              </div>
            )}
          </form>

          

        </div>
      </div>
    );

  const renderActiveTab = () => {
    switch (activeTab) {
      case STUDENT_TABS.TASKS:    return renderTasks();
      case STUDENT_TABS.TEAM:     return renderTeam();
      case STUDENT_TABS.LEAVE:    return renderLeave();
      case STUDENT_TABS.INBOX:    return renderInbox();
      case STUDENT_TABS.BULLETIN: return renderBulletin();
      case STUDENT_TABS.PROFILE: return renderProfile();
      default:                    return renderOverview();
    }
  };

  const tabs = [
    STUDENT_TABS.OVERVIEW,
    STUDENT_TABS.TASKS,
    STUDENT_TABS.TEAM,
    STUDENT_TABS.LEAVE,
    STUDENT_TABS.INBOX,
    STUDENT_TABS.BULLETIN,
    STUDENT_TABS.PROFILE, 
  ];

  return (
    <div className="student-dashboard-root">
      <div className="student-hamburger">
        <button type="button" onClick={toggleSidebar}>
          <div className="student-hamburger-line" />
        </button>
      </div>
      {sidebarOpen && <div className="student-sidebar-overlay" onClick={toggleSidebar} />}

      <div className="student-dashboard-layout">
        <aside className={["student-sidebar", "student-glass-panel", sidebarOpen ? "student-sidebar-open" : ""].join(" ")}>
          <div className="student-sidebar-brand">
            <div className="student-sidebar-logo" />
            <div className="student-sidebar-title-group">
              <div className="student-sidebar-title">Prime Hub</div>
              <div className="student-sidebar-subtitle">Student Space</div>
            </div>
          </div>

          <div className="student-sidebar-user">
            <div className="student-sidebar-user-name">{studentName}</div>
            <div className="student-sidebar-user-meta">
              <span>Focus Mode</span>
              <span>{nowString}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgba(248,113,113,0.5)",
                background: "rgba(248,113,113,0.1)",
                color: "#f87171",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
              }}>
              🚪 Log Out
            </button>
          </div>

          <nav className="student-sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={"student-sidebar-tab-btn" + (activeTab === tab ? " student-sidebar-tab-btn-active" : "")}
                onClick={() => handleTabChange(tab)}
              >
                <span><span className="tab-dot" />{tab}</span>
                {tab === STUDENT_TABS.OVERVIEW && <span>⌂</span>}
                {tab === STUDENT_TABS.TASKS && <span>✓</span>}
                {tab === STUDENT_TABS.TEAM && <span>👥</span>}
                {tab === STUDENT_TABS.LEAVE && <span>☾</span>}
                {tab === STUDENT_TABS.INBOX && <span>✉</span>}
                {tab === STUDENT_TABS.BULLETIN && <span>◦</span>}
                {tab === STUDENT_TABS.PROFILE && <span>⚙</span>}
              </button>
            ))}
          </nav>

          <div className="student-sidebar-footer">Prime Hub · Student · v1.0</div>
        </aside>

        <main className="student-main">
          <header className="student-main-header">
            <div className="student-main-header-left">
              <div className="student-main-title">{activeTab}</div>
              <div className="student-main-breadcrumb">Student · Prime Hub · {activeTab}</div>
            </div>
            <div className="student-main-header-right">
              <span className="student-main-chip">Current Status</span>
              <span className="student-main-time">{nowString}</span>
            </div>
          </header>

          <div className="student-inline-tabs-row">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className="student-btn-ghost"
                style={{ paddingInline: 10, fontSize: 11, borderColor: activeTab === tab ? "rgba(187,247,208,0.9)" : "rgba(148,163,184,0.7)" }}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;