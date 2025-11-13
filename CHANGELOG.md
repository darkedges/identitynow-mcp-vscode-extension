# Change Log

All notable changes to the "IdentityNow MCP" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.5] - 2025-11-13

### Added

- **Impact Analysis Tool**: Comprehensive access impact analysis for identity attribute changes
  - New tool: `analyze_attribute_impact` - Analyzes access changes when source attributes change
  - Shows roles to be revoked (old attribute value matches)
  - Shows roles to be granted (new attribute value matches)
  - Lists associated access profiles and entitlements
  - Provides summary statistics and professional Markdown output
  - Perfect for pre-change analysis, compliance validation, and access certification
  - New library functions:
    - `searchRolesByAttributeValue()` - Find roles matching an attribute value
    - `getRoleAccessProfiles()` - Get access profiles for a role
    - `getRoleEntitlements()` - Get entitlements for a role
    - `analyzeAttributeImpact()` - Main orchestration function
    - `formatImpactAnalysis()` - Format results as Markdown

### Documentation

- New comprehensive documentation files:
  - `IMPACT_ANALYSIS.md` - Complete technical reference for the impact analysis tool
  - `IMPACT_ANALYSIS_EXAMPLES.md` - Practical usage examples and scenarios
  - `TEST_IMPACT_ANALYSIS.sh` - Testing guide with test scenarios and validation checklist
  - `IMPLEMENTATION_SUMMARY.md` - Implementation details and feature overview
  - `DELIVERY_SUMMARY.md` - Quick reference guide for getting started
- Updated `README.md` with Impact Analysis tool information and usage examples

## [0.0.4] - 2025-10-12

### Added

- Comprehensive MCP tool set with 16+ identity governance functions:
  - Identity management: search, get details, analyze access patterns
  - Access management: search access profiles and roles, get identity access
  - Account management: search accounts, get identity accounts, find orphaned accounts
  - Entitlement management: search entitlements, get details, search by source
  - Governance & auditing: search identity events, audit events, user access reviews
  - Identity profiles: list profiles, get details, extract attribute mappings

### Changed

- **BREAKING**: Migrated from manual API calls to official SailPoint TypeScript SDK (`sailpoint-api-client` v1.6.9)
- **BREAKING**: Restructured codebase into modular architecture:
  - `src/types/index.ts`: Centralized TypeScript interfaces for all IdentityNow entities
  - `src/library/identitynow.ts`: Standalone, testable IdentityNow API functions
  - `src/mcp.ts`: Focused MCP server implementation (reduced from ~1600 to ~965 lines)
- Improved authentication handling with automatic environment variable detection
- Enhanced error handling and type safety throughout the codebase
- Updated documentation with comprehensive feature descriptions and usage examples

### Removed

- Manual fetch-based API implementations
- Unnecessary `configParams` variable
- Redundant authentication logic

### Fixed

- Type safety issues with search request bodies
- Import path inconsistencies
- Compilation errors related to API class naming

### Technical Details

- Dependencies updated: Added `sailpoint-api-client@^1.6.9`
- Build system: Enhanced with TypeScript compilation checks and ESBuild bundling
- Code organization: Separated concerns for better maintainability and independent testing
- Authentication: Now supports both VS Code settings and environment variables

## [0.0.3] - Previous Release

### Enhanced

- Logo implemented

## [0.0.2] - Previous Release

### Updated

- Logo implemented

## [0.0.1] - Initial Release

### Features

- Initial release with basic IdentityNow MCP functionality
- Basic identity search capabilities
- VS Code extension framework setup
