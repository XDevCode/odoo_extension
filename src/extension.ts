import * as vscode from 'vscode';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "devodoo" is now active!');
  registerCommands(context);
}

export function deactivate() {}
