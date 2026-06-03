import { Router } from "express";

const router = Router();

// id 'autoincrementado'
// name
// email
// password
// position
// date_creation 'autocreado'
// status 'autocreado'

// ====================
// ==CREAR UN USUARIO==
// ====================
        // SE SOLICITA NOMBRE,ID DEL CREADOR ,DESCRIPCION(OPCIONAL),FECHA DE ENTREGA
router.post('/register', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {name,email,password,position} = req.body;
    const status = "A";
    const date_creation = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try{
        const [result] = await pool.query(
            'INSERT INTO user (name,email,password,position,date_creation,status) VALUES (?,?,?,?,?,?)',
            [name,email,password,position,date_creation,status]
        );
            res.status(201).json({id:result.insertId, message: 'Usuario creado exitosamente'})
    }catch(err){
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }
        res.status(500).json({error: 'Error', details:err.message})
    }
});

// ========================================
// ==CONSULTAR EL USUARIO/ INICIAR SESION==
// ========================================
        //PARA ENCONTRAR LOS PROYECTOS SE SOLICITA EL USUARIO Y CONTRASENA

router.post('/login', async (req,res)=>{
    const pool =req.app.locals.pool;
    const {email,password} = req.body;
    try{
        const [result] = await pool.query(
            "SELECT id, name, email, position FROM user WHERE email = ? AND password = ? AND status = 'A'",
            [email,password]
        );
         if (result.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas o usuario no existe' });
        }
        res.json({ message: 'Login exitoso', user: result[0] });       
    }catch(err){
        res.status(500).json({error: 'Error', details:err.message})
    }
});

// ====================================
// ==ACTUALIZAR EL USUARIO COMO OWNER==
// ====================================
        //PARA ENCONTRAR EL PROYECTO SE SOLICITA EN EL URL EL ID DEL RECURSO
        // NOMBRE, CORREO, CONTRA, POSICION
router.put('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const {id} = req.params
    const {name,email,password,position} = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE user SET name = ?, email = ?, password = ?  WHERE id = ?',
            [name,email,password,position,id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }else {
            res.json({ message : 'Usuario actualizado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el usuario',details: err.message });
    }
});

// ==========================
// ==DAR DE BAJA UNA CUENTA==
// ==========================
        //PARA DAR DE BAJA A UN USUARIO SE SOLICITA EN EL URL EL ID DEL USUARIO
router.delete('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            "UPDATE `user` SET status = 'B' WHERE id = ? AND status = 'A'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Usuario no existe o ya está dado de baja'
            });
        }

        res.json({ message: 'Usuario dado de baja correctamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error al eliminar el usuario'
        });
    }
});

export default router;
