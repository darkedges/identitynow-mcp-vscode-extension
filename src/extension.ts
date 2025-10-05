import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const didChangeEmitter = new vscode.EventEmitter<void>();

  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('darkedges.identitynow_provider', {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: async () => {
      let servers: vscode.McpServerDefinition[] = [];
      servers.push(new vscode.McpStdioServerDefinition(
        'IdentityNow',
        'node',
        ['mcp.js'],
        {
          SAILPOINT_BASE_URL: '',
          SAILPOINT_CLIENT_ID: '',
          SAILPOINT_CLIENT_SECRET: ''
        },
        '1.0.0'
      ));

      return servers;
    },
    resolveMcpServerDefinition: async (server: vscode.McpServerDefinition) => {

      if (server.label === 'IdentityNow Provider') {
        // Get the API key from the user, e.g. using vscode.window.showInputBox
        // Update the server definition with the API key
      }

      // Return undefined to indicate that the server should not be started or throw an error
      // If there is a pending tool call, the editor will cancel it and return an error message
      // to the language model.
      return server;
    }
  }));
}

// This method is called when your extension is deactivated
export function deactivate() {}
