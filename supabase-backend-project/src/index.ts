import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { Logger } from './logging/logger';
import { DashboardService } from './dashboards/dashboardService';
import { RLSValidator } from './rls/rlsValidator';
import { prismaIntegration } from './integrations/prismaIntegration';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Logger
const logger = new Logger();

// Initialize Dashboard Service
const dashboardService = new DashboardService(prisma);

// Initialize RLS Validator
const rlsValidator = new RLSValidator();

// Middleware
app.use(express.json());

// Routes
app.get('/dashboard', async (req, res) => {
    try {
        const data = await dashboardService.getDashboardData();
        res.json(data);
    } catch (error) {
        logger.logError('Error fetching dashboard data', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
app.listen(port, () => {
    logger.logInfo(`Server is running on http://localhost:${port}`);
});