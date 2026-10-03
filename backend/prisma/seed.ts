import { PrismaClient, RoleEnum, StatusEnum, TransactionStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Fanaye Enterprise Database Seeding...');

  // Clean existing records if any
  await prisma.auditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.passkeyCredential.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // Hash passwords with Argon2id
  const adminPassword = await argon2.hash('Fanaye@Admin2026!', {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
  });

  const devPassword = await argon2.hash('Fanaye@Dev2026!', {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
  });

  // 1. Seed Super Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fanaye.com',
      password: adminPassword,
      firstName: 'Fanaye',
      lastName: 'SuperAdmin',
      role: RoleEnum.ADMIN,
      status: StatusEnum.ACTIVE,
      isTwoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    },
  });

  // 2. Seed Demo Developer
  const dev = await prisma.user.create({
    data: {
      email: 'dev@fanaye.com',
      password: devPassword,
      firstName: 'Abebe',
      lastName: 'Bikila',
      role: RoleEnum.USER,
      status: StatusEnum.ACTIVE,
      isTwoFactorEnabled: false,
    },
  });

  // 3. Seed Locked User (Simulating account lockout)
  const locked = await prisma.user.create({
    data: {
      email: 'locked@fanaye.com',
      password: devPassword,
      firstName: 'Suspicious',
      lastName: 'Actor',
      role: RoleEnum.USER,
      status: StatusEnum.LOCKED,
      failedLoginAttempts: 5,
      lockoutExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Seeded 3 core user accounts.');

  // 4. Seed 25 Mock Financial Transactions
  const transactionTemplates = [
    { ref: 'TX-2026-001', amount: 14500.00, status: TransactionStatus.PAID, cat: 'Cloud Infrastructure', desc: 'AWS & Kubernetes cluster monthly billing' },
    { ref: 'TX-2026-002', amount: 3200.00, status: TransactionStatus.PAID, cat: 'SaaS Subscription', desc: 'Enterprise Datadog APM & Log monitoring' },
    { ref: 'TX-2026-003', amount: 890.00, status: TransactionStatus.PAID, cat: 'API Billing', desc: 'Resend transactional email & SMS gateway' },
    { ref: 'TX-2026-004', amount: 7500.00, status: TransactionStatus.PENDING, cat: 'Consulting', desc: 'Architecture advisory — FinTech compliance audit' },
    { ref: 'TX-2026-005', amount: 12000.00, status: TransactionStatus.PAID, cat: 'Custom Dev', desc: 'Payment Gateway integration milestone 2' },
    { ref: 'TX-2026-006', amount: 2400.00, status: TransactionStatus.OVERDUE, cat: 'SaaS Subscription', desc: 'Figma Organization design licenses' },
    { ref: 'TX-2026-007', amount: 480.00, status: TransactionStatus.PAID, cat: 'API Billing', desc: 'OpenAI & Anthropic LLM API consumption' },
    { ref: 'TX-2026-008', amount: 19500.00, status: TransactionStatus.PAID, cat: 'Custom Dev', desc: 'Mobile banking biometric auth module' },
    { ref: 'TX-2026-009', amount: 6200.00, status: TransactionStatus.PENDING, cat: 'Cloud Infrastructure', desc: 'Google Cloud BigQuery warehouse compute' },
    { ref: 'TX-2026-010', amount: 1500.00, status: TransactionStatus.DECLINED, cat: 'API Billing', desc: 'Twilio SMS OTP delivery failure fallback' },
    { ref: 'TX-2026-011', amount: 8900.00, status: TransactionStatus.PAID, cat: 'Consulting', desc: 'SOC 2 Type II readiness penetration test' },
    { ref: 'TX-2026-012', amount: 4200.00, status: TransactionStatus.PAID, cat: 'SaaS Subscription', desc: 'GitHub Enterprise Copilot seats' },
    { ref: 'TX-2026-013', amount: 16800.00, status: TransactionStatus.PAID, cat: 'Cloud Infrastructure', desc: 'Dedicated Redis Cluster multi-region sync' },
    { ref: 'TX-2026-014', amount: 5300.00, status: TransactionStatus.PENDING, cat: 'Custom Dev', desc: 'Hexagonal DDD vertical slice generator' },
    { ref: 'TX-2026-015', amount: 950.00, status: TransactionStatus.OVERDUE, cat: 'SaaS Subscription', desc: 'Linear Project Management enterprise workspace' },
    { ref: 'TX-2026-016', amount: 21000.00, status: TransactionStatus.PAID, cat: 'Custom Dev', desc: 'Core banking ISO 20022 message parser' },
    { ref: 'TX-2026-017', amount: 3750.00, status: TransactionStatus.PAID, cat: 'Consulting', desc: 'BullMQ asynchronous worker throughput tuning' },
    { ref: 'TX-2026-018', amount: 1250.00, status: TransactionStatus.DECLINED, cat: 'API Billing', desc: 'HaveIBeenPwned enterprise API query credits' },
    { ref: 'TX-2026-019', amount: 11400.00, status: TransactionStatus.PAID, cat: 'Cloud Infrastructure', desc: 'Cloudflare Enterprise zero-trust edge tunnels' },
    { ref: 'TX-2026-020', amount: 4900.00, status: TransactionStatus.PENDING, cat: 'SaaS Subscription', desc: 'Sentry error monitoring and performance APM' },
    { ref: 'TX-2026-021', amount: 7800.00, status: TransactionStatus.PAID, cat: 'Consulting', desc: 'PCI-DSS tokenization vault architecture' },
    { ref: 'TX-2026-022', amount: 15600.00, status: TransactionStatus.PAID, cat: 'Custom Dev', desc: 'WebAuthn passkeys cross-device authentication' },
    { ref: 'TX-2026-023', amount: 820.00, status: TransactionStatus.PAID, cat: 'API Billing', desc: 'PostgreSQL connection pooling telemetry' },
    { ref: 'TX-2026-024', amount: 3100.00, status: TransactionStatus.OVERDUE, cat: 'SaaS Subscription', desc: 'Vercel Enterprise Next.js 16 deployment tier' },
    { ref: 'TX-2026-025', amount: 27500.00, status: TransactionStatus.PAID, cat: 'Custom Dev', desc: 'Zero-Shadow editorial financial design system' },
  ];

  for (let i = 0; i < transactionTemplates.length; i++) {
    const t = transactionTemplates[i];
    const daysAgo = Math.floor((25 - i) * 14);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await prisma.transaction.create({
      data: {
        userId: i % 2 === 0 ? admin.id : dev.id,
        reference: t.ref,
        amount: t.amount,
        currency: 'USD',
        status: t.status,
        category: t.cat,
        description: t.desc,
        createdAt: date,
        updatedAt: date,
      },
    });
  }

  console.log(`✅ Seeded ${transactionTemplates.length} financial transactions.`);

  // 5. Seed Security Audit Logs
  const auditLogs = [
    {
      userId: admin.id,
      action: 'AUTH_LOGIN_SUCCESS',
      entity: 'User',
      entityId: admin.id,
      deviceId: 'macbook-pro-m3-addis',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ipAddress: '197.156.103.42',
      details: { method: 'PASSWORD_PLUS_2FA', durationMs: 142 },
    },
    {
      userId: admin.id,
      action: 'SECURITY_POLICY_UPDATE',
      entity: 'SecurityPolicy',
      entityId: 'iam-argon2id-default',
      deviceId: 'macbook-pro-m3-addis',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ipAddress: '197.156.103.42',
      details: { memoryCost: 19456, timeCost: 2, minLength: 8 },
    },
    {
      userId: dev.id,
      action: 'TRANSACTION_RECONCILED',
      entity: 'Transaction',
      entityId: 'TX-2026-001',
      deviceId: 'dell-xps-15-remote',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      ipAddress: '196.189.61.12',
      details: { amount: 14500.00, currency: 'USD', status: 'PAID' },
    },
    {
      userId: locked.id,
      action: 'ACCOUNT_LOCKOUT_TRIGGERED',
      entity: 'User',
      entityId: locked.id,
      deviceId: 'unknown-tor-node',
      userAgent: 'Python-urllib/3.10',
      ipAddress: '185.220.101.5',
      details: { failedAttempts: 5, action: 'TEMPORARY_24H_LOCK' },
    },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  console.log(`✅ Seeded ${auditLogs.length} security audit log records.`);
  console.log('🚀 Fanaye Enterprise Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
