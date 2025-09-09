const express = require('express');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');
const { getClientes, registrarVenda, registrarPosVenda } = require('../controllers/dataController');
const router = express.Router();

// Todas as rotas API requerem autenticação
router.use(authenticateToken);
router.use(requireSupervisor);

router.get('/clientes', getClientes);
router.post('/venda', registrarVenda);
router.post('/posvenda', registrarPosVenda);

module.exports = router;

