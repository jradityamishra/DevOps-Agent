import crypto from "crypto";
import axios from "axios";
import "dotenv/config";

async function main() {
  const logs = process.argv[2] ?? "ERROR: npm install failed - peer dependency conflict";

  const response = await axios.post(
    process.env.AGENT_API_URL!,
    {
      output_type: "chat",
      input_type: "chat",
      input_value: logs,
      session_id: crypto.randomUUID(),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AGENT_API_KEY!,
      },
    }
  );

  console.log(JSON.stringify(response.data, null, 2));
}

main().catch((err) => console.error(err.response?.data ?? err.message));
