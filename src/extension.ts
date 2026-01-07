import * as vscode from "vscode";
import * as fs from "fs";
import getDataVTEX, { hasVTEXToolbelt, hasVTEXSession } from "./data";

let workspaceStatusBarItem: vscode.StatusBarItem;
let accountStatusBarItem: vscode.StatusBarItem;
let fileWatcher: fs.FSWatcher | undefined;

function updateStatusBarItems() {
  const { login, account, currentWorkspace } = getDataVTEX();

  if (workspaceStatusBarItem) {
    workspaceStatusBarItem.text = `$(git-merge) ${currentWorkspace}`;
    workspaceStatusBarItem.tooltip = `VTEX Workspace: ${currentWorkspace}`;
    workspaceStatusBarItem.show();
  }

  if (accountStatusBarItem) {
    accountStatusBarItem.text = `$(account) ${account}`;
    accountStatusBarItem.tooltip = `VTEX User: ${login}`;
    accountStatusBarItem.show();
  }
}

let timeoutId: NodeJS.Timeout | undefined;
function debounceUpdate() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    updateStatusBarItems();
    timeoutId = undefined;
  }, 100);
}

export function activate(context: vscode.ExtensionContext) {
  if (hasVTEXToolbelt() && hasVTEXSession()) {
    workspaceStatusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      1001
    );
    accountStatusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      1002
    );

    const { sessionFolder } = getDataVTEX();

    updateStatusBarItems();

    try {
      fileWatcher = fs.watch(sessionFolder, (eventType, filename) => {
        if (
          filename === "workspace.json" ||
          filename === "session.json"
        ) {
          debounceUpdate();
        }
      });
    } catch (error) {
      console.error("Failed to start file watcher:", error);
    }

    context.subscriptions.push(workspaceStatusBarItem);
    context.subscriptions.push(accountStatusBarItem);
    context.subscriptions.push({
      dispose: () => {
        if (fileWatcher) {
          fileWatcher.close();
        }
      },
    });
  }
}

export function deactivate() {
  if (fileWatcher) {
    fileWatcher.close();
  }
}
