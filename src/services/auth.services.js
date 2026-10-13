const pool = require('../configurations/database');
const bcrypt = require('bcrypt');


async function login(username,password){
    const result = await pool.query(
        `
        SELECT
        *
        FROM
        lobos.users u
        INNER JOIN 
        lobos.roles r 
        ON 
        r.id = u.role_id
        WHERE
        u.username = $1
        LIMIT 1`,
        [username]
    );
    const user = result.rows[0];
    if(!user || !user.estado){
        return null;
    }
    const passwordCorrecta = await bcrypt.compare(password,user.password);
    if(!passwordCorrecta){
        return null;
    }
    return {
        id:user.id,
        username: user.username,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.nombre
    };
}

module.exports = {
    login
};