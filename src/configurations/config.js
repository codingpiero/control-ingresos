const dotenv = require('dotenv');

const enviroment = process.env.NODE_ENV ?? 'development';

dotenv.config({
    path:`.env.${enviroment}.local`
});

const config = {
    APP:{
        PORT:process.env.PORT ?? 3000,
    },
    DATABASE:{
        POSTGRESQL:process.env.POSTGRES_URI
    },
    SESSION:{
        SECRET:process.env.SESSION_SECRET
    },
    API:{
        DNI_TOKEN: process.env.APIPERU_TOKEN
    }
}

module.exports = config;