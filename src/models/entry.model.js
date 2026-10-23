const pool = require('../configurations/database');



async function findAll({
    search = '',
    fechaIngreso = '',
    fechaSalida = '',
    limit = 10,
    offset = 0
} = {}) {
    const searchTerm = search.trim();

    const where = `
        WHERE
            (
                $1 = ''
                OR LPAD(e.id::text, 5, '0') ILIKE '%' || $1 || '%'
                OR e.id::text ILIKE '%' || $1 || '%'
                OR e.nombres_visita ILIKE '%' || $1 || '%'
                OR e.apellidos_visita ILIKE '%' || $1 || '%'
                OR e.numero_documento ILIKE '%' || $1 || '%'
                OR e.placa_vehiculo ILIKE '%' || $1 || '%'
                OR e.motivo_ingreso ILIKE '%' || $1 || '%'
                OR e.medio_ingreso ILIKE '%' || $1 || '%'
                OR dt.codigo ILIKE '%' || $1 || '%'
                OR e.identificacion_estado ILIKE '%' || $1 || '%'
                OR u.username ILIKE '%' || $1 || '%'
            )
            AND (
                NULLIF($2, '') IS NULL
                OR (
                    e.fecha_hora_ingreso >= NULLIF($2, '')::date
                    AND e.fecha_hora_ingreso < NULLIF($2, '')::date + INTERVAL '1 day'
                )
            )
            AND (
                NULLIF($3, '') IS NULL
                OR (
                    e.fecha_hora_salida >= NULLIF($3, '')::date
                    AND e.fecha_hora_salida < NULLIF($3, '')::date + INTERVAL '1 day'
                )
            )
    `;

    const values = [searchTerm, fechaIngreso, fechaSalida];

    const from = `
        FROM lobos.entries e
        LEFT JOIN lobos.document_types dt
            ON dt.id = e.document_type_id
        INNER JOIN lobos.users u
            ON u.id = e.created_by
    `;

    const result = await pool.query(
        `
        SELECT
            e.id AS entry_id,
            LPAD(e.id::text, 5, '0') AS id,
            TO_CHAR(e.fecha_hora_ingreso, 'DD/MM/YYYY HH24:MI:SS')
                AS fecha_hora_ingreso,
            TO_CHAR(e.fecha_hora_salida, 'DD/MM/YYYY HH24:MI:SS')
                AS fecha_hora_salida,
            e.medio_ingreso,
            INITCAP(e.nombres_visita) AS nombres_visita,
            INITCAP(e.apellidos_visita) AS apellidos_visita,
            dt.codigo AS tipo_documento,
            e.numero_documento,
            UPPER(e.placa_vehiculo) AS placa_vehiculo,
            INITCAP(e.motivo_ingreso) AS motivo_ingreso,
            e.identificacion_estado,
            INITCAP(u.username) AS registrado_por
        ${from}
        ${where}
        ORDER BY e.fecha_hora_ingreso DESC
        LIMIT $4 OFFSET $5
        `,
        [...values, limit, offset]
    );

    const countResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        ${from}
        ${where}
        `,
        values
    );

    return {
        entries: result.rows,
        total: countResult.rows[0].total
    };
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