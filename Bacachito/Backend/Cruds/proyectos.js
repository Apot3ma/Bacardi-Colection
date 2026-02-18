import { Router } from "express";

const router = Router();
const fechaactual = new fetch();
const date = fechaactual.obtenerfechaactualenformatomysql();

router.post('/', async (req,res)=>{
    const pool = req.app.locals.pool;
    const {id_usuario,nombreproyecto,descripcionproyecto,creacionproyecto} = req.body;
    try{
        const [result] = await pool.query(
            'INSTERT INTO proyectos (id_usuario, nombreproyecto, descripcionproyecto, creacionproyecto) VALUES (?,?,?,?)',
            [id_usuario,nombreproyecto,descripcionproyecto,date]
        );
        res.status(201).json({id:result.insertId,id_proyecto,ubicacion,nombre,date})
        println("recurso creado correctamente-"+"id_usario: "+id_usuario+"nombre: "+nombreproyecto + " descripcion: "+descripcionproyecto+" nombre: "+nombre +" fecha: "+date);
    }catch(err){
        res.status(500).json({error: 'Error', details: err.message});
        println("Error al crear el reporte" + err.message);
    }
});

router.get('/:idproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const {idproyecto} = req.params;
    try {
        const [result] = await pool.query(
            'SELECT idproyecto,id_usuario,nombreproyecto,descripcionproyecto,creacionproyecto FROM proyectos WHERE idproyecto = ? ORDER BY creacionproyecto DESC',
            [idproyecto]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'no se encontro ningun proyecto' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los proyectos', details: err.message });
    }
});

router.put('/:idproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idrecurso } = req.params;
    const { id_usuario,nombreproyecto, descripcionproyecto, creacionproyecto } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE proyectos SET id_usuario = ?, nombreproyecto = ?, descripcionproyecto = ?, creacionproyecto = ? WHERE idproyecto = ?',
            [id_usuario, nombreproyecto, descripcionproyecto, creacionproyecto]
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

router.delete('/:idproyecto', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idproyecto } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM proyectos WHERE idproyecto = ?',[idproyecto]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }else {
            res.json({ message : 'Recurso eliminado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Recurso' });
    }
});
