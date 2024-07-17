import * as vscode from 'vscode';

export let odooStatusBarItem: vscode.StatusBarItem;

export function createStatusBarItem(context: vscode.ExtensionContext) {
  // Crear un nuevo item de la barra de estado
  odooStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  odooStatusBarItem.command = 'devodoo.toggleOdooProject';
  context.subscriptions.push(odooStatusBarItem);

  // Registrar el comando para alternar el estado del proyecto Odoo
  const toggleOdooProjectCommand = vscode.commands.registerCommand('devodoo.toggleOdooProject', () => {
    toggleOdooProject();
  });
  context.subscriptions.push(toggleOdooProjectCommand);

  // Inicializar el item de la barra de estado
  updateOdooStatusBar(false);
}

function toggleOdooProject() {
  const isOdooEnabled = odooStatusBarItem.text.includes('$(check)');
  updateOdooStatusBar(!isOdooEnabled);
}

function updateOdooStatusBar(enabled: boolean) {
  if (enabled) {
    odooStatusBarItem.text = `$(check) Odoo`;
    odooStatusBarItem.color = '#68AD79'; // Verde para el texto
    odooStatusBarItem.tooltip = 'Inhabilitar modo Odoo';
  } else {
    odooStatusBarItem.text = `$(circle-slash) Odoo`;
    odooStatusBarItem.color = '#E5C07B'; // Amarillo para el texto
    odooStatusBarItem.tooltip = 'Habilitar modo Odoo';
  }
  odooStatusBarItem.show();
}
