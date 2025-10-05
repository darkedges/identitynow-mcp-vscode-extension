import path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('identityNowMCP');
  const extensionPath = context.extensionUri.fsPath;

  const didChangeEmitter = new vscode.EventEmitter<void>();
  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('darkedges.identitynow-mcp', {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: async () => {
      let servers: vscode.McpServerDefinition[] = [];
      servers.push(new vscode.McpStdioServerDefinition(
        'IdentityNow MCP',
        'node',
        [
          path.join(extensionPath, 'out', 'mcp.js')
        ],
        {
          SAILPOINT_BASE_URL: config.get('baseUrl', ''),
          SAILPOINT_CLIENT_ID: config.get('clientId', ''),
          SAILPOINT_CLIENT_SECRET: config.get('clientSecret', '')
        },
        '1.0.1'
      ));

      return servers;
    },
    resolveMcpServerDefinition: async (server: vscode.McpServerDefinition) => {
      const configError = [];
      if (config.get('baseUrl', '') === '') {
        configError.push('Base URL');
      }
      if (config.get('clientId', '') === '') {
        configError.push('Client ID');
      }
      if (config.get('clientSecret', '') === '') {
        configError.push('Client Secret');
      }

      if (configError.length > 0) {
        vscode.window.showErrorMessage(`Please configure the IdentityNow MCP extension with your SailPoint IdentityNow ${configError.join(', ')}.`);
        return undefined;
      }

      // Return undefined to indicate that the server should not be started or throw an error
      // If there is a pending tool call, the editor will cancel it and return an error message
      // to the language model.
      return server;
    }
  }));
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.error('IdentityNow MCP extension is now deactivated!');
}
