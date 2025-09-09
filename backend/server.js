require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());

// Limitar taxa de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));

// Configuração CORS para produção/desenvolvimento
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://controle-vendas-frontend.onrender.com'] 
  : ['http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido por CORS'));
    }
  },
  credentials: true
}));

// ================== ROTAS DE LOGIN ================== //
// Dados dos usuários (supervisores)
const users = [
  { id: 1, username: "Aldenir Medeiros", password: "aldenir6", role: "supervisor" },
  { id: 2, username: "Rozélia Soares", password: "rozelia3", role: "supervisor" },
  { id: 3, username: "Aline Ysline", password: "aline5", role: "supervisor" },
  { id: 4, username: "Thiago de Carvalho", password: "thiago4", role: "supervisor" },
  { id: 5, username: "Kesse Jhones", password: "kesse8", role: "supervisor" },
  { id: 6, username: "Anderson Brito", password: "brito9", role: "supervisor" },
  { id: 7, username: "Guilherme Queiroz", password: "guilherme13", role: "supervisor" },
  { id: 8, username: "Maria Anita", password: "anita12", role: "supervisor" },
  { id: 9, username: "Pedro Lavor", password: "lavor2", role: "supervisor" },
  { id: 10, username: "Ramom Amaral", password: "ramom1", role: "supervisor" },
  { id: 11, username: "Dougllas Araújo", password: "dougllas2", role: "supervisor" },
  { id: 12, username: "Tiago William", password: "tiago10", role: "supervisor" },
  { id: 13, username: "Thiago Eurípedes", password: "thiago11", role: "supervisor" },
  { id: 14, username: "Allexandre Serrão", password: "allex3", role: "supervisor" },
  { id: 15, username: "Michella Matos", password: "michella4", role: "supervisor" },
  { id: 16, username: "Vitória de Freitas", password: "vitoria1", role: "supervisor" },
  { id: 17, username: "Maykon Thompson", password: "maykon4", role: "supervisor" }
];

// Rota de login
app.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.json({
        message: 'Login realizado com sucesso',
        token: 'token-' + user.id + '-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de autenticação simplificado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  try {
    // Verificação simplificada do token
    const tokenParts = token.split('-');
    if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    // Aqui você poderia validar melhor o token se quisesse
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar se é supervisor
const requireSupervisor = (req, res, next) => {
  // Em uma implementação real, você verificaria no token
  // Mas para simplificar, vamos assumir que todos são supervisores
  next();
};

// ================== ROTAS DA API ================== //
const axios = require('axios');
const WEB_APP_URL = process.env.WEB_APP_URL;

// Buscar clientes via Apps Script
app.get('/api/clientes', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const supervisorName = req.headers['supervisor'] || req.query.supervisor;
    
    console.log('Buscando clientes para supervisor:', supervisorName);
    
    const response = await axios.get(WEB_APP_URL, {
      params: {
        action: 'getClientes',
        supervisor: supervisorName
      }
    });

    console.log('Resposta do Apps Script:', response.data);
    
    res.json(response.data);

  } catch (error) {
    console.error('Erro ao buscar clientes:', error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Erro ao buscar clientes: " + error.message 
    });
  }
});

// Registrar nova venda via Apps Script
app.post('/api/venda', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const vendaData = {
      ...req.body,
      action: 'registrarVenda'
    };

    console.log('Enviando venda para Apps Script:', vendaData);

    const response = await axios.post(WEB_APP_URL, vendaData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta do Apps Script:', response.data);
    
    res.json(response.data);

  } catch (error) {
    console.error('Erro ao registrar venda:', error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Erro ao registrar venda: " + error.message 
    });
  }
});

// Registrar pós-venda via Apps Script
app.post('/api/posvenda', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const posVendaData = {
      ...req.body,
      action: 'registrarPosVenda'
    };

    console.log('Enviando pós-venda para Apps Script:', posVendaData);

    const response = await axios.post(WEB_APP_URL, posVendaData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta do Apps Script:', response.data);
    
    res.json(response.data);

  } catch (error) {
    console.error('Erro ao registrar pós-venda:', error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Erro ao registrar atendimento: " + error.message 
    });
  }
});

// Busca para pós-venda
app.get('/api/clientes/busca', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const { termo, supervisor } = req.query;
    
    console.log('Buscando clientes com termo:', termo, 'para supervisor:', supervisor);

    const response = await axios.get(WEB_APP_URL, {
      params: {
        action: 'getClientes',
        termo: termo || '',
        supervisor: supervisor || ''
      }
    });

    console.log('Resposta da busca:', response.data);
    
    res.json(response.data);

  } catch (error) {
    console.error('Erro na busca:', error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Erro na busca de clientes: " + error.message 
    });
  }
});

// Rota para obter informações do usuário (para o frontend)
app.get('/api/user-info', authenticateToken, (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    // Extrair user ID do token
    const tokenParts = token.split('-');
    const userId = parseInt(tokenParts[1]);
    
    const user = users.find(u => u.id === userId);
    
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter informações do usuário' });
  }
});

// Rota de saúde para teste
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Controle de Vendas',
    version: '1.0.0',
    endpoints: {
      login: 'POST /auth/login',
      clientes: 'GET /api/clientes',
      venda: 'POST /api/venda',
      posvenda: 'POST /api/posvenda',
      health: 'GET /health'
    }
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro:', error);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`✅ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API URL: http://localhost:${PORT}/`);
});