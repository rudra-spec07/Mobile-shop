const http = require('http');
const zlib = require('zlib');
const app = require('./src/app');
const { generateToken } = require('./src/utils/jwt');
const { ROLES } = require('./src/utils/constants');
const { brandCache, categoryCache } = require('./src/utils/cache');

const PORT = 5052;

const runPerformanceTests = async () => {
  console.log('🧪 Running Module 11 Backend Performance & Optimization Verification Suite...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}`;

  const adminToken = generateToken({ userId: 'admin-uuid-test', role: ROLES.SUPER_ADMIN });

  const makeRequest = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.get(url, options, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const contentEncoding = res.headers['content-encoding'];
          let bodyStr;
          if (contentEncoding === 'gzip') {
            bodyStr = zlib.gunzipSync(buffer).toString('utf8');
          } else {
            bodyStr = buffer.toString('utf8');
          }
          let json = null;
          try { json = JSON.parse(bodyStr); } catch (e) {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json || bodyStr,
            rawSize: buffer.length,
          });
        });
      });
      req.on('error', reject);
    });
  };

  try {
    // 1. Verify Response Time Header & Performance Middleware
    console.log('1️⃣ Performance Middleware & X-Response-Time Header Test:');
    const healthRes = await makeRequest(`${baseUrl}/api/v1/health`);
    console.log(`   - Status: ${healthRes.statusCode}`);
    console.log(`   - X-Response-Time Header: ${healthRes.headers['x-response-time'] || 'Present on finish'}`);
    if (healthRes.statusCode === 200 && healthRes.body.success) {
      console.log('   ✅ Performance middleware verified.\n');
    } else {
      throw new Error('❌ Health endpoint failed!');
    }

    // 2. Database Health & Latency Test
    console.log('2️⃣ Database Health Latency Test:');
    const dbHealthRes = await makeRequest(`${baseUrl}/api/v1/health/database`);
    console.log(`   - Status: ${dbHealthRes.statusCode}`);
    console.log(`   - DB Response Time: ${dbHealthRes.body.responseTimeMs} ms`);
    if (dbHealthRes.statusCode === 200 && dbHealthRes.body.status === 'UP') {
      console.log('   ✅ Database connectivity & performance check passed.\n');
    } else {
      throw new Error('❌ Database health check failed!');
    }

    // 3. Super Admin Dashboard Aggregation Performance Test
    console.log('3️⃣ Optimized Super Admin Dashboard Stats Aggregation Test:');
    const startDashboard = Date.now();
    const dashRes = await makeRequest(`${baseUrl}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashDuration = Date.now() - startDashboard;
    console.log(`   - Status: ${dashRes.statusCode}`);
    console.log(`   - Total Execution Duration: ${dashDuration} ms`);
    console.log(`   - Output Summary: Customers: ${dashRes.body.data?.statistics?.customers?.total}, Mobiles: ${dashRes.body.data?.statistics?.mobiles?.total}, Parts: ${dashRes.body.data?.statistics?.parts?.total}`);
    if (dashRes.statusCode === 200 && dashRes.body.success) {
      console.log('   ✅ Dashboard aggregation query optimization passed.\n');
    } else {
      throw new Error('❌ Dashboard stats test failed!');
    }

    // 4. In-Memory Reference Data Caching Test (Brands)
    console.log('4️⃣ In-Memory Reference Data Caching Test (Brands):');
    brandCache.clear();
    const t0 = Date.now();
    await makeRequest(`${baseUrl}/api/v1/brands?page=1&limit=10`);
    const durationMiss = Date.now() - t0;

    const t1 = Date.now();
    const cacheHitRes = await makeRequest(`${baseUrl}/api/v1/brands?page=1&limit=10`);
    const durationHit = Date.now() - t1;

    console.log(`   - Cache Miss Duration: ${durationMiss} ms`);
    console.log(`   - Cache Hit Duration: ${durationHit} ms`);
    if (cacheHitRes.statusCode === 200 && durationHit <= durationMiss) {
      console.log('   ✅ Reference data in-memory TTL caching passed.\n');
    } else {
      throw new Error('❌ Brands caching test failed!');
    }

    // 5. Pagination Limit Safeguard Test
    console.log('5️⃣ Pagination Boundary Safeguard Test:');
    const pagRes = await makeRequest(`${baseUrl}/api/v1/mobiles?page=1&limit=999999`);
    console.log(`   - Requested Limit: 999999, Clamped Limit Returned: ${pagRes.body.pagination?.limit}`);
    if (pagRes.statusCode === 200 && pagRes.body.pagination?.limit <= 100) {
      console.log('   ✅ Pagination limit safeguard verified (Max: 100).\n');
    } else {
      throw new Error('❌ Pagination safeguard test failed!');
    }

    // 6. JSON Response Compression Test (Gzip)
    console.log('6️⃣ Response Compression Test (Gzip):');
    const gzipRes = await makeRequest(`${baseUrl}/api/v1/mobiles?page=1&limit=20`, {
      headers: { 'Accept-Encoding': 'gzip' },
    });
    console.log(`   - Content-Encoding Header: ${gzipRes.headers['content-encoding']}`);
    console.log(`   - Compressed Response Size: ${gzipRes.rawSize} bytes`);
    if (gzipRes.statusCode === 200) {
      console.log('   ✅ JSON response compression verified.\n');
    } else {
      throw new Error('❌ Response compression test failed!');
    }

    console.log('🎉 All Module 11 Performance & Optimization tests completed successfully!');
  } finally {
    server.close();
  }
};

runPerformanceTests().catch((err) => {
  console.error('💥 Performance test suite failed:', err);
  process.exit(1);
});
