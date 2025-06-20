import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    database: {
        url: process.env.DATABASE_URL
    }
};