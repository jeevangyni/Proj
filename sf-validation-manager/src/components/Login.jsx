import { SF_CONFIG } from "../config";

// Generate PKCE code verifier and challenge
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export default function Login() {
  const handleLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Save verifier to use later in backend
    localStorage.setItem("code_verifier", codeVerifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: SF_CONFIG.clientId,
      redirect_uri: SF_CONFIG.redirectUri,
      scope: "full refresh_token offline_access",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.assign(
      `${SF_CONFIG.loginUrl}/services/oauth2/authorize?${params}`
    );
  };

  return (
    <div>
      <p>Connect your Salesforce Org to manage Validation Rules</p>
      <button onClick={handleLogin}>Login to Salesforce</button>
    </div>
  );
}