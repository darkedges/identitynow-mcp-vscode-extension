# Impact Analysis Tool - Example Usage Guide

## Quick Start Examples

### Example 1: Department Change (Sales → Engineering)

**Scenario**: John Smith is being promoted from Sales to Engineering

**Command to Claude**:

```text
I need to analyze the access impact for John Smith (john.smith@company.com) who is moving from the Sales department to the Engineering department. 
His employee data is in Workday.

Please use the analyze_attribute_impact tool with:
- Identity ID: [john smith's identity ID]
- Source: workday
- Attribute: department
- Old Value: Sales
- New Value: Engineering

Then provide a summary of:
1. What access will be removed
2. What access will be added
3. Any potential access gaps or over-provisioning
```

**Expected Output Format**:

```text
# Access Impact Analysis

## Identity
- **Name**: John Smith
- **ID**: 00u1234567890
- **Email**: john.smith@company.com

## Attribute Change
- **Source**: workday
- **Attribute**: department
- **Old Value**: `Sales`
- **New Value**: `Engineering`

## Summary
| Category        | Removed | Added |
| --------------- | ------- | ----- |
| Roles           | 3       | 2     |
| Access Profiles | 4       | 3     |
| Entitlements    | 12      | 9     |

## Roles to be Revoked
### Sales Representative
*Standard sales role with CRM and territory access*

**Access Profiles** (2):
- Salesforce Standard Edition - Standard Salesforce access
- Territory Management System - Territory allocation tools

**Entitlements** (5):
- Salesforce (salesforce.com) - salesforce.com entitlements
- Territory Data (salesforce.com) - Territory assignment data
- ...

## Roles to be Granted
### Software Engineer
*Core engineering role with development tool access*

**Access Profiles** (2):
- Engineering Development Tools - IDE, version control, build tools
- Cloud Infrastructure Access - AWS development environment

**Entitlements** (4):
- GitHub (github.com) - Repository access
- AWS (amazon.com) - Development account access
- ...
```

---

### Example 2: Location Change (New York → San Francisco)

**Scenario**: Jane Doe is relocating from the New York office to San Francisco

**Command to Claude**:

```text
Analyze the access impact for Jane Doe when her office location changes from New York to San Francisco.
She's an Operations Manager in Workday.

Identity ID: 00u9876543210
Source: workday
Attribute: location
Old Value: New York
New Value: San Francisco

After the analysis, please highlight:
1. Any location-specific access that needs to change
2. Regional compliance or security requirements
3. Any access that might be unexpected for the new location
```

---

### Example 3: Job Title Change (Coordinator → Manager)

**Scenario**: Sarah Chen is being promoted from Coordinator to Manager

**Command to Claude**:

```text
I'm promoting Sarah Chen from Coordinator to Manager. Please analyze the access changes.

Use the impact analysis tool:
- Identity ID: [sarah's ID]
- Source: workday  
- Attribute: job_title
- Old Value: HR Coordinator
- New Value: HR Manager

After analysis, validate that:
1. All manager-level access is being added
2. Any access gaps are identified
3. The new access aligns with HR best practices
```

---

### Example 4: Manager Change (Impact on Access)

**Scenario**: When someone gets a new manager, they might need different access

**Command to Claude**:

```text
Analyze how reporting structure changes affect access for James Wilson.

His manager is changing from "Linda Garcia" to "Michael Chen" in Workday.

Identity ID: 00u5555555555
Source: workday
Attribute: manager
Old Value: Linda Garcia
New Value: Michael Chen

Please analyze and explain:
1. What team-specific access might change
2. Whether any delegation of authority changes are needed
3. Any cross-functional access that should be updated
```

---

## Advanced Usage Scenarios

### Multi-Step Analysis

**Scenario**: Analyzing multiple attribute changes for a complex role transition

```text
I need to understand the full access impact for a role transition where three things are changing:
- The person is moving from Sales to Customer Success
- Their location is changing from New York to Los Angeles  
- Their manager is changing from John Smith to Sarah Lee

Please run three separate impact analyses:
1. Department: Sales → Customer Success
2. Location: New York → Los Angeles
3. Manager: John Smith → Sarah Lee

Then consolidate the results to show:
- Complete access change overview
- Any overlapping changes
- The net access addition/removal
- Any concerns with the new access profile
```

### Compliance Validation

**Scenario**: Validating access changes against compliance requirements

```text
We're moving Daniel Rodriguez from Sales to Finance.

Please analyze the access impact and then validate against:
1. SOX compliance requirements for Finance
2. Segregation of duties (SoD) conflicts
3. Any access he's losing that he should keep
4. Any access he's gaining that creates conflicts
5. Required access he's NOT getting that should be added

Identity ID: [daniel's ID]
Source: workday
Attribute: department
Old Value: Sales
New Value: Finance
```

