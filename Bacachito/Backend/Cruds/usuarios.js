import { Router } from "express";
import {fecha} from "./fecha.js";

const router = Router();
const fechaactual = new fecha();
const date = fechaactual.obtenerfechaactualenformatomysql();


router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const {email,username,password} = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO usuarios (email, username, password, creationdate) VALUES (?, ?, ?, ?)',
            [email,username,password,date]
        );
        res.status(201).json({ id: result.insertId, email, username, date });
        println("Reporte creado correctamente"+" idusuarios: "+idusuarios+" date: "+date+" consumototal: "+consumototal);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
        println("Error al crear el reporte" + err.message);
    }
});

router.get('/:username/:password', async (req, res) => {
    const pool = req.app.locals.pool;
    const {username, password} = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT idusuarios, email, username, creationdate FROM usuarios WHERE username = ? AND password = ?',
            [username, password]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'contraseña o usuario erroneo' });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los usuarios', details: err.message });
    }
});

router.put('/:idusuarios', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idusuarios } = req.params;
    const { email, username, password } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET email = ?, username = ?, password = ? WHERE idusuarios = ?',
            [email, username, password, idusuarios]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }else {
            res.json({ message : 'Usuario actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

router.delete('/:idusuarios', async (req, res) => {
    const pool = req.app.locals.pool;
    const { idusuarios } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM usuarios WHERE idusuarios = ?',[idusuarios]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }else {
            res.json({ message : 'Usuario eliminado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});


export default router;