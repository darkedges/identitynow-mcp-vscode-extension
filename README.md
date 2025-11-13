# IdentityNow MCP for Visual Studio Code

A Visual Studio Code extension that provides a Model Context Protocol (MCP) server for SailPoint IdentityNow. This extension enables AI assistants and other MCP clients to interact with your IdentityNow tenant to perform identity and access management queries.

## Overview

The IdentityNow MCP extension bridges the gap between AI assistants and SailPoint IdentityNow, allowing you to perform identity governance tasks through natural language queries. Built using the official SailPoint TypeScript SDK, this extension provides secure, type-safe access to your IdentityNow tenant.

## Features

### Identity Management

- **Search Identities**: Find users by name, email, or other attributes
- **Get Identity Details**: Retrieve comprehensive identity information including accounts, access profiles, and roles
- **Identity Analysis**: Analyze an identity's access patterns and relationships

### Access Management

- **Search Access Profiles**: Find access profiles by name or description
- **Search Roles**: Locate roles within your IdentityNow tenant
- **Get Identity Access**: Retrieve all access profiles and roles assigned to an identity

### Account Management

- **Search Accounts**: Find accounts across all connected sources
- **Get Identity Accounts**: Retrieve all accounts associated with a specific identity
- **Find Orphaned Accounts**: Identify accounts without associated identities

### Entitlement Management

- **Search Entitlements**: Find entitlements across sources
- **Get Entitlement Details**: Retrieve specific entitlement information
- **Search by Source**: Find entitlements for a specific source system

### Governance & Auditing

- **Search Identity Events**: Find lifecycle events for identities
- **Search Audit Events**: Retrieve audit trail information
- **Audit User Access**: Comprehensive access review for specific users

### Impact Analysis

- **Analyze Attribute Impact**: Analyze access changes resulting from source attribute value changes
  - Identify roles to be revoked when an attribute changes
  - Identify roles to be granted with the new attribute value
  - Get comprehensive impact summary with access profile and entitlement details
  - Perfect for pre-change analysis, compliance validation, and access certification

### Identity Profiles

- **Get Identity Profiles**: List all identity profiles in your tenant
- **Get Profile Details**: Retrieve specific identity profile configuration
- **Extract Attribute Mappings**: Analyze identity profile attribute mappings

## Architecture

This extension features a clean, modular architecture:

```text
src/
├── extension.ts           # VS Code extension entry point
├── mcp.ts                # MCP server implementation
├── types/
│   └── index.ts          # TypeScript interfaces for IdentityNow entities
└── library/
    └── identitynow.ts    # IdentityNow API functions and utilities
```

- **Types Module**: Centralized TypeScript interfaces for all IdentityNow entities
- **Library Module**: Standalone, testable functions for IdentityNow API interactions
- **MCP Server**: Protocol-specific handlers that utilize the library functions

## Requirements

- Visual Studio Code 1.104.0 or later
- Valid SailPoint IdentityNow tenant access
- IdentityNow API credentials (Client ID and Client Secret)

## Installation

1. Install the extension from the VS Code Marketplace
2. Configure your IdentityNow credentials (see Configuration section)
3. The MCP server will automatically start when VS Code loads

## Configuration

This extension contributes the following settings:

- **`identityNowMCP.baseUrl`**: IdentityNow tenant API URL (default: `https://sailpoint.api.identitynow.com`)
- **`identityNowMCP.clientId`**: Your IdentityNow Client ID
- **`identityNowMCP.clientSecret`**: Your IdentityNow Client Secret

### Authentication Setup

1. In your IdentityNow tenant, create a new API client:
   - Navigate to Admin → API Management → API Clients
   - Click "Create API Client"
   - Grant appropriate scopes for read access
2. Copy the Client ID and Client Secret to the extension settings

Alternatively, you can set environment variables:

- `SAILPOINT_BASE_URL`
- `SAILPOINT_CLIENT_ID`
- `SAILPOINT_CLIENT_SECRET`

## Usage with AI Assistants

Once configured, AI assistants with MCP support can interact with your IdentityNow tenant. Example queries:

- "Find all identities with admin in their name"
- "Show me the access profiles for user john.doe"
- "What accounts does jane.smith have?"
- "Find all roles related to finance"
- "Audit access for the identity ID 2c9180..."

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/darkedges/identitynow-mcp-vscode-extension.git
cd identitynow-mcp-vscode-extension

# Install dependencies
npm install

# Build the extension
npm run compile

# Watch for changes during development
npm run watch
```

### Testing

The modular architecture enables independent testing of IdentityNow functions:

```typescript
import * as IdentityNow from './library/identitynow.js';

// Test individual functions without MCP overhead
const identities = await IdentityNow.searchIdentities('test query');
```

## Security

- All API communications use HTTPS
- Credentials are stored securely in VS Code settings
- The extension uses the official SailPoint TypeScript SDK for authentication
- No sensitive data is logged or stored locally

## Impact Analysis Tool

The Impact Analysis Tool helps you understand the access implications before making changes to identity attributes. This is particularly useful for:

- **Pre-change analysis**: See what access will be added/removed before making the change
- **Compliance validation**: Ensure changes comply with segregation of duties and other policies
- **Access certification**: Validate that access levels match role expectations
- **Risk assessment**: Identify potentially problematic access changes

### Using the Impact Analysis Tool

Ask Claude (or your AI assistant):

```console
"Analyze the access impact for [identity_name] (ID: [identity_id]) 
when their [attribute] changes from '[old_value]' to '[new_value]' 
in [source_system]."
```

The tool will return a detailed analysis including:

- All roles that match the old attribute value (to be revoked)
- All roles that match the new attribute value (to be granted)
- Associated access profiles for each role
- Associated entitlements from each access profile
- Summary statistics of the changes

### Example Scenarios

#### Department Change

```console
"Analyze access impact for John Smith moving from Sales to Engineering department"
```

#### Promotion

```console
"What access changes when Sarah Chen is promoted from Coordinator to Manager?"
```

#### Relocation

```console
"Show access changes if Jane Doe relocates from New York to San Francisco"
```

For detailed examples and use cases, see [docs/IMPACT_ANALYSIS_EXAMPLES.md](IMPACT_ANALYSIS_EXAMPLES.md).

For complete technical documentation, see [docs/IMPACT_ANALYSIS.md](IMPACT_ANALYSIS.md).

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/darkedges/identitynow-mcp-vscode-extension).

## Release Notes

### 0.0.4 (Current)

- Refactored to use official SailPoint TypeScript SDK
- Improved modular architecture with separate types and library modules
- Enhanced error handling and type safety
- Added comprehensive MCP tool set for identity governance
- Improved authentication using environment variables or VS Code settings

### 0.0.3

- Added support for entitlement management
- Enhanced search capabilities across multiple entity types
- Improved error handling and logging

### 0.0.2

- Added access profile and role management features
- Enhanced identity search functionality
- Improved documentation and examples

### 0.0.1

- Initial release with basic identity search functionality
