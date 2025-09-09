const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    const userData = User.findById(user.id);
    if (!userData) {
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }
    
    req.user = userData;
    next();
  });
};

// Middleware para verificar se o usuário é supervisor
const requireSupervisor = (req, res, next) => {
  if (req.user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Acesso permitido apenas para supervisores' });
  }
  next();
};

module.exports = { authenticateToken, requireSupervisor };