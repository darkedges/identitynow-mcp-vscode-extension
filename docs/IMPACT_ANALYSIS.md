# IdentityNow Impact Analysis Tool

## Overview

The Impact Analysis Tool is a powerful feature of the IdentityNow MCP (Model Context Protocol) extension that analyzes access changes for an identity based on changes to source attributes. It helps identity administrators understand the downstream effects of attribute value changes before applying them.

## Use Cases

- **Before making changes**: Understand the impact of changing an employee's department, location, or job title
- **Audit and compliance**: Document access changes resulting from organizational restructuring
- **Access certification**: Validate that access changes are appropriate for the new role/department
- **Risk assessment**: Identify potential over-privileging or security gaps from attribute changes
- **Training and documentation**: Show stakeholders what access will be added/removed

## Tool: `analyze_attribute_impact`

### Purpose

Analyzes the access impact when an identity's source attribute value changes by finding all roles with membership criteria matching both the old and new values.

### Parameters

| Parameter        | Type   | Required | Description                                                                                                     |
| ---------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| `identity_id`    | string | Yes      | The ID of the identity being analyzed                                                                           |
| `source_name`    | string | Yes      | The name of the source system (e.g., 'workday', 'active-directory', 'bamboohr')                                 |
| `attribute_name` | string | Yes      | The name of the attribute being changed (e.g., 'department', 'location', 'job_title', 'manager', 'cost_center') |
| `old_value`      | string | Yes      | The current/old value of the attribute                                                                          |
| `new_value`      | string | Yes      | The new value of the attribute after the change                                                                 |

### Return Value

The tool returns an `ImpactAnalysisResult` object containing:

#### Identity Information

```typescript
{
  id: string;        // Identity ID
  name: string;      // Identity name
  email?: string;    // Identity email (if available)
}
```

#### Source Attribute Details

```typescript
{
  source: string;    // Source system name
  attribute: string; // Attribute name
  oldValue: string;  // Old attribute value
  newValue: string;  // New attribute value
}
```

#### Roles to be Revoked

Array of roles matching the **old** attribute value that will be removed:

- Role ID, name, and description
- Associated access profiles
- Associated entitlements from each access profile

#### Roles to be Granted

Array of roles matching the **new** attribute value that will be added:

- Role ID, name, and description
- Associated access profiles
- Associated entitlements from each access profile

#### Summary Statistics

```typescript
{
  rolesRemoved: number;              // Number of roles being revoked
  rolesAdded: number;                // Number of roles being granted
  accessProfilesRemoved: number;     // Total unique access profiles being removed
  accessProfilesAdded: number;       // Total unique access profiles being added
  entitlementsRemoved: number;       // Total unique entitlements being removed
  entitlementsAdded: number;         // Total unique entitlements being added
}
```

### Output Format

The results are formatted as a comprehensive Markdown document that includes:

1. **Identity section**: Shows the identity being analyzed
2. **Attribute Change section**: Documents the source, attribute name, and old→new values
3. **Summary table**: Quick overview of access changes
4. **Roles to be Revoked section**: Detailed breakdown of removed roles with their access profiles and entitlements
5. **Roles to be Granted section**: Detailed breakdown of added roles with their access profiles and entitlements

### Example Usage

#### Scenario: Department Change from Sales to Engineering

```text
Identity: John Smith (john.smith@company.com)
Source: Workday
Attribute Change: department
Old Value: Sales
New Value: Engineering
```

**Expected Output:**

- Revoked Roles: Sales Rep, Sales Manager, Regional Sales Lead
  - Removed Access Profiles: Sales Systems, Territory Access, Salesforce Premium
  - Removed Entitlements: CRM permissions, Territory allocation, Sales reporting tools
- Granted Roles: Engineering Lead, Developer, Code Reviewer
  - Added Access Profiles: Engineering Systems, Code Repository, Development Tools
  - Added Entitlements: GitHub access, Jira permissions, CI/CD pipeline access

## Implementation Details

### Core Functions in `identitynow.ts`

#### 1. `searchRolesByAttributeValue(attributeName: string, attributeValue: string): Promise<Role[]>`

- Searches for all roles that have membership criteria matching the specified attribute and value
- Currently uses role description matching as a heuristic
- **Note**: For production use, this should be enhanced to query actual role membership rules from IdentityNow

#### 2. `getRoleAccessProfiles(roleId: string): Promise<AccessProfile[]>`

- Retrieves all access profiles assigned to a specific role
- Uses IdentityNow search API to find access profiles linked to the role

#### 3. `getRoleEntitlements(roleId: string): Promise<Entitlement[]>`

- Retrieves all entitlements assigned to a specific role
- Uses IdentityNow search API to find entitlements linked to the role

#### 4. `analyzeAttributeImpact(...): Promise<ImpactAnalysisResult>`

- Main analysis function that orchestrates the analysis process:
  1. Retrieves identity information
  2. Searches for roles matching old value
  3. Searches for roles matching new value
  4. For each role, fetches associated access profiles and entitlements
  5. Calculates summary statistics (using Set to ensure uniqueness)
  6. Returns comprehensive analysis result

#### 5. `formatImpactAnalysis(result: ImpactAnalysisResult): string`

- Formats the analysis result as human-readable Markdown
- Includes all relevant information organized by category
- Provides clear visual hierarchy and formatting

## Key Design Decisions

### 1. Attribute Matching Strategy

The current implementation searches for roles with matching criteria in their descriptions. In a production environment, this should be enhanced to:

- Query actual role membership rules/criteria from IdentityNow
- Support complex rule evaluation (AND/OR operators)
- Handle role provisioning rules and conditions

### 2. Deduplication

- Access profiles and entitlements are deduplicated using Set data structures
- This prevents double-counting when a profile/entitlement is assigned through multiple roles

### 3. Error Handling

- Each function includes error handling and logging
- Errors in fetching individual roles' access don't block the overall analysis
- Returns empty arrays instead of failing on missing data

### 4. Output Format

- Results are formatted as Markdown for easy display in VS Code
- Provides both summary statistics and detailed breakdowns
- Markdown can be exported to documents or used in reports

## Limitations and Improvements

### Current Limitations

1. **Role membership criteria**: Uses role descriptions instead of actual membership rules
2. **Exact matching only**: Doesn't handle partial string matches or complex criteria
3. **Single attribute analysis**: Analyzes one attribute change at a time

### Future Enhancements

1. **Advanced role matching**: Query IdentityNow's role membership rules API
2. **Multi-attribute analysis**: Support analyzing multiple attribute changes in a single operation
3. **Historical analysis**: Compare with previous changes to the same attribute
4. **Exclusion lists**: Support for roles that should be excluded from analysis
5. **Access profile dependencies**: Show relationships between access profiles
6. **Entitlement mapping**: Show which sources provide each entitlement
7. **Risk scoring**: Calculate risk score based on sensitive access additions/removals
8. **Approval workflows**: Integration with approval processes for recommended access changes
9. **Compliance mapping**: Show which compliance rules are affected by access changes

## Integration with MCP Server

The tool is integrated into the IdentityNow MCP server as a standard tool that can be called by Claude or other AI models:

```typescript
// Tool definition in ListToolsRequestSchema
{
  name: "analyze_attribute_impact",
  description: "Analyze the access impact when an identity's source attribute changes...",
  inputSchema: {
    type: "object",
    properties: {
      identity_id: { type: "string", ... },
      source_name: { type: "string", ... },
      attribute_name: { type: "string", ... },
      old_value: { type: "string", ... },
      new_value: { type: "string", ... }
    },
    required: ["identity_id", "source_name", "attribute_name", "old_value", "new_value"]
  }
}

// Tool implementation in CallToolRequestSchema handler
if (name === "analyze_attribute_impact") {
  const result = await IdentityNow.analyzeAttributeImpact(...);
  const markdown = IdentityNow.formatImpactAnalysis(result);
  return { content: [{ type: "text", text: markdown }] };
}
```

## Testing

To test the impact analysis tool:

1. Ensure your IdentityNow credentials are configured
2. Call the tool with a valid identity ID and attribute change scenario
3. Verify the returned analysis includes:
   - Correct identity information
   - Proper attribute change details
   - All matching roles for both old and new values
   - Complete access profile and entitlement listings

## Example Prompts for Claude

The following prompts can be used with Claude to leverage the impact analysis tool:

### Basic Impact Analysis

```text
Analyze the access impact if John Smith (identity ID: abc123) changes from the Sales department to the Engineering department in Workday.
```

### Risk Assessment

```text
Analyze John Smith's access changes when moving from Sales to Engineering. 
Highlight any:
1. Highly privileged access being granted
2. Access that seems inappropriate for the new role
3. Potential security risks from the new access
4. Compliance concerns
```

### Access Certification

```text
I'm certifying access for John Smith who recently moved from Sales to Engineering.
Use the attribute impact analysis to show:
1. What access should have been removed
2. What access should have been added
3. Whether the current access matches expectations
4. Any access that needs immediate attention
```

## Error Handling

The tool includes comprehensive error handling:

- **Missing identity**: Returns error message
- **API connectivity issues**: Caught and logged
- **Invalid attribute values**: Returns empty role lists (no matching roles)
- **Missing access profiles/entitlements**: Returns partial results instead of failing

## Performance Considerations

- Each analysis performs multiple API calls (search for roles, fetch access for each role)
- For identities with many roles, analysis time may increase
- Results are computed on-demand (not cached) to ensure freshness
- Consider rate limits when analyzing multiple identities in succession

## Security and Privacy

- Analysis only returns access information for the specified identity
- No sensitive access data is cached
- All communications use HTTPS/secure channels configured in the MCP server
- Results should be treated as sensitive since they show system access details

## Related Tools

This tool complements other IdentityNow MCP tools:

- `get_identity`: Get comprehensive identity information
- `search_roles`: Find roles by name or keyword
- `search_access_profiles`: Find access profiles
- `search_entitlements`: Find entitlements by name or source
- `get_identity_access`: Get all current access for an identity

## Support and Feedback

For issues or feature requests related to the impact analysis tool, please refer to the main extension README and contribute through the appropriate channels.
