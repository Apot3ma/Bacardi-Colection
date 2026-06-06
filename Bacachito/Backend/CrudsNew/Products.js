// routes/procesos.js
import { Router } from 'express';
import PDFDoc from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { resolveFolder, buildFileName, saveRecord, BASE_DIR } from '../helpers/pdfHelper.js';
 
const router = Router();
 
// ─── Estilos PDF compartidos ────────────────────────────────────────────────
const FONT_TITLE    = 'Helvetica-Bold';
const FONT_SUBTITLE = 'Helvetica-Bold';
const FONT_BODY     = 'Helvetica';
const COLOR_TITLE   = '#1a1a2e';
const COLOR_LABEL   = '#444444';
const COLOR_LINE    = '#cccccc';
 
function addHeader(doc, title, subtitle = '') {
    doc.font(FONT_TITLE).fontSize(20).fillColor(COLOR_TITLE).text(title, { align: 'center' });
    if (subtitle) {
        doc.moveDown(0.3)
           .font(FONT_BODY).fontSize(11).fillColor('#666666').text(subtitle, { align: 'center' });
    }
    doc.moveDown(0.5)
       .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(COLOR_LINE).lineWidth(1).stroke()
       .moveDown(0.8);
}
 
function addField(doc, label, value) {
    doc.font(FONT_SUBTITLE).fontSize(10).fillColor(COLOR_LABEL).text(`${label}:`, { continued: true })
       .font(FONT_BODY).fillColor('#222222').text(` ${value ?? '—'}`);
    doc.moveDown(0.3);
}
 
function addSectionTitle(doc, text) {
    doc.moveDown(0.5)
       .font(FONT_SUBTITLE).fontSize(13).fillColor(COLOR_TITLE).text(text)
       .moveDown(0.2)
       .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').lineWidth(0.5).stroke()
       .moveDown(0.5);
}
 
