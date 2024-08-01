import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

async function getPath(configKey: string, dialogOptions: vscode.OpenDialogOptions): Promise<string | undefined> {
  let fullPath = vscode.workspace.getConfiguration().get<string>(configKey);
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (fullPath && workspaceFolder) {
    return path.relative(workspaceFolder, fullPath);
  } else {
    const uri = await vscode.window.showOpenDialog(dialogOptions);

    if (uri && uri[0] && workspaceFolder) {
      fullPath = uri[0].fsPath;
      await vscode.workspace.getConfiguration().update(configKey, fullPath, vscode.ConfigurationTarget.Global);
      return path.relative(workspaceFolder, fullPath);
    }
  }
  return undefined;
}

export async function getConfigPath(): Promise<string | undefined> {
  const dialogOptions: vscode.OpenDialogOptions = {
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: 'Select Odoo Config File'
  };
  return getPath('odoo.configPath', dialogOptions);
}

export async function getPythonDir(): Promise<string | undefined> {
  const dialogOptions: vscode.OpenDialogOptions = {
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select Python Directory'
  };
  return getPath('odoo.pythonPath', dialogOptions);
}

export async function getOdooBinPath(): Promise<string | undefined> {
  const dialogOptions: vscode.OpenDialogOptions = {
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: 'Select Odoo Bin File'
  };
  return getPath('odoo.odooBinPath', dialogOptions);
}

export async function getModules(): Promise<string[]> {
  const configPath = await getConfigPath();
  const odooBin    = await getOdooBinPath();
  if (!configPath) {
    vscode.window.showErrorMessage('Config path is missing!');
    return [];
  }

  if (!odooBin ) {
    vscode.window.showErrorMessage('odoo-bin path is missing!');
    return [];
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Workspace folder is missing!');
    return [];
  }

  const odooBin_  = path.join(workspaceFolder, odooBin);


  const fullConfigPath = path.join(workspaceFolder, configPath);
  const configContent = fs.readFileSync(fullConfigPath, 'utf-8');
  const addonsPaths = configContent.match(/addons_path\s*=\s*([^\n]*)/);
  if (!addonsPaths) {
    vscode.window.showErrorMessage('Addons path is not specified in the config file!');
    return [];
  }

  const addonsDirectories = addonsPaths[1].split(',').map(dir => dir.trim());
  const modules: string[] = [];

  for (const dir of addonsDirectories) {
    const fullPath = path.resolve(path.dirname(odooBin_), dir);
    if (fs.existsSync(fullPath)) {
      const dirModules = fs.readdirSync(fullPath).filter(file => fs.statSync(path.join(fullPath, file)).isDirectory());
      modules.push(...dirModules);
    }
  }

  return modules;
}



export async function createModelFile(uri: vscode.Uri, modelName: string, modelType: 'base' | 'abstract' | 'transient') {
  const modelTemplates: { [key: string]: string } = {
    base: `from odoo import models, fields

class ${modelName}(models.Model):
  _name = '${modelName}'
  _description = '${modelName}'

  name = fields.Char(string="Name")`,
    abstract: `from odoo import models, fields

class ${modelName}(models.AbstractModel):
  _name = '${modelName}'
  _description = '${modelName}'

  name = fields.Char(string="Name")`,
    transient: `from odoo import models, fields

class ${modelName}(models.TransientModel):
  _name = '${modelName}'
  _description = '${modelName}'

  name = fields.Char(string="Name")`
  };

  const template = modelTemplates[modelType];
  const filePath = path.join(uri.fsPath, `${modelName}.py`);
  const initPath = path.join(uri.fsPath, `__init__.py`);

  // Crear el archivo del modelo
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Error creating ${modelType} model: ${err.message}`);
    } else {
      vscode.window.showInformationMessage(`${modelType.charAt(0).toUpperCase() + modelType.slice(1)} model created: ${filePath}`);
      // Actualizar __init__.py
      updateInitFile(initPath, modelName);
    }
  });
}

export function updateInitFile(initPath: string, modelName: string) {
  fs.readFile(initPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Si __init__.py no existe, crearlo y añadir la importación
        fs.writeFile(initPath, `from . import ${modelName}\n`, (err) => {
          if (err) {
            vscode.window.showErrorMessage(`Error creating __init__.py: ${err.message}`);
          }
        });
      } else {
        vscode.window.showErrorMessage(`Error reading __init__.py: ${err.message}`);
      }
      return;
    }

    // Verificar si el modelo ya está importado
    const importStatement = `from . import ${modelName}`;
    if (!data.includes(importStatement)) {
      // Añadir la importación si no existe
      const updatedData = `${data}\n${importStatement}\n`;
      fs.writeFile(initPath, updatedData, (err) => {
        if (err) {
          vscode.window.showErrorMessage(`Error updating __init__.py: ${err.message}`);
        }
      });
    }
  });
}
