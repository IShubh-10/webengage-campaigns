import React, { useState, useEffect } from "react";
import API from "./API";
import CampaignGallery from './CampaignGallery'

const Login = () => {
  const [adminUsers, setAdminUsers] = useState([]);

  // DB values
  const [dbUsername, setDbUsername] = useState("");
  const [dbPassword, setDbPassword] = useState("");

  // Input values
  const [username, setUsername] = useState("");
  const [password, setUserPassword] = useState("");

  const [message, setMessage] = useState("");

//  login  
  const [isLogedIn, setisLogedIn] = useState(false);

  const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

  // ================= FETCH ADMIN USERS =================
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch(ADMIN_API_URL);
      const data = await response.json();

      console.log(data);

      setAdminUsers(data);

      // taking first admin user
      if (data.length > 0) {
        setDbUsername(data[0].username);
        setDbPassword(data[0].userpassword);
      }
    } catch (error) {
      console.error("❌ Error fetching:", error);
    }
  };

  // ================= LOGIN =================
  const handleLogin = () => {
    if (username === dbUsername && password === dbPassword) {
      setMessage("✅ User logged in");
        setisLogedIn(true);
        localStorage.setItem("isLogedIn", true)
    } else {
      setMessage("❌ Invalid credentials");
      setisLogedIn(false);
      localStorage.setItem("isLogedIn", false)
    }
  };

  const loginState = localStorage.getItem("isLogedIn");
  if(loginState){
    return(
        <>
        <API/>  
        {/* <CampaignGallery /> */}
        </>
    )
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Login Only</h2>

      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setUserPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleLogin}>Submit</button>

      <br />
      <br />

      <p>{message}</p>
    </div>
  );
};

export default Login;