import { Router } from "express";

const router = Router();

// id autogenerado
// name 
// id_user 'id del creador'
// description(opcional)
// deadline'Fecha de entrega'

// =============================
// ==CREAR PROYECTO COMO OWNER==
// =============================
        // SE SOLICITA NOMBRE,ID DEL CREADOR ,DESCRIPCION(OPCIONAL),DEAD LINE
router.post('/', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {name,id_user,description,deadline} = req.body;
    try{
        const [result] = await pool.query(
            'INSERT INTO projects (name, id_user,description,deadline) VALUES (?,?,?,?)',
            [name,id_user,description,deadline]
        );
            res.status(200).json({id:result.insertId})
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message}
        )
    }
});

// ======================================
// ==CONSULTAR MIS PROYECTOS COMO OWNER==
// ======================================
        //PARA ENCONTRAR LOS PROYECTOS SE SOLICITA EN EL URL EL ID DEL USUARIO
router.get('/:id_user', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {id_user} = req.params;
    try{
        const [result] = await pool.query(
            'SELECT id,`name`,description,deadline FROM project WHERE id_user = ?',
            [id_user]
        );
         if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ningun Proyecto' });
        }
        res.json(result);       
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message}
        )
    }
});


// =======================================
// ==ACTUALIZAR MIS PROYECTOS COMO OWNER==
// =======================================
        //PARA ENCONTRAR EL PROYECTO SE SOLICITA EN EL URL EL ID DEL PROYECTO
        // SE SOLICITA NOMBRE, DESCRIPCION (OPCIONAL),FECHA DE ENTREGA
router.put('/:idproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idproyecto } = req.params;

    const {name,description,deadline} = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE project SET name = ?, description = ?, deadline = ? WHERE id = ?',
            [name,description,deadline,idproyecto]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }else {
            res.json({ message : 'Proyecto actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el projecto',details: err.message });
    }
});


// =====================================
// ==ELIMINAR MIS PROYECTOS COMO OWNER==
// =====================================
        //PARA ENCONTRAR EL PROYECTO SE SOLICITA EN EL URL EL ID DEL PROYECTO
router.delete('/:idproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idproyecto } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM proyectos WHERE id = ?',[idproyecto]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }else {
            res.json({ message : 'Proyecto eliminado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Proyecto' });
    }
});
