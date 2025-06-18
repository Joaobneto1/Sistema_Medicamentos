import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const syncDataWithSupabase = async () => {
    // Logic to sync data between Prisma and Supabase
};

export const performQuery = async (query: string) => {
    // Logic to perform specific queries using Prisma
    return await prisma.$queryRaw(query);
};

export const getSupabaseData = async (table: string) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
        throw new Error(error.message);
    }
    return data;
};