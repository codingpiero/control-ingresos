const entryService = require('../services/entry.services');
const dniService = require('../services/dni.services');

async function index(req, res, next) {
    try {
        const {
            q = '',
            fechaIngreso = '',
            fechaSalida = '',
            page = 1,
            limit = 10
        } = req.query;

        const { entries, pagination } =
            await entryService.getEntries({
                search: q,
                fechaIngreso,
                fechaSalida,
                page,
                limit
            });

        res.render('entries/index', {
            title: 'Listado de visitas',
            entries,
            pagination
        });
    } catch (e) {
        next(e);
    }
}
async function createForm(req,res){
    res.render('entries/create',{
        title:'Registrar Visita',
        data:{}
    });
}
async function create(req,res,next){
    let createdId = Number(req.session.user.id);
    try {
        const data = {
            ...req.body,
            created_by:createdId
        }
        await entryService.createEntry(data);
        res.redirect('/entries');
    } catch (e) {
        if(e.isOperational){
            return res.status(e.statusCode).render('entries/create',{
                error: e.message,
                data: req.body
            })
        }
        next(e);
    }
}

async function editForm(req,res,next){
    try {
        const entry = await entryService.getEntryById(req.params.id);

        if(!entry){
            return res.status(404).render('errors/error',{
                title:'Visita no encontrada.',
                message:'La visita solicitada no existe',
            });
        }
        res.render('entries/edit',{
            title:'Editar Visita',
            data:entry
        })
    } catch (e) {
        next(e);
    }
}
async function update(req, res, next) {
    try {
        await entryService.updateEntry(req.params.id, req.body);
        res.redirect('/entries');
    } catch (error) {
        next(error);
    }
}
async function deleteRecord(req, res, next) {
    try {
        await entryService.deleteEntry(req.params.id);

        res.redirect('/entries');
    } catch (error) {
        next(error);
    }
}
async function registerExit(req,res,next){
    try {
        await entryService.registerExit(req.params.id);
        res.redirect('/entries');
    } catch (e) {
        next(e);
    }
}

async function consultarDni(req, res) {
    try {
        const { dni } = req.body;

        if (typeof dni !== 'string' || !/^\d{8}$/.test(dni)) {
            return res.status(400).json({
                success: false,
                message: 'Ingresa un DNI válido de 8 dígitos.'
            });
        }

        const persona = await dniService.consultarDNI(dni);

        if (!persona) {
            return res.status(200).json({
                success: false,
                message: 'No se encontraron datos. Puedes ingresar los datos manualmente.'
            });
        }

        return res.status(200).json({
            success: true,
            data: persona
        });
    } catch (error) {
        console.error('Error en la consulta de DNI:', error.message);

        // La consulta externa no debe impedir registrar la visita.
        return res.status(200).json({
            success: false,
            message: 'No fue posible consultar el DNI. Puedes ingresar los datos manualmente.'
        });
    }
}

async function getNewEntryData(req, res, next) {
    try {
        const data = await entryService.getDataForNewEntry(
            req.params.id
        );

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

async function createNewEntry(req, res, next) {
    try {
        const previousData = await entryService.getDataForNewEntry(
            req.params.id
        );

        // Los datos personales se recuperan del registro original.
        // Solo permitimos editar los datos propios del nuevo ingreso.
        const data = {
            ...previousData,
            placa_vehiculo: req.body.placa_vehiculo,
            color_vehiculo: req.body.color_vehiculo,
            cantidad_pasajeros: req.body.cantidad_pasajeros,
            motivo_ingreso: req.body.motivo_ingreso,
            created_by: Number(req.session.user.id)
        };

        await entryService.createEntry(data);

        return res.json({
            success: true,
            message: 'Nuevo ingreso registrado correctamente.'
        });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

module.exports = {
    index,
    createForm,
    create,
    editForm,
    update,
    deleteRecord,
    registerExit,
    consultarDni,
    getNewEntryData,
    createNewEntry
}