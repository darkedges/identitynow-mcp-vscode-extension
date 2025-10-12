/**
 * Type definitions for SailPoint IdentityNow MCP Server
 */

export interface Identity {
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

export interface AccessProfile {
    id: string;
    name: string;
    description?: string;
    source?: {
        id: string;
        name: string;
    };
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    owner?: {
        id: string;
        name: string;
    };
}

export interface Account {
    id: string;
    name: string;
    identityId?: string;
    sourceId?: string;
    sourceName?: string;
    disabled?: boolean;
}

export interface Entitlement {
    id: string;
    name: string;
    description?: string;
    attribute?: string;
    value?: string;
    source?: {
        id: string;
        name: string;
        type?: string;
    };
    schema?: string;
    privileged?: boolean;
    cloudGoverned?: boolean;
    created?: string;
    modified?: string;
    synced?: string;
    displayName?: string;
    type?: string;
    requestable?: boolean;
}

export interface IdentityProfile {
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

export interface AttributeTransform {
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

export interface AttributeMapping {
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

export interface AuditEvent {
    id: string;
    created: string;
    type: string;
    action: string;
    actor?: {
        id: string;
        name: string;
        type: string;
    };
    target?: {
        id: string;
        name: string;
        type: string;
    };
    source?: {
        id: string;
        name: string;
    };
    details?: any;
    attributes?: Record<string, any>;
    result?: 'SUCCESS' | 'FAILURE' | 'PENDING';
}

export interface IdentityEvent {
    timestamp: string;
    eventType: string;
    action: string;
    itemType: string;
    itemName: string;
    itemId: string;
    changeType: 'ADDED' | 'REMOVED' | 'MODIFIED';
    actor?: string;
    source?: string;
    details?: string;
}