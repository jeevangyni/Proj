import { useState } from "react";
import axios from "axios";
import DeployButton from "./DeployButton";

const BACKEND_URL = process.env.NODE_ENV === "production" 
  ? "" 
  : "http://localhost:5000";

export default function ValidationList({ token, instanceUrl }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deployed, setDeployed] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(`${BACKEND_URL}/api/validation-rules`, {
        params: { token, instanceUrl },
      });
      setRules(res.data.records);
      setMessage(`Found ${res.data.records.length} validation rules`);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      setMessage("Error fetching rules. Check console.");
    }
    setLoading(false);
  };

  const toggleRule = async (rule) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/validation-rules/${rule.Id}`,
        {
          token,
          instanceUrl,
          active: !rule.Active,
        }
      );
      setMessage(
        `${rule.ValidationName} ${!rule.Active ? "activated" : "deactivated"} successfully!`
      );
      fetchRules();
    } catch (error) {
      console.error("Toggle error:", error.response?.data || error.message);
      setMessage("Error toggling rule. Check console.");
    }
  };

  const toggleAll = async (activate) => {
    try {
      for (const rule of rules) {
        await axios.patch(`${BACKEND_URL}/api/validation-rules/${rule.Id}`, {
          token,
          instanceUrl,
          active: activate,
        });
      }
      setMessage(`All rules ${activate ? "activated" : "deactivated"} successfully!`);
      fetchRules();
    } catch (error) {
      console.error("Toggle all error:", error.response?.data || error.message);
      setMessage("Error toggling all rules. Check console.");
    }
  };

  const handleDeploy = () => {
  setDeployed(true);
  setMessage("✅ All changes deployed to Salesforce successfully!");
  setTimeout(() => setDeployed(false), 3000);
  };

  return (
    <div>
      <h2>Validation Rules Manager</h2>
      <DeployButton onDeploy={handleDeploy} deployed={deployed} />

      {/* Fetch Button */}
      <button onClick={fetchRules} disabled={loading}>
        {loading ? "Loading..." : "Get Validation Rules"}
      </button>

      {/* Message */}
      {message && <p>{message}</p>}

      {/* Rules List */}
      {rules.length > 0 && (
        <div>
          <button onClick={() => toggleAll(true)}>Enable All</button>
          <button onClick={() => toggleAll(false)}>Disable All</button>

          <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" }}>
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.Id}>
                  <td>{rule.ValidationName}</td>
                  <td>{rule.Active ? "✅ Active" : "❌ Inactive"}</td>
                  <td>
                    <button onClick={() => toggleRule(rule)}>
                      {rule.Active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}