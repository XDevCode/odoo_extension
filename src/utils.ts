import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function getPythonDir(): Promise<string | undefined> {
  let pythonDir = vscode.workspace.getConfiguration().get<string>('odoo.pythonPath');
  if (!pythonDir) {
    pythonDir = await vscode.window.showInputBox({ prompt: 'Enter the directory of the Python environment' });
    if (pythonDir) {
      await vscode.workspace.getConfiguration().update('odoo.pythonPath', pythonDir, vscode.ConfigurationTarget.Global);
    }
  }
  return pythonDir;
}

export async function getOdooBinPath(): Promise<string | undefined> {
  let odooBinPath = vscode.workspace.getConfiguration().get<string>('odoo.odooBinPath');
  if (!odooBinPath) {
    odooBinPath = await vscode.window.showInputBox({ prompt: 'Enter the odoo-bin path' });
    if (odooBinPath) {
      await vscode.workspace.getConfiguration().update('odoo.odooBinPath', odooBinPath, vscode.ConfigurationTarget.Global);
    }
  }
  return odooBinPath;
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
