
import { useState, useEffect } from "react";

export default function Home() {
  const [report, setReport] = useState(null);
  const [log, setLog] = useState([]);
  const [shieldActive, setShieldActive] = useState(false);

  async function activateShield() {
    const res = await fetch("/api/sunar/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: 'SUNAR_SHIELD("Protect and Preserve Flame Intention")',
      }),
    });

    const data = await res.json();
    setReport(data);
    setShieldActive(true);
    logEvent("🛡️ Shield Activated");
    logEvent(`🧠 AI Anomalies: ${data.aiAnomaliesDetected}`);
    logEvent(`☣️ Cyber Threats: ${data.cyberThreats.join(", ")}`);
    logEvent(`⚙️ Countermeasures: ${data.counterMeasures.join(", ")}`);
    logEvent("✅ Protection Status: " + data.shieldStatus);
  }

  function logEvent(entry) {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${entry}`]);
  }

  useEffect(() => {
    const ws = new WebSocket("wss://" + window.location.host + "/threat-feed");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "threat") {
        logEvent(`🚨 Real-Time Threat: ${msg.data.source} [${msg.data.action}]`);
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🛡️ SUNAR_SHIELD Dashboard</h1>
      <button onClick={activateShield} style={{ padding: "1rem", background: "green", color: "white", borderRadius: "8px" }}>
        {shieldActive ? "Shield Active ✅" : "Activate Shield"}
      </button>
      {report && (
        <div>
          <h2>Threat Report</h2>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
      <div style={{ marginTop: "2rem" }}>
        <h2>Logs</h2>
        <div style={{ background: "#000", color: "#0f0", padding: "1rem", borderRadius: "8px", height: "200px", overflowY: "auto" }}>
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
