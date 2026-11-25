/** Lead lifecycle stages aligned with DealPulse business process (status field on leads). */
export enum LeadLifecycleStage {
  NEW = 'New',
  WORKING = 'Working',
  UNQUALIFIED = 'Unqualified',
  NURTURING = 'Nurturing',
  QUALIFIED = 'Qualified',
}

export const CHANGED_BY_HEADER = 'x-changed-by';

/** Approval stage values stored on leads.approval_stage (no separate approval service DB). */
export enum LeadApprovalStage {
  NONE = 'None',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}