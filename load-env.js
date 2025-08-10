// load-env.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load root .env first
const rootEnv = path.resolve(__dirname, ".env");
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}

// Load workspace-specific .env if present (overrides root)
const workspace = process.env.npm_config_workspace || process.env.WORKSPACE;
if (workspace) {
  const localEnv = path.resolve(__dirname, workspace, ".env");
  if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv, override: true });
  }
}
