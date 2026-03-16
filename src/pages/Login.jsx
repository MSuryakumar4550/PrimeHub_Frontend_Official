import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const LoginPage = () => {
    // TRICK: We only need the centralized login function from context
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    console.log(error);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // THE RECTIFICATION: 
            // 1. Trigger only the context login.
            // 2. AuthContext handles the api.post, localStorage, and token for you.
            const role = await login(email, password);
            // // console.log(role);
            // console.log(email);
            // console.log(password);
            // 3. CLEAN REDIRECT: Use the role returned by the context function
            if (role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (role === 'TEACHER') {
                navigate('/teacher-dashboard');
            } else if (role === 'STUDENT') {
                navigate('/student-dashboard');
            } else {
                navigate('/'); // Fallback if role is undefined
            }

        } catch (err) {
            // TRAP AVOIDANCE: Catch the 401/500 errors from the backend
            // console.log(role);
            setError('Invalid credentials or System Offline. Access Denied.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-wrapper">
                
                {/* SYSTEM BRANDING */}
                <div className="login-branding">
                    <div className="logo-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <circle cx="12" cy="11" r="1" />
                            <path d="M12 12v3" />
                        </svg>
                    </div>
                    <h1>PRIME HUB</h1>
                    <p>Identity & Access Management</p>
                </div>

                {/* LOGIN CARD */}
                <div className="login-card">
                    <h2>Secure Sign-in</h2>

                    {error && (
                        <div className="error-msg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label className="input-label">Work Email</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="name@college.edu"
                                autoComplete="email"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Security Token</label>
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="login-btn"
                        >
                            {isLoading ? 'Authenticating...' : 'Authorize Access'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <div className="footer-links">
                            <button className="footer-link">Help Center</button>
                            <button className="footer-link">Forgot Credentials</button>
                        </div>
                        <p className="security-note">
                            Authorized personnel only. All access attempts are 
                            monitored and logged by system security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;