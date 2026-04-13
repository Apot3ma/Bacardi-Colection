import { Router } from "express";

const router = Router();

// id 'autogenerado'
// name 
// description(opcional)
// route 'ruta del archivo'
// id_category 'categoria a la que pertence el recurso'
// date_update 'autogenerado'

// ====================
// ==CREAR UN RECURSO==
// ====================
        // SE SOLICITA NOMBRE,ID DEL CREADOR ,DESCRIPCION(OPCIONAL),FECHA DE ENTREGA
router.post('/', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {name, description,route,id_category,date_update} = req.body;
    try{
        const [result] = await pool.query(
            'INSERT INTO resources (name, description,route,id_category,date_update) VALUES (?,?,?,?,?)',
            [name, description,route,id_category,date_update]
        );
            res.status(200).json({id:result.insertId})
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message})
    }
});

// ========================================
// ==CONSULTAR LOS RECURSOS POR CATEGORIA==
// ========================================
        //PARA ENCONTRAR LOS PROYECTOS SE SOLICITA EN EL URL EL ID DEL USUARIO

router.get('/:id_category', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {id_category} = req.params;
    try{
        const [result] = await pool.query(
            'SELECT id,`name`,description,route,date_update FROM resources WHERE id_category = ?',
            [id_category]
        );
         if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ningun recurso' });
        }
        res.json(result);       
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message}
        )
    }
});

// ==========================
// ==ACTUALIZAR UN RECURSO ==
// ==========================
        //PARA ENCONTRAR EL PROYECTO SE SOLICITA EN EL URL EL ID DEL RECURSO
        // NOMBRE, DESCRIPCION, RUTA,FECHA DE ACTUALIZACION
router.put('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const {id} = req.params;
    const {name,description,route,date_update} = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE resources SET name = ?, description = ?, route = ?, date_update =?  WHERE id = ?',
            [name,description,route,date_update,id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }else {
            res.json({ message : 'Recurso actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el recurso',details: err.message });
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
        const [result] = await pool.query(
            'DELETE FROM resources WHERE id = ?',[id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }else {
            res.json({ message : 'Recurso eliminado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Recurso' });
    }
});


// Agregar la funcion de generar los distintos tipos de recursos para poder generar los documentos pertinentes y guardarlos en una ruta
        // asegurarme de que no se puedan generar archivos dentro de la misma carpeta con el mismo nombre