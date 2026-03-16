import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder imports for pages you will build
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Teacher Routes */}
                    <Route path="/teacher-dashboard" element={
                        <ProtectedRoute allowedRoles={['TEACHER']}>
                            <TeacherDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Student Routes */}
                    <Route path="/student-dashboard" element={
                        <ProtectedRoute allowedRoles={['STUDENT']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Default Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;