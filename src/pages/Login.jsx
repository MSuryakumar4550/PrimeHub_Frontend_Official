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
            setError('Invalid credentials. Please verify and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-corporate-container">
            
            {/* LEFT: IMAGE PANE */}
            <div className="login-image-pane">
                <div className="image-overlay">
                    <div className="overlay-content">
                        <h2>Empowering Education.</h2>
                        <p>Streamline your institution's operations with our next-generation management platform.</p>
                    </div>
                </div>
            </div>

            {/* RIGHT: FORM PANE */}
            <div className="login-form-pane">
                <div className="form-wrapper">
                    
                    <div className="brand-header">
                        <div className="brand-logo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <circle cx="12" cy="11" r="1" />
                                <path d="M12 12v3" />
                            </svg>
                        </div>
                        <h1>Prime Hub</h1>
                    </div>

                    <div className="form-header">
                        <h2>Welcome back</h2>
                        <p>Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="corporate-error-msg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="corporate-auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                id="email"
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                id="password"
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember for 30 days</span>
                            </label>
                            <button type="button" className="forgot-password">Forgot password?</button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="corporate-submit-btn"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p>Don't have an account? <button className="contact-admin">Contact Admin</button></p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;