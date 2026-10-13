const app = require('./app');
const pool = require('./configurations/database');
const config = require('./configurations/config');

async function startServer(){
    try {
        await pool.query('SELECT NOW()');
        console.log('Base de Datos Disponible');
        app.listen(config.APP.PORT,()=>{
            console.log('Servicio Exitoso.');
        })
    } catch (e) {
        console.error(`Error: ${e}`);
    }
}
startServer()