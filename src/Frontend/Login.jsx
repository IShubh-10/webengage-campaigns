import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Strict whitelist of authorized usernames and WebEngage Admin email addresses
const ALLOWED_ADMIN_EMAILS = [
    "superadmin",
    "shubham.kadam@webengage.com",
    "suraj.gupta@webengage.com",
    "niraj.jain@webengage.com",
    "ayushi.jain@webengage.com",
    "prathamesh.shivekar@webengage.com",
    "ravina.jain@webengage.com",
    "ashish.raj@webengage.com"
];

const Login = () => {
    const navigate = useNavigate();
    const [adminUsers, setAdminUsers] = useState([]);

    // DB values
    const [dbUsername, setDbUsername] = useState("");
    const [dbPassword, setDbPassword] = useState("");

    // Input values
    const [username, setUsername] = useState("");
    const [password, setUserPassword] = useState("");

    const [message, setMessage] = useState("");

    // password toggle
    const [showPassword, setShowPassword] = useState(false);

    // Safely extract environment variables without triggering ES2015 build warnings
    let ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

    try {
        const env = new Function("return import.meta.env")();
        if (env && env.VITE_ADMIN_API_URL) {
            ADMIN_API_URL = env.VITE_ADMIN_API_URL;
        }
    } catch (e) {
        // Fall back to default parameter
    }

    useEffect(() => {
        fetchAdminUsers();

        // Redirect already logged-in users
        const isGuest = localStorage.getItem("isGuestUser") === "true";
        const isLogged = localStorage.getItem("isLogedIn") === "true";
        
        if (isGuest || isLogged) {
            navigate("/gallery");
        }
    }, [navigate]);

    const fetchAdminUsers = async () => {
        try {
            const response = await fetch(ADMIN_API_URL);
            const data = await response.json();

            setAdminUsers(data);

            if (data.length > 0) {
                setDbUsername(data[0].username);
                setDbPassword(data[0].userpassword);
            }
        } catch (error) {
            console.error("❌ Error fetching credentials:", error);
        }
    };

    const handleLogin = () => {
        const inputUserLower = username.toLowerCase().trim();

        // 1. Strict Whitelist Check: Block non-whitelisted email domains/usernames before checking passwords
        if (!ALLOWED_ADMIN_EMAILS.includes(inputUserLower)) {
            setMessage("❌ Access Blocked: Your email is not whitelisted for admin privileges please login as a guest user.");
            localStorage.setItem("isLogedIn", "false");
            return;
        }

        // 2. Query/Match manual input against list of database credentials
        const matchedDbUser = adminUsers.find(
            (u) => u.username.toLowerCase() === inputUserLower && u.userpassword === password
        );

        // Check if matching whitelisted database record was found with correct password
        if (matchedDbUser) {
            const assignedRole = matchedDbUser.role || "admin";

            setMessage("Login successful");
            localStorage.setItem("isLogedIn", "true");
            localStorage.setItem("userRole", assignedRole);
            localStorage.setItem("userIdentifier", inputUserLower);
            localStorage.setItem("userName", inputUserLower.split('@')[0]);
            
            navigate("/gallery");
        } else {
            setMessage("❌ Invalid username or password");
            localStorage.setItem("isLogedIn", "false");
        }
    };

    const handleGuest = () => {
        localStorage.setItem("isGuestUser", "true");
        localStorage.setItem("userRole", "guest");
        localStorage.setItem("userIdentifier", "Guest");
        navigate("/gallery");
    };

    return (
        <>
            <style>
                {`
                *{
                    margin:0;
                    padding:0;
                    box-sizing:border-box;
                    font-family:Inter, sans-serif;
                }

                body{
                    background:#f4f7fb;
                    color:#111827;
                }

                .login-container{
                    width:100%;
                    min-height:100vh;
                    display:flex;
                    background:#f4f7fb;
                }

                /* ================= LEFT PANEL ================= */

                .login-left{
                    width:46%;
                    background:#ffffff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:60px 70px;
                    border-right:1px solid #e5e7eb;
                }

                .login-content{
                    width:100%;
                    max-width:420px;
                }

                .brand{
                    display:flex;
                    align-items:center;
                    gap:14px;
                    margin-bottom:50px;
                }

                .brand-logo{
                    width:48px;
                    height:48px;
                    border-radius:14px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#fff;
                    font-size:18px;
                    font-weight:700;
                    box-shadow:0 10px 25px rgba(91,61,245,0.25);
                }

                .brand-text{
                    font-size:24px;
                    font-weight:700;
                    color:#111827;
                    letter-spacing:-0.4px;
                }

                .welcome-title{
                    font-size:44px;
                    line-height:1.1;
                    font-weight:800;
                    color:#111827;
                    margin-bottom:18px;
                    letter-spacing:-1px;
                }

                .subtitle{
                    font-size:16px;
                    color:#6b7280;
                    line-height:1.8;
                    margin-bottom:40px;
                }

                .input-group{
                    margin-bottom:22px;
                    position:relative;
                }

                .input-group label{
                    display:block;
                    margin-bottom:10px;
                    font-size:14px;
                    font-weight:600;
                    color:#374151;
                }

                .input-group input{
                    width:100%;
                    height:58px;
                    border-radius:14px;
                    border:1px solid #dce3ec;
                    background:#fbfcfe;
                    padding:0 18px;
                    font-size:15px;
                    color:#111827;
                    transition:all 0.25s ease;
                    outline:none;
                }

                .input-group input:focus{
                    border-color:#5B3DF5;
                    background:#fff;
                    box-shadow:0 0 0 4px rgba(91,61,245,0.08);
                }

                .eye-icon{
                    position:absolute;
                    right:18px;
                    top:47px;
                    cursor:pointer;
                    font-size:18px;
                    opacity:0.7;
                }

                .login-btn{
                    width:100%;
                    height:58px;
                    border:none;
                    border-radius:14px;
                    background:linear-gradient(135deg, #4d47b3, #583892);
                    color:#fff;
                    font-size:16px;
                    font-weight:700;
                    cursor:pointer;
                    transition:all 0.25s ease;
                    margin-top:8px;
                    box-shadow:0 14px 28px rgba(91,61,245,0.22);
                }

                .login-btn:hover{
                    transform:translateY(-1px);
                    opacity:0.96;
                }

                .guest-btn{
                    width:100%;
                    height:56px;
                    margin-top:16px;
                    border-radius:14px;
                    border:1px solid #dce3ec;
                    background:#fff;
                    color:#374151;
                    font-size:15px;
                    font-weight:600;
                    cursor:pointer;
                    transition:0.25s ease;
                }

                .guest-btn:hover{
                    background:#f9fafb;
                }

                .message{
                    margin-bottom: 22px;
                    text-align: center;
                    font-size: 14px;
                    color: red;
                    line-height: 1.5;
                }

                /* ================= RIGHT PANEL ================= */

                .login-right{
                    width:54%;
                    background:
                        radial-gradient(circle at top right, rgba(124,102,255,0.18), transparent 30%),
                        linear-gradient(135deg,#0f172a,#111827);
                    padding:60px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    position:relative;
                    overflow:hidden;
                }

                .dashboard-wrapper{
                    width:100%;
                    max-width:560px;
                    position:relative;
                    z-index:2;
                }

                .dashboard-badge{
                    display:inline-flex;
                    align-items:center;
                    gap:8px;
                    padding:8px 14px;
                    border-radius:999px;
                    background:rgba(255,255,255,0.08);
                    border:1px solid rgba(255,255,255,0.08);
                    color:#c7d2fe;
                    font-size:13px;
                    font-weight:600;
                    margin-bottom:24px;
                }

                .dashboard-heading{
                    font-size:42px;
                    line-height:1.15;
                    font-weight:800;
                    color:#ffffff;
                    letter-spacing:-1px;
                    margin-bottom:16px;
                }

                .dashboard-description{
                    font-size:16px;
                    line-height:1.7;
                    color:#9ca3af;
                    max-width:500px;
                    margin-bottom:40px;
                }

                /* ================= CLEAN ANALYTICS CARD ================= */

                .analytics-card{
                    width:100%;
                    background:rgba(255,255,255,0.06);
                    backdrop-filter:blur(18px);
                    border:1px solid rgba(255,255,255,0.08);
                    border-radius:28px;
                    padding:30px;
                }

                .analytics-header{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:28px;
                }

                .analytics-title{
                    color:#fff;
                    font-size:20px;
                    font-weight:700;
                }

                .analytics-tag{
                    padding:8px 14px;
                    border-radius:999px;
                    background:rgba(91,61,245,0.22);
                    color:#d6ccff;
                    font-size:13px;
                    font-weight:600;
                }

                .stats-row{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:18px;
                    margin-bottom:26px;
                }

                .stat-box{
                    flex:1;
                }

                .stat-label{
                    font-size:13px;
                    color:#9ca3af;
                    margin-bottom:10px;
                }

                .stat-value{
                    font-size:32px;
                    font-weight:800;
                    color:#ffffff;
                    letter-spacing:-1px;
                }

                .progress-section{
                    margin-top:10px;
                }

                .progress-top{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:12px;
                }

                .progress-label{
                    color:#e5e7eb;
                    font-size:14px;
                    font-weight:600;
                }

                .progress-value{
                    color:#ffffff;
                    font-size:14px;
                    font-weight:700;
                }

                .progress-bar{
                    width:100%;
                    height:10px;
                    background:rgba(255,255,255,0.08);
                    border-radius:999px;
                    overflow:hidden;
                }

                .progress-fill{
                    width:78%;
                    height:100%;
                    border-radius:999px;
                    background:linear-gradient(90deg,#7C66FF,#A78BFA);
                }

                /* ================= MOBILE ================= */

                @media(max-width:1100px){

                    .login-container{
                        flex-direction:column;
                    }

                    .login-left,
                    .login-right{
                        width:100%;
                    }

                    .login-left{
                        padding:50px 28px;
                    }

                    .login-right{
                        padding:40px 24px;
                        display: none;
                    }
                }

                @media(max-width:768px){

                    .welcome-title{
                        font-size:34px;
                    }

                    .dashboard-heading{
                        font-size:30px;
                    }

                    .stats-row{
                        flex-direction:column;
                        align-items:flex-start;
                    }

                    .analytics-card{
                        padding:22px;
                    }
                }
                `}
            </style>

            <div className="login-container">

                {/* LEFT PANEL */}
                <div className="login-left">

                    <div className="login-content">

                        <div className="brand">

                            <div className="brand-logo">
                                <img width={40} src="https://res.cloudinary.com/djoqxegkb/image/upload/v1780386730/mxdccfpslyc7bmxi2vag.jpg" alt="Logo" />
                            </div>

                            <div className="brand-text">
                                WebEngage Campaign Gallery
                            </div>

                        </div>

                        <h1 className="welcome-title">
                            Sign in to continue
                        </h1>

                        <p className="subtitle">
                            Access campaigns, templates, analytics, and engagement workflows from your centralized dashboard.
                        </p>

                        {message && (
                            <p className="message" style={{ color: message.includes("successful") ? "#10b981" : "red" }}>
                                {message}
                            </p>
                        )}

                        <div className="input-group">

                            <label>WebEngage Admin Email</label>

                            <input
                                type="text"
                                placeholder="Enter whitelisted email address"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter secure password"
                                value={password}
                                onChange={(e) => setUserPassword(e.target.value)}
                            />

                            <span
                                className="eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOffIcon/> :  <VisibilityIcon />}
                            </span>

                        </div>

                        <button
                            className="login-btn"
                            onClick={handleLogin}
                        >
                            Sign In
                        </button>

                        <button
                            className="guest-btn"
                            onClick={handleGuest}
                        >
                            Continue as Guest
                        </button>

                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div className="login-right">

                    <div className="dashboard-wrapper">

                        <div className="dashboard-badge">
                            ● WebEngage Intelligence Suite
                        </div>

                        <h2 className="dashboard-heading">
                            Build meaningful customer engagement campaigns
                        </h2>

                        <p className="dashboard-description">
                            Manage campaigns, automate workflows, and monitor engagement performance from a unified platform.
                        </p>

                        <div className="analytics-card">

                            <div className="analytics-header">

                                <div className="analytics-title">
                                    Campaign Performance
                                </div>

                                <div className="analytics-tag">
                                    Live
                                </div>

                            </div>

                            <div className="stats-row">

                                <div className="stat-box">

                                    <div className="stat-label">
                                        Active Campaigns
                                    </div>

                                    <div className="stat-value">
                                        128
                                    </div>

                                </div>

                                <div className="stat-box">

                                    <div className="stat-label">
                                        Engagement Rate
                                    </div>

                                    <div className="stat-value">
                                        92%
                                    </div>

                                </div>

                                <div className="stat-box">

                                    <div className="stat-label">
                                        Notifications
                                    </div>

                                    <div className="stat-value">
                                        1.2M
                                    </div>

                                </div>

                            </div>

                            <div className="progress-section">

                                <div className="progress-top">

                                    <div className="progress-label">
                                        Campaign Delivery Performance
                                    </div>

                                    <div className="progress-value">
                                        78%
                                    </div>

                                </div>

                                <div className="progress-bar">
                                    <div className="progress-fill"></div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
};

export default Login;