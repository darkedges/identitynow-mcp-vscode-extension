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
import * as IdentityNow from "./library/identitynow.js";
import {
  AttributeMapping,
  IdentityProfile
} from "./types/index.js";

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
    const identities = await IdentityNow.searchIdentities(undefined, 100);

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
    const identity = await IdentityNow.getIdentityById(identityId);
    const accounts = await IdentityNow.getIdentityAccounts(identityId);
    const accessProfiles = await IdentityNow.getIdentityAccessProfiles(identityId);
    const roles = await IdentityNow.getIdentityRoles(identityId);

    const markdown = IdentityNow.formatIdentityAsMarkdown(identity, accounts, accessProfiles, roles);

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
        name: "search_entitlements",
        description: "Search for entitlements in SailPoint",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for entitlements",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 250)",
              default: 250,
            },
          },
        },
      },
      {
        name: "get_entitlement",
        description: "Get detailed information about a specific entitlement by ID",
        inputSchema: {
          type: "object",
          properties: {
            entitlement_id: {
              type: "string",
              description: "ID of the entitlement to retrieve",
            },
          },
          required: ["entitlement_id"],
        },
      },
      {
        name: "search_entitlements_by_source",
        description: "Search for entitlements within a specific source system",
        inputSchema: {
          type: "object",
          properties: {
            source_id: {
              type: "string",
              description: "ID of the source system to search within",
            },
            query: {
              type: "string",
              description: "Search query for entitlements within the source (optional)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 250)",
              default: 250,
            },
          },
          required: ["source_id"],
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
      {
        name: "search_identity_events",
        description: "Search for access change events (roles, access profiles, entitlements added/removed) for an identity",
        inputSchema: {
          type: "object",
          properties: {
            identity_id: {
              type: "string",
              description: "ID of the identity to search events for",
            },
            days_back: {
              type: "number",
              description: "Number of days back to search (default: 30)",
              default: 30,
            },
            event_types: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Specific event types to search for (optional)",
            },
            format: {
              type: "string",
              description: "Output format: 'detailed' or 'summary' (default: 'detailed')",
              enum: ["detailed", "summary"],
              default: "detailed",
            },
          },
          required: ["identity_id"],
        },
      },
      {
        name: "search_audit_events",
        description: "Search audit events with flexible filtering options",
        inputSchema: {
          type: "object",
          properties: {
            identity_id: {
              type: "string",
              description: "ID of the identity to search events for (optional)",
            },
            start_date: {
              type: "string",
              description: "Start date in ISO format (e.g., '2024-01-01T00:00:00Z')",
            },
            end_date: {
              type: "string",
              description: "End date in ISO format (e.g., '2024-01-31T23:59:59Z')",
            },
            event_types: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Event types to filter by (e.g., ['ROLE_ASSIGNED', 'ACCESS_PROFILE_REMOVED'])",
            },
            limit: {
              type: "number",
              description: "Maximum number of events to return (default: 100)",
              default: 100,
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

      const identities = await IdentityNow.searchIdentities(query, limit);

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

      const identity = await IdentityNow.getIdentityById(identityId);
      const result: any = { ...identity };

      if (includeAccounts) {
        result.accounts = await IdentityNow.getIdentityAccounts(identityId);
      }

      if (includeAccess) {
        result.accessProfiles = await IdentityNow.getIdentityAccessProfiles(identityId);
        result.roles = await IdentityNow.getIdentityRoles(identityId);
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
      const accounts = await IdentityNow.getIdentityAccounts(identityId);

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

      const accounts = await IdentityNow.searchAccounts(query, limit);

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
      const profiles = await IdentityNow.searchAccessProfiles(query);

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
      const roles = await IdentityNow.searchRoles(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(roles, null, 2),
          },
        ],
      };
    }

    if (name === "search_entitlements") {
      const query = args?.query as string | undefined;
      const limit = (args?.limit as number) || 250;
      const entitlements = await IdentityNow.searchEntitlements(query, limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(entitlements, null, 2),
          },
        ],
      };
    }

    if (name === "get_entitlement") {
      const entitlementId = args?.entitlement_id as string;

      if (!entitlementId) {
        throw new Error("entitlement_id is required");
      }

      const entitlement = await IdentityNow.getEntitlementById(entitlementId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(entitlement, null, 2),
          },
        ],
      };
    }

    if (name === "search_entitlements_by_source") {
      const sourceId = args?.source_id as string;
      const query = args?.query as string | undefined;
      const limit = (args?.limit as number) || 250;

      if (!sourceId) {
        throw new Error("source_id is required");
      }

      const entitlements = await IdentityNow.searchEntitlementsBySource(sourceId, query, limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(entitlements, null, 2),
          },
        ],
      };
    }

    if (name === "get_identity_access") {
      const identityId = args?.identity_id as string;

      const [accessProfiles, roles] = await Promise.all([
        IdentityNow.getIdentityAccessProfiles(identityId),
        IdentityNow.getIdentityRoles(identityId)
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
      const profiles = await IdentityNow.searchIdentityProfiles(query);

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
      const profile = await IdentityNow.getIdentityProfile(profileId);

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
        const profile = await IdentityNow.getIdentityProfile(profileId);
        profiles = [profile];
      } else {
        profiles = await IdentityNow.searchIdentityProfiles(profileName);
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
        const mappings = IdentityNow.formatAttributeMappings(profile);
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
          output = `Found ${allMappings.length} attribute mappings across ${profiles.length} profile(s):\n\n${IdentityNow.formatMappingsAsTable(allMappings)}`;
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

    if (name === "search_identity_events") {
      const identityId = args?.identity_id as string;
      const daysBack = (args?.days_back as number) || 30;
      const eventTypes = args?.event_types as string[] | undefined;
      const format = (args?.format as string) || "detailed";

      if (!identityId) {
        throw new Error("identity_id is required");
      }

      const events = await IdentityNow.getIdentityEvents(
        identityId,
        daysBack,
        eventTypes || ['ROLE_ASSIGNED', 'ROLE_REMOVED', 'ACCESS_PROFILE_ASSIGNED', 'ACCESS_PROFILE_REMOVED', 'ENTITLEMENT_ASSIGNED', 'ENTITLEMENT_REMOVED']
      );

      let output: string;
      if (format === "summary") {
        const addedCount = events.filter(e => e.changeType === 'ADDED').length;
        const removedCount = events.filter(e => e.changeType === 'REMOVED').length;
        const modifiedCount = events.filter(e => e.changeType === 'MODIFIED').length;

        output = `# Access Change Summary (Last ${daysBack} days)\n\n`;
        output += `**Total Events**: ${events.length}\n`;
        output += `**Items Added**: ${addedCount}\n`;
        output += `**Items Removed**: ${removedCount}\n`;
        output += `**Items Modified**: ${modifiedCount}\n\n`;

        if (events.length > 0) {
          output += `**Recent Changes**:\n`;
          events.slice(0, 10).forEach(event => {
            const changeIcon = event.changeType === 'ADDED' ? '✅' :
              event.changeType === 'REMOVED' ? '❌' : '🔄';
            output += `- ${changeIcon} ${event.changeType} ${event.itemType}: ${event.itemName}\n`;
          });
        }
      } else {
        output = IdentityNow.formatIdentityEvents(events);
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

    if (name === "search_audit_events") {
      const identityId = args?.identity_id as string | undefined;
      const startDate = args?.start_date as string | undefined;
      const endDate = args?.end_date as string | undefined;
      const eventTypes = args?.event_types as string[] | undefined;
      const limit = (args?.limit as number) || 100;

      const events = await IdentityNow.searchAuditEvents(identityId, startDate, endDate, eventTypes, limit);

      const output = JSON.stringify({
        totalEvents: events.length,
        events: events.map(event => ({
          id: event.id,
          created: event.created,
          type: event.type,
          action: event.action,
          actor: event.actor?.name || 'System',
          target: event.target?.name || 'Unknown',
          source: event.source?.name,
          result: event.result || 'UNKNOWN',
          details: event.details
        }))
      }, null, 2);

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
    // Test connectivity
    await IdentityNow.testConnectivity();

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SailPoint MCP server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
