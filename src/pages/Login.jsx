import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const role = await login(email, password);
            if (role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (role === 'TEACHER') {
                navigate('/teacher-dashboard');
            } else if (role === 'STUDENT') {
                navigate('/student-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid credentials or System Offline. Access Denied.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            
            {/* LEFT HERO SECTION */}
            <div className="login-hero">
                <div className="hero-content">
                    <div className="logo-icon-large">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <circle cx="12" cy="11" r="1" />
                            <path d="M12 12v3" />
                        </svg>
                    </div>
                    <h1>PRIME HUB</h1>
                    <h2>The Next-Gen Education Management Platform</h2>
                    <p>Experience seamless administration, interactive learning, and secure identity management all in one centralized workspace.</p>
                    
                    <div className="hero-features">
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Enterprise-grade Security</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Real-time Analytics</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Collaborative Spaces</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="hero-decoration-1"></div>
                <div className="hero-decoration-2"></div>
            </div>

            {/* RIGHT LOGIN SECTION */}
            <div className="login-form-container">
                <div className="login-card">
                    <h2>Secure Sign-in</h2>
                    <p className="login-subtitle">Enter your credentials to access your workspace</p>

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