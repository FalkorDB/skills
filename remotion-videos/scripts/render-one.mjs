import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skillsData } from "./skills-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectRoot, "..");

const skillId = process.argv[2];
if (!skillId) {
  console.error("Usage: npm run render:one -- <composition-id>");
  process.exit(1);
}

const skill = skillsData.find((item) => item.id === skillId);
if (!skill) {
  console.error(`Unknown composition id: ${skillId}`);
  process.exit(1);
}

const outputPath = path.resolve(repoRoot, skill.videoPath);
const outputDir = path.dirname(outputPath);
mkdirSync(outputDir, { recursive: true });

const result = spawnSync(
  "npx",
  [
    "remotion",
    "render",
    path.join(projectRoot, "src/index.ts"),
    skill.id,
    outputPath,
    "--overwrite",
  ],
  {
    stdio: "inherit",
    cwd: projectRoot,
  }
);

process.exit(result.status ?? 1);
