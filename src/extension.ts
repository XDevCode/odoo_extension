import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { createStatusBarItem } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "devodoo" is now active!');

  // Crear el item de la barra de estado
  createStatusBarItem(context);

  // Registrar otros comandos
  registerCommands(context);
}

export function deactivate() {}
