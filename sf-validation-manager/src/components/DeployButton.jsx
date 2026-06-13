export default function DeployButton({ onDeploy, deployed }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={onDeploy}
        style={{
          backgroundColor: deployed ? "green" : "blue",
          color: "white",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {deployed ? "✅ Deployed Successfully!" : "🚀 Deploy Changes to Salesforce"}
      </button>
    </div>
  );
}