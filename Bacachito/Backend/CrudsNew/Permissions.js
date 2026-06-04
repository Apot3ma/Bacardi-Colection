import { Router } from "express";

const router = Router();

// id autogenerado
// id_user 'usuario id'
// id_category 'categoria de id'
// permission 'el permiso va como en linux 1 ejecucion 2 edicion 4 creacion'

// ========================================
// ==CREAR UN PRERMISO PARA UNA CATEGORIA==
// ========================================
    // SE SOLICITA 
        // ID DEL USUARIO,
        // ID DE LA CATEGORIA,
        // PERMISOS
router.post('/', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {id_user,id_category,permission} = req.body;
    try{
        const [result] = await pool.query(
            'INSERT INTO permission (id_user,id_category,permission) VALUES (?,?,?)',
            [id_user,id_category,permission]
        );
            res.status(200).json({id:result.insertId})
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message})
    }
});

// =====================================
// ==CONSULTAR PERMISOS DE UN PROYECTO==
// =====================================
        //PARA ENCONTRAR LOS PERMISOS SE SOLICITA EN EL URL EL ID DEL USUARIO Y EL ID DE CATEGORIA
router.get('/user/:id_user/category/:id_category', async (req,res)=>{
    const pool = req.app.locals.pool;
    const { id_user, id_category } = req.params;
    try {
        const [result] = await pool.query(
            'SELECT permission FROM permission WHERE id_user = ? AND id_category = ?',
            [id_user, id_category]
        );
        if (result.length === 0) {
            return res.status(200).json({ permission: 0 });
        }
        res.json(result[0]);       
    } catch(err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

// =============================================
// ==CONSULTAR TODOS LOS PERMISOS DE CATEGORÍA==
// =============================================
// SE SOLICITA EN EL URL EL ID DE LA CATEGORIA
router.get('/category/:id_category', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_category } = req.params;
    try {
        const [result] = await pool.query(
            `SELECT p.id_user, p.permission, u.name, u.email
             FROM permission p
             INNER JOIN user u ON p.id_user = u.id
             WHERE p.id_category = ?`,
            [id_category]
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});

// ==========================================
// ==ACTUALIZAR LOS PERMISOS DE UN USUARIO ==
// ==========================================
        //PARA ENCONTRAR LOS PERMISOS SE SOLICITA EN EL URL EL ID DEL USUARIO Y EL ID DE CATEGORIA
router.put('/:id/:category', async (req, res) => {
    const pool = req.app.locals.pool;
    const {permission} = req.params;
    const {id,category} = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE permission SET  permission= ? WHERE id_user = ? AND id_category = ?',
            [permission,id,category]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'permisos no encontrados' });
        }else {
            res.json({ message : 'Categoria actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar  los permisos',details: err.message });
    }
});

// =====================================
// ==ELIMINAR MIS PROYECTOS COMO OWNER==
// =====================================
        //PARA ENCONTRAR LOS PERMISOS SE SOLICITA EN EL URL EL ID DEL USUARIO Y EL ID DE CATEGORIA
router.delete('/:id_user/:id_category', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_user,id_category } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM permission WHERE id_user = ? AND id_category =?',
            [id_user,id_category]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Permisos no encontrado' });
        }else {
            res.json({ message : 'Permisos eliminados' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar los Permisos' });
    }
});

export default router;
