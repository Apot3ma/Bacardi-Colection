import { Router } from "express";

const router = Router();

router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, name, content } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO diagram (id_project, name, content) VALUES (?, ?, ?)',
            [id_project, name, content]
        );
        res.status(200).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el diagrama', details: err.message });
    }
});

router.get('/project/:id_project', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project } = req.params;
    try {
        const [result] = await pool.query(
            'SELECT id, id_project, name, content, created_at FROM diagram WHERE id_project = ?',
            [id_project]
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los diagramas', details: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    const { name, content } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE diagram SET name = ?, content = ? WHERE id = ?',
            [name, content, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Diagrama no encontrado' });
        }
        res.json({ message: 'Diagrama actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el diagrama', details: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM diagram WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Diagrama no encontrado' });
        }
        res.json({ message: 'Diagrama eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el diagrama', details: err.message });
    }
});

export default router;
