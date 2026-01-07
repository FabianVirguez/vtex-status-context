import * as fs from "fs";
import { join } from "path";
import { homedir } from "os";

const VTEX_FOLDER = join(homedir(), ".vtex");
const SESSION_FOLDER = join(VTEX_FOLDER, "session");
const SESSION_PATH = join(SESSION_FOLDER, "session.json");
const WORKSPACE_PATH = join(SESSION_FOLDER, "workspace.json");

export interface VTEXData {
  login: string;
  account: string;
  currentWorkspace: string;
  sessionFolder: string;
}

export default function getDataVTEX(): VTEXData {
  let account = "Disconnected";
  let login = "Account";
  let currentWorkspace = "Disconnected";

  try {
    if (fs.existsSync(SESSION_PATH)) {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, "utf8"));
      account = sessionData.account || "Disconnected";
      login = sessionData.login || "Account";
    }
  } catch (error) {
    console.error("Error reading VTEX session:", error);
  }

  try {
    if (fs.existsSync(WORKSPACE_PATH)) {
      const workspaceData = JSON.parse(fs.readFileSync(WORKSPACE_PATH, "utf8"));
      currentWorkspace = workspaceData.currentWorkspace || "Disconnected";
    }
  } catch (error) {
    console.error("Error reading VTEX workspace:", error);
  }

  return {
    login,
    account,
    currentWorkspace,
    sessionFolder: SESSION_FOLDER,
  };
}

export { SESSION_FOLDER };

export function hasVTEXToolbelt(): boolean {
  return fs.existsSync(VTEX_FOLDER);
}

export function hasVTEXSession(): boolean {
  return fs.existsSync(SESSION_FOLDER);
}
