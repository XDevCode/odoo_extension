import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "devodoo" is now active!');

  // Función para obtener o solicitar la ruta del directorio de Python
  async function getPythonDir(): Promise<string | undefined> {
    let pythonDir = vscode.workspace.getConfiguration().get<string>('odoo.pythonPath');
    if (!pythonDir) {
      pythonDir = await vscode.window.showInputBox({ prompt: 'Enter the directory of the Python environment' });
      if (pythonDir) {
        await vscode.workspace.getConfiguration().update('odoo.pythonPath', pythonDir, vscode.ConfigurationTarget.Global);
      }
    }
    return pythonDir;
  }

  // Función para obtener o solicitar la ruta de odoo-bin
  async function getOdooBinPath(): Promise<string | undefined> {
    let odooBinPath = vscode.workspace.getConfiguration().get<string>('odoo.odooBinPath');
    if (!odooBinPath) {
      odooBinPath = await vscode.window.showInputBox({ prompt: 'Enter the odoo-bin path' });
      if (odooBinPath) {
        await vscode.workspace.getConfiguration().update('odoo.odooBinPath', odooBinPath, vscode.ConfigurationTarget.Global);
      }
    }
    return odooBinPath;
  }

  // Comando para crear un módulo Odoo
  let disposableCreateOdooModule = vscode.commands.registerCommand('extension.createOdooModule', async (uri: vscode.Uri) => {
    const moduleName = await vscode.window.showInputBox({ prompt: 'Enter Module Name' });
    const pythonDir = await getPythonDir();
    const odooBinPath = await getOdooBinPath();
    const addonsPath = uri.fsPath;

    if (moduleName && pythonDir && odooBinPath) {
      const command = `${pythonDir}/python ${odooBinPath} scaffold ${moduleName} ${addonsPath}`;
      console.log(`Executing command: ${command}`);
      cp.exec(command, (err, stdout, stderr) => {
        if (err) {
          vscode.window.showErrorMessage(`Error creating module: ${stderr}`);
          console.error(`Error: ${stderr}`);
        } else {
          vscode.window.showInformationMessage(`Module created: ${stdout}`);
          console.log(`Output: ${stdout}`);
        }
      });
    } else {
      if (!moduleName) {
        vscode.window.showErrorMessage('Module name is missing!');
      }
      if (!pythonDir) {
        vscode.window.showErrorMessage('Python directory is missing!');
      }
      if (!odooBinPath) {
        vscode.window.showErrorMessage('Odoo-bin path is missing!');
      }
      console.error('Module name, Python directory, or odoo-bin path is missing!');
    }
  });

  context.subscriptions.push(disposableCreateOdooModule);
}

export function deactivate() {}