function finalizePDF(doc, filePath) {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/entrevista
// Body: { id_project, titulo, entrevistado, secciones: [{ nombre, preguntas: [string] }] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/entrevista', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, titulo, entrevistado, secciones = [] } = req.body;
 
    if (!id_project || !titulo || !entrevistado)
        return res.status(400).json({ error: 'id_project, titulo y entrevistado son requeridos' });
 
    try {
        const type = 'entrevista';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Entrevista', titulo);
        addField(doc, 'Entrevistado', entrevistado);
        addField(doc, 'Fecha', new Date().toLocaleDateString('es-MX'));
 
        secciones.forEach((seccion, i) => {
            addSectionTitle(doc, `${i + 1}. ${seccion.nombre}`);
            (seccion.preguntas || []).forEach((p, j) => {
                doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
                   .text(`${j + 1}. ${p}`).moveDown(0.3);
            });
        });
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Entrevista generada', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar entrevista', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/cuestionario
// Body: { id_project, titulo, objetivo, preguntas: [{ texto, tipo, opciones? }] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/cuestionario', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, titulo, objetivo, preguntas = [] } = req.body;
 
    if (!id_project || !titulo || !objetivo)
        return res.status(400).json({ error: 'id_project, titulo y objetivo son requeridos' });
 
    try {
        const type = 'cuestionario';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Cuestionario', titulo);
        addField(doc, 'Objetivo', objetivo);
        addField(doc, 'Fecha', new Date().toLocaleDateString('es-MX'));
        addSectionTitle(doc, 'Preguntas');
 
        preguntas.forEach((p, i) => {
            doc.font(FONT_SUBTITLE).fontSize(11).fillColor('#222222')
               .text(`${i + 1}. ${p.texto} (${p.tipo})`).moveDown(0.2);
 
            if (p.tipo === 'multiple' && Array.isArray(p.opciones)) {
                p.opciones.forEach(op => {
                    doc.font(FONT_BODY).fontSize(10).fillColor('#555555').text(`   ○  ${op}`);
                });
            } else if (p.tipo === 'si_no') {
                doc.font(FONT_BODY).fontSize(10).fillColor('#555555').text('   ○  Sí    ○  No');
            } else {
                doc.font(FONT_BODY).fontSize(10).fillColor('#aaaaaa')
                   .text('   _____________________________________________');
            }
            doc.moveDown(0.5);
        });
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Cuestionario generado', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar cuestionario', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/observacion
// Body: { id_project, titulo, notas: [string] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/observacion', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, titulo, notas = [] } = req.body;
 
    if (!id_project || !titulo)
        return res.status(400).json({ error: 'id_project y titulo son requeridos' });
 
    try {
        const type = 'observacion';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Observación', titulo);
        addField(doc, 'Fecha', new Date().toLocaleDateString('es-MX'));
        addSectionTitle(doc, 'Notas');
 
        notas.forEach((nota, i) => {
            doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
               .text(`${i + 1}. ${nota}`).moveDown(0.4);
        });
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Observación generada', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar observación', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/historia_usuario
// Body: { id_project, identificador, titulo, prioridad, criterios: [string] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/historia_usuario', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, identificador, titulo, prioridad, criterios = [] } = req.body;
 
    if (!id_project || !identificador || !titulo || !prioridad)
        return res.status(400).json({ error: 'id_project, identificador, titulo y prioridad son requeridos' });
 
    try {
        const type = 'historia_usuario';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Historia de Usuario', titulo);
        addField(doc, 'Identificador (Num. de serie)', identificador);
        addField(doc, 'Título', titulo);
        addField(doc, 'Prioridad', prioridad);
        addField(doc, 'Fecha', new Date().toLocaleDateString('es-MX'));
        addSectionTitle(doc, 'Criterios de Aceptación');
 
        criterios.forEach((c, i) => {
            doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
               .text(`${i + 1}. ${c}`).moveDown(0.4);
        });
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Historia de usuario generada', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar historia de usuario', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/focus_group
// Body: { id_project, titulo, fecha?, participantes: [{ nombre, conclusiones: [string] }] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/focus_group', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, titulo, fecha, participantes = [] } = req.body;
 
    if (!id_project || !titulo)
        return res.status(400).json({ error: 'id_project y titulo son requeridos' });
 
    try {
        const type = 'focus_group';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Focus Group', titulo);
        addField(doc, 'Fecha', fecha || new Date().toLocaleDateString('es-MX'));
        addField(doc, 'Total de participantes', participantes.length);
 
        participantes.forEach((p, i) => {
            addSectionTitle(doc, `Participante ${i + 1}: ${p.nombre}`);
            (p.conclusiones || []).forEach(c => {
                doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
                   .text(`• ${c}`).moveDown(0.3);
            });
        });
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Focus group generado', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar focus group', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/analisis_documento
// Body: { id_project, titulo, descripcion?, notas: [string] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/analisis_documento', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, titulo, descripcion, notas = [] } = req.body;
 
    if (!id_project || !titulo)
        return res.status(400).json({ error: 'id_project y titulo son requeridos' });
 
    try {
        const type = 'analisis_documento';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Análisis de Documento', titulo);
        addField(doc, 'Descripción', descripcion || '—');
        addField(doc, 'Fecha', new Date().toLocaleDateString('es-MX'));
        addSectionTitle(doc, 'Notas de análisis');
 
        notas.forEach((nota, i) => {
            doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
               .text(`${i + 1}. ${nota}`).moveDown(0.4);
        });
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Análisis de documento generado', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar análisis de documento', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// POST /procesos/seguimiento_transaccion
// Body: { id_project, titulo, descripcion?, eventos_disparadores: [string], pasos: [string] }
// ════════════════════════════════════════════════════════════════════════════
router.post('/seguimiento_transaccion', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, titulo, descripcion, eventos_disparadores = [], pasos = [] } = req.body;
 
    if (!id_project || !titulo)
        return res.status(400).json({ error: 'id_project y titulo son requeridos' });
 
    try {
        const type = 'seguimiento_transaccion';
        const { abs, relative } = resolveFolder(type);
        const file_name = buildFileName(type);
        const filePath  = path.join(abs, file_name);
 
        const doc = new PDFDoc({ margin: 50 });
        addHeader(doc, 'Seguimiento de Transacción', titulo);
        addField(doc, 'Descripción', descripcion || '—');
        addField(doc, 'Fecha', new Date().toLocaleDateString('es-MX'));
 
        addSectionTitle(doc, 'Eventos Disparadores');
        if (eventos_disparadores.length === 0) {
            doc.font(FONT_BODY).fontSize(11).fillColor('#aaaaaa').text('Sin eventos registrados.');
        } else {
            eventos_disparadores.forEach((e, i) => {
                doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
                   .text(`${i + 1}. ${e}`).moveDown(0.3);
            });
        }
 
        addSectionTitle(doc, 'Pasos de la Secuencia');
        if (pasos.length === 0) {
            doc.font(FONT_BODY).fontSize(11).fillColor('#aaaaaa').text('Sin pasos registrados.');
        } else {
            pasos.forEach((p, i) => {
                doc.font(FONT_BODY).fontSize(11).fillColor('#222222')
                   .text(`${i + 1}. ${p}`).moveDown(0.3);
            });
        }
 
        await finalizePDF(doc, filePath);
        const route    = `${relative}/${file_name}`;
        const insertId = await saveRecord(pool, { id_project, type, name: titulo, file_name, route });
 
        res.status(201).json({ message: 'Seguimiento de transacción generado', id: insertId, file_name, route });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar seguimiento de transacción', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// GET /procesos/proyecto/:id_project
// Lista todos los procesos de un proyecto (más reciente primero)
// ════════════════════════════════════════════════════════════════════════════
router.get('/proyecto/:id_project', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT id, type, name, file_name, route, date_creation
             FROM procesos
             WHERE id_project = ?
             ORDER BY date_creation DESC`,
            [id_project]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener procesos', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// GET /procesos/proyecto/:id_project/tipo/:type
// Lista los procesos de un proyecto filtrados por tipo/categoría
// ════════════════════════════════════════════════════════════════════════════
router.get('/proyecto/:id_project/tipo/:type', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id_project, type } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT id, type, name, file_name, route, date_creation
             FROM procesos
             WHERE id_project = ? AND type = ?
             ORDER BY date_creation DESC`,
            [id_project, type]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener procesos por tipo', details: err.message });
    }
});
 
// ════════════════════════════════════════════════════════════════════════════
// GET /procesos/:id/abrir
// Sirve el archivo PDF directamente en el navegador (nueva pestaña)
// ════════════════════════════════════════════════════════════════════════════
router.get('/:id/abrir', async (req, res) => {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT route, file_name FROM procesos WHERE id = ?',
            [id]
        );
        if (rows.length === 0)
            return res.status(404).json({ error: 'Proceso no encontrado' });
 
        const filePath = path.join(BASE_DIR, '..', rows[0].route);
        if (!fs.existsSync(filePath))
            return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
 
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${rows[0].file_name}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        res.status(500).json({ error: 'Error al abrir el archivo', details: err.message });
    }
});
 
export default router;