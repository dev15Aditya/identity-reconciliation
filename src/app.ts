import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/identify';

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/identify', router)

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default app;