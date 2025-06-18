const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'job_post',
    password: 'Veera@0134',
    port: 5432,
});

app.use(cors());
app.use(express.json());

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                location VARCHAR(255) NOT NULL,
                experience VARCHAR(50) NOT NULL,
                currency VARCHAR(10),
                min_salary INTEGER,
                max_salary INTEGER,
                salary_period VARCHAR(50),
                description TEXT NOT NULL,
                skills TEXT[],
                benefits TEXT[],
                posted_date TIMESTAMP NOT NULL
            )
        `);
        console.log('Jobs table initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

app.get('/api/jobs', async (req, res) => {
    try {
        const { search, location, type } = req.query;
        
        let query = 'SELECT * FROM jobs';
        const queryParams = [];
        const conditions = [];

        if (search) {
            conditions.push(`title ILIKE $${queryParams.length + 1}`);
            queryParams.push(`%${search}%`);
        }
        if (location) {
            conditions.push(`location ILIKE $${queryParams.length + 1}`);
            queryParams.push(`%${location}%`);
        }
        if (type) {
            conditions.push(`type = $${queryParams.length + 1}`);
            queryParams.push(type);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY posted_date DESC';

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/jobs', async (req, res) => {
    const {
        title, type, location, experience, currency, minSalary, maxSalary,
        salaryPeriod, description, skills, benefits, postedDate
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO jobs (
                title, type, location, experience, currency, min_salary,
                max_salary, salary_period, description, 
                skills, benefits, posted_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                title, type, location, experience, currency, minSalary,
                maxSalary, salaryPeriod, description, 
                skills, benefits, postedDate
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, async () => {
    await initializeDatabase();
    console.log(`Server running on http://localhost:${port}`);
});