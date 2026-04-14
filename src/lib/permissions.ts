// Role-based permission system for agency teams

export type AgencyRole = "owner" | "manager" | "assistant";

export interface Permission {
  canEditDeals: boolean;
  canEditContracts: boolean;
  canEditInvoices: boolean;
  canSeeFinancials: boolean;
  canInviteTeam: boolean;
  canRemoveTeam: boolean;
  canChangeRoles: boolean;
  canAccessBilling: boolean;
  canDeleteAgency: boolean;
  canCreateChannels: boolean;
  canArchiveChannels: boolean;
  canAssignTasks: boolean;
  canSeeAuditLog: boolean;
  canEditCampaigns: boolean;
  canSendMessages: boolean;
  canAddNotes: boolean;
}

const rolePermissions: Record<AgencyRole, Permission> = {
  owner: {
    canEditDeals: true, canEditContracts: true, canEditInvoices: true,
    canSeeFinancials: true, canInviteTeam: true, canRemoveTeam: true,
    canChangeRoles: true, canAccessBilling: true, canDeleteAgency: true,
    canCreateChannels: true, canArchiveChannels: true, canAssignTasks: true,
    canSeeAuditLog: true, canEditCampaigns: true, canSendMessages: true,
    canAddNotes: true,
  },
  manager: {
    canEditDeals: true, canEditContracts: true, canEditInvoices: true,
    canSeeFinancials: true, canInviteTeam: true, canRemoveTeam: false,
    canChangeRoles: false, canAccessBilling: false, canDeleteAgency: false,
    canCreateChannels: true, canArchiveChannels: false, canAssignTasks: true,
    canSeeAuditLog: false, canEditCampaigns: true, canSendMessages: true,
    canAddNotes: true,
  },
  assistant: {
    canEditDeals: false, canEditContracts: false, canEditInvoices: false,
    canSeeFinancials: false, canInviteTeam: false, canRemoveTeam: false,
    canChangeRoles: false, canAccessBilling: false, canDeleteAgency: false,
    canCreateChannels: false, canArchiveChannels: false, canAssignTasks: false,
    canSeeAuditLog: false, canEditCampaigns: false, canSendMessages: true,
    canAddNotes: true,
  },
};

export function getPermissions(role: AgencyRole | string | null | undefined): Permission {
  if (!role || !rolePermissions[role as AgencyRole]) {
    return rolePermissions.assistant; // Default to most restrictive
  }
  return rolePermissions[role as AgencyRole];
}

export function hasPermission(role: AgencyRole | string | null | undefined, permission: keyof Permission): boolean {
  return getPermissions(role)[permission];
}
