import { Router } from "express";

const router = Router();

// id 'autoincrementado'
// id_project
// id_user
// role


// =====================
// ==CREAR UN USER LOG==
// =====================
// SE SOLICITA ID DEL PROYECTO,ID DEL USUARIIO , ROL DEL USUARIO
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, id_user, role } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO user_log_project (id_project,id_user,role) VALUES (?,?,?)',
            [id_project, id_user, role]
        );
        res.status(200).json({ id: result.insertId })
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message })
    }
});

// ====================================
// ==BUSCAR USUARIO POR CORREO==
// ====================================
// SE SOLICITA EL CORREO EN QUERY PARAM ?email=
router.get('/search', async (req, res) => {
    const pool = req.app.locals.pool;
    const { email, id_project } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Se requiere el parámetro email' });
    }
    try {
        let query = "SELECT id, name, email FROM user WHERE email = ? AND status = 'A'";
        let params = [email];

        if (id_project) {
            query = `
                SELECT u.id, u.name, u.email 
                FROM user u 
                WHERE u.email = ? AND u.status = 'A'
                AND (
                    u.id IN (SELECT id_user FROM user_log_project WHERE id_project = ?)
                    OR u.id = (SELECT id_user FROM project WHERE id = ?)
                )
            `;
            params.push(id_project, id_project);
        }

        const [result] = await pool.query(query, params);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

// ===========================================
// ==VER TODAS LAS CATEGORIAS DE UN PROYECTO==
// ===========================================
// SE SOLICITA ID DEL PROYECTO
router.get('/:id_project', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project } = req.params;
    try {
        const [result] = await pool.query(
            'SELECT * FROM user_log_project WHERE id_project = ?',
            [id_project]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'no existe el proyecto' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message }
        )
    }
});

// ===========================================
// ==VER TODOS LOS USUARIOS DE UNA CATEGORIA==
// ===========================================
router.get('/project/:id_project', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project } = req.params;
    try {
        const [result] = await pool.query(
            `SELECT 
                ulp.id_project,
                ulp.id_user,
                ulp.role,
                u.name,
                u.email
            FROM user_log_project ulp
            INNER JOIN user u ON ulp.id_user = u.id
            WHERE ulp.id_project = ?`,
            [id_project]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'No hay usuarios en este proyecto' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

export default router;