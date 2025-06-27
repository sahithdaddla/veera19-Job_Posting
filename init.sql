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