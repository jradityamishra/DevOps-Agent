# DevOps Copilot MVP (Node.js)

Node.js + TypeScript webhook service that detects failed GitHub Actions runs, fetches logs, sends logs to your custom agent API, and logs the analysis result locally.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Fill `.env` values.

4. Start in dev mode:

```bash
npm run dev
```

Health endpoint:

- `GET /health`

Webhook endpoint:

- `POST /webhook/github`

## Required webhook setup

1. GitHub repository -> Settings -> Webhooks -> Add webhook.
2. Payload URL: `https://your-api.com/webhook/github`
3. Content type: `application/json`
4. Secret: same as `GITHUB_WEBHOOK_SECRET`
5. Events: `Workflow runs`

## Event filter behavior

The service processes only:

- event type `workflow_run`
- action `completed`
- conclusion `failure`

All other events are ignored with `202` response.

## Agent integration contract

The app posts logs to `AGENT_API_URL` using:

```json
{
	"logs": "<trimmed pipeline logs>",
	"task": "analyze-ci-failure"
}
```

It expects one of the following in response:

1. `analysis` object with keys `rootCause`, `evidence`, `immediateFix`, `preventiveFix`, `confidence`
2. direct JSON object with those keys
3. `output` as a JSON string with those keys

## Output behavior

1. Analysis output is logged to the local console.
2. Webhook response returns acceptance status and analysis confidence.

## Build and check

```bash
npm run typecheck
npm run build
```
