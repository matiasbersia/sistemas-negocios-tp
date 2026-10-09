const express = require('express');

const router = express.Router();

const eventosController = require('../controllers/eventosController');

console.log(eventosController);

console.log(typeof eventosController.obtenerEventos);

console.log(typeof eventosController.crearEvento);

console.log(typeof eventosController.modificarEvento);

console.log(typeof eventosController.eliminarEvento);

console.log(typeof eventosController.buscarEvento);

router.get('/eventos', eventosController.obtenerEventos);

router.get('/eventos/buscar/:nombre', eventosController.buscarEvento);

router.post('/eventos', eventosController.crearEvento);

router.put('/eventos/:id', eventosController.modificarEvento);

router.delete('/eventos/:id', eventosController.eliminarEvento);

module.exports = router;