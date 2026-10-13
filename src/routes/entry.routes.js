const express = require('express');
const entryController = require('../controllers/entry.controller');

const {requireRole} =require('../middlewares/role.middleware');

const router = express.Router();


router.get('/',requireRole('VIGILANTE', 'USUARIO'),entryController.index);

router.get('/nuevo', requireRole('VIGILANTE'),entryController.createForm);
router.post('/', requireRole('VIGILANTE'),entryController.create);

router.get('/:id/editar', requireRole('VIGILANTE'), entryController.editForm);
router.post('/:id/editar', requireRole('VIGILANTE'), entryController.update);

router.post('/:id/eliminar', requireRole('VIGILANTE'), entryController.deleteRecord);
router.post('/:id/salida', requireRole('VIGILANTE'),entryController.registerExit);

module.exports = router;