const {Pool} =require('pg');
const config = require('./config');

let enviroment = process.env.NODE_ENV;
let certified = false;
if(enviroment === 'production'){
    certified = {
        rejectUnauthorized: false
    }
}
const pool = new Pool({
    connectionString: config.DATABASE.POSTGRESQL,
    ssl:certified
});
module.exports = pool;