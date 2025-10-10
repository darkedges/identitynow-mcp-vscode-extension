import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Declare fetch as global (available in Node.js 18+)
declare const fetch: typeof globalThis.fetch;

// SailPoint API Configuration
const SAILPOINT_BASE_URL = process.env.SAILPOINT_BASE_URL || "https://your-tenant.api.identitynow.com";
const SAILPOINT_CLIENT_ID = process.env.SAILPOINT_CLIENT_ID || "";
const SAILPOINT_CLIENT_SECRET = process.env.SAILPOINT_CLIENT_SECRET || "";

console.error("Using SailPoint Base URL:", SAILPOINT_BASE_URL);
console.error("Using SailPoint Client Id:", SAILPOINT_CLIENT_ID);
console.error("Using SailPoint Client Secret:", SAILPOINT_CLIENT_SECRET);
interface Identity {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  manager?: {
    id: string;
    name: string;
  };
  department?: string;
  source?: {
    id: string;
    name: string;
  };
  accounts?: Array<{
    id: string;
    name: string;
    source: string;
  }>;
  accessProfiles?: Array<{
    id: string;
    name: string;
  }>;
  roles?: Array<{
    id: string;
    name: string;
  }>;
}

interface AccessProfile {
  id: string;
  name: string;
  description?: string;
  source?: {
    id: string;
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
  description?: string;
  owner?: {
    id: string;
    name: string;
  };
}

interface Account {
  id: string;
  name: string;
  identityId?: string;
  sourceId?: string;
  sourceName?: string;
  disabled?: boolean;
}

interface IdentityProfile {
  id: string;
  name: string;
  description?: string;
  priority?: number;
  authoritativeSource?: {
    id: string;
    name: string;
  };
  identityAttributeConfig?: {
    enabled?: string[];
    attributeTransforms?: AttributeTransform[];
  };
  created?: string;
  modified?: string;
}

interface AttributeTransform {
  identityAttribute: string;
  transform: {
    type: string;
    name?: string;
    description?: string;
    expression?: string;
    attributes?: any[];
  };
  isRequired?: boolean;
}

interface AttributeMapping {
  profileName: string;
  profileId: string;
  targetAttribute: string;
  transformType: string;
  transformName: string;
  sourceAttributes: string;
  isRequired: boolean;
  expression: string;
  description: string;
}

// OAuth token management
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Request new token
  const response = await fetch(`${SAILPOINT_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SAILPOINT_CLIENT_ID,
      client_secret: SAILPOINT_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate: ${response.statusText}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

  return accessToken;
}

async function sailpointRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> {
  const token = await getAccessToken();

  const options: any = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SAILPOINT_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SailPoint API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json() as T;
}

// Helper functions for SailPoint API calls
async function searchIdentities(query?: string, limit: number = 250): Promise<Identity[]> {
  const searchBody = {
    indices: ["identities"],
    query: query ? {
      query: query
    } : undefined,
    sort: ["name"],
    queryResultFilter: {
      includes: ["id", "name", "email", "displayName", "firstName", "lastName", "manager", "department", "source"]
    }
  };
  console.error("Searching identities with query:", JSON.stringify(searchBody));

  const results = await sailpointRequest<Identity[]>("/v2025/search", "POST", searchBody);
  return results.slice(0, limit);
}

async function getIdentityById(id: string): Promise<Identity> {
  console.error("Fetching identity by ID:", id);
  return await sailpointRequest<Identity>(`/v2025/identities/${id}`);
}

async function getIdentityAccounts(id: string): Promise<Account[]> {
  console.error("Fetching accounts for identity ID:", id);
  return await sailpointRequest<Account[]>(`/beta/historical-identities/${id}/access-items?type=account`);
}

async function getIdentityAccessProfiles(id: string): Promise<AccessProfile[]> {
  console.error("Fetching access profiles for identity ID:", id);
  return await sailpointRequest<AccessProfile[]>(`/beta/historical-identities/${id}/access-items?type=access-profile`);
}

async function getIdentityRoles(id: string): Promise<Role[]> {
  console.error("Fetching roles for identity ID:", id);
  return await sailpointRequest<Role[]>(`/beta/historical-identities/${id}/access-items?type=role`);
}

async function searchAccounts(query?: string, limit: number = 250): Promise<Account[]> {
  const searchBody = {
    indices: ["accounts"],
    query: query ? {
      query: query
    } : undefined,
    sort: ["name"],
  };

  const results = await sailpointRequest<Account[]>("/v2025/search", "POST", searchBody);
  return results.slice(0, limit);
}

async function searchAccessProfiles(query?: string): Promise<AccessProfile[]> {
  const params = new URLSearchParams();
  if (query) {
    params.append("filters", `name co "${query}"`);
  }
  params.append("limit", "250");

  return await sailpointRequest<AccessProfile[]>(`/v2025/access-profiles?${params.toString()}`);
}

async function searchRoles(query?: string): Promise<Role[]> {
  const params = new URLSearchParams();
  if (query) {
    params.append("filters", `name co "${query}"`);
  }
  params.append("limit", "250");

  return await sailpointRequest<Role[]>(`/v2025/roles?${params.toString()}`);
}

// Identity Profile API functions
async function getIdentityProfiles(): Promise<IdentityProfile[]> {
  return await sailpointRequest<IdentityProfile[]>("/v3/identity-profiles");
}

async function getIdentityProfile(profileId: string): Promise<IdentityProfile> {
  return await sailpointRequest<IdentityProfile>(`/v3/identity-profiles/${profileId}`);
}

async function searchIdentityProfiles(query?: string): Promise<IdentityProfile[]> {
  const profiles = await getIdentityProfiles();

  if (!query) {
    return profiles;
  }

  const lowerQuery = query.toLowerCase();
  return profiles.filter(profile =>
    profile.name.toLowerCase().includes(lowerQuery) ||
    (profile.description && profile.description.toLowerCase().includes(lowerQuery))
  );
}

function formatAttributeMappings(profile: IdentityProfile): AttributeMapping[] {
  const mappings: AttributeMapping[] = [];

  // Process attribute transforms
  if (profile.identityAttributeConfig && profile.identityAttributeConfig.attributeTransforms) {
    profile.identityAttributeConfig.attributeTransforms.forEach(transform => {
      const mapping: AttributeMapping = {
        profileName: profile.name,
        profileId: profile.id,
        targetAttribute: transform.identityAttribute,
        transformType: transform.transform?.type || 'N/A',
        transformName: transform.transform?.name || 'N/A',
        sourceAttributes: extractSourceAttributes(transform.transform),
        isRequired: transform.isRequired || false,
        expression: transform.transform?.expression || 'N/A',
        description: transform.transform?.description || 'N/A'
      };
      mappings.push(mapping);
    });
  }

  // Process enabled attributes (direct mappings)
  if (profile.identityAttributeConfig && profile.identityAttributeConfig.enabled) {
    profile.identityAttributeConfig.enabled.forEach(attr => {
      // Check if this attribute doesn't already have a transform
      const existingMapping = mappings.find(m => m.targetAttribute === attr);
      if (!existingMapping) {
        const mapping: AttributeMapping = {
          profileName: profile.name,
          profileId: profile.id,
          targetAttribute: attr,
          transformType: 'Direct Mapping',
          transformName: 'N/A',
          sourceAttributes: 'N/A',
          isRequired: false,
          expression: 'N/A',
          description: 'Direct attribute mapping'
        };
        mappings.push(mapping);
      }
    });
  }

  return mappings;
}

function extractSourceAttributes(transform: any): string {
  if (!transform || !transform.attributes) {
    return 'N/A';
  }

  return transform.attributes.map((attr: any) => {
    if (typeof attr === 'string') {
      return attr;
    }
    if (attr.name) {
      return attr.name;
    }
    if (attr.sourceName) {
      return `${attr.sourceName}.${attr.attributeName}`;
    }
    return JSON.stringify(attr);
  }).join(', ');
}

function formatMappingsAsTable(mappings: AttributeMapping[]): string {
  if (mappings.length === 0) {
    return 'No attribute mappings found';
  }

  const headers = ['Profile Name', 'Target Attribute', 'Transform Type', 'Source Attributes', 'Required', 'Expression'];
  const rows = mappings.map(mapping => [
    mapping.profileName,
    mapping.targetAttribute,
    mapping.transformType,
    mapping.sourceAttributes,
    mapping.isRequired ? 'Yes' : 'No',
    mapping.expression.length > 50 ? mapping.expression.substring(0, 47) + '...' : mapping.expression
  ]);

  // Calculate column widths
  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map(row => row[i].length))
  );

  // Create table
  const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow = '|' + headers.map((header, i) => ` ${header.padEnd(widths[i])} `).join('|') + '|';
  const dataRows = rows.map(row =>
    '|' + row.map((cell, i) => ` ${cell.padEnd(widths[i])} `).join('|') + '|'
  ).join('\n');

  return [separator, headerRow, separator, dataRows, separator].join('\n');
}

// Format identity as markdown
function formatIdentityAsMarkdown(identity: Identity, accounts?: Account[], accessProfiles?: AccessProfile[], roles?: Role[]): string {
  let md = `# Identity: ${identity.name}\n\n`;

  md += `## Basic Information\n\n`;
  md += `- **ID**: ${identity.id}\n`;
  md += `- **Display Name**: ${identity.displayName || 'N/A'}\n`;
  md += `- **Email**: ${identity.email || 'N/A'}\n`;
  md += `- **First Name**: ${identity.firstName || 'N/A'}\n`;
  md += `- **Last Name**: ${identity.lastName || 'N/A'}\n`;
  md += `- **Department**: ${identity.department || 'N/A'}\n`;

  if (identity.manager) {
    md += `- **Manager**: ${identity.manager.name} (${identity.manager.id})\n`;
  }

  if (identity.source) {
    md += `- **Source**: ${identity.source.name} (${identity.source.id})\n`;
  }

  if (accounts && accounts.length > 0) {
    md += `\n## Accounts (${accounts.length})\n\n`;
    accounts.forEach(account => {
      md += `- **${account.name}** - ${account.sourceName || account.sourceId}\n`;
      if (account.disabled) {
        md += `  - Status: DISABLED\n`;
      }
    });
  }

  if (accessProfiles && accessProfiles.length > 0) {
    md += `\n## Access Profiles (${accessProfiles.length})\n\n`;
    accessProfiles.forEach(profile => {
      md += `- **${profile.name}**\n`;
      if (profile.description) {
        md += `  - ${profile.description}\n`;
      }
    });
  }

  if (roles && roles.length > 0) {
    md += `\n## Roles (${roles.length})\n\n`;
    roles.forEach(role => {
      md += `- **${role.name}**\n`;
      if (role.description) {
        md += `  - ${role.description}\n`;
      }
    });
  }

  return md;
}

const server = new Server(
  {
    name: "sailpoint-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// List available resources (identities)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const identities = await searchIdentities(undefined, 100);

    return {
      resources: identities.map(identity => ({
        uri: `sailpoint://identity/${identity.id}`,
        mimeType: "text/markdown",
        name: `Identity: ${identity.name}`,
        description: `${identity.displayName || identity.name} - ${identity.email || 'No email'}`,
      })),
    };
  } catch (error) {
    console.error("Error listing resources:", error);
    return { resources: [] };
  }
});

// Read a specific resource (identity)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri.toString();
  const match = uri.match(/^sailpoint:\/\/identity\/(.+)$/);

  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  const identityId = match[1];

  try {
    const identity = await getIdentityById(identityId);
    const accounts = await getIdentityAccounts(identityId);
    const accessProfiles = await getIdentityAccessProfiles(identityId);
    const roles = await getIdentityRoles(identityId);

    const markdown = formatIdentityAsMarkdown(identity, accounts, accessProfiles, roles);

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: markdown,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to read identity ${identityId}: ${error}`);
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_identities",
        description: "Search for identities in SailPoint. Returns matching identities with basic information.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (searches across name, email, etc.)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 50)",
              default: 50,
            },
          },
        },
      },
      {
        name: "get_identity",
        description: "Get detailed information about a specific identity by ID",
        inputSchema: {
          type: "object",
          properties: {
            identity_id: {
              type: "string",
              description: "The ID of the identity to retrieve",
            },
            include_accounts: {
              type: "boolean",
              description: "Include associated accounts (default: true)",
              default: true,
            },
            include_access: {
              type: "boolean",
              description: "Include access profiles and roles (default: true)",
              default: true,
            },
          },
          required: ["identity_id"],
        },
      },
      {
        name: "get_identity_accounts",
        description: "Get all accounts associated with an identity",
        inputSchema: {
          type: "object",
          properties: {
            identity_id: {
              type: "string",
              description: "The ID of the identity",
            },
          },
          required: ["identity_id"],
        },
      },
      {
        name: "search_accounts",
        description: "Search for accounts in SailPoint",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for accounts",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (default: 50)",
              default: 50,
            },
          },
        },
      },
      {
        name: "search_access_profiles",
        description: "Search for access profiles in SailPoint",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for access profiles",
            },
          },
        },
      },
      {
        name: "search_roles",
        description: "Search for roles in SailPoint",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for roles",
            },
          },
        },
      },
      {
        name: "get_identity_access",
        description: "Get all access profiles and roles for an identity",
        inputSchema: {
          type: "object",
          properties: {
            identity_id: {
              type: "string",
              description: "The ID of the identity",
            },
          },
          required: ["identity_id"],
        },
      },
      {
        name: "get_identity_profiles",
        description: "Get all identity profiles in IdentityNow",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Optional search query to filter profiles by name or description",
            },
          },
        },
      },
      {
        name: "get_identity_profile",
        description: "Get detailed information about a specific identity profile by ID",
        inputSchema: {
          type: "object",
          properties: {
            profile_id: {
              type: "string",
              description: "The ID of the identity profile to retrieve",
            },
          },
          required: ["profile_id"],
        },
      },
      {
        name: "extract_profile_attribute_mappings",
        description: "Extract and format attribute mapping settings for identity profile(s)",
        inputSchema: {
          type: "object",
          properties: {
            profile_id: {
              type: "string",
              description: "Specific profile ID to extract (optional)",
            },
            profile_name: {
              type: "string",
              description: "Filter by profile name (partial match, optional)",
            },
            format: {
              type: "string",
              description: "Output format: 'table', 'json', or 'csv' (default: 'table')",
              enum: ["table", "json", "csv"],
              default: "table",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_identities") {
      const query = args?.query as string | undefined;
      const limit = (args?.limit as number) || 50;

      const identities = await searchIdentities(query, limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(identities, null, 2),
          },
        ],
      };
    }

    if (name === "get_identity") {
      const identityId = args?.identity_id as string;
      const includeAccounts = args?.include_accounts !== false;
      const includeAccess = args?.include_access !== false;

      const identity = await getIdentityById(identityId);
      const result: any = { ...identity };

      if (includeAccounts) {
        result.accounts = await getIdentityAccounts(identityId);
      }

      if (includeAccess) {
        result.accessProfiles = await getIdentityAccessProfiles(identityId);
        result.roles = await getIdentityRoles(identityId);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === "get_identity_accounts") {
      const identityId = args?.identity_id as string;
      const accounts = await getIdentityAccounts(identityId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(accounts, null, 2),
          },
        ],
      };
    }

    if (name === "search_accounts") {
      const query = args?.query as string | undefined;
      const limit = (args?.limit as number) || 50;

      const accounts = await searchAccounts(query, limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(accounts, null, 2),
          },
        ],
      };
    }

    if (name === "search_access_profiles") {
      const query = args?.query as string | undefined;
      const profiles = await searchAccessProfiles(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(profiles, null, 2),
          },
        ],
      };
    }

    if (name === "search_roles") {
      const query = args?.query as string | undefined;
      const roles = await searchRoles(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(roles, null, 2),
          },
        ],
      };
    }

    if (name === "get_identity_access") {
      const identityId = args?.identity_id as string;

      const [accessProfiles, roles] = await Promise.all([
        getIdentityAccessProfiles(identityId),
        getIdentityRoles(identityId)
      ]);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ accessProfiles, roles }, null, 2),
          },
        ],
      };
    }

    if (name === "get_identity_profiles") {
      const query = args?.query as string | undefined;
      const profiles = await searchIdentityProfiles(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(profiles, null, 2),
          },
        ],
      };
    }

    if (name === "get_identity_profile") {
      const profileId = args?.profile_id as string;
      const profile = await getIdentityProfile(profileId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    }

    if (name === "extract_profile_attribute_mappings") {
      const profileId = args?.profile_id as string | undefined;
      const profileName = args?.profile_name as string | undefined;
      const format = (args?.format as string) || "table";

      let profiles: IdentityProfile[] = [];

      if (profileId) {
        const profile = await getIdentityProfile(profileId);
        profiles = [profile];
      } else {
        profiles = await searchIdentityProfiles(profileName);
      }

      if (profiles.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No matching identity profiles found.",
            },
          ],
        };
      }

      let allMappings: AttributeMapping[] = [];
      for (const profile of profiles) {
        const mappings = formatAttributeMappings(profile);
        allMappings = allMappings.concat(mappings);
      }

      let output: string;
      if (format === "json") {
        output = JSON.stringify({
          profileCount: profiles.length,
          mappingCount: allMappings.length,
          mappings: allMappings
        }, null, 2);
      } else if (format === "csv") {
        if (allMappings.length === 0) {
          output = "No attribute mappings found";
        } else {
          const headers = ['Profile Name', 'Profile ID', 'Target Attribute', 'Transform Type', 'Transform Name', 'Source Attributes', 'Required', 'Expression', 'Description'];
          const csvLines = [headers.join(',')];

          allMappings.forEach(mapping => {
            const row = [
              `"${mapping.profileName}"`,
              `"${mapping.profileId}"`,
              `"${mapping.targetAttribute}"`,
              `"${mapping.transformType}"`,
              `"${mapping.transformName}"`,
              `"${mapping.sourceAttributes}"`,
              `"${mapping.isRequired}"`,
              `"${mapping.expression.replace(/"/g, '""')}"`,
              `"${mapping.description.replace(/"/g, '""')}"`
            ];
            csvLines.push(row.join(','));
          });

          output = csvLines.join('\n');
        }
      } else {
        // Default to table format
        if (allMappings.length === 0) {
          output = "No attribute mappings found";
        } else {
          output = `Found ${allMappings.length} attribute mappings across ${profiles.length} profile(s):\n\n${formatMappingsAsTable(allMappings)}`;
        }
      }

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "analyze_identity",
        description: "Analyze an identity's access and provide security insights",
        arguments: [
          {
            name: "identity_id",
            description: "ID of the identity to analyze",
            required: true,
          },
        ],
      },
      {
        name: "find_orphaned_accounts",
        description: "Find accounts without associated identities",
        arguments: [],
      },
      {
        name: "audit_user_access",
        description: "Generate an access audit report for a user",
        arguments: [
          {
            name: "identity_id",
            description: "ID of the identity to audit",
            required: true,
          },
        ],
      },
      {
        name: "compare_identities",
        description: "Compare access between two identities",
        arguments: [
          {
            name: "identity1_id",
            description: "First identity ID",
            required: true,
          },
          {
            name: "identity2_id",
            description: "Second identity ID",
            required: true,
          },
        ],
      },
      {
        name: "role_membership_report",
        description: "Generate a report of who has a specific role",
        arguments: [
          {
            name: "role_name",
            description: "Name of the role to report on",
            required: true,
          },
        ],
      },
    ],
  };
});

// Handle prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "analyze_identity") {
    const identityId = args?.identity_id as string;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze the identity "${identityId}" and provide:

1. Summary of the identity's basic information
2. List of all accounts and their status
3. Access profiles and roles assigned
4. Potential security concerns (excessive access, dormant accounts, etc.)
5. Recommendations for access optimization

Use the get_identity tool with full details.`,
          },
        },
      ],
    };
  }

  if (name === "find_orphaned_accounts") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find and report on orphaned accounts (accounts without associated identities):

1. Search for accounts
2. Identify those without valid identity associations
3. Group by source system
4. Provide recommendations for cleanup

Use the search_accounts tool to gather data.`,
          },
        },
      ],
    };
  }

  if (name === "audit_user_access") {
    const identityId = args?.identity_id as string;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a comprehensive access audit report for identity "${identityId}":

1. Identity details and organizational context
2. All accounts across all systems
3. Complete list of access profiles and roles
4. Access review recommendations
5. Compliance considerations

Format as a professional audit report.`,
          },
        },
      ],
    };
  }

  if (name === "compare_identities") {
    const identity1 = args?.identity1_id as string;
    const identity2 = args?.identity2_id as string;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare access between identities "${identity1}" and "${identity2}":

1. Show accounts unique to each identity
2. Show shared accounts
3. Compare access profiles and roles
4. Highlight significant access differences
5. Suggest reasons for differences based on department, role, etc.`,
          },
        },
      ],
    };
  }

  if (name === "role_membership_report") {
    const roleName = args?.role_name as string;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a membership report for the role "${roleName}":

1. Find the role using search_roles
2. Search for identities with this role
3. List all members with their details
4. Identify patterns (departments, managers, etc.)
5. Suggest whether role membership is appropriate

Use search_identities with appropriate filters.`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// Start the server
async function main() {
  try {
    // Validate configuration
    if (!SAILPOINT_CLIENT_ID || !SAILPOINT_CLIENT_SECRET) {
      throw new Error("SailPoint credentials not configured. Set SAILPOINT_CLIENT_ID and SAILPOINT_CLIENT_SECRET environment variables.");
    }

    // Test authentication
    await getAccessToken();
    console.error("SailPoint authentication successful");

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SailPoint MCP server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
