const config = require('../configurations/config');

const API_URL = 'https://api.apiperu.dev/dni';

async function consultarDNI(dni){
    const token = config.API.DNI_TOKEN;
    if(!token){
        throw new Error('DNI_TOKEN no esta configurado.');
    }
    const respuesta = await fetch(API_URL,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            Accept:'application/json',
            Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({dni}),
        signal:AbortSignal.timeout(8000)
    });
    let resultado;
    try {
        resultado = await respuesta.json();
    } catch (error) {
        throw new Error('Api Dni devolvio respuesta invalida.');
    }
    if(!respuesta.ok){
        throw new Error(`Api respondio con HTTP ${respuesta.status}.`)
    }
    if(resultado.success !== true || !resultado.data){
        return null;
    }
    const {nombres,apellido_paterno,apellido_materno} = resultado.data;
    if (
        typeof nombres !== 'string' ||
        !nombres.trim() ||
        typeof apellido_paterno !== 'string' ||
        !apellido_paterno.trim() ||
        typeof apellido_materno !== 'string' ||
        !apellido_materno.trim()
    ) {
        return null;
    }

    return {
        nombres: nombres.trim(),
        apellidos: `${apellido_paterno} ${apellido_materno}`.trim()
    };

}
module.exports = {
    consultarDNI
}