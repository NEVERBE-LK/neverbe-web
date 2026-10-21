import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const failures = [];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(tsx?|css)$/.test(path)) {
      const source = await readFile(path, "utf8");
      if (/#[\da-f]{3,8}\b|rgba?\(\s*\d/i.test(source)) failures.push(path);
    }
  }
}
for (const dir of [
  "app",
  "components",
  "hooks",
  "utils",
  "constants",
  "config",
])
  await scan(dir);
if (failures.length) {
  console.error(
    "Move color literals into config/design-tokens.json:\n" +
      failures.join("\n"),
  );
  process.exitCode = 1;
} else console.log("All interface color literals are centralized.");
