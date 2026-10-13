function errorHandler(error,req,res,next){
    console.log('log=============');
    console.log(error);
    console.log('log=============');

    let statusCode = error.statusCode ?? 500;
    let message = error.message ?? 'Error Internal.';

    if(error.isOperational){
        return res
        .status(error.statusCode)
        .send(error.message)
    }

    const databaseError = handleDatabaseError(error);

    if(databaseError){
        return res
        .status(databaseError.statusCode)
        .send(databaseError.message)
    }

    return res
        .status(statusCode)
        .send(message);
}

function handleDatabaseError(error){
    switch (error.code) {
        case '23503':
            return {
                statusCode:400,
                message:'El dato relacionado no existe.'
            }
            break;
        case '23514':
            return {
                statusCode:400,
                message:'Los datos enviados no cumplen las reglas del sistema.'
            }
            break;
        case '23502':
            return {
                statusCode:400,
                message:'Falta completar un dato obligatorio.'
            }
        default:
            return null;
    }
}



module.exports = errorHandler;