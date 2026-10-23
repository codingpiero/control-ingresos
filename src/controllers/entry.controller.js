const entryService = require('../services/entry.services');

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
    try {
        const data = {
            ...req.body,
            created_by:1
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
module.exports = {
    index,
    createForm,
    create,
    editForm,
    update,
    deleteRecord,
    registerExit
}