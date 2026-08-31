const app = require('../src/app');
const http = require('http');
const { prisma } = require('../src/config/database');
const { createAuditLog, getAuditLogs } = require('../src/services/audit.service');

const PORT = 5051;

const runModule10Tests = async () => {
  console.log('🔒 Running Module 10 Security, Audit & Health Tests on port', PORT, '...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));

  try {
    // 1. Health check GET /api/v1/health
    console.log('1️⃣ Testing GET /api/v1/health:');
    const healthRes = await fetch(`http://localhost:${PORT}/api/v1/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status, '| Status field:', healthData.status);
    if (healthRes.status === 200 && healthData.status === 'UP' && healthData.service === 'mobile-adda-backend') {
      console.log('   ✅ Health endpoint test passed.\n');
    } else {
      throw new Error('❌ Health endpoint test failed!');
    }

    // 2. Database Health check GET /api/v1/health/database
    console.log('2️⃣ Testing GET /api/v1/health/database:');
    const dbHealthRes = await fetch(`http://localhost:${PORT}/api/v1/health/database`);
    const dbHealthData = await dbHealthRes.json();
    console.log('   Status:', dbHealthRes.status, '| Database:', dbHealthData.database, '| ResponseTime:', dbHealthData.responseTimeMs + 'ms');
    if (dbHealthRes.status === 200 && dbHealthData.status === 'UP' && dbHealthData.database === 'Neon PostgreSQL') {
      console.log('   ✅ Database health check test passed.\n');
    } else {
      throw new Error('❌ Database health check test failed!');
    }

    // 3. Request ID header test
    console.log('3️⃣ Testing X-Request-ID Header:');
    const reqIdHeader = healthRes.headers.get('x-request-id');
    console.log('   Received X-Request-ID:', reqIdHeader);
    if (reqIdHeader && reqIdHeader.length > 0) {
      console.log('   ✅ X-Request-ID test passed.\n');
    } else {
      throw new Error('❌ X-Request-ID test failed!');
    }

    // 4. Swagger UI endpoints (/api/docs and /api-docs)
    console.log('4️⃣ Testing Swagger UI routes (/api/docs and /api-docs):');
    const docsRes1 = await fetch(`http://localhost:${PORT}/api/docs/`);
    const docsRes2 = await fetch(`http://localhost:${PORT}/api-docs/`);
    console.log('   /api/docs Status:', docsRes1.status);
    console.log('   /api-docs Status:', docsRes2.status);
    if (docsRes1.status === 200 && docsRes2.status === 200) {
      console.log('   ✅ Swagger UI route aliases test passed.\n');
    } else {
      throw new Error('❌ Swagger UI route aliases test failed!');
    }

    // 5. Rate Limiting Test on POST /api/v1/auth/login
    console.log('5️⃣ Testing Rate Limiter on POST /api/v1/auth/login:');
    let hitRateLimit = false;
    for (let i = 1; i <= 12; i++) {
      const loginRes = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile: 'admin@mobileadda.shop', password: 'wrongpassword' }),
      });
      if (loginRes.status === 429) {
        hitRateLimit = true;
        const rateData = await loginRes.json();
        console.log(`   Hit rate limit on request #${i}! Code: ${rateData.errorCode}, Message: "${rateData.message}"`);
        break;
      }
    }
    if (hitRateLimit) {
      console.log('   ✅ Rate Limiting test passed.\n');
    } else {
      throw new Error('❌ Rate limiting failed to trigger status 429 after 10 requests!');
    }

    // 6. Audit Service test
    console.log('6️⃣ Testing Audit Log creation:');
    const auditRecord = await createAuditLog({
      userId: 'test-user-id',
      action: 'TEST_AUDIT_ACTION',
      entityType: 'TestEntity',
      entityId: 'test-123',
      oldValue: { status: 'OLD', password: 'MUST_BE_REMOVED' },
      newValue: { status: 'NEW' },
    });
    console.log('   Created Audit Log ID:', auditRecord?.id);
    console.log('   Logged OldValue:', auditRecord?.oldValue);
    if (auditRecord && auditRecord.oldValue.password === undefined && auditRecord.oldValue.status === 'OLD') {
      console.log('   ✅ Audit logging and sensitive field sanitization test passed.\n');
    } else {
      throw new Error('❌ Audit log creation failed or sensitive field password was not stripped!');
    }

    // Clean up test audit record
    if (auditRecord?.id) {
      await prisma.auditLog.delete({ where: { id: auditRecord.id } }).catch(() => {});
    }

    console.log('🎉 ALL MODULE 10 SECURITY, AUDIT & HEALTH TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
};

runModule10Tests().catch((err) => {
  console.error('💥 Module 10 Test Failed:', err);
  process.exit(1);
});
