import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

const api = axios.create({ baseURL: "http://localhost:8080" });

api.interceptors.request.use(
  (config) => {
    try {
      const token = window.localStorage.getItem("primehub_token"); // ✅ FIXED
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {}
    return config;
  },
  (error) => Promise.reject(error)
);

const TABS = {
  OVERVIEW: "Overview",
  STUDENTS: "Students",
  TEAMS: "Teams",
  CREATE_TASK: "Create Task",
  EVALUATE: "Evaluate",
  LEAVES: "Leaves",
  ANNOUNCEMENTS: "Announcements",
  PRIVATE_NOTES: "Private Notes",
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ FIXED: Read from "user" object in localStorage
  const { displayName, teacherId } = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const name = (u.name || "Teacher").trim().split(" ")[0];
      const id = u.id || u.userId;
      return { displayName: name, teacherId: id };
    } catch {
      return { displayName: "Teacher", teacherId: null };
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

  const [nowString, setNowString] = useState(() =>
    new Date().toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setNowString(new Date().toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");
  const [overviewCounts, setOverviewCounts] = useState({ students: 0, teams: 0, pendingEvaluations: 0, pendingLeaves: 0 });

  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [teamCreateStatus, setTeamCreateStatus] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");

  const [evaluateLoading, setEvaluateLoading] = useState(false);
  const [evaluateError, setEvaluateError] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [teacherTasks, setTeacherTasks] = useState([]);
  const [teacherTasksLoading, setTeacherTasksLoading] = useState(false);
  const [teacherTasksError, setTeacherTasksError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewScore, setReviewScore] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [leavesLoading, setLeavesLoading] = useState(false);
  const [leavesError, setLeavesError] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [leavesActionStatus, setLeavesActionStatus] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [announcementStatus, setAnnouncementStatus] = useState("");

  const [noteStudentId, setNoteStudentId] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteStatus, setNoteStatus] = useState("");
  const [createdTaskId, setCreatedTaskId] = useState(null);
  const [assignType, setAssignType] = useState("INDIVIDUAL");
  const [assignStudentIds, setAssignStudentIds] = useState([]);
  const [assignTeamId, setAssignTeamId] = useState("");
  const [assignStatus, setAssignStatus] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // ── FETCH HELPERS ──────────────────────────────────────────────

  const loadStudents = async () => {
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const res = await api.get("/api/teacher/students");
      const list = Array.isArray(res.data) ? res.data : res.data?.students || [];
      setStudents(list);
    } catch {
      setStudentsError("Unable to load students. Please try again.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadTeams = async () => {
    if (!teacherId) return;
    setTeamsLoading(true);
    setTeamsError("");
    try {
      const res = await api.get(`/api/teacher/${encodeURIComponent(teacherId)}/teams`);
      const list = Array.isArray(res.data) ? res.data : res.data?.teams || [];
      setTeams(list);
    } catch {
      setTeamsError("Unable to load teams.");
    } finally {
      setTeamsLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!teacherId) return;
    setEvaluateLoading(true);
    setEvaluateError("");
    try {
      const res = await api.get(`/api/tasks/teacher/${encodeURIComponent(teacherId)}/assignments`);
      const list = Array.isArray(res.data) ? res.data : res.data?.assignments || [];
      setAssignments(list);
    } catch {
      setEvaluateError("Failed to fetch submissions.");
    } finally {
      setEvaluateLoading(false);
    }
  };

  const loadTeacherTasks = async () => {
    if (!teacherId) return;
    setTeacherTasksLoading(true);
    setTeacherTasksError("");
    try {
      const res = await api.get(`/api/tasks/teacher/${encodeURIComponent(teacherId)}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.tasks || [];
      setTeacherTasks(list);
    } catch (err) {
      // Log full backend response for debugging access issues.
      console.error("loadTeacherTasks error:", err?.response || err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message;
      setTeacherTasksError(
        status === 403
          ? "Permission denied to load tasks (403). Check your role or endpoint."
          : `Failed to load your tasks. ${message || ""}`
      );
    } finally {
      setTeacherTasksLoading(false);
    }
  };

  const loadLeaves = async () => {
    setLeavesLoading(true);
    setLeavesError("");
    try {
      const res = await api.get("/api/school/leave/pending");
      const list = Array.isArray(res.data) ? res.data : res.data?.leaves || [];
      setLeaves(list);
    } catch {
      setLeavesError("Failed to load pending leaves.");
    } finally {
      setLeavesLoading(false);
    }
  };

  useEffect(() => {
    setOverviewCounts({
      students: students.length,
      teams: teams.length,
      pendingEvaluations: assignments.filter((a) => !a.status || a.status.toLowerCase() === "pending").length,
      pendingLeaves: leaves.length,
    });
  }, [students, teams, assignments, leaves]);

  useEffect(() => {
    const bootstrap = async () => {
      setOverviewLoading(true);
      setOverviewError("");
      try {
        await Promise.all([loadStudents(), loadTeams(), loadAssignments(), loadTeacherTasks(), loadLeaves()]);
      } catch {
        setOverviewError("Some sections failed to initialize.");
      } finally {
        setOverviewLoading(false);
      }
    };
    bootstrap();
  }, []);

  // ── HANDLERS ──────────────────────────────────────────────────

  const toggleSidebarOnMobile = () => setSidebarOpen((o) => !o);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter((s) => {
      const name = (s.name || s.fullName || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [students, studentSearch]);

  const handleStudentCheckbox = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setTeamCreateStatus("");
    if (!teacherId) { setTeamCreateStatus("Teacher ID missing."); return; }
    if (!teamName.trim() || selectedStudentIds.length === 0) {
      setTeamCreateStatus("Provide a team name and select at least one student.");
      return;
    }
    try {
      setTeamCreateStatus("Creating team...");
      await api.post(`/api/teacher/${encodeURIComponent(teacherId)}/teams/create`, {
        teamName: teamName.trim(),
        studentIds: selectedStudentIds,
      });
      setTeamName("");
      setSelectedStudentIds([]);
      setTeamCreateStatus("Team created successfully.");
      await loadTeams();
    } catch {
      setTeamCreateStatus("Failed to create team.");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskStatus("");
    if (!taskTitle.trim() || !taskDescription.trim() || !taskDueDate) {
      setTaskStatus("All fields are required.");
      return;
    }
    try {
      setTaskSubmitting(true);
      setTaskStatus("Creating task...");
      const res = await api.post("/api/tasks/create", {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        dueDate: taskDueDate,           // ✅ backend handles LocalDate from "yyyy-MM-dd"
        createdByUserId: teacherId,     // ✅ send teacher's ID
      });

      const createdTask = res.data;
      const createdTaskId = createdTask?.taskId || createdTask?.id;

      // Try to assign to students so it shows up in their dashboard
      const studentIdsToAssign =
        selectedStudentIds.length > 0
          ? selectedStudentIds
          : students
              .map((s) => s.userId || s.id || s._id)
              .filter(Boolean);

      if (createdTaskId && studentIdsToAssign.length > 0) {
        await api.post("/api/tasks/assign/students", {
          taskId: createdTaskId,
          studentIds: studentIdsToAssign,
        });
      }

      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskStatus("Task created successfully.");
      setTeacherTasks((prev) => [
        ...prev,
        {
          id: createdTaskId || `local-${Date.now()}`,
          taskTitle: taskTitle.trim(),
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          dueDate: taskDueDate,
          status: "OPEN",
        },
      ]);
      await Promise.all([loadAssignments(), loadTeacherTasks()]);
    } catch (err) {
      console.error("Failed to create or assign task", err?.response || err);
      setTaskStatus("Failed to create task.");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleReviewSubmission = (assignment) => {
    if (!assignment) return;
    setSelectedAssignment(assignment);
    setReviewScore(assignment.score ?? assignment.grade ?? "");
    setReviewStatus("");
    // ✅ Auto scroll to review panel
    setTimeout(() => {
      document.getElementById("review-panel")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaveScore = async () => {
    if (!selectedAssignment) return;
    const id = selectedAssignment.id || selectedAssignment._id || selectedAssignment.assignmentId;
    if (!id) {
      setReviewStatus("Cannot identify submission ID.");
      return;
    }

    setReviewSubmitting(true);
    setReviewStatus("");
    try {
      await api.patch(`/api/tasks/assignments/${encodeURIComponent(id)}`, {
        score: reviewScore,
      });
      setReviewStatus("Score updated successfully.");
      await loadAssignments();
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message;
      setReviewStatus(
        status === 403
          ? "Permission denied to update score (403)."
          : `Failed to update score. ${message || ""}`
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ✅ FIXED: was PUT to wrong URL — now PATCH to correct URL with uppercase status
  const handleLeaveAction = async (leaveId, action) => {
    if (!leaveId) return;
    setLeavesActionStatus("");
    try {
      setLeavesActionStatus(`${action === "APPROVED" ? "Approving" : "Rejecting"} leave...`);
      await api.patch(`/api/school/leave/status/${leaveId}`, {
        status: action, // "APPROVED" or "REJECTED"
      });
      setLeavesActionStatus(`Leave ${action.toLowerCase()} successfully.`);
      await loadLeaves();
    } catch {
      setLeavesActionStatus("Failed to update leave status.");
    }
  };

  // ✅ FIXED: was sending "message" field — backend expects "content" + "teacherId"
  const handleSubmitAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncementStatus("");
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      setAnnouncementStatus("Title and message are required.");
      return;
    }
    if (!teacherId) {
      setAnnouncementStatus("Teacher ID missing. Please re-login.");
      return;
    }
    try {
      setAnnouncementSubmitting(true);
      setAnnouncementStatus("Sending announcement...");
      await api.post("/api/school/announcements", {
        title: announcementTitle.trim(),
        content: announcementBody.trim(), // ✅ FIXED: "content" not "message"
        teacherId: teacherId,             // ✅ FIXED: backend requires this
      });
      setAnnouncementTitle("");
      setAnnouncementBody("");
      setAnnouncementStatus("Announcement sent successfully.");
    } catch {
      setAnnouncementStatus("Failed to send announcement.");
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  // ✅ FIXED: sends teacherId + studentId + content (matches NoteRequest.java)
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    setNoteStatus("");
    if (!noteStudentId || !noteBody.trim()) {
      setNoteStatus("Student and message are required.");
      return;
    }
    try {
      setNoteSubmitting(true);
      setNoteStatus("Sending note...");
      await api.post("/api/school/notes", {
        teacherId: teacherId,           // ✅ FIXED: matches NoteRequest.java
        studentId: Number(noteStudentId),
        content: noteBody.trim(),       // ✅ FIXED: "content" not "message"
      });
      setNoteStudentId("");
      setNoteBody("");
      setNoteStatus("Private note sent successfully.");
    } catch {
      setNoteStatus("Failed to send note.");
    } finally {
      setNoteSubmitting(false);
    }
  };

  // ── RENDER HELPERS ─────────────────────────────────────────────

  const renderOverview = () => (
    <div className="teacher-main-body">
      {overviewError && <div className="text-error">{overviewError}</div>}
      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-card-header">
            <div className="overview-card-title">Students</div>
            <span className="overview-card-pill">Directory</span>
          </div>
          <div className="overview-card-value">
            {overviewLoading ? <div className="skeleton-line" /> : overviewCounts.students}
          </div>
          <div className="overview-card-foot">Total active students assigned to you.</div>
        </div>
        <div className="overview-card">
          <div className="overview-card-header">
            <div className="overview-card-title">Teams</div>
            <span className="overview-card-pill">Collaboration</span>
          </div>
          <div className="overview-card-value">
            {overviewLoading ? <div className="skeleton-line" /> : overviewCounts.teams}
          </div>
          <div className="overview-card-foot">Structured groups for projects and labs.</div>
        </div>
        <div className="overview-card">
          <div className="overview-card-header">
            <div className="overview-card-title">Pending Evaluations</div>
            <span className="overview-card-pill">Review</span>
          </div>
          <div className="overview-card-value">
            {overviewLoading ? <div className="skeleton-line" /> : overviewCounts.pendingEvaluations}
          </div>
          <div className="overview-card-foot">Student submissions that require your review.</div>
        </div>
        <div className="overview-card">
          <div className="overview-card-header">
            <div className="overview-card-title">Pending Leaves</div>
            <span className="overview-card-pill">Attendance</span>
          </div>
          <div className="overview-card-value">
            {overviewLoading ? <div className="skeleton-line" /> : overviewCounts.pendingLeaves}
          </div>
          <div className="overview-card-foot">Leave requests awaiting your approval.</div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="teacher-main-body">
      <div className="students-section-header">
        <div>
          <div className="section-title">Students Directory</div>
          <div className="section-subtitle">Search and filter your assigned students.</div>
        </div>
        <div className="students-search-bar">
          <input
            className="input-glass"
            type="text"
            placeholder="Search by name or email..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />
          <button className="btn-ghost" type="button" onClick={loadStudents}>Refresh</button>
        </div>
      </div>
      {studentsError && <div className="text-error">{studentsError}</div>}
      {studentsLoading ? (
        <div className="text-muted">Loading students...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-muted">No students found.</div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map((s, index) => {
            const id = s.userId || s.id || s._id;
            const name = s.name || s.fullName || "Unnamed Student";
            return (
              <div key={`${id ?? name}-${index}`} className="student-card glass-panel">
                          <div className="student-card-header">
                  <div className="student-avatar">{name.trim().charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="student-name">{name}</div>
                    <div className="student-meta"><span>{s.email || "No email"}</span></div>
                  </div>
                </div>
                <div className="student-meta">
                  <span>ID: {id}</span>
                  {s.role && <span>Role: {s.role}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTeams = () => (
    <div className="teacher-main-body">
      <div className="teams-section-header">
        <div>
          <div className="section-title">Teams</div>
          <div className="section-subtitle">Create and manage student teams.</div>
        </div>
        <button className="btn-ghost" type="button" onClick={loadTeams}>Refresh Teams</button>
      </div>
      <div className="teams-layout">
        <form className="form-card glass-panel" onSubmit={handleCreateTeam}>
          <div className="form-row">
            <label className="form-label">Team Name</label>
            <input
              className="select-glass"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. AI Capstone Squad"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Select Members</span>
            <div style={{ maxHeight: 180, overflowY: "auto", padding: "6px 4px", borderRadius: 12, border: "1px solid rgba(148,163,184,0.4)", background: "rgba(15,23,42,0.7)" }}>
              {students.length === 0 ? (
                <div className="text-muted" style={{ padding: "4px 6px" }}>No students available.</div>
              ) : (
                students.map((s, index) => {
                  const id = s.userId || s.id || s._id;
                  const name = s.name || s.fullName || "Unnamed";
                  return (
                    <label key={`${id ?? name}-${index}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", fontSize: 12, cursor: "pointer" }}>
                      <input type="checkbox" checked={selectedStudentIds.includes(id)} onChange={() => handleStudentCheckbox(id)} />
                      <span>{name}</span>
                      {s.email && <span style={{ color: "#9ca3af" }}>({s.email})</span>}
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <button className="btn-primary" type="submit">Create Team</button>
            {teamCreateStatus && (
              <span className={teamCreateStatus.includes("fail") ? "text-error" : "text-success"}>{teamCreateStatus}</span>
            )}
          </div>
        </form>

        <div className="form-card glass-panel">
          <div className="section-subtitle" style={{ marginBottom: 6 }}>Existing Teams</div>
          {teamsError && <div className="text-error">{teamsError}</div>}
          {teamsLoading ? (
            <div className="text-muted">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="text-muted">No teams created yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {teams.map((team, index) => (
                <div key={`${team.id || team._id || team.teamName || team.name}-${index}`} className="list-card">
                  <div className="list-header">
                    <div className="list-header-main">
                      <div className="list-title">{team.teamName || team.name || "Unnamed Team"}</div>
                      <div className="list-subtitle">{team.description || "Student collaboration group"}</div>
                    </div>
                    <span className="badge">{Array.isArray(team.members) ? `${team.members.length} members` : "Team"}</span>
                  </div>
                  {Array.isArray(team.members) && team.members.length > 0 && (
                    <div className="list-meta-row">
                      {team.members.slice(0, 4).map((m, idx) => (
                        <span key={`${m.id ?? m.name}-${idx}`}>{m.name}</span>
                      ))}
                      {team.members.length > 4 && <span>+{team.members.length - 4} more</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

const renderCreateTask = () => (
    <div className="teacher-main-body">
      <div className="tasks-section-header">
        <div>
          <div className="section-title">Create Task</div>
          <div className="section-subtitle">Configure assignments for your students.</div>
        </div>
      </div>

      {/* STEP 1: Create Task */}
      <form className="form-card glass-panel" onSubmit={handleCreateTask}>
        <div className="form-row">
          <label className="form-label">Title</label>
          <input className="select-glass" type="text" value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Data Structures Lab 04" />
        </div>
        <div className="form-row">
          <label className="form-label">Description</label>
          <textarea className="textarea-glass" value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Add grading criteria, guidelines, and resources." />
        </div>
        <div className="form-row">
          <label className="form-label">Due Date</label>
          <input className="date-glass" type="date" value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <button className="btn-primary" type="submit" disabled={taskSubmitting}>
            {taskSubmitting ? "Creating..." : "Create Task"}
          </button>
          {taskStatus && (
            <span className={taskStatus.includes("fail") ? "text-error" : "text-success"}>
              {taskStatus}
            </span>
          )}
        </div>
      </form>

      {/* STEP 2: Assign — shown after task created */}
      {createdTaskId && (
        <div className="form-card glass-panel" style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 4 }}>Assign Task</div>
          <div className="section-subtitle" style={{ marginBottom: 12 }}>
            Task ID: {createdTaskId} — Choose who to assign it to.
          </div>

          <div className="form-row">
            <label className="form-label">Assign To</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button"
                className={assignType === "INDIVIDUAL" ? "btn-primary" : "btn-ghost"}
                onClick={() => { setAssignType("INDIVIDUAL"); setAssignTeamId(""); }}>
                Individual Students
              </button>
              <button type="button"
                className={assignType === "TEAM" ? "btn-primary" : "btn-ghost"}
                onClick={() => { setAssignType("TEAM"); setAssignStudentIds([]); }}>
                Team
              </button>
            </div>
          </div>

          {assignType === "INDIVIDUAL" && (
            <div className="form-row">
              <span className="form-label">Select Students</span>
              <div style={{ maxHeight: 180, overflowY: "auto", padding: "6px 4px",
                borderRadius: 12, border: "1px solid rgba(148,163,184,0.4)",
                background: "rgba(15,23,42,0.7)" }}>
                {students.length === 0 ? (
                  <div className="text-muted" style={{ padding: "4px 6px" }}>No students available.</div>
                ) : (
                  students.map((s, index) => {
                    const id = s.userId || s.id || s._id;
                    const name = s.name || s.fullName || "Unnamed";
                    return (
                      <label key={`${id ?? name}-${index}`}
                        style={{ display: "flex", alignItems: "center", gap: 8,
                          padding: "4px 6px", fontSize: 12, cursor: "pointer" }}>
                        <input type="checkbox"
                          checked={assignStudentIds.includes(id)}
                          onChange={() =>
                            setAssignStudentIds((prev) =>
                              prev.includes(id)
                                ? prev.filter((pid) => pid !== id)
                                : [...prev, id]
                            )
                          } />
                        <span>{name}</span>
                        {s.email && <span style={{ color: "#9ca3af" }}>({s.email})</span>}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {assignType === "TEAM" && (
            <div className="form-row">
              <label className="form-label">Select Team</label>
              <select className="select-glass" value={assignTeamId}
                onChange={(e) => setAssignTeamId(e.target.value)}>
                <option value="">-- Select a team --</option>
                {teams.map((team, index) => {
                  const id = team.teamId || team.id || team._id;
                  const name = team.teamName || team.name || "Unnamed Team";
                  return (
                    <option key={`${id ?? name}-${index}`} value={id}>{name}</option>
                  );
                })}
              </select>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button className="btn-primary" type="button"
              onClick={handleAssignTask} disabled={assignSubmitting}>
              {assignSubmitting ? "Assigning..." : "Assign Task"}
            </button>
            <button className="btn-ghost" type="button"
              onClick={() => { setCreatedTaskId(null); setAssignStatus(""); }}>
              Skip
            </button>
            {assignStatus && (
              <span className={assignStatus.includes("fail") ? "text-error" : "text-success"}>
                {assignStatus}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const handleAssignTask = async () => {
    if (!createdTaskId) {
      setAssignStatus("No task to assign.");
      return;
    }
    setAssignSubmitting(true);
    setAssignStatus("");
    try {
      if (assignType === "INDIVIDUAL") {
        if (assignStudentIds.length === 0) {
          setAssignStatus("Select at least one student.");
          setAssignSubmitting(false);
          return;
        }
        await api.post("/api/tasks/assign/students", {
          taskId: createdTaskId,
          studentIds: assignStudentIds,
        });
      } else {
        if (!assignTeamId) {
          setAssignStatus("Select a team.");
          setAssignSubmitting(false);
          return;
        }
        await api.post("/api/tasks/assign/team", {
          taskId: createdTaskId,
          teamId: Number(assignTeamId),
        });
      }
      setAssignStatus("Task assigned successfully!");
      setAssignStudentIds([]);
      setAssignTeamId("");
      setCreatedTaskId(null);
      await loadAssignments();
    } catch {
      setAssignStatus("Failed to assign task.");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const renderEvaluate = () => (
    <div className="teacher-main-body">
      <div className="evaluate-section-header">
        <div>
          <div className="section-title">Evaluate Submissions</div>
          <div className="section-subtitle">Review student work and record evaluations.</div>
        </div>
        <button
          className="btn-ghost"
          type="button"
          onClick={() => {
            loadAssignments();
            loadTeacherTasks();
            setSelectedAssignment(null);
          }}
        >
          Refresh
        </button>
      </div>

      {evaluateError && <div className="text-error">{evaluateError}</div>}

      <div style={{ marginBottom: 16 }}>
        <div className="section-subtitle">Tasks you created</div>
        {teacherTasksError && <div className="text-error">{teacherTasksError}</div>}
        {teacherTasksLoading ? (
          <div className="text-muted">Loading your tasks...</div>
        ) : teacherTasks.length === 0 ? (
          <div className="text-muted">No tasks created yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {teacherTasks.map((t, index) => (
              <div key={`${t.id || t._id || t.taskId || index}`} className="list-card glass-panel">
                <div className="list-header">
                  <div className="list-header-main">
                    <div className="list-title">{t.taskTitle || t.title || "Untitled Task"}</div>
                    <div className="list-subtitle">Due {t.dueDate || t.due || "-"}</div>
                  </div>
                  <span className="badge">{(t.status || "Open").toString().toUpperCase()}</span>
                </div>
                {t.description && <div className="list-meta-row">{t.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-subtitle">Submissions</div>
      {evaluateLoading ? (
        <div className="text-muted">Loading submissions...</div>
      ) : assignments.length === 0 ? (
        <div className="text-muted">No submissions pending review.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {assignments.map((a, index) => (
            <div key={`${a.id || a._id || a.taskId || a.assignmentId || index}`} className="list-card glass-panel">
              <div className="list-header">
                <div className="list-header-main">
                  <div className="list-title">
                    {a.task?.title || a.taskTitle || a.title || "Untitled Task"} – {a.student?.name || a.studentName || "Student"}
                  </div>
                  <div className="list-subtitle">
                    {a.submissionDate
                      ? `Submitted on ${new Date(a.submissionDate).toLocaleString()}`
                      : a.status === "PENDING"
                      ? "Not yet submitted"
                      : "Submission date not recorded"}
                  </div>
                </div>
                <span className={!a.status || a.status.toLowerCase() === "pending" ? "badge badge-muted" : "badge badge-success"}>
                  {a.status ? a.status.toUpperCase() : "PENDING"}
                </span>
              </div>
              <div className="list-actions">
                <button className="btn-primary" type="button" onClick={() => handleReviewSubmission(a)}>
                  Review Submission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAssignment && (
          <div id="review-panel" className="list-card glass-panel" style={{ marginTop: 16 }}>
          <div className="list-header">
            <div className="list-header-main">
              <div className="list-title">Review: {selectedAssignment.task?.title || selectedAssignment.taskTitle || selectedAssignment.title || "Submission"}</div>
              <div className="list-subtitle">Student: {selectedAssignment.student?.name || selectedAssignment.studentName || "Unknown"}</div>
            </div>
            <button className="btn-ghost" type="button" onClick={() => setSelectedAssignment(null)}>
              Close
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Status:</strong> {selectedAssignment.status || "PENDING"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Submitted at:</strong>{" "}
              {selectedAssignment.submissionDate
                ? new Date(selectedAssignment.submissionDate).toLocaleString()
                : selectedAssignment.status === "PENDING"
                ? "Not yet submitted"
                : "Date not recorded"}
            </div>

            
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontWeight: 600 }}>Score:</label>
              <input
                type="number"
                value={reviewScore}
                onChange={(e) => setReviewScore(e.target.value)}
                placeholder="e.g. 85"
                style={{ width: 100, padding: 6, borderRadius: 6, border: "1px solid rgba(148,163,184,0.5)", background: "rgba(15,23,42,0.7)" }}
              />
              <button className="btn-primary" type="button" onClick={handleSaveScore} disabled={reviewSubmitting}>
                {reviewSubmitting ? "Saving..." : "Save Score"}
              </button>
            </div>
            {reviewStatus && (
              <div className={reviewStatus.toLowerCase().includes("fail") ? "text-error" : "text-success"} style={{ marginBottom: 12 }}>
                {reviewStatus}
              </div>
            )}
            <div style={{ marginBottom: 8 }}>
              <strong>Raw data (for debugging):</strong>
              <pre style={{ maxHeight: 180, overflowY: "auto", background: "rgba(0,0,0,0.05)", padding: 8 }}>{JSON.stringify(selectedAssignment, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ✅ FIXED: correct field names from LeaveApplication.java (startDate/endDate, leaveId)
  const renderLeaves = () => (
    <div className="teacher-main-body">
      <div className="leaves-section-header">
        <div>
          <div className="section-title">Pending Leaves</div>
          <div className="section-subtitle">Review and approve or reject leave requests.</div>
        </div>
        <button className="btn-ghost" type="button" onClick={loadLeaves}>Refresh</button>
      </div>
      {leavesError && <div className="text-error">{leavesError}</div>}
      {leavesActionStatus && (
        <div className={leavesActionStatus.includes("fail") ? "text-error" : "text-success"}>
          {leavesActionStatus}
        </div>
      )}
      {leavesLoading ? (
        <div className="text-muted">Loading leaves...</div>
      ) : leaves.length === 0 ? (
        <div className="text-muted">No pending leave requests.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leaves.map((l) => (
            <div key={l.leaveId || l.id} className="list-card glass-panel">
              <div className="list-header">
                <div className="list-header-main">
                  {/* ✅ student is a User object from backend */}
                  <div className="list-title">
                    {l.student?.name || l.studentName || "Student"} — {l.reason || "Leave request"}
                  </div>
                  {/* ✅ FIXED: backend uses startDate/endDate not fromDate/toDate */}
                  <div className="list-subtitle">
                    From {l.startDate || "?"} to {l.endDate || "?"}
                  </div>
                </div>
                <span className="badge badge-muted">{l.status || "PENDING"}</span>
              </div>
              <div className="list-meta-row">
                {l.appliedAt && <span>Applied: {new Date(l.appliedAt).toLocaleDateString()}</span>}
              </div>
              <div className="list-actions">
                {/* ✅ FIXED: passing uppercase "APPROVED"/"REJECTED" */}
                <button className="btn-primary" type="button" onClick={() => handleLeaveAction(l.leaveId || l.id, "APPROVED")}>
                  Approve
                </button>
                <button className="btn-ghost" type="button" onClick={() => handleLeaveAction(l.leaveId || l.id, "REJECTED")}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnnouncements = () => (
    <div className="teacher-main-body">
      <div className="announcements-section-header">
        <div>
          <div className="section-title">Global Announcements</div>
          <div className="section-subtitle">Publish updates that every student can see.</div>
        </div>
      </div>
      <form className="form-card glass-panel" onSubmit={handleSubmitAnnouncement}>
        <div className="form-row">
          <label className="form-label">Title</label>
          <input className="select-glass" type="text" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="e.g. Exam Week Schedule Update" />
        </div>
        <div className="form-row">
          <label className="form-label">Message</label>
          <textarea className="textarea-glass" value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} placeholder="Provide details, links, and expectations." />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <button className="btn-primary" type="submit" disabled={announcementSubmitting}>
            {announcementSubmitting ? "Sending..." : "Send Announcement"}
          </button>
          {announcementStatus && <span className={announcementStatus.includes("fail") ? "text-error" : "text-success"}>{announcementStatus}</span>}
        </div>
      </form>
    </div>
  );

  const renderPrivateNotes = () => (
    <div className="teacher-main-body">
      <div className="notes-section-header">
        <div>
          <div className="section-title">Private Notes</div>
          <div className="section-subtitle">Send confidential notes directly to a student.</div>
        </div>
      </div>
      <form className="form-card glass-panel" onSubmit={handleSubmitNote}>
        <div className="form-row">
          <label className="form-label">Student</label>
          <select className="select-glass" value={noteStudentId} onChange={(e) => setNoteStudentId(e.target.value)}>
            <option value="">Select a student</option>
            {students.map((s, index) => {
              const id = s.userId || s.id || s._id;
              const name = s.name || s.fullName || "Unnamed Student";
              return (
                <option key={id ?? name + index} value={id}>{name} (ID: {id})</option>
              );
            })}
          </select>
        </div>
        <div className="form-row">
          <label className="form-label">Message</label>
          <textarea className="textarea-glass" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Share feedback or guidance visible only to this student." />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <button className="btn-primary" type="submit" disabled={noteSubmitting}>
            {noteSubmitting ? "Sending..." : "Send Note"}
          </button>
          {noteStatus && <span className={noteStatus.includes("fail") ? "text-error" : "text-success"}>{noteStatus}</span>}
        </div>
      </form>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case TABS.STUDENTS:      return renderStudents();
      case TABS.TEAMS:         return renderTeams();
      case TABS.CREATE_TASK:   return renderCreateTask();
      case TABS.EVALUATE:      return renderEvaluate();
      case TABS.LEAVES:        return renderLeaves();
      case TABS.ANNOUNCEMENTS: return renderAnnouncements();
      case TABS.PRIVATE_NOTES: return renderPrivateNotes();
      default:                 return renderOverview();
    }
  };

  const tabsArray = [
    TABS.OVERVIEW, TABS.STUDENTS, TABS.TEAMS, TABS.CREATE_TASK,
    TABS.EVALUATE, TABS.LEAVES, TABS.ANNOUNCEMENTS, TABS.PRIVATE_NOTES,
  ];

  return (
    <div className="teacher-dashboard-root">
      <div className="teacher-hamburger">
        <button type="button" onClick={toggleSidebarOnMobile}>
          <div className="teacher-hamburger-line" />
        </button>
      </div>
      {sidebarOpen && <div className="teacher-sidebar-overlay" onClick={toggleSidebarOnMobile} />}

      <div className="teacher-dashboard-layout">
        <aside className={["teacher-sidebar", "glass-panel", sidebarOpen ? "teacher-sidebar-open" : ""].join(" ")}>
          <div className="teacher-sidebar-brand">
            <div className="teacher-sidebar-logo" />
            <div className="teacher-sidebar-title-group">
              <div className="teacher-sidebar-title">Prime Hub</div>
              <div className="teacher-sidebar-subtitle">Teacher Control Center</div>
            </div>
          </div>

          <div className="teacher-sidebar-user">
            <div className="teacher-sidebar-user-name">{displayName}</div>
            <div className="teacher-sidebar-user-role">Faculty · Instructor</div>
            <div className="teacher-sidebar-user-meta">
              <span>Today</span>
              <span>{nowString}</span>
            </div>
          </div>

          <nav className="teacher-sidebar-nav">
            {tabsArray.map((tab) => (
              <button
                key={tab}
                type="button"
                className={"teacher-sidebar-tab-btn" + (activeTab === tab ? " teacher-sidebar-tab-btn-active" : "")}
                onClick={() => handleTabChange(tab)}
              >
                <span><span className="tab-dot" />{tab}</span>
                {tab === TABS.OVERVIEW && <span>⌂</span>}
                {tab === TABS.STUDENTS && <span>⧉</span>}
                {tab === TABS.TEAMS && <span>◇</span>}
                {tab === TABS.CREATE_TASK && <span>✎</span>}
                {tab === TABS.EVALUATE && <span>✓</span>}
                {tab === TABS.LEAVES && <span>☾</span>}
                {tab === TABS.ANNOUNCEMENTS && <span>◦</span>}
                {tab === TABS.PRIVATE_NOTES && <span>✉</span>}
              </button>
            ))}
          </nav>

          <div className="teacher-sidebar-footer">
            <span>Prime Hub · v1.0</span>
            <span>SMT</span>
          </div>
        </aside>

        <main className="teacher-main">
          <header className="teacher-main-header">
            <div className="teacher-main-header-left">
              <div className="teacher-main-title">{activeTab}</div>
              <div className="teacher-main-breadcrumb">Teacher · Prime Hub · {activeTab}</div>
            </div>
            <div className="teacher-main-header-right">
              <span className="teacher-main-chip">Secure Workspace</span>
              <span className="teacher-main-time">{nowString}</span>
            </div>
          </header>

          <div className="inline-tabs-row">
            {tabsArray.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={"btn-ghost" + (activeTab === tab ? " teacher-sidebar-tab-btn-active" : "")}
                style={{ paddingInline: 10, fontSize: 11 }}
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

export default TeacherDashboard;