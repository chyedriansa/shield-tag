import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dasrhboardRoute';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Your API is running!'); 
});

export default app;