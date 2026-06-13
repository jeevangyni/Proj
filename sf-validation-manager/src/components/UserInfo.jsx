import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.NODE_ENV === "production" 
  ? "" 
  : "http://localhost:5000";

export default function UserInfo({ token, instanceUrl, onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/user-info`, {
          params: { token, instanceUrl },
        });
        setUser(res.data);
      } catch (error) {
        console.error("User info error:", error);
      }
    };

    fetchUserInfo();
  }, [token, instanceUrl]);

  if (!user) return <p>Loading user info...</p>;

  return (
    <div style={{
      backgroundColor: "#f0f0f0",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {user.photo && (
          <img
            src={user.photo}
            alt="Profile"
            style={{ borderRadius: "50%", width: "50px", height: "50px" }}
          />
        )}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>
            👤 Logged in as: {user.name}
          </p>
          <p style={{ margin: 0 }}>
            🏢 Organisation: {user.organization}
          </p>
          <p style={{ margin: 0, color: "gray", fontSize: "12px" }}>
            📧 {user.email}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}