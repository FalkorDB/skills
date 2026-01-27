import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skillsData } from "./skills-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectRoot, "..");

const renderSkill = (skill) => {
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

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

for (const skill of skillsData) {
  console.log(`Rendering ${skill.id} -> ${skill.videoPath}`);
  renderSkill(skill);
}
