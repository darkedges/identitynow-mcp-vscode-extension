import path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.error('IdentityNow MCP extension is now active!');
  const config = vscode.workspace.getConfiguration('identityNowMCP');
  const extensionPath = vscode.extensions.getExtension('darkedges.identitynow_provider')?.extensionUri.fsPath || '';
  const didChangeEmitter = new vscode.EventEmitter<void>();
  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('darkedges.identitynow_provider', {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: async () => {
      let servers: vscode.McpServerDefinition[] = [];
      servers.push(new vscode.McpStdioServerDefinition(
        'IdentityNow',
        'node',
        [
          path.join(extensionPath, '..', 'out', 'mcp.js')
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

      if (config.get('baseUrl', '') !== '' || config.get('clientId', '') !== '' || config.get('clientSecret', '') !== '') {
        vscode.window.showErrorMessage('Please configure the IdentityNow MCP extension with your SailPoint IdentityNow Base URL, Client ID, and Client Secret.');
        return undefined;
      }
      vscode.window.showErrorMessage('Please configure the IdentityNow MCP extension with your SailPoint IdentityNow Base URL, Client ID, and Client Secret.');

      // Return undefined to indicate that the server should not be started or throw an error
      // If there is a pending tool call, the editor will cancel it and return an error message
      // to the language model.
      return server;
    }
  }));
}

// This method is called when your extension is deactivated
export function deactivate() { }