### Audit and Documentation

**Scenario**: Documenting access changes for audit purposes

```text
We need to document access changes for John Davis who moved from IT Help Desk to IT Security.

Run the impact analysis:
- Identity ID: [john's ID]
- Source: workday
- Attribute: department
- Old Value: IT Help Desk
- New Value: IT Security

Then create an audit summary that includes:
1. Access Granted (with effective date)
2. Access Revoked (with effective date)
3. Audit trail information
4. Required approvals
5. Access owner assignments
```

---

## Interpreting Results

### Access Profiles Summary

- **What was removed**: Groups of entitlements/permissions associated with the old role
- **What was added**: Groups of entitlements/permissions for the new role
- **What to verify**: Access profiles should align with the person's new responsibilities

### Entitlements Detail

- **Entitlement name**: The specific system resource/permission
- **Source system**: Where the entitlement comes from (AD, Okta, Salesforce, etc.)
- **Purpose**: What the entitlement allows the user to do

### Risk Indicators to Watch For

**Access Not Removed**:

- User still has access from old role
- May violate segregation of duties
- Could be a security risk if access is sensitive

**Unexpected Access Granted**:

- New role adds access that seems unrelated
- May indicate over-provisioning
- Should be questioned before approval

**Missing Expected Access**:

- New role doesn't grant expected access
- May indicate access gaps
- Role membership rules might need updating

---

## Integration with Approval Workflows

### Manual Approval Process

1. Run impact analysis
2. Review results with:
   - Identity owner
   - New role owner
   - Security team
   - Compliance team
3. Document approvals
4. Execute access changes
5. Verify changes completed

### Automated Approval Process

The impact analysis supports automated workflows:

1. Change request submitted
2. Impact analysis runs automatically
3. Risk score calculated
4. Routes to appropriate approvers based on access level
5. Tracks audit trail of approvals

---

## Common Questions

### Q: What if no roles match the attribute values?

A: The analysis will return empty role lists. This might indicate:

- Role membership rules don't include that attribute
- New department/location doesn't have defined roles
- The attribute value spelling is different

### Q: Why is the same entitlement appearing in multiple access profiles?

A: This is normal. Entitlements can be assigned through multiple access profiles. The summary counts unique entitlements, so the "Total Entitlements" reflects the unique count.

### Q: How often should we re-run the analysis?

A: Run it:

- Before approving any attribute change
- When validating that changes took effect
- During periodic access reviews
- When investigating access gaps

### Q: Can we use this for preventive access provisioning?

A: Yes! Before someone starts a new role:

1. Set up their new attribute in the source system (HR system, AD, etc.)
2. Run the impact analysis to see what access they'll get
3. Pre-position any manual access needs
4. Coordinate with system owners for timing
5. Execute the attribute change in source system
6. Verify all access provisioned correctly

---

## Best Practices

1. **Always review before approving**: The tool shows what SHOULD happen, verify it aligns with policy
2. **Document decisions**: Keep records of what was approved and why
3. **Monitor changes**: After access changes, verify they completed
4. **Regular audits**: Use impact analysis during periodic access reviews
5. **Involve stakeholders**: Get approval from role owners and security before executing
6. **Test role rules**: Periodically test role membership rules to ensure they're working correctly
7. **Maintain role definitions**: Keep role descriptions and criteria up to date for accurate analysis

---

## Troubleshooting

### Issue: Analysis returns empty role lists

**Solutions**:

1. Check attribute name spelling (case-sensitive)
2. Verify attribute values match how they're stored in the source system
3. Ensure role membership rules include the attribute
4. Verify identity exists in the system

### Issue: Missing expected access in results

**Possible causes**:

1. Role membership rules may need updating
2. Access profile might not be linked to the role
3. Entitlements may be provisioned manually, not through roles
4. Manual access assignment not tracked

### Issue: Unexpected access appearing in analysis

**Possible causes**:

1. Role has broader membership criteria than expected
2. Role may need to be split into more granular roles
3. Access profile may be assigned to multiple roles
4. Role description may need clarification

---

## Next Steps

After running an impact analysis:

1. **Review Results**: Check all removed and added access
2. **Validate**: Confirm this matches your policies
3. **Get Approvals**: Have appropriate stakeholders approve changes
4. **Schedule Execution**: Plan when to apply the changes
5. **Execute**: Apply the attribute change in the source system
6. **Verify**: Confirm access changes took effect
7. **Document**: Record what happened for audit trail
8. **Follow Up**: Monitor for any access issues in following weeks
