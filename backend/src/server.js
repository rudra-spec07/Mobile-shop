const app = require('./app');
const env = require('./config/env');
const { prisma } = require('./config/database');

const PORT = env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Mobile-Adda Backend running on port ${PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`💓 Health Endpoint: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start Mobile-Adda backend server:', error);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      await prisma.$disconnect();
      console.log('🔒 Database connections closed.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
};

// Unhandled Rejection & Uncaught Exception Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception thrown:', error);
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
