import app from './app';
import { PrismaClient } from '@prisma/client';
import config from './config/config';

const prisma = new PrismaClient();
const port = config.port;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
});

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});