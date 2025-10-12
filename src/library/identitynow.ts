/**
 * IdentityNow API Library
 * 
 * This module contains all the SailPoint IdentityNow API functions
 * and utility functions for the MCP server.
 */

import { AccessProfilesApi, AccountsApi, Configuration, EntitlementsBetaApi, IdentitiesBetaApi, IdentityProfilesApi, RolesApi, SearchApi } from "sailpoint-api-client";
import {
    AccessProfile,
    Account,
    AttributeMapping,
    AuditEvent,
    Entitlement,
    Identity,
    IdentityEvent,
    IdentityProfile,
    Role
} from "../types/index.js";

// Initialize SailPoint SDK configuration (uses environment variables by default)
const configuration = new Configuration();

// Initialize API clients
const searchApi = new SearchApi(configuration);
const identitiesApi = new IdentitiesBetaApi(configuration);
const accountsApi = new AccountsApi(configuration);
const accessProfilesApi = new AccessProfilesApi(configuration);
const rolesApi = new RolesApi(configuration);
const entitlementsApi = new EntitlementsBetaApi(configuration);
const identityProfilesApi = new IdentityProfilesApi(configuration);

// Identity Functions
export async function searchIdentities(query?: string, limit: number = 250): Promise<Identity[]> {
    try {
        // Use the search API with proper index enum value
        const searchBody: any = {
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

        const response = await searchApi.searchPost({ search: searchBody as any });
        const results = response.data || [];
        return results.slice(0, limit) as Identity[];
    } catch (error) {
        console.error("Error searching identities:", error);
        throw error;
    }
}

export async function getIdentityById(id: string): Promise<Identity> {
    console.error("Fetching identity by ID:", id);
    try {
        const response = await identitiesApi.getIdentity({ id });
        return response.data as Identity;
    } catch (error) {
        console.error("Error fetching identity:", error);
        throw error;
    }
}

export async function getIdentityAccounts(id: string): Promise<Account[]> {
    console.error("Fetching accounts for identity ID:", id);
    try {
        // The SDK may not have this exact method - use search instead
        const searchBody: any = {
            indices: ["accounts"],
            query: {
                term: {
                    "identityId": id
                }
            }
        };

        const response = await searchApi.searchPost({ search: searchBody as any });
        return response.data as Account[];
    } catch (error) {
        console.error("Error fetching identity accounts:", error);
        return [];
    }
}

export async function getIdentityAccessProfiles(id: string): Promise<AccessProfile[]> {
    console.error("Fetching access profiles for identity ID:", id);
    try {
        // Use search API to find access profiles for identity
        const searchBody: any = {
            indices: ["entitlements"],
            query: {
                bool: {
                    must: [
                        { term: { "type": "accessProfile" } },
                        { term: { "identities.id": id } }
                    ]
                }
            }
        };

        const response = await searchApi.searchPost({ search: searchBody as any });
        return response.data as AccessProfile[];
    } catch (error) {
        console.error("Error fetching identity access profiles:", error);
        return [];
    }
}

export async function getIdentityRoles(id: string): Promise<Role[]> {
    console.error("Fetching roles for identity ID:", id);
    try {
        // Use search API to find roles for identity
        const searchBody: any = {
            indices: ["entitlements"],
            query: {
                bool: {
                    must: [
                        { term: { "type": "role" } },
                        { term: { "identities.id": id } }
                    ]
                }
            }
        };

        const response = await searchApi.searchPost({ search: searchBody as any });
        return response.data as Role[];
    } catch (error) {
        console.error("Error fetching identity roles:", error);
        return [];
    }
}

// Account Functions
export async function searchAccounts(query?: string, limit: number = 250): Promise<Account[]> {
    const searchBody: any = {
        indices: ["accounts"],
        query: query ? {
            query: query
        } : undefined,
        sort: ["name"],
    };

    try {
        const response = await searchApi.searchPost({ search: searchBody as any });
        const results = response.data || [];
        return results.slice(0, limit) as Account[];
    } catch (error) {
        console.error("Error searching accounts:", error);
        throw error;
    }
}

// Access Profile Functions
export async function searchAccessProfiles(query?: string): Promise<AccessProfile[]> {
    try {
        let filters: string | undefined;
        if (query) {
            filters = `name co "${query}"`;
        }

        const response = await accessProfilesApi.listAccessProfiles({
            filters,
            limit: 250
        });
        return response.data as AccessProfile[];
    } catch (error) {
        console.error("Error searching access profiles:", error);
        throw error;
    }
}

// Role Functions
export async function searchRoles(query?: string): Promise<Role[]> {
    try {
        let filters: string | undefined;
        if (query) {
            filters = `name co "${query}"`;
        }

        const response = await rolesApi.listRoles({
            filters,
            limit: 250
        });
        return response.data as Role[];
    } catch (error) {
        console.error("Error searching roles:", error);
        throw error;
    }
}

// Entitlement Functions
export async function searchEntitlements(query?: string, limit: number = 250): Promise<Entitlement[]> {
    try {
        let filters: string | undefined;
        if (query) {
            filters = `name co "${query}"`;
        }

        const response = await entitlementsApi.listEntitlements({
            filters,
            limit
        });
        return response.data as Entitlement[];
    } catch (error) {
        console.error("Error searching entitlements:", error);
        throw error;
    }
}

export async function getEntitlementById(id: string): Promise<Entitlement> {
    try {
        const response = await entitlementsApi.getEntitlement({ id });
        return response.data as Entitlement;
    } catch (error) {
        console.error("Error fetching entitlement:", error);
        throw error;
    }
}

export async function searchEntitlementsBySource(sourceId: string, query?: string, limit: number = 250): Promise<Entitlement[]> {
    try {
        let filters = `source.id eq "${sourceId}"`;
        if (query) {
            filters += ` and name co "${query}"`;
        }

        const response = await entitlementsApi.listEntitlements({
            filters,
            limit
        });
        return response.data as Entitlement[];
    } catch (error) {
        console.error("Error searching entitlements by source:", error);
        throw error;
    }
}

// Identity Profile Functions
export async function getIdentityProfiles(): Promise<IdentityProfile[]> {
    try {
        const response = await identityProfilesApi.listIdentityProfiles({});
        return response.data as IdentityProfile[];
    } catch (error) {
        console.error("Error fetching identity profiles:", error);
        throw error;
    }
}

export async function getIdentityProfile(profileId: string): Promise<IdentityProfile> {
    try {
        const response = await identityProfilesApi.getIdentityProfile({ identityProfileId: profileId });
        return response.data as IdentityProfile;
    } catch (error) {
        console.error("Error fetching identity profile:", error);
        throw error;
    }
}

export async function searchIdentityProfiles(query?: string): Promise<IdentityProfile[]> {
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

// Event and Audit Log Functions
export async function searchAuditEvents(
    identityId?: string,
    startDate?: string,
    endDate?: string,
    eventTypes?: string[],
    limit: number = 100
): Promise<AuditEvent[]> {
    try {
        const searchBody: any = {
            indices: ["events"],
            query: {
                bool: {
                    must: [] as any[]
                }
            },
            sort: [{ created: { order: "desc" } }]
        };

        // Build query filters
        const filters: any[] = [];

        if (identityId) {
            filters.push({ term: { "target.id": identityId } });
        }

        if (startDate) {
            filters.push({ range: { created: { gte: startDate } } });
        }

        if (endDate) {
            filters.push({ range: { created: { lte: endDate } } });
        }

        if (eventTypes && eventTypes.length > 0) {
            filters.push({ terms: { type: eventTypes } });
        }

        if (filters.length > 0) {
            searchBody.query.bool.must = filters;
        }

        const response = await searchApi.searchPost({ search: searchBody as any });
        const results = response.data || [];
        return results.slice(0, limit) as AuditEvent[];
    } catch (error) {
        console.error("Error searching audit events:", error);
        // Return empty array if search fails rather than throwing
        return [];
    }
}

export async function getIdentityEvents(
    identityId: string,
    daysBack: number = 30,
    eventTypes: string[] = ['ROLE_ASSIGNED', 'ROLE_REMOVED', 'ACCESS_PROFILE_ASSIGNED', 'ACCESS_PROFILE_REMOVED', 'ENTITLEMENT_ASSIGNED', 'ENTITLEMENT_REMOVED']
): Promise<IdentityEvent[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    try {
        const auditEvents = await searchAuditEvents(
            identityId,
            startDate.toISOString(),
            endDate.toISOString(),
            eventTypes,
            500
        );

        return auditEvents.map(event => {
            const identityEvent: IdentityEvent = {
                timestamp: event.created,
                eventType: event.type,
                action: event.action,
                itemType: determineItemType(event),
                itemName: getItemName(event),
                itemId: getItemId(event),
                changeType: determineChangeType(event),
                actor: event.actor?.name || 'System',
                source: event.source?.name,
                details: JSON.stringify(event.details || {})
            };

            return identityEvent;
        }).filter(event => event.itemName !== 'Unknown');

    } catch (error) {
        console.error('Error fetching identity events:', error);
        return [];
    }
}

// Utility Functions
export function determineItemType(event: AuditEvent): string {
    if (event.type.includes('ROLE')) {
        return 'Role';
    }
    if (event.type.includes('ACCESS_PROFILE')) {
        return 'Access Profile';
    }
    if (event.type.includes('ENTITLEMENT')) {
        return 'Entitlement';
    }
    if (event.type.includes('ACCOUNT')) {
        return 'Account';
    }
    return event.type;
}

export function getItemName(event: AuditEvent): string {
    if (event.target?.name) {
        return event.target.name;
    }
    if (event.details?.roleName) {
        return event.details.roleName;
    }
    if (event.details?.accessProfileName) {
        return event.details.accessProfileName;
    }
    if (event.details?.entitlementName) {
        return event.details.entitlementName;
    }
    if (event.details?.accountName) {
        return event.details.accountName;
    }
    if (event.details?.name) {
        return event.details.name;
    }
    return 'Unknown';
}

export function getItemId(event: AuditEvent): string {
    if (event.target?.id) {
        return event.target.id;
    }
    if (event.details?.roleId) {
        return event.details.roleId;
    }
    if (event.details?.accessProfileId) {
        return event.details.accessProfileId;
    }
    if (event.details?.entitlementId) {
        return event.details.entitlementId;
    }
    if (event.details?.accountId) {
        return event.details.accountId;
    }
    if (event.details?.id) {
        return event.details.id;
    }
    return '';
}

export function determineChangeType(event: AuditEvent): 'ADDED' | 'REMOVED' | 'MODIFIED' {
    const action = event.action.toLowerCase();
    const type = event.type.toLowerCase();

    if (action.includes('assign') || action.includes('grant') || action.includes('add') ||
        type.includes('assigned') || type.includes('granted')) {
        return 'ADDED';
    }

    if (action.includes('remove') || action.includes('revoke') || action.includes('delete') ||
        type.includes('removed') || type.includes('revoked')) {
        return 'REMOVED';
    }

    return 'MODIFIED';
}

export function formatIdentityEvents(events: IdentityEvent[]): string {
    if (events.length === 0) {
        return 'No events found for the specified time period.';
    }

    let output = `# Identity Access Change History\n\n`;
    output += `Found ${events.length} events:\n\n`;

    // Group events by date
    const eventsByDate = events.reduce((groups, event) => {
        const date = new Date(event.timestamp).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
        return groups;
    }, {} as Record<string, IdentityEvent[]>);

    // Sort dates in descending order
    const sortedDates = Object.keys(eventsByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    for (const date of sortedDates) {
        output += `## ${date}\n\n`;

        const dayEvents = eventsByDate[date].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        for (const event of dayEvents) {
            const time = new Date(event.timestamp).toLocaleTimeString();
            const changeIcon = event.changeType === 'ADDED' ? '✅' :
                event.changeType === 'REMOVED' ? '❌' : '🔄';

            output += `### ${changeIcon} ${time} - ${event.changeType} ${event.itemType}\n\n`;
            output += `- **Item**: ${event.itemName}\n`;
            output += `- **Action**: ${event.action}\n`;
            output += `- **Actor**: ${event.actor}\n`;
            if (event.source) {
                output += `- **Source**: ${event.source}\n`;
            }
            output += `- **Event Type**: ${event.eventType}\n`;
            if (event.details && event.details !== '{}') {
                output += `- **Details**: ${event.details}\n`;
            }
            output += `\n`;
        }
    }

    return output;
}

export function formatAttributeMappings(profile: IdentityProfile): AttributeMapping[] {
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

export function extractSourceAttributes(transform: any): string {
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

export function formatMappingsAsTable(mappings: AttributeMapping[]): string {
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
export function formatIdentityAsMarkdown(identity: Identity, accounts?: Account[], accessProfiles?: AccessProfile[], roles?: Role[]): string {
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

// Test connectivity function
export async function testConnectivity(): Promise<void> {
    try {
        await identityProfilesApi.listIdentityProfiles({ limit: 1 });
        console.error("SailPoint SDK authentication and connectivity successful");
    } catch (authError) {
        console.error("SailPoint SDK authentication failed:", authError);
        throw new Error("Failed to authenticate with SailPoint API. Please check your credentials and network connectivity.");
    }
}