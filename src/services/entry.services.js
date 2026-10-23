
const AppError = require('../errors/AppError');
const entryModel = require('../models/entry.model');

async function getEntries({
    search = '',
    fechaIngreso = '',
    fechaSalida = '',
    page = 1,
    limit = 10
} = {}) {
    const currentPage = Math.max(
        1,
        Number.parseInt(page, 10) || 1
    );

    const pageSize = [10, 20, 50].includes(Number(limit))
        ? Number(limit)
        : 10;

    const offset = (currentPage - 1) * pageSize;

    const { entries, total } = await entryModel.findAll({
        search,
        fechaIngreso,
        fechaSalida,
        limit: pageSize,
        offset
    });

    return {
        entries,
        pagination: {
            search,
            fechaIngreso,
            fechaSalida,
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}
async function getEntryById(id) {
    const entryId = Number(id);
    if (!Number.isInteger(entryId) || entryId <= 0) {
        throw new AppError('El ID de la visita  no es valido', 400);
    }
    return await entryModel.findById(id);
}

async function createEntry(data) {

    data.nombre_visita = data.nombre_visita?.trim() || null;
    data.apellidos_visita = data.apellidos_visita?.trim() || null;
    data.numero_documento = data.numero_documento?.trim() || null;
    data.direccion_visita = data.direccion_visita?.trim() || null;
    data.motivo_ingreso = data.motivo_ingreso?.trim() || null;

    if (data.document_type_id === '') {
        data.document_type_id = null;
    } else if (data.document_type_id !== null) {
        data.document_type_id = Number(data.document_type_id);
    }

    if (!data.medio_ingreso) {
        throw new AppError('El medio de ingreso es obligatorio.', 400);
    }

    if (data.medio_ingreso !== 'PEATON' && data.medio_ingreso !== 'VEHICULO') {
        throw new AppError('Medio de ingreso invalido', 400);
    }

    if (data.medio_ingreso === 'VEHICULO' && !data.placa_vehiculo) {
        throw new AppError('La placa es obligatoria  para el ingreso vehicular.', 400);
    }

    if (data.medio_ingreso === 'PEATON') {
        data.placa_vehiculo = null;
        data.color_vehiculo = null;
        data.cantidad_pasajeros = null;
    }

    if (data.medio_ingreso === 'VEHICULO') {
        data.placa_vehiculo = data.placa_vehiculo?.trim().toUpperCase();
        data.color_vehiculo = data.color_vehiculo?.trim() || null;

        if (data.cantidad_pasajeros === '') {
            data.cantidad_pasajeros = null;
        } else if (data.cantidad_pasajeros !== null) {
            data.cantidad_pasajeros = Number(data.cantidad_pasajeros);
        }
    }

    const entry = await entryModel.create(data);

    return entry;
}

async function updateEntry(id, data) {
    const entryId = Number(id);
    if (!Number.isInteger(entryId) || entryId <= 0) {
        throw new AppError('El ID de la visita no es valido', 400);
    }
    const existingEntry = await entryModel.findById(entryId);

    if (!existingEntry) {
        throw new AppError('La visita no existe', 404);
    }
    // VALIDACIONES
    if (
        data.cantidad_pasajeros === '' ||
        data.cantidad_pasajeros == null
    ) {
        data.cantidad_pasajeros = null;
    } else {
        data.cantidad_pasajeros = Number(data.cantidad_pasajeros);

        if (
            !Number.isInteger(data.cantidad_pasajeros) ||
            data.cantidad_pasajeros < 0
        ) {
            throw new AppError(
                'La cantidad de pasajeros debe ser un entero mayor o igual a cero',
                400
            );
        }
    }
    data.placa_vehiculo =
        data.placa_vehiculo?.trim().toUpperCase() || null;

    data.color_vehiculo =
        data.color_vehiculo?.trim() || null;

    if (data.medio_ingreso === 'PEATON') {
        data.placa_vehiculo = null;
        data.color_vehiculo = null;
        data.cantidad_pasajeros = null;
    } else if (data.medio_ingreso === 'VEHICULO') {
        if (!data.placa_vehiculo) {
            throw new AppError(
                'La placa del vehículo es obligatoria',
                400
            );
        }
    } else {
        throw new AppError('El medio de ingreso no es válido', 400);
    }

    if(!data.document_type_id){
        data.document_type_id = null;
    }
    const updateEntry = await entryModel.update(entryId, data);
    return updateEntry;
}

async function deleteEntry(id) {
    const entryId = Number(id);

    if (!Number.isInteger(entryId) || entryId <= 0) {
        throw new AppError('El ID de la visita no es válido', 400);
    }

    const existingEntry = await entryModel.findById(entryId);

    if (!existingEntry) {
        throw new AppError('La visita no existe', 404);
    }

    return await entryModel.remove(entryId);
}

async function registerExit(id){
    const entryId = Number(id);
    if(!Number.isInteger(entryId) || entryId <= 0){
        throw new AppError(`El ID de la visita no es valido`,400);
    }
    const entry = await entryModel.findById(entryId);

    if(!entry){
        throw new AppError('La visita no existe.',400);
    }
    if(entry.fecha_hora_salida !== null){
        throw new AppError('Esta visita ya tiene una salida registrada.',400);
    }
    const updatedEntry = await entryModel.registerExit(entryId);
    if(!updatedEntry){
        throw new AppError('No se pudo registrar la salida. Verifica el estado de la visita.');
    }
    return updatedEntry;
}
module.exports = {
    getEntries,
    createEntry,
    updateEntry,
    getEntryById,
    deleteEntry,
    registerExit,
}