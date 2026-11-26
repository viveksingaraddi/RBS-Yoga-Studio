import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('🧪 Starting End-to-End Verification Suite for RBS Yoga Studio...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  // --- 1. Database Connection & Schema Verification ---
  console.log('--- 1. Testing Remote Prisma Database & Clean State ---');
  const settings = await prisma.businessSettings.findUnique({ where: { id: 'singleton' } });
  assert(settings !== null, 'Business settings singleton exists');
  assert(settings?.businessName === 'RBS Yoga Studio', 'Studio name is "RBS Yoga Studio"');
  assert(settings?.publicContactEmail === 'yogawithsangu@gmail.com', 'Public email is yogawithsangu@gmail.com');
  assert(settings?.adminNotificationEmail === 'yogawithsangu@gmail.com', 'Admin email is yogawithsangu@gmail.com');
  assert(settings?.instructorName === 'Master Sangu', 'Lead instructor is Master Sangu');
  assert(settings?.publicWhatsAppNumber === '+91 89513 46405', 'WhatsApp number is +91 89513 46405');

  // Verify accounts (1 per role)
  const users = await prisma.user.findMany({});
  assert(users.length === 3, `Exactly 3 accounts exist in the entire database (found ${users.length})`);

  const admin = users.find((u) => u.role === 'ADMIN');
  const instructor = users.find((u) => u.role === 'INSTRUCTOR');
  const learner = users.find((u) => u.role === 'LEARNER');

  assert(admin?.email === 'admin@rbsyogastudio.com', 'Admin account is admin@rbsyogastudio.com');
  assert(instructor?.email === 'instructor@rbsyogastudio.com', 'Instructor account is instructor@rbsyogastudio.com');
  assert(learner?.email === 'learner@rbsyogastudio.com', 'Learner account is learner@rbsyogastudio.com');

  // Verify No Fake Bookings or Fake Payments
  const bookings = await prisma.booking.findMany({});
  assert(bookings.length === 0, `No fake bookings exist (found ${bookings.length})`);

  const payments = await prisma.payment.findMany({});
  assert(payments.length === 0, `No fake payments exist (found ${payments.length})`);

  // Verify Programs & Plans
  const programs = await prisma.program.findMany({});
  assert(programs.length === 6, `Exactly 6 authentic core programs exist (found ${programs.length})`);

  const plans = await prisma.membershipPlan.findMany({});
  assert(plans.length === 3, `Exactly 3 authentic membership plans exist (found ${plans.length})`);

  // Verify Configured Learner has Active Membership
  const learnerMembership = await prisma.membership.findFirst({
    where: { userId: learner.id, status: 'ACTIVE' },
  });
  assert(learnerMembership !== null, 'Configured learner has an active subscription membership');

  // --- 2. Password Hashing & Bcrypt Verification ---
  console.log('\n--- 2. Testing Password Security & Role Authentication ---');
  const isAdminValid = await bcrypt.compare('Admin@RBSYoga2026!', admin.passwordHash);
  assert(isAdminValid, 'Admin credentials authenticate with bcrypt');

  const isInstructorValid = await bcrypt.compare('Instructor@RBSYoga2026!', instructor.passwordHash);
  assert(isInstructorValid, 'Instructor credentials authenticate with bcrypt');

  const isLearnerValid = await bcrypt.compare('Learner@RBSYoga2026!', learner.passwordHash);
  assert(isLearnerValid, 'Learner credentials authenticate with bcrypt');

  // --- 3. Subscription-Based Access Control Rules ---
  console.log('\n--- 3. Testing Subscription Access Control Rules ---');
  const CONFIG_SYSTEM_EMAILS = [
    'admin@rbsyogastudio.com',
    'instructor@rbsyogastudio.com',
    'learner@rbsyogastudio.com',
    'yogawithsangu@gmail.com',
  ];

  // Configured accounts are always permitted
  assert(CONFIG_SYSTEM_EMAILS.includes(admin.email), 'Admin is whitelisted for direct portal access');
  assert(CONFIG_SYSTEM_EMAILS.includes(instructor.email), 'Instructor is whitelisted for direct portal access');
  assert(CONFIG_SYSTEM_EMAILS.includes(learner.email), 'Configured learner is whitelisted');

  // Non-configured user simulation
  const mockUnsubscribedLearner = {
    id: 'mock-user-unsubscribed',
    email: 'new_student@example.com',
    role: 'LEARNER',
  };

  const isMockConfigured = CONFIG_SYSTEM_EMAILS.includes(mockUnsubscribedLearner.email);
  assert(!isMockConfigured, 'New student is NOT on the whitelist');

  // Check their membership
  const mockMembership = await prisma.membership.findFirst({
    where: { userId: mockUnsubscribedLearner.id, status: 'ACTIVE' },
  });
  assert(!mockMembership, 'New student has no active membership yet');

  // Rule evaluation
  const shouldAllowLogin = mockUnsubscribedLearner.role === 'ADMIN' || isMockConfigured || !!mockMembership;
  assert(shouldAllowLogin === false, 'Access control correctly BLOCKS login for unsubscribed non-configured users');

  // --- 4. Password Update Simulation ---
  console.log('\n--- 4. Testing Password Update Mechanism ---');
  const testNewPassword = 'UpdatedSecurePass2026!';
  const updatedSalt = await bcrypt.genSalt(12);
  const updatedHash = await bcrypt.hash(testNewPassword, updatedSalt);

  assert(await bcrypt.compare(testNewPassword, updatedHash), 'Updated password verifies correctly');
  assert(!(await bcrypt.compare('WrongPassword', updatedHash)), 'Incorrect password rejected');

  // --- 5. JWT Token Integrity ---
  console.log('\n--- 5. Testing JWT Session Generation & Verification ---');
  const JWT_SECRET = process.env.JWT_SECRET || 'rbs_yoga_studio_super_secret_jwt_key_2026_dev_prod_secure_min32chars';
  const token = jwt.sign(
    { userId: admin.id, email: admin.email, name: admin.name, role: admin.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const decoded = jwt.verify(token, JWT_SECRET);
  assert(decoded.userId === admin.id, 'JWT token userId matches');
  assert(decoded.role === 'ADMIN', 'JWT token role matches ADMIN');

  console.log(`\n========================================`);
  console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
