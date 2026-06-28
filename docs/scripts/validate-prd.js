const fs = require("fs");

const required = [
  "CONSTITUTION.md",
  "AGENTS.md",
  "ENGINEERING_GUIDE.md",
  "product/VISION.md",
  "product/PROBLEM.md",
  "product/LEARNING_LOOP.md",
  "architecture/ARCHITECTURE.md",
  "architecture/DOMAIN_MODEL.md",
  "testing/TESTING_STRATEGY.md",
  "sprints/CURRENT_SPRINT.md",
  "prompts/IMPLEMENT_NOW.md"
];

const missing = required.filter((file) => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing required files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log("Executable Feynman Learning OS PRD is valid.");
