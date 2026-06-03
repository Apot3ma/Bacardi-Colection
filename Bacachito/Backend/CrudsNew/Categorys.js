import { Router } from "express";

const router = Router();

// id 'autogenerado'
// name 
// description (opcional)
// id_project 'Depende del proyecto en el que esta el usuario'
// date_creation 'autogenerado'

// ========================
// ==CREAR UNA CATEGORIA ==
// ========================
        // SE SOLICITA NOMBRE,DESCRIPCION(OPCIONAL),ID DEL PROYECTO,FECHA DE CREACION

router.post('/', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {name, description,id_project,date_creation} = req.body;
    try{
        const [result] = await pool.query(
            'INSERT INTO category (name, description,id_project,date_creation) VALUES (?,?,?,?)',
            [name, description,id_project,date_creation]
        );
            res.status(200).json({id:result.insertId})
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message})
    }
});

// ========================================
// ==CONSULTAR LOS RECURSOS POR CATEGORIA==
// ========================================
        //PARA ENCONTRAR LA CATEGORIA SE SOLICITA EN EL URL EL ID DEL PROYECTO

router.get('/:id_project', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {id_project} = req.params;
    try{
        const [result] = await pool.query(
            'SELECT id, name, description,date_creation FROM category WHERE id_project = ?',
            [id_project]
        );
         if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ninguna categoria' });
        }
        res.json(result);       
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message}
        )
    }
});

// =============================
// ==ACTUALIZAR UNA CATEGORIA ==
// =============================
        //PARA ENCONTRAR LA CATEGORIA SE SOLICITA EN EL URL EL ID LA CATEGORIA
router.put('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE category SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria no encontrada' });
        } else {
            res.json({ message: 'Categoria actualizada' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la categoria', details: err.message });
    }
});

// =======================
// ==ELIMINAR CATEGORIAS==
// =======================
        //PARA ENCONTRAR LA CATEGORIA SE SOLICITA EN EL URL EL ID LA CATEGORIA
router.delete('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM category WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria no encontrada' });
        } else {
            res.json({ message: 'Categoria eliminada' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la categoria' });
    }
});

export default router;
