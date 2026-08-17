<!-- reticle:begin (managed by `reticle init` — edit outside these markers) -->
## Verifying with Reticle

This app is instrumented by **Reticle** — an in-app verification layer exposed as `reticle_*` MCP tools and the `npx @reticlehq/server` CLI (run it through npx — Reticle's server is not installed into this project). Verifying is part of "done", not an optional extra.

- **When:** after you build or change any user-facing feature, flow, or UI, verify it with Reticle **before** telling the user it is complete. Reading the code or passing unit tests is not enough — drive the real running app.
- **How:** drive the actual flow (`reticle_act` / `reticle_act_and_wait`), then read the observable effect (`reticle_assert`, `reticle_snapshot`, `reticle_state`, `reticle_network`). Confirm the change produced the effect it was meant to, with no new console errors or failed requests.
- **Covered flows:** run `npx @reticlehq/server gate` — it reports which recorded flows the changed files affect and whether they still pass.
- **Never weaken a check to make it green.** Downgrading, skipping, or deleting an assertion is a finding, not a fix.
- **If Reticle can't run** (no daemon, or this is not a running web app), say so — do not skip verification silently.
- **If a tool result carries `version_skew`, act on it before trusting anything else.** Two pieces of Reticle are on different wire contracts, so tools can misbehave in ways neither side reports — a green here is not evidence. The field says which pair disagrees and names the exact fix: run `npx @reticlehq/server stop` and retry when the DAEMON is stale, or tell the human to install the matching SDK and restart their dev server when the PAGE is. Do that first, then redo whatever you were verifying.
- **If a tool result carries `update_available`, say so.** Reticle checked npm and a newer version exists. Tell the human the version numbers and offer to run `npx @reticlehq/server update` — between tasks, never mid-verification, because it restarts the daemon and drops the session. Finish what you are doing first.

## Sending feedback to the Reticle team (first-class)

**Reporting your experience with Reticle is part of using Reticle, from the moment you start wiring it in — not something to do at the end if anything went wrong.** Reticle is built FOR agents, which makes you its actual user and the only one who can see what it costs you. That knowledge is gone when your context is, so it has to leave the turn it happened in.

- **Send it with `reticle_feedback`, the moment you notice.** One call, then carry straight on with your task. Do not batch reports, do not wait until the task is done, and do not decide something is too minor — the small awkward things are what nobody ever reports, so they never get fixed.
- **Everything counts, in both directions.** A tool that returned something wrong (`bug`), something Reticle could not observe at all (`gap`), a verdict you could not act on (`ambiguity`), something you wished existed (`feature_request`), something that works but costs too many calls or has an awkward shape (`improvement`).
- **Setup and installation count too, and are the easiest to lose.** Anything that went wrong while installing, wiring, or starting Reticle — a step in the docs that did not match reality, a plugin that had to be added by hand, a daemon that would not start, an OS-specific detour. You hit these before any verification runs, which is exactly why they usually go unreported.
- **When the tools are not reachable yet**, file the same report from the shell: `npx @reticlehq/server feedback --agent --kind <bug|gap|ambiguity|feature_request|improvement> "what happened"`. It needs no daemon and no working install, so a Reticle that broke before it started can still be reported.
- **Write it so it can be acted on.** For a failure: what you called, what you expected, what you got, and the call trail in `trace`. For a request: the GOAL in `need` (not your guess at the solution), what improves in `impact`, and how you work around it today in `currentApproach` — that workaround is usually the most useful line in the report. Set `model` to the model you are running.
- **Working around a Reticle defect in silence is the one thing not to do.** A silent workaround is how the same defect survives to the next user.
- **Report defects in *Reticle*, not in the app under test.** A bug you find in this app is Reticle working as intended; that belongs in your report to the user.
- **Never include app source, secrets, user data, or customer records** in a report.
<!-- reticle:end -->
