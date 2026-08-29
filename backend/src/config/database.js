const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

const checkDatabaseHealth = async () => {
  try {
    // Perform simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return { isConnected: true, message: 'Database connection healthy' };
  } catch (error) {
    return { isConnected: false, message: 'Database connection failed', error: error.message };
  }
};

module.exports = {
  prisma,
  checkDatabaseHealth,
};
