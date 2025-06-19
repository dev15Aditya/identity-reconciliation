import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default app;