
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", message: "Connected to Threat Stream" }));
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/threat-feed") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  server.listen(3000, () => {
    console.log("🌐 Server ready on http://localhost:3000");
  });

  setInterval(() => {
    const threatReport = {
      type: "threat",
      data: {
        timestamp: new Date().toISOString(),
        anomaly: Math.random() > 0.5,
        source: ["NodeBot", "NeuroWorm", "SpectreAI"][Math.floor(Math.random() * 3)],
        action: "Neutralized",
      },
    };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(threatReport));
      }
    });
  }, 10000);
});
