
# Devodoo

## Descripción

`Devodoo` es una extensión para Visual Studio Code que ayuda a los desarrolladores de Odoo a crear nuevos módulos, modelos y vistas rápidamente.

## Características

- Crear módulos de Odoo usando el comando `scaffold`.
- Crear modelos base, abstractos y transitorios.
- Crear vistas y plantillas.
- Actualización automática de los archivos `__init__.py` y `__manifest__.py`.
- Configuración del archivo `odoo-bin`.
- Compatible con entornos virtuales de Python.

## Requisitos Previos

Antes de usar esta extensión, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Instalación

1. **Clona el repositorio**:
   ```sh
   git clone https://github.com/tu-usuario/devodoo.git
   cd devodoo
   ```

2. **Instala las dependencias**:
   ```sh
   npm install
   ```

3. **Compila el proyecto**:
   ```sh
   npm run compile
   ```

4. **Instala `@vscode/vsce` globalmente**:
   ```sh
   npm install -g @vscode/vsce
   ```

## Empaquetar la Extensión

Para empaquetar la extensión y crear un archivo `.vsix` que puedas instalar en otras instancias de VS Code, sigue estos pasos:

1. **Empaqueta la extensión**:
   ```sh
   vsce package
   ```
   Esto generará un archivo `.vsix` en el directorio actual.

2. **Descarga el archivo `.vsix` empaquetado**:

   Puedes descargar la extensión empaquetada desde [este enlace](https://github.com/XDevCode/odoo_extension/raw/main/Extension.vsix).

## Instalar la Extensión Empaquetada

Puedes instalar la extensión empaquetada en VS Code de dos maneras:

### Usando la interfaz de usuario

1. Abre VS Code.
2. Ve a la sección de extensiones (`Ctrl+Shift+X` o `Cmd+Shift+X` en macOS).
3. Haz clic en el menú de tres puntos en la esquina superior derecha y selecciona "Instalar desde VSIX...".
4. Selecciona el archivo `.vsix` que descargaste anteriormente.

### Usando la línea de comandos

1. Abre una terminal y navega al directorio donde se encuentra el archivo `.vsix`.
2. Ejecuta el siguiente comando:
   ```sh
   code --install-extension devodoo-0.0.1.vsix
   ```

## Uso

1. Haz clic derecho en cualquier directorio en el explorador de archivos.
2. Selecciona Odoo en el menú contextual.
3. Elige una de las siguientes opciones:
   - Crear Módulo
   - Crear Modelo Base
   - Crear Modelo Abstracto
   - Crear Modelo Transitorio
   - Crear Vista
   - Crear Plantilla
4. Sigue las instrucciones en pantalla para completar la acción seleccionada.


## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
