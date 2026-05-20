# DevOps Copilot MVP (Node.js)

Automatically detect failed GitHub Actions runs, analyze logs with AI, and send actionable output to Slack and Jira.

## 1. Goal
Build a lightweight MVP that runs fully automated:

1. GitHub Actions workflow fails
2. GitHub webhook sends workflow_run event
3. Node.js backend receives event
4. Backend fetches failed logs from GitHub API
5. Backend sends logs to OpenAI for analysis
6. Backend posts summary to Slack
7. Backend creates Jira issue

## 2. MVP Scope
Included:

1. Node.js + TypeScript backend
2. One webhook endpoint
3. Failure-only event filtering
4. OpenAI analysis
5. Slack notification
6. Jira ticket creation

Excluded for MVP:

1. Teams notification
2. Dashboard
3. Trend analytics
4. Auto-fix pull requests
5. Queue and distributed workers

## 3. Architecture (Simple)
Components:

1. GitHub Actions (pipeline execution)
2. GitHub Webhook (workflow_run event)
3. Webhook API (validation and orchestration)
4. GitHub Log Fetcher
5. OpenAI Analysis Service
6. Slack Notifier
7. Jira Ticket Creator

Processing flow:

1. Receive webhook
2. Ignore non-failure events
3. Fetch logs for failed run
4. Trim large logs
5. Analyze with OpenAI
6. Post to Slack
7. Create Jira issue
8. Log final status

## 3.1 Node.js Architecture (Detailed)
Use a clean layered structure so the MVP is simple now but easy to scale later.

Architecture layers:

1. API Layer
2. Orchestration Layer
3. Integration Layer
4. Utility Layer

API Layer responsibilities:

1. Expose POST endpoint for GitHub webhook
2. Verify signature and parse payload
3. Apply failure-only filtering
4. Return fast HTTP responses

Orchestration Layer responsibilities:

1. Coordinate full pipeline for one failed run
2. Call GitHub log fetch -> OpenAI analysis -> Slack -> Jira
3. Build a single normalized analysis object used by all outputs
4. Handle retries and partial downstream failures

Integration Layer responsibilities:

1. GitHub client for Actions run and logs
2. OpenAI client for structured root cause analysis
3. Slack client for notification message delivery
4. Jira client for issue creation

Utility Layer responsibilities:

1. Environment configuration and validation
2. Logger and correlation id support
3. Basic retry helper for external APIs
4. Common formatters for summaries and payloads

Recommended folder layout:

```text
src/
	app.ts
	server.ts
	routes/
		githubWebhook.ts
	services/
		orchestrator.ts
		githubClient.ts
		openaiClient.ts
		slackClient.ts
		jiraClient.ts
	middleware/
		verifyGithubSignature.ts
		errorHandler.ts
	config/
		env.ts
	utils/
		logger.ts
		retry.ts
```

Request lifecycle inside Node.js service:

1. Webhook route receives workflow_run event.
2. Signature middleware validates authenticity.
3. Route filters for completed failure events only.
4. Orchestrator fetches failed logs from GitHub.
5. Orchestrator trims logs and sends to OpenAI.
6. Orchestrator receives root cause and fix guidance.
7. Orchestrator sends Slack summary.
8. Orchestrator creates Jira issue.
9. Service logs final status with correlation id.

Minimal scalability path from this architecture:

1. Move orchestrator call to queue worker if event volume increases.
2. Add idempotency storage to prevent duplicate event handling.
3. Add Teams client in services layer without route changes.
4. Split integration clients into separate packages if multi-repo adoption grows.

## 4. Required Environment Variables
Use env vars only. Never hardcode secrets.

1. GITHUB_TOKEN
2. GITHUB_WEBHOOK_SECRET
3. OPENAI_API_KEY
4. OPENAI_MODEL (example: gpt-4o-mini)
5. SLACK_WEBHOOK_URL
6. JIRA_BASE_URL (example: https://your-domain.atlassian.net)
7. JIRA_EMAIL
8. JIRA_API_TOKEN
9. JIRA_PROJECT_KEY (example: DEV)
10. PORT (example: 3000)

## 5. GitHub Webhook Setup
In your GitHub repository:

1. Go to Settings -> Webhooks -> Add webhook
2. Payload URL -> your public endpoint (example: https://your-api.com/webhook/github)
3. Content type -> application/json
4. Secret -> same value as GITHUB_WEBHOOK_SECRET
5. Events -> Workflow runs
6. Active -> enabled

Backend filter rule:

1. action must be completed
2. workflow_run.conclusion must be failure
3. Ignore success, cancelled, skipped

## 6. AI Prompt Strategy
Use a concise structured prompt and require exact output sections:

1. Root cause
2. Evidence from logs
3. Immediate fix steps
4. Preventive fix
5. Confidence (low, medium, high)

Prompt quality rules:

1. Keep response actionable and short
2. Avoid vague wording
3. State missing context if logs are incomplete
4. Prioritize concrete commands/config changes

## 7. Slack Message Format
Message should contain:

1. Repository and branch
2. Workflow name and run URL
3. Root cause summary
4. Top fix steps
5. Jira issue URL

## 8. Jira Issue Format
Create issue with:

1. Summary: CI failure in <repo> - <workflow>
2. Description:
- Workflow run URL
- Failure excerpt
- AI root cause
- Suggested fix
- Preventive action
3. Labels: ci-failure, auto-generated
4. Priority: mapped from severity/confidence

## 9. Error Handling (MVP)
Minimum reliability controls:

1. Retry external calls up to 2 times
2. If Slack fails, still create Jira
3. If Jira fails, still keep Slack success
4. Log all errors with request correlation id
5. Return HTTP 202 quickly from webhook

## 10. Security Baseline
Must-have controls:

1. Verify GitHub webhook signature (HMAC SHA-256)
2. Do not log secrets/tokens
3. Use least-privilege GitHub/Jira tokens
4. Keep all secrets in deployment env settings
5. Rotate tokens periodically

## 11. End-to-End Test Plan
Use a deliberate CI failure:

1. Add an intentional failing step in GitHub Actions
2. Push code to trigger workflow
3. Confirm workflow fails
4. Confirm webhook endpoint receives event
5. Confirm logs are fetched
6. Confirm OpenAI analysis is generated
7. Confirm Slack message posted
8. Confirm Jira issue created
9. Re-run with same payload to validate dedup strategy later

## 12. CI/CD for This Service
For the analyzer service itself:

1. Run lint
2. Run tests
3. Build TypeScript
4. Deploy to Railway or Render
5. Configure secrets via platform variables

## 13. MVP Success Criteria
MVP is complete when:

1. Failed workflow triggers automated processing
2. Slack receives actionable summary
3. Jira issue is auto-created with useful details
4. No manual log analysis is needed for first response
5. End-to-end flow works in a real failure simulation

## 14. Next Improvements
After MVP:

1. Add Teams notification
2. Add idempotency to avoid duplicate tickets
3. Add Redis queue for higher load
4. Add trend/recurring failure analysis
5. Add ownership routing by repo/team
