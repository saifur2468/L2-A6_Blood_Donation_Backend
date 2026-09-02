// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '../../generated/prisma/client.js';

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const prisma = new PrismaClient({
//   adapter,
// });

// export default prisma;

import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config(); 


import pg from 'pg';
import { PrismaClient } from '../../prisma/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env file!');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
