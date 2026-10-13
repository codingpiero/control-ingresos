const pool = require('../configurations/database');


async function findAll(){
     const result = await pool.query(`
        SELECT
            e.id,
            e.fecha_hora_ingreso,
            e.fecha_hora_salida,
            e.medio_ingreso,
            e.nombres_visita,
            e.apellidos_visita,
            dt.codigo AS tipo_documento,
            e.numero_documento,
            e.placa_vehiculo,
            e.identificacion_estado,
            u.username AS registrado_por

        FROM lobos.entries e

        LEFT JOIN lobos.document_types dt
            ON dt.id = e.document_type_id

        INNER JOIN lobos.users u
            ON u.id = e.created_by

        ORDER BY e.fecha_hora_ingreso DESC
    `);

    return result.rows;
}

async function create(data) {

    const result = await pool.query(`
        INSERT INTO lobos.entries (
            medio_ingreso,
            nombres_visita,
            apellidos_visita,
            document_type_id,
            numero_documento,
            placa_vehiculo,
            color_vehiculo,
            cantidad_pasajeros,
            direccion_visita,
            motivo_ingreso,
            identificacion_estado,
            created_by
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12
        )
        RETURNING *
    `, [
        data.medio_ingreso,
        data.nombres_visita,
        data.apellidos_visita,
        data.document_type_id,
        data.numero_documento,
        data.placa_vehiculo,
        data.color_vehiculo,
        data.cantidad_pasajeros,
        data.direccion_visita,
        data.motivo_ingreso,
        data.identificacion_estado,
        data.created_by
    ]);

    return result.rows[0];
}
async function findById(id){
    const result = await pool.query(
        `SELECT * 
        FROM lobos.entries
        WHERE 
        id = $1`,
        [id]
    );
    return result.rows[0] || null;
}
async function update(id, data) {
    const result = await pool.query(
        `UPDATE lobos.entries
         SET medio_ingreso = $1,
             nombres_visita = $2,
             apellidos_visita = $3,
             document_type_id = $4,
             numero_documento = $5,
             placa_vehiculo = $6,
             color_vehiculo = $7,
             cantidad_pasajeros = $8,
             direccion_visita = $9,
             motivo_ingreso = $10,
             identificacion_estado = $11,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [
            data.medio_ingreso,
            data.nombres_visita,
            data.apellidos_visita,
            data.document_type_id,
            data.numero_documento,
            data.placa_vehiculo,
            data.color_vehiculo,
            data.cantidad_pasajeros,
            data.direccion_visita,
            data.motivo_ingreso,
            data.identificacion_estado,
            id
        ]
    );

    return result.rows[0] || null;
}
async function remove(id) {
    const result = await pool.query(
        `DELETE FROM lobos.entries
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

async function registerExit(id){
    const result = await pool.query(`
        UPDATE lobos.entries
        SET
            fecha_hora_salida = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE
        id = $1 AND
        fecha_hora_salida  IS NULL
        RETURNING *`,
        [id]);
    return result.rows[0] || null;
}
module.exports = {
    findAll,
    create,
    findById,
    update,
    remove,
    registerExit
}