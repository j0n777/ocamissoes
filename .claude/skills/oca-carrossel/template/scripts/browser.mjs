// Launches Chromium: $CHROMIUM if set, then Playwright's own browser, then a
// preinstalled one in /opt/pw-browsers (cloud sandboxes). If none works, run
// `npx playwright install chromium`.
import { existsSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

export async function launch() {
  const tries = [];
  if (process.env.CHROMIUM) tries.push(process.env.CHROMIUM);
  tries.push(undefined);
  if (existsSync("/opt/pw-browsers")) {
    tries.push("/opt/pw-browsers/chromium");
    for (const d of readdirSync("/opt/pw-browsers")) {
      for (const bin of ["chrome-linux/chrome", "chrome-linux64/chrome"]) {
        if (existsSync(`/opt/pw-browsers/${d}/${bin}`)) tries.push(`/opt/pw-browsers/${d}/${bin}`);
      }
    }
  }
  let last;
  for (const executablePath of tries) {
    try {
      return await chromium.launch(executablePath ? { executablePath } : {});
    } catch (e) {
      last = e;
    }
  }
  throw new Error(`No Chromium found. Run: npx playwright install chromium\n${last?.message ?? ""}`);
}
