import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { getPythonDir, getOdooBinPath, createModelFile, updateInitFile } from './utils';

export function registerCommands(context: vscode.ExtensionContext) {
  let disposableCreateOdooModule = vscode.commands.registerCommand('devodoo.createOdooModule', async (uri: vscode.Uri) => {
    const moduleName = await vscode.window.showInputBox({ prompt: 'Enter Module Name' });
    const pythonDir = await getPythonDir();
    const odooBinPath = await getOdooBinPath();
    const addonsPath = uri.fsPath;

    if (moduleName && pythonDir && odooBinPath) {
      const command = `"${pythonDir}/python" "${odooBinPath}" scaffold ${moduleName} "${addonsPath}"`;
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

  let disposableCreateBaseModel = vscode.commands.registerCommand('devodoo.createBaseModel', async (uri: vscode.Uri) => {
    const modelName = await vscode.window.showInputBox({ prompt: 'Enter Base Model Name' });
    if (modelName) {
      await createModelFile(uri, modelName, 'base');
    } else {
      vscode.window.showErrorMessage('Model name is missing!');
    }
  });

  let disposableCreateAbstractModel = vscode.commands.registerCommand('devodoo.createAbstractModel', async (uri: vscode.Uri) => {
    const modelName = await vscode.window.showInputBox({ prompt: 'Enter Abstract Model Name' });
    if (modelName) {
      await createModelFile(uri, modelName, 'abstract');
    } else {
      vscode.window.showErrorMessage('Model name is missing!');
    }
  });

  let disposableCreateTransientModel = vscode.commands.registerCommand('devodoo.createTransientModel', async (uri: vscode.Uri) => {
    const modelName = await vscode.window.showInputBox({ prompt: 'Enter Transient Model Name' });
    if (modelName) {
      await createModelFile(uri, modelName, 'transient');
    } else {
      vscode.window.showErrorMessage('Model name is missing!');
    }
  });

  let disposableCreateView = vscode.commands.registerCommand('devodoo.createView', async (uri: vscode.Uri) => {
    const viewName = await vscode.window.showInputBox({ prompt: 'Enter View Name' });
    if (viewName) {
      await createViewFile(uri, viewName, 'view');
    } else {
      vscode.window.showErrorMessage('View name is missing!');
    }
  });

  let disposableCreateTemplate = vscode.commands.registerCommand('devodoo.createTemplate', async (uri: vscode.Uri) => {
    const templateName = await vscode.window.showInputBox({ prompt: 'Enter Template Name' });
    if (templateName) {
      await createViewFile(uri, templateName, 'template');
    } else {
      vscode.window.showErrorMessage('Template name is missing!');
    }
  });

  context.subscriptions.push(disposableCreateOdooModule);
  context.subscriptions.push(disposableCreateBaseModel);
  context.subscriptions.push(disposableCreateAbstractModel);
  context.subscriptions.push(disposableCreateTransientModel);
  context.subscriptions.push(disposableCreateView);
  context.subscriptions.push(disposableCreateTemplate);
}

async function createViewFile(uri: vscode.Uri, viewName: string, type: 'view' | 'template') {
  let viewTemplate: string;
  if (type === 'view') {
    viewTemplate = `
<odoo>
  <data>
    <!-- explicit list view definition -->
    <!--
    <record model="ir.ui.view" id="${viewName}.list">
      <field name="name">${viewName} list</field>
      <field name="model">your.model</field>
      <field name="arch" type="xml">
        <tree>
          <field name="name"/>
          <field name="value"/>
          <field name="value2"/>
        </tree>
      </field>
    </record>

    <!-- actions opening views on models -->
    <record model="ir.actions.act_window" id="${viewName}.action_window">
      <field name="name">${viewName} window</field>
      <field name="res_model">your.model</field>
      <field name="view_mode">tree,form</field>
    </record>

    <!-- server action to the one above -->
    <record model="ir.actions.server" id="${viewName}.action_server">
      <field name="name">${viewName} server</field>
      <field name="model_id" ref="model_your_model"/>
      <field name="state">code</field>
      <field name="code">
        action = {
          "type": "ir.actions.act_window",
          "view_mode": "tree,form",
          "res_model": model._name,
        }
      </field>
    </record>

    <!-- Top menu item -->
    <menuitem name="${viewName}" id="${viewName}.menu_root"/>

    <!-- menu categories -->
    <menuitem name="Menu 1" id="${viewName}.menu_1" parent="${viewName}.menu_root"/>
    <menuitem name="Menu 2" id="${viewName}.menu_2" parent="${viewName}.menu_root"/>

    <!-- actions -->
    <menuitem name="List" id="${viewName}.menu_1_list" parent="${viewName}.menu_1"
              action="${viewName}.action_window"/>
    <menuitem name="Server to list" id="${viewName}" parent="${viewName}.menu_2"
              action="${viewName}.action_server"/>
-->
  </data>
</odoo>`;
  } else {
    viewTemplate = `
<odoo>
  <data>
    <!--
    <template id="${viewName}_listing">
      <ul>
        <li t-foreach="objects" t-as="object">
          <a t-attf-href="#{ root }/objects/#{ object.id }">
            <t t-esc="object.display_name"/>
          </a>
        </li>
      </ul>
    </template>
    <template id="${viewName}_object">
      <h1><t t-esc="object.display_name"/></h1>
      <dl>
        <t t-foreach="object._fields" t-as="field">
          <dt><t t-esc="field"/></dt>
          <dd><t t-esc="object[field]"/></dd>
        </t>
      </dl>
    </template>
-->
  </data>
</odoo>`;
  }

  const filePath = path.join(uri.fsPath, `${viewName}.xml`);
  fs.writeFile(filePath, viewTemplate, (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Error creating ${type}: ${err.message}`);
    } else {
      vscode.window.showInformationMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} created: ${filePath}`);
      updateManifestFile(uri.fsPath, `views/${viewName}.xml`);
    }
  });
}

function updateManifestFile(viewPath: string, newViewPath: string) {
  const manifestPath = path.resolve(viewPath, '..', '__manifest__.py');
  fs.readFile(manifestPath, 'utf8', (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(`Error reading __manifest__.py: ${err.message}`);
      return;
    }

    // Encuentra la sección 'data' en el archivo __manifest__.py
    const dataSectionStart = data.indexOf("'data': [");
    if (dataSectionStart === -1) {
      vscode.window.showErrorMessage("No se encontró la sección 'data' en __manifest__.py");
      return;
    }

    const dataSectionEnd = data.indexOf(']', dataSectionStart);
    if (dataSectionEnd === -1) {
      vscode.window.showErrorMessage("La sección 'data' en __manifest__.py no está bien formada");
      return;
    }

    // Extrae y actualiza la sección 'data'
    const beforeDataSection = data.substring(0, dataSectionStart + 9);
    const dataSection = data.substring(dataSectionStart + 9, dataSectionEnd).trim();
    const afterDataSection = data.substring(dataSectionEnd);

    let dataEntries = dataSection.split('\n').map(line => line.trim().replace(/,$/, '').replace(/'/g, ''));
    if (!dataEntries.includes(`views/${newViewPath}`)) {
      dataEntries.push(`views/${newViewPath}`);
    }

    // Asegúrate de que 'views/views.xml' esté siempre al principio
    dataEntries = dataEntries.filter(entry => entry && entry !== "views/views.xml");
    dataEntries.unshift("views/views.xml");

    const updatedDataSection = dataEntries.map(entry => `'${entry}'`).join(',\n    ') + ',';

    // Reemplaza la sección 'data' en el archivo original
    const updatedManifest = beforeDataSection +
      '\n    ' + updatedDataSection +
      '\n  ' + afterDataSection;

    fs.writeFile(manifestPath, updatedManifest, (err) => {
      if (err) {
        vscode.window.showErrorMessage(`Error updating __manifest__.py: ${err.message}`);
      } else {
        vscode.window.showInformationMessage(`__manifest__.py updated with new view: ${newViewPath}`);
      }
    });
  });
}
