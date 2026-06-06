// helpers/pdfHelper.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
 
export const BASE_DIR = path.join(__dirname, '../../documentos');
 
// Carpeta por tipo de proceso
const FOLDERS = {
    entrevista:              'entrevistas',
    cuestionario:            'cuestionarios',
    observacion:             'observaciones',
    historia_usuario:        'historias_usuario',
    focus_group:             'focus_group',
    analisis_documento:      'analisis_documentos',
    seguimiento_transaccion: 'seguimiento_transaccion',
};
 
/**
 * Devuelve la ruta absoluta de la carpeta para el tipo dado
 * y la crea si no existe.
 */
export function resolveFolder(type) {
    const folder = FOLDERS[type];
    if (!folder) throw new Error(`Tipo de proceso desconocido: ${type}`);
    const abs = path.join(BASE_DIR, folder);
    fs.mkdirSync(abs, { recursive: true });
    return { abs, relative: `documentos/${folder}` };
}
 
/**
 * Genera nombre de archivo único: <tipo>_<timestamp>.pdf
 */
export function buildFileName(type) {
    return `${type}_${Date.now()}.pdf`;
}
 
/**
 * Guarda el registro del proceso en BD y devuelve el insertId.
 */
export async function saveRecord(pool, { id_project, type, name, file_name, route }) {
    const [result] = await pool.query(
        `INSERT INTO procesos (id_project, type, name, file_name, route)
         VALUES (?, ?, ?, ?, ?)`,
        [id_project, type, name, file_name, route]
    );
    return result.insertId;
}
 