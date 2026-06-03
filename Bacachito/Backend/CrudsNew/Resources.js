import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = Router();

// id 'autogenerado'
// name 
// description(opcional)
// route 'ruta del archivo'
// id_category 'categoria a la que pertence el recurso'
// date_update 'autogenerado'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ====================
// ==CREAR UN RECURSO==
// ====================
// SE SOLICITA NOMBRE,ID DEL CREADOR ,DESCRIPCION(OPCIONAL),FECHA DE ENTREGA
router.post('/', upload.single('file'), async (req, res) => {
    const pool = req.app.locals.pool;
    const { name, description, id_category } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Se requiere un archivo' });
    const route = '/uploads/' + req.file.filename;
    const date_update = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
        const [result] = await pool.query(
            'INSERT INTO resources (name, description, route, id_category, date_update) VALUES (?,?,?,?,?)',
            [name, description, route, id_category, date_update]
        );
        res.status(200).json({ id: result.insertId, route });
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

// =============================================
// ==CONSULTAR RECURSOS RECIENTES DEL PROYECTO==
// =============================================
//PARA ENCONTRAR LOS RECURSOS SE SOLICITA EN EL URL EL ID DEL PROYECTO
router.get('/recent/:id_project', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project } = req.params;
    try {
        const [result] = await pool.query(
            `SELECT r.id, r.name, r.description, r.route, r.date_update, r.id_category
             FROM resources r
             INNER JOIN category c ON r.id_category = c.id
             WHERE c.id_project = ?
             ORDER BY r.date_update DESC
             LIMIT 6`,
            [id_project]
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

// ========================================
// ==CONSULTAR LOS RECURSOS POR CATEGORIA==
// ========================================
//PARA ENCONTRAR LOS PROYECTOS SE SOLICITA EN EL URL EL ID DEL USUARIO

router.get('/:id_category', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_category } = req.params;
    try {
        const [result] = await pool.query(
            'SELECT id, `name`, description, route, date_update FROM resources WHERE id_category = ?',
            [id_category]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ningun recurso' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

// ==========================
// ==ACTUALIZAR UN RECURSO ==
// ==========================
//PARA ENCONTRAR EL PROYECTO SE SOLICITA EN EL URL EL ID DEL RECURSO
// NOMBRE, DESCRIPCION, RUTA,FECHA DE ACTUALIZACION
router.put('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    const { name, description } = req.body;
    const date_update = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
        const [result] = await pool.query(
            'UPDATE resources SET name = ?, description = ?, date_update = ? WHERE id = ?',
            [name, description, date_update, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        } else {
            res.json({ message: 'Recurso actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el recurso', details: err.message });
    }
});

// =======================
// ==ELIMINAR UN RECURSO==
// =======================
//PARA ENCONTRAR EL PROYECTO SE SOLICITA EN EL URL EL ID DEL PROYECTO
router.delete('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT route FROM resources WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Recurso no encontrado' });
        const filePath = path.join(uploadsDir, path.basename(rows[0].route));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await pool.query('DELETE FROM resources WHERE id = ?', [id]);
        res.json({ message: 'Recurso eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Recurso' });
    }
});

export default router;
