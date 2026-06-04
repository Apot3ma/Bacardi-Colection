import { Router } from "express";
import { stat } from "node:fs";

const router = Router();

// id 'autoincrementado'
// id_project
// id_user
// role


// =====================
// ==CREAR UN USER LOG==
// =====================
        // SE SOLICITA ID DEL PROYECTO,ID DEL USUARIIO , ROL DEL USUARIO
router.post('/' , async (req,res) =>{
    const pool =req.app.locals.pool;
    const {id_project,id_user,role} = req.body;
    try{
        const [result] = await pool.query(
            'INSERT INTO user_log_project (id_project,id_user,role) VALUES (?,?,?)',
            [id_project,id_user,role]
        );
            res.status(200).json({id:result.insertId})
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message})
    }
});

// ===========================================
// ==VER TODAS LAS CATEGORIAS DE UN PROYECTO==
// ===========================================
        // SE SOLICITA ID DEL PROYECTO
router.get('/:id_project', async (req,res)=>{
    const pool =req.app.locals.pool;
     const {id_project} = req.params;
    try{
        const [result] = await pool.query(
            'SELECT * FROM user_log_project WHERE id_project = ?',
            [id_project]
        );
         if (result.length === 0) {
            return res.status(404).json({ error: 'no existe el proyecto' });
        }
        res.json(result);       
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message}
        )
    }
});

// ===========================================
// ==VER TODOS LOS USUARIOS DE UNA CATEGORIA==
// ===========================================
router.get('/:role', async (req, res) => {
    const pool = req.app.locals.pool;
    const { role } = req.params;
    try {
        const [result] = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                ulp.role,
                ulp.project_id
            FROM users u
            INNER JOIN user_log_project ulp ON u.id = ulp.user_id
            WHERE ulp.role = ?`,
            [role]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'No hay usuarios en este rol' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
});