require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// OAuth callback
app.post("/oauth/callback", async (req, res) => {
  const { code, code_verifier } = req.body;

  console.log("Received code:", code);
  console.log("Received code_verifier:", code_verifier);

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      redirect_uri: process.env.SF_REDIRECT_URI,
      code_verifier: code_verifier,
    });

    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, instance_url } = response.data;

    res.json({
      token: access_token,
      instance: encodeURIComponent(instance_url),
    });

  } catch (error) {
    console.error("OAuth error:", JSON.stringify(error.response?.data, null, 2));
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Fetch validation rules
app.get("/api/validation-rules", async (req, res) => {
  const { token, instanceUrl } = req.query;

  try {
    const query = `SELECT Id,ValidationName,Active,Description FROM ValidationRule WHERE EntityDefinition.QualifiedApiName='Account'`;
    const response = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/query`,
      {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Fetch rules error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Get logged in user info
app.get("/api/user-info", async (req, res) => {
  const { token, instanceUrl } = req.query;
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v59.0/chatter/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json({
      name: response.data.name,
      organization: response.data.companyName,
      email: response.data.email,
      photo: response.data.photo?.smallPhotoUrl,
    });
  } catch (error) {
    console.error("User info error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Toggle a single validation rule
app.patch("/api/validation-rules/:id", async (req, res) => {
  const { id } = req.params;
  const { token, instanceUrl, active } = req.body;

  console.log("Toggling rule:", id, "active:", active);
  console.log("Instance URL:", instanceUrl);

  try {
    // First GET the full metadata
    const getResponse = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Current metadata:", JSON.stringify(getResponse.data.Metadata, null, 2));

    // Merge existing metadata with new active state
    const existingMetadata = getResponse.data.Metadata;
    const updatedMetadata = {
      ...existingMetadata,
      active: active,
    };

    // Now PATCH with full metadata
    await axios.patch(
      `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`,
      { Metadata: updatedMetadata },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Toggle error full:", JSON.stringify(error.response?.data, null, 2));
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Serve React frontend
app.use(express.static(path.join(__dirname, "../build")));

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));