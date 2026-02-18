import { Router } from "express";

const router = Router();
const fechaactual = new fetch();
const date = fechaactual.obtenerfechaactualenformatomysql();

router.post('/', async (req,res)=>{
    const pool = req.app.locals.pool;
    const {id_usuario,id_proyecto,ubicacion,nombre} = req.body;
    try{
        const [result] = await pool.query(
            'INSTERT INTO recursos (id_usuario, id_proyecto, ubicacion, nombre, fecha) VALUES (?,?,?,?,?)',
            [id_usuario,id_proyecto,ubicacion,nombre,date]
        );
        res.status(201).json({id:result.insertId,id_proyecto,ubicacion,nombre,date})
        println("recurso creado correctamente-"+"id_usario: "+id_usuario+"id: "+id_proyecto + " ubicacion: "+ubicacion+" nombre: "+nombre,date);
    }catch(err){
        res.status(500).json({error: 'Error', details: err.message});
        println("Error al crear el reporte" + err.message);
    }
});

router.get('/:id_proyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const {id_proyecto} = req.params;
    try {
        const [result] = await pool.query(
            'SELECT idrecurso,id_usuario,id_proyecto,ubicacion,nombre,fecha FROM recursos WHERE id_proyecto = ? ORDER BY fecha DESC',
            [id_proyecto]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ningun recurso' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los usuarios', details: err.message });
    }
});

router.put('/:idrecurso', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idrecurso } = req.params;
    const { id_usuario,ubicacion, nombre } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE recursos SET id_usuario = ?, ubicacion = ?, nombre = ?,date =? WHERE idrecurso = ?',
            [id_usuario, ubicacion, nombre, date,idrecurso]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }else {
            res.json({ message : 'Recurso actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el Recurso',details: err.message });
    }
});

router.delete('/:idrecurso', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idrecurso } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM recursos WHERE idrecurso = ?',[idrecurso]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }else {
            res.json({ message : 'Recurso eliminado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Recurso' });
    }
});
