const express = require('express');
const entryController = require('../controllers/entry.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

// Listado de visitas.
router.get(
    '/',
    requireRole('VIGILANTE', 'USUARIO'),
    entryController.index
);

// Registrar visitas.
router.get(
    '/nuevo',
    requireRole('VIGILANTE'),
    entryController.createForm
);

router.post(
    '/',
    requireRole('VIGILANTE'),
    entryController.create
);

// Consultar DNI.
// Debe estar protegida porque consume la cuota de la API.
router.post(
    '/consultar-dni',
    requireRole('VIGILANTE'),
    entryController.consultarDni
);

// Editar visitas.
router.get(
    '/:id/editar',
    requireRole('VIGILANTE'),
    entryController.editForm
);

router.post(
    '/:id/editar',
    requireRole('VIGILANTE'),
    entryController.update
);

router.get(
    '/:id/nuevo-ingreso',
    requireRole('VIGILANTE'),
    entryController.getNewEntryData
);

router.post(
    '/:id/nuevo-ingreso',
    requireRole('VIGILANTE'),
    entryController.createNewEntry
);
// Eliminar visitas.
router.post(
    '/:id/eliminar',
    requireRole('VIGILANTE'),
    entryController.deleteRecord
);

// Registrar salida.
router.post(
    '/:id/salida',
    requireRole('VIGILANTE'),
    entryController.registerExit
);

module.exports = router;