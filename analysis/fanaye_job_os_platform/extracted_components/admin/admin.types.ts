import type { LoginRequestDto, LoginResponseDto } from "@/domains/auth/types/auth.types";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";
export type AdminUserRole = "CANDIDATE" | "ANONYMOUS_VISITOR";
export type UserStatus =
  | "ANONYMOUS"
  | "REGISTERED"
  | "VERIFIED"
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETION_PENDING"
  | "DELETED";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
export type BillingCycle = "NONE" | "MONTHLY" | "ANNUAL" | "LIFETIME";
export type BillingCreditType = "BASE" | "MONTHLY_ALLOWANCE" | "BONUS" | "PROMOTIONAL" | "ADMIN";
export type BillingPlanStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type BillingPlanVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BillingPaymentProvider = "STRIPE" | "CHAPA";
export type BillingFeatureKey =
  | "MATCH_FEED"
  | "MATCH_VIEW"
  | "MATCH_DETAIL"
  | "APPLICATION_TRACKING"
  | "APPLICATION_INTELLIGENCE"
  | "RESUME_GENERATION"
  | "COVER_LETTER_GENERATION"
  | "KNOWLEDGE_REFRESH";
export type BillingMeteringMode = "NONE" | "ON_DELIVERY" | "ON_VIEW" | "ON_REQUEST" | "ON_SUCCESS" | "MANUAL";
export type BillingLimitPeriod = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "LIFETIME";
export type BillingUniqueBy =
  | "ALIGNMENT_ID"
  | "JOB_ID"
  | "GENERATED_RESUME_ID"
  | "GENERATED_COVER_LETTER_ID"
  | "KNOWLEDGE_SNAPSHOT_ID"
  | "APPLICATION_ID"
  | "REQUEST_ID";
export type BillingEnforcementMode = "BLOCK" | "ALLOW_AND_RECORD" | "RECORD_ONLY";
export type BillingCreditGrantTrigger =
  | "ON_SIGNUP"
  | "ON_SUBSCRIPTION_ACTIVATION"
  | "ON_RENEWAL"
  | "ON_ADMIN_GRANT"
  | "ON_PROMOTION";
export type AdminOutcome = "SUCCESS" | "FAILURE" | "UNSUPPORTED" | "SKIPPED";
export type JsonRecord = Record<string, unknown>;

export type AdminLoginRequest = LoginRequestDto;
export type AdminLoginResponse = LoginResponseDto;

export interface PagedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateAdminUserRequest {
  email: string;
  fullName?: string;
  roleTitle?: string;
  permissions?: string[];
}

export interface UpdateAdminUserRequest {
  fullName?: string;
  roleTitle?: string;
  permissions?: string[];
}

export interface AdminStaffUser {
  userId: string;
  email: string;
  fullName: string | null;
  roleTitle: string | null;
  role: AdminRole;
  permissions: string[];
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStaffUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminRole;
  status?: UserStatus;
}

export interface AdminProfile {
  userId: string;
  email: string;
  fullName: string | null;
  roleTitle?: string | null;
  permissions?: string[];
  role: AdminRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminCountBreakdown {
  total: number;
}

export interface AdminDashboard {
  generatedAt: string;
  users: AdminCountBreakdown & {
    candidates: number;
    admins: number;
    superAdmins: number;
    active: number;
    suspended: number;
    deletionPending: number;
    deleted: number;
    verified: number;
    unverified: number;
  };
  jobs: AdminCountBreakdown & {
    published: number;
    expired: number;
    archived: number;
    acquisitions: number;
    failedAcquisitions: number;
    pendingAcquisitions: number;
  };
  billing: {
    plans: number;
    publicPlans: number;
    publishedPlanVersions: number;
    subscriptions: number;
    wallets: number;
    paymentEvents: number;
    activeSubscriptions: number;
    suspendedOrInactiveSubscriptions: number;
    totalAvailableCredits: number;
    failedPaymentEvents: number;
  };
  knowledgeBase: {
    knowledgeBases: number;
    candidateImports: number;
    snapshots: number;
    failedImports: number;
    processingImports: number;
  };
  matching: {
    alignmentRecords: number;
    invalidatedAlignments: number;
    averageScore: number | null;
    lowScoreAlignments: number;
    anonymousPreviewResults: number;
  };
  application?: AdminCountBreakdown & {
    active: number;
    archived: number;
    applied: number;
    interviews: number;
    offers: number;
  };
  notification?: {
    name: string;
    status: string;
  };
  integrations?: {
    name: string;
    status: string;
  };
}

export interface AdminSystemHealth {
  status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN";
  checkedAt: string;
  api: { status: string; environment: string };
  database: { status: string };
  redis: { status: string };
  queues: Array<{ name: string; status: string }>;
  integrations: { name: string; status: string };
  domains: Array<{ name: string; status: string }>;
}

export interface AdminUserSummary {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: AdminUserRole;
  status: UserStatus;
  isVerified: boolean;
  hasUploadedCv: boolean;
  deletionState: "ACTIVE" | "DELETION_PENDING" | "DELETED";
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminUserRole;
  status?: UserStatus;
  isVerified?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "email" | "fullName" | "status";
  sortOrder?: "asc" | "desc";
}

export interface AdminActionReason {
  reason?: string;
}

export interface AdminBillingUser {
  userId: string;
  email: string | null;
  fullName: string | null;
}

export interface AdminWalletSummary {
  walletId: string;
  availableCredits: number;
  reservedCredits: number;
  consumedCredits: number;
  bonusCredits: number;
  lastCreditAt: string | null;
  lastConsumptionAt: string | null;
}

export interface AdminSubscriptionSummary {
  subscriptionId: string;
  status: SubscriptionStatus;
  user: AdminBillingUser;
  plan: {
    planId: string;
    planVersionId: string;
    planCode: string;
    planName: string;
    billingCycle: BillingCycle;
  };
  wallet: AdminWalletSummary | null;
  autoRenew: boolean;
  startedAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  expiresAt: string | null;
  renewedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionDetail extends AdminSubscriptionSummary {
  usage: JsonRecord[];
  recentTransactions: JsonRecord[];
  recentPaymentEvents: JsonRecord[];
}

export interface AdminSubscriptionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus;
  planCode?: string;
  billingCycle?: BillingCycle;
}

export interface GrantWalletCreditsRequest {
  creditAmount: number;
  creditType: BillingCreditType;
  reason: string;
  idempotencyKey?: string;
}

export interface AdminWalletCreditResponse {
  walletId: string;
  idempotent: boolean;
  wallet: AdminWalletSummary;
  transaction: {
    transactionId: string;
    transactionType: string;
    creditAmount: number;
    balanceAfter: number;
    createdAt: string;
  };
}

export interface AdminAuditLogSummary {
  auditLogId: string;
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: AdminOutcome;
  reason: string | null;
  createdAt: string;
}

export interface AdminAuditLogDetail extends AdminAuditLogSummary {
  metadata: Record<string, unknown> | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AdminAuditLogListQuery {
  page?: number;
  limit?: number;
  actorUserId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  outcome?: AdminOutcome;
  sortOrder?: "asc" | "desc";
}

export interface IntegrationHealthService {
  name: string;
  status: "OK" | "DEGRADED" | "DOWN" | "FAILED";
  configured: boolean;
  durationMs: number;
  classification?: string;
  message?: string;
}

export interface AdminIntegrationsHealth {
  status: "OK" | "DEGRADED" | "DOWN";
  checkedAt: string;
  durationMs: number;
  services: IntegrationHealthService[];
}

export interface AdminIntegrationsHealthQuery {
  includeAi?: boolean;
  includeCloudinary?: boolean;
  includeRedis?: boolean;
  includeDatabase?: boolean;
  includeQueue?: boolean;
}

export interface AdminJob {
  jobId: string;
  id?: string;
  title: string;
  company: string | null;
  companyName?: string | null;
  location: string | null;
  workLocation: string | null;
  employmentType: string | null;
  category: {
    categoryId?: string;
    categoryCode?: string;
    name?: string;
    categoryName?: string;
  } | null;
  status: string | null;
  jobStatus?: string | null;
  visibility?: string | null;
  isPublished?: boolean;
  sourceName: string | null;
  source?: { sourceName: string | null };
  applyUrl?: string | null;
  salaryText?: string | null;
  description?: string | null;
  expiresAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminJobCategory {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  parentCategory: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobCategoryRequest {
  categoryName: string;
  categoryCode: string;
  parentCategory?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AdminKnowledgeBaseSummary {
  knowledgeBaseId: string;
  userId: string;
  candidateEmail: string | null;
  candidateName: string | null;
  status: string;
  latestSnapshotId: string | null;
  latestSnapshotStatus: string | null;
  importCount: number;
  failedImportCount: number;
  snapshotCount: number;
  lastProcessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminKnowledgeBaseDetail extends AdminKnowledgeBaseSummary {
  candidate?: JsonRecord | null;
  currentSnapshot?: JsonRecord | null;
  imports: JsonRecord[];
  snapshots: JsonRecord[];
  pipeline: {
    canReprocess: boolean;
    canRebuild: boolean;
    lastError: string | null;
  };
}

export interface AdminKnowledgeSnapshot {
  snapshotId: string;
  status: string | null;
  version: number;
  createdAt: string;
  generatedAt: string | null;
}

export interface AdminKnowledgeBaseActionResponse {
  knowledgeBaseId: string;
  action: "REPROCESS" | "REBUILD";
  status: "QUEUED" | "STARTED" | "COMPLETED" | "SKIPPED";
  importId?: string;
  snapshotId?: string;
  message: string;
}

export interface AdminAlignmentSummary {
  alignmentId: string;
  userId: string | null;
  jobId: string;
  candidate: { userId: string; email: string | null; fullName: string | null; knowledgeBaseId?: string | null } | null;
  job: { jobId: string; title: string | null; company: string | null; categoryCode: string | null; status?: string | null } | null;
  score: number | null;
  status: string | null;
  isValid: boolean;
  invalidatedAt: string | null;
  provider: string | null;
  model: string | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminAlignmentDetail extends AdminAlignmentSummary {
  invalidatedReason: string | null;
  evaluation: JsonRecord;
  trace: JsonRecord;
  moderation: { canRecalculate: boolean; canInvalidate: boolean };
}

export interface AdminAlignmentActionResponse {
  alignmentId: string;
  action: "INVALIDATE" | "RECALCULATE";
  status: "COMPLETED" | "SKIPPED" | "QUEUED" | "STARTED" | "UNSUPPORTED";
  message: string;
  alignment?: AdminAlignmentDetail;
  newAlignmentId?: string;
}

export interface AdminApplicationSummary {
  applicationId: string;
  userId: string;
  candidate: { userId: string; email: string | null; fullName: string | null } | null;
  sourceType: string;
  jobId: string | null;
  alignmentId: string | null;
  matchScoreSnapshot: number | null;
  status: string;
  jobTitle: string;
  company: string | null;
  location: string | null;
  applyUrl: string | null;
  appliedAt: string | null;
  nextFollowUpAt: string | null;
  archivedAt: string | null;
  timelineEventCount: number;
  artifactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminApplicationDetail extends AdminApplicationSummary {
  notes: string | null;
  platformJob: JsonRecord | null;
  timelinePreview: JsonRecord[];
  artifactsPreview: JsonRecord[];
  moderation: { canArchive: boolean };
}

export type AdminFeedbackReportType = "GENERAL_FEEDBACK" | "JOB_ISSUE";

export type AdminFeedbackReportStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "REPLIED"
  | "RESOLVED"
  | "CLOSED";

export type AdminFeedbackReportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type AdminFeedbackReplyVisibility =
  | "CANDIDATE_VISIBLE"
  | "INTERNAL_NOTE";

export interface AdminFeedbackReporter {
  userId: string;
  email: string | null;
  fullName: string | null;
}

export interface AdminFeedbackJob {
  jobId: string;
  title: string | null;
  company: string | null;
}

export interface AdminFeedbackReply {
  replyId: string;
  adminUserId: string;
  message: string;
  visibility: AdminFeedbackReplyVisibility;
  notifyCandidateRequested: boolean;
  notificationQueued: boolean;
  createdAt: string;
}

export interface AdminFeedbackReportSummary {
  feedbackReportId: string;
  type: AdminFeedbackReportType;
  category: string;
  subject: string | null;
  messagePreview: string;
  status: AdminFeedbackReportStatus;
  priority: AdminFeedbackReportPriority;
  reporter: AdminFeedbackReporter;
  job: AdminFeedbackJob | null;
  createdAt: string;
  updatedAt: string;
  lastAdminReplyAt: string | null;
}

export interface AdminFeedbackReportDetail extends AdminFeedbackReportSummary {
  message: string;
  pagePath: string | null;
  rating: number | null;
  resolvedAt: string | null;
  closedAt: string | null;
  replies: AdminFeedbackReply[];
}

export interface AdminFeedbackReportListQuery {
  type?: AdminFeedbackReportType;
  category?: string;
  status?: AdminFeedbackReportStatus;
  priority?: AdminFeedbackReportPriority;
  jobId?: string;
  reporterUserId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

export interface AdminFeedbackReportListResponse {
  data: AdminFeedbackReportSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateAdminFeedbackStatusRequest {
  status: AdminFeedbackReportStatus;
}

export interface UpdateAdminFeedbackPriorityRequest {
  priority: AdminFeedbackReportPriority;
}

export interface AddAdminFeedbackReplyRequest {
  message: string;
  visibility: AdminFeedbackReplyVisibility;
  notifyCandidateRequested?: boolean;
}

export interface AdminFeedbackReplyResponse {
  report: AdminFeedbackReportDetail;
  notificationQueued: boolean;
}

export interface AdminDeletedUser {
  deletionId: string;
  userId: string;
  emailSnapshot: string;
  fullNameSnapshot: string | null;
  status: string;
  requestedAt: string;
  purgeAfter: string;
  recoveredAt: string | null;
  purgedAt: string | null;
  recoverable: boolean;
}

export interface AccountDeletionActionResponse {
  deletionId: string;
  userId: string;
  status: string;
  email?: string;
  fullName?: string | null;
  purgedAt?: string;
}

export interface BillingFeatureRule {
  ruleId: string;
  featureKey: BillingFeatureKey;
  enabled: boolean;
  meteringMode: BillingMeteringMode;
  limitPeriod: BillingLimitPeriod;
  limitAmount: number | null;
  creditCost: number;
  resetTimezone: string | null;
  uniqueBy: BillingUniqueBy | null;
  enforcementMode: BillingEnforcementMode;
  metadata: JsonRecord | null;
}

export interface BillingCreditGrantRule {
  grantRuleId: string;
  trigger: BillingCreditGrantTrigger;
  creditAmount: number;
  creditType: BillingCreditType;
  expiresAfterDays: number | null;
  isActive: boolean;
  metadata: JsonRecord | null;
}

export interface BillingProviderMapping {
  mappingId: string;
  planVersionId: string;
  provider: BillingPaymentProvider;
  providerProductId: string | null;
  providerPriceId: string | null;
  providerPlanId: string | null;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  isActive: boolean;
  metadata: JsonRecord | null;
}

export interface BillingPlanVersion {
  planVersionId: string;
  version: number;
  billingCycle: BillingCycle;
  priceAmount: string;
  priceCurrency: string;
  status: BillingPlanVersionStatus;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  publishedAt: string | null;
  featureRules: BillingFeatureRule[];
  creditGrantRules: BillingCreditGrantRule[];
  providerMappings?: BillingProviderMapping[];
}

export interface BillingPlan {
  planId: string;
  planCode: string;
  planName: string;
  description: string | null;
  status: BillingPlanStatus;
  isPublic: boolean;
  displayOrder: number;
  latestPublishedVersion?: BillingPlanVersion | null;
}

export interface CreateBillingPlanRequest {
  planCode: string;
  planName: string;
  description?: string | null;
  status?: BillingPlanStatus;
  isPublic?: boolean;
  displayOrder?: number;
}

export type UpdateBillingPlanRequest = Omit<Partial<CreateBillingPlanRequest>, "planCode">;

export interface CreateBillingPlanVersionRequest {
  billingCycle: BillingCycle;
  priceAmount: number;
  priceCurrency: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface CreateBillingFeatureRuleRequest {
  featureKey: BillingFeatureKey;
  enabled?: boolean;
  meteringMode: BillingMeteringMode;
  limitPeriod: BillingLimitPeriod;
  limitAmount?: number | null;
  creditCost?: number;
  resetTimezone?: string | null;
  uniqueBy?: BillingUniqueBy | null;
  enforcementMode?: BillingEnforcementMode;
  metadata?: JsonRecord | null;
}

export type UpdateBillingFeatureRuleRequest = Partial<CreateBillingFeatureRuleRequest>;

export interface CreateBillingCreditGrantRuleRequest {
  trigger: BillingCreditGrantTrigger;
  creditAmount: number;
  creditType: BillingCreditType;
  expiresAfterDays?: number | null;
  isActive?: boolean;
  metadata?: JsonRecord | null;
}

export type UpdateBillingCreditGrantRuleRequest = Partial<CreateBillingCreditGrantRuleRequest>;

export interface CreateProviderMappingRequest {
  provider: BillingPaymentProvider;
  providerProductId?: string | null;
  providerPriceId?: string | null;
  providerPlanId?: string | null;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  isActive?: boolean;
  metadata?: JsonRecord | null;
}

export type UpdateProviderMappingRequest = Partial<CreateProviderMappingRequest>;

export interface BillingSetting {
  settingKey: string;
  settingValue: JsonRecord;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateBillingSettingRequest {
  settingValue: JsonRecord;
  description?: string | null;
  isActive?: boolean;
}

export interface JobSource {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  isActive: boolean;
  isBlocked: boolean;
  totalJobs: number;
  publishedJobs: number;
  archivedJobs: number;
  acquisitionCount: number;
  failedAcquisitionCount: number;
  lastSeenAt: string | null;
  lastIngestedAt: string | null;
  lastSyncAt: string | null;
  successRate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSourceListQuery {
  search?: string;
  isActive?: boolean;
}

export interface UpdateJobSourceStatusRequest {
  status: "ACTIVE" | "INACTIVE";
}

export interface JobAcquisition {
  acquisitionId: string;
  sourceId: string;
  externalJobId: string | null;
  sourceUrl: string | null;
  inputMode: string;
  acquisitionStatus: string;
  processingStage: string;
  rawPayload: unknown | null;
  structuredPayload: unknown | null;
  normalizedPreview: unknown | null;
  canonicalJobHash: string | null;
  publishedJobId: string | null;
  duplicateOfJobId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  acquiredAt: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobAcquisitionListQuery {
  page?: number;
  limit?: number;
  status?: string;
  stage?: string;
  inputMode?: string;
  sourceId?: string;
}

export interface PagedJobAcquisitionsResponse {
  items: JobAcquisition[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateManualJobImportRequest {
  sourceName: string;
  externalJobId?: string;
  title: string;
  companyName: string;
  companyVerified?: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  technologies: string[];
  benefits: string[];
  country: string;
  city: string;
  workLocation: "REMOTE" | "ON_SITE" | "HYBRID";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  experienceLevel: "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
  categoryCode: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  applyUrl: string;
  publishedAt?: string;
  expiresAt?: string;
}

export interface ManualJobImportResponse {
  published: boolean;
  duplicate: boolean;
  job: JsonRecord;
}

export type SourceDeliveryPolicyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface SourceDeliveryPolicyEntry {
  id?: string;
  sourceCode: string;
  targetPercentage: number;
  minPercentage: number;
  maxPercentage: number;
  isFallback: boolean;
}

export interface SourceDeliveryPolicy {
  id: string;
  name: string | null;
  status: SourceDeliveryPolicyStatus;
  publishedAt: string | null;
  publishedById: string | null;
  entries: SourceDeliveryPolicyEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminSourceDeliveryPolicyOverview {
  activePolicy: SourceDeliveryPolicy;
  draftPolicy: SourceDeliveryPolicy | null;
  availableSources: string[];
}

export interface SaveSourceDeliveryPolicyDraftRequest {
  name?: string;
  entries: Array<{
    sourceCode: string;
    targetPercentage: number;
    minPercentage?: number;
    maxPercentage?: number;
    isFallback?: boolean;
  }>;
}

export interface PublishSourceDeliveryPolicyRequest {
  policyId?: string;
  name?: string;
  entries?: Array<{
    sourceCode: string;
    targetPercentage: number;
    minPercentage?: number;
    maxPercentage?: number;
    isFallback?: boolean;
  }>;
}

export interface AdminPromoCode {
  id: string;
  code: string;
  description: string | null;
  discountPercentage: number;
  planId: string | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  featuredOnCard: boolean;
  cardBadgeText: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    planCode: string;
    planName: string;
  } | null;
  _count?: {
    redemptions: number;
  };
}

export interface AdminPromoCodeRedemption {
  id: string;
  promoCodeId: string;
  userId: string;
  checkoutSessionId: string | null;
  subscriptionId: string | null;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

export interface CreateAdminPromoCodeRequest {
  code?: string;
  description?: string;
  discountPercentage: number;
  planId?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
  featuredOnCard?: boolean;
  cardBadgeText?: string | null;
}

export interface UpdateAdminPromoCodeRequest {
  description?: string;
  discountPercentage?: number;
  planId?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
  featuredOnCard?: boolean;
  cardBadgeText?: string | null;
}

export interface AdminJobPreWarmItem {
  roleQuery: string;
  workMode?: string;
  employmentType?: string;
}

export interface AdminJobPreWarmRequest {
  items: AdminJobPreWarmItem[];
  postedWithinDays?: number;
}

export interface AdminJobPreWarmDispatchSummary {
  dispatchId: string;
  chunkIndex: number;
  chunkCount: number;
  criteriaCount: number;
  status: string;
  roles: string[];
  error?: string | null;
}

export interface AdminJobPreWarmResponse {
  totalRoles: number;
  uniqueRoles: number;
  totalDispatches: number;
  successfulDispatches: number;
  failedDispatches: number;
  dispatches: AdminJobPreWarmDispatchSummary[];
}

export interface AdminJobPreWarmHistoryItem {
  dispatchId: string;
  chunkIndex?: number | null;
  chunkCount?: number | null;
  criteriaCount: number;
  status: string;
  createdAt: string;
  acknowledgedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  roles: string[];
}

// ── Candidate Activity & Journey Monitoring ─────────────────────────────────

export interface AdminCandidateActivityQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleTitle?: string;
  status?: string;
  sortBy?: 'createdAt' | 'lastActiveAt' | 'fullName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateActivityPreferences {
  preferredTitles: string[];
  employmentTypes: string[];
  workLocations: string[];
  preferredSources: string[];
  confirmedAt: string | null;
  version: number | null;
}

export interface CandidateActivityKnowledgeBase {
  exists: boolean;
  version: number | null;
  profileCompleteness: number | null;
  lastProcessedAt: string | null;
  isReady: boolean;
  knowledgeDocument?: Record<string, any> | null;
}

export interface CandidateActivityTotals {
  mapped: number;
  reached: number;
  opened: number;
  applied: number;
  resumes: number;
  coverLetters: number;
}

export interface AdminCandidateActivitySummary {
  userId: string;
  fullName: string | null;
  email: string | null;
  phoneNumber?: string | null;
  roleTitle?: string | null;
  targetRoleHeadline?: string | null;
  executiveSummary?: string | null;
  status: string;
  onboardingStage: string;
  createdAt: string;
  lastActiveAt: string | null;
  preferredTitles: string[];
  preferences: CandidateActivityPreferences;
  knowledgeBase: CandidateActivityKnowledgeBase;
  totals: CandidateActivityTotals;
}

export interface AdminCandidateActivityListResponse {
  data: AdminCandidateActivitySummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CandidateDailyJobReached {
  opportunityId: string;
  jobId: string;
  jobTitle: string;
  company: string | null;
  workLocation: string | null;
  employmentType: string | null;
  city: string | null;
  country: string | null;
  releasedAt: string | null;
  firstViewedAt: string | null;
  evaluationStatus: string;
  score: number | null;
  recommendation: string | null;
}

export interface CandidateDailyJobOpened {
  opportunityId: string;
  jobId: string;
  jobTitle: string;
  company: string | null;
  openedAt: string;
}

export interface CandidateDailyApplication {
  applicationId: string;
  jobId: string | null;
  jobTitle: string;
  company: string | null;
  status: string;
  appliedAt: string | null;
  createdAt: string;
  applyUrl: string | null;
}

export interface CandidateDailyDocument {
  id: string;
  type: 'RESUME' | 'COVER_LETTER';
  title: string | null;
  jobId: string | null;
  jobTitle: string | null;
  company: string | null;
  status: string;
  generatedAt: string | null;
  createdAt: string;
}

export interface CandidateDailySummary {
  mapped: number;
  reached: number;
  opened: number;
  applied: number;
  resumesGenerated: number;
  coverLettersGenerated: number;
}

export interface CandidateDailyActivityItem {
  date: string;
  summary: CandidateDailySummary;
  jobsReached: CandidateDailyJobReached[];
  jobsOpened: CandidateDailyJobOpened[];
  applications: CandidateDailyApplication[];
  documents: CandidateDailyDocument[];
}

export interface CandidateJourneyDetail {
  candidate: AdminCandidateActivitySummary;
  timeline: CandidateDailyActivityItem[];
}

export type FilterComparisonOperator = 'ANY' | 'EQ' | 'GTE' | 'LTE';

export type CandidateExportSortBy =
  | 'createdAt'
  | 'lastActiveAt'
  | 'fullName'
  | 'email'
  | 'mapped'
  | 'reached'
  | 'opened'
  | 'applied'
  | 'resumes'
  | 'coverLetters';

export interface CandidateExportQuery {
  search?: string;
  queryRole?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  onboardingStage?: string;
  hasQueryRoles?: boolean;
  hasCv?: boolean;
  preferencesConfirmed?: boolean;
  mappedOperator?: FilterComparisonOperator;
  mappedValue?: number;
  reachedOperator?: FilterComparisonOperator;
  reachedValue?: number;
  openedOperator?: FilterComparisonOperator;
  openedValue?: number;
  appliedOperator?: FilterComparisonOperator;
  appliedValue?: number;
  resumesOperator?: FilterComparisonOperator;
  resumesValue?: number;
  lettersOperator?: FilterComparisonOperator;
  lettersValue?: number;
  sortBy?: CandidateExportSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CandidateExportPreviewItem {
  userId: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  onboardingStage: string;
  createdAt: string;
  lastActiveAt: string | null;
  hasCv: boolean;
  kbVersion: number;
  kbCompleteness: number;
  targetRoles: string[];
  preferencesConfirmed: boolean;
  preferencesConfirmedAt: string | null;
  totals: CandidateActivityTotals;
}

export interface CandidateExportPreviewResponse {
  data: CandidateExportPreviewItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Course Suggestions Engine Types
// ---------------------------------------------------------------------------

export type CourseSuggestionStatus = 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';

export interface AdminCourseSuggestionCandidateQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ALL' | 'READY' | 'PENDING' | 'NONE';
}

export interface LatestAlignedJobSnapshot {
  title: string;
  company: string | null;
  evaluatedAt: string;
  overallScore: number;
}

export interface AdminCourseSuggestionCandidateSummary {
  userId: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  status: string;
  onboardingStage: string;
  headline: string | null;
  profileCompleteness: number | null;
  totalEvaluatedJobs: number;
  suggestionsReadyCount: number;
  suggestionsPendingCount: number;
  latestAlignedJob: LatestAlignedJobSnapshot | null;
}

export interface AdminCourseSuggestionCandidateMetrics {
  totalCandidatesWithAlignments: number;
  totalEvaluatedJobs: number;
  totalRoadmapsReady: number;
  totalRoadmapsPending: number;
}

export interface AdminCourseSuggestionCandidatesResponse {
  data: AdminCourseSuggestionCandidateSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  metrics: AdminCourseSuggestionCandidateMetrics;
}

export interface SkillPriorityGap {
  skillName: string;
  priority: string;
  reason: string;
}

export interface CourseSuggestionSummaryPill {
  id: string;
  status: CourseSuggestionStatus;
  skillsAddressed: string[];
  summary: string | null;
  resourceCount: number;
  generatedAt: string | null;
  errorMessage: string | null;
}

export interface AdminCandidateAlignedJob {
  alignmentId: string;
  jobId: string;
  jobTitle: string;
  companyName: string | null;
  workLocation: string | null;
  employmentType: string | null;
  city: string | null;
  country: string | null;
  overallScore: number;
  skillsScore: number | null;
  recommendation: string;
  evaluatedAt: string;
  missingSkills: string[];
  partialSkills: string[];
  matchedSkills: string[];
  priorityGaps: SkillPriorityGap[];
  suggestion: CourseSuggestionSummaryPill | null;
}

export interface CandidateProfileSnapshot {
  userId: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  status: string;
  onboardingStage: string;
  headline: string | null;
  profileCompleteness: number | null;
  baselineSkills: string[];
}

export interface AdminCandidateAlignmentsResponse {
  candidate: CandidateProfileSnapshot;
  alignments: AdminCandidateAlignedJob[];
}

export interface AdminCourseResourceItem {
  skill: string;
  title: string;
  platform: string;
  authorOrChannel: string;
  type: 'VIDEO_COURSE' | 'OFFICIAL_DOCS' | 'INTERACTIVE_TUTORIAL' | 'GUIDE';
  estimatedDuration: string;
  destinationUrl: string;
  whyRecommended: string;
}

export interface AdminCourseSuggestionDetail {
  id: string;
  candidateId: string;
  alignmentId: string;
  jobId: string;
  jobTitle: string;
  companyName: string | null;
  candidateName: string | null;
  status: CourseSuggestionStatus;
  skillsAddressed: string[];
  summary: string | null;
  resources: AdminCourseResourceItem[];
  provider: string | null;
  model: string | null;
  errorMessage: string | null;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCourseSuggestionRequest {
  alignmentId: string;
  forceRegenerate?: boolean;
}

export interface AdminSalesPhoneScript {
  openingHook: string;
  strengthPraise: string;
  bottleneckDiagnosis: string;
  upskillPitch: string;
  closingCallToAction: string;
}

export interface AdminCandidateSalesPitch {
  id: string;
  candidateId: string;
  candidateName: string | null;
  status: CourseSuggestionStatus;
  analyzedJobsCount: number;
  targetRoles: string[];
  recurringStrengths: string[];
  recurringGaps: string[];
  phoneScript: AdminSalesPhoneScript;
  followUpMessage: string | null;
  resources: AdminCourseResourceItem[];
  summary: string | null;
  provider: string | null;
  model: string | null;
  errorMessage: string | null;
  isStale: boolean;
  newActivitiesCount: number;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
