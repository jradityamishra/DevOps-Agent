import express from "express";
import crypto from "crypto";
import axios from "axios";
import "dotenv/config";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT ?? 3000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/analyze", async (req, res) => {
  try {
    const logs = (req.body?.logs as string) ?? "";
    if (!logs) {
      return res.status(400).json({ error: "Missing 'logs' in body" });
    }

    const response = await axios.post(
      process.env.AGENT_API_URL!,
      {
        output_type: "chat",
        input_type: "chat",
        input_value: logs.slice(0, 12000),
        session_id: crypto.randomUUID(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AGENT_API_KEY!,
        },
      }
    );

    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data ?? err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
