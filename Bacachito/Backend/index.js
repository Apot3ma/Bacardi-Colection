import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dbconfig from './Conexion.js';
import usersRouter from './CrudsNew/Users.js';
import projectsRouter from './CrudsNew/Projects.js';
import categorysRouter from './CrudsNew/Categorys.js';
import resourcesRouter from './CrudsNew/Resources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/categories', categorysRouter);
app.use('/api/resources', resourcesRouter);

const dbConfig = dbconfig;
let pool;

async function start() {
    try {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10
        });

        await pool.query('SELECT 1');
        console.log('MySQL connected');

        app.locals.pool = pool;

        app.get('/', async (req, res) => {
            try {
                const [rows] = await pool.query('SELECT 1');
                res.send('Healthy!!! Api Server - DB connected');
            } catch (err) {
                res.status(500).send('DB error');
            }
        });

        app.listen(3000, '0.0.0.0', () => {
            console.log('Active on port 3000');
        });
    } catch (err) {
        console.error('Failed to connect to MySQL', err);
        process.exit(1);
    }
}

start();
