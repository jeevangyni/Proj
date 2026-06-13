import { useEffect, useState } from "react";
import Login from "./components/Login";
import ValidationList from "./components/ValidationList";
import UserInfo from "./components/UserInfo";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [instanceUrl, setInstanceUrl] = useState(null);

  const BACKEND_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const codeVerifier =
        localStorage.getItem("code_verifier") ||
        sessionStorage.getItem("code_verifier");

      console.log("Code:", code);
      console.log("Code Verifier:", codeVerifier);

      if (!codeVerifier) {
        console.error("No code verifier found!");
        return;
      }

      fetch(`${BACKEND_URL}/oauth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          code_verifier: codeVerifier,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Token response:", data);
          if (data.token && data.instance) {
            setToken(data.token);
            setInstanceUrl(decodeURIComponent(data.instance));
            localStorage.removeItem("code_verifier");
            sessionStorage.removeItem("code_verifier");
            window.history.replaceState({}, document.title, "/");
          } else {
            console.error("No token in response:", data);
          }
        })
        .catch((err) => console.error("Token exchange error:", err));
      return;
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    setInstanceUrl(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <div className="App">
      <h1>Salesforce Validation Rule Manager</h1>
      {!token ? (
        <Login />
      ) : (
        <>
          <UserInfo token={token} instanceUrl={instanceUrl} onLogout={handleLogout} />
          <ValidationList token={token} instanceUrl={instanceUrl} />
        </>
      )}
    </div>
  );
}

export default App;