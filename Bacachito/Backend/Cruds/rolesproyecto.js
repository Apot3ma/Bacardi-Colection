import { Router } from "express";

const router = Router();
const fechaactual = new fetch();
const date = fechaactual.obtenerfechaactualenformatomysql();

router.post('/', async (req,res)=>{
    const pool = req.app.locals.pool;
    const {id_proyectos,nombrerol} = req.body;
    try{
        const [result] = await pool.query(
            'INSTERT INTO rolesproyecto (id_proyectos, nombrerol) VALUES (?,?)',
            [id_proyectos,nombrerol]
        );
        res.status(201).json({id:result.insertId,id_proyecto,ubicacion,nombre,date})
        println("recurso creado correctamente-"+" id_proyecto: "+id_proyectos + "nombrerol: "+ nombrerol);
    }catch(err){
        res.status(500).json({error: 'Error', details: err.message});
        println("Error al crear el reporte" + err.message);
    }
});

router.get('/:idrolesproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const {idrolesproyecto} = req.params;
    try {
        const [result] = await pool.query(
            'SELECT id_proyectos, nombrerol FROM rolesproyecto WHERE idrolesproyecto = ?',
            [idrolesproyecto]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ningun proyecto' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los proyectos', details: err.message });
    }
});

router.put('/:idrolesproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idrolesproyecto } = req.params;
    const { id_proyectos,nombrerol} = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE rolesproyecto SET id_proyectos = ?, nombrerol = ? WHERE idrolesproyecto = ?',
            [id_proyectos, nombrerol, idrolesproyecto]
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

router.delete('/:idrolesproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idproyecto } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM proyectos WHERE idrolesproyecto = ?',[idrolesproyecto]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }else {
            res.json({ message : 'Recurso eliminado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Recurso' });
    }
});