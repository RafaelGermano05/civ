const axios = require('axios');

const WEB_APP_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// Função para buscar dados filtrados por supervisor
const getClientes = async (req, res) => {
  try {
    const { termo } = req.query;
    const supervisorName = req.user.username;
    
    // Chamar o Google Apps Script
    const response = await axios.get(WEB_APP_URL, {
      params: {
        termo: termo || '',
        supervisor: supervisorName,
        action: 'getClientes'
      }
    });
    
    // Filtrar resultados apenas para o supervisor logado
    let clientes = response.data.data || [];
    clientes = clientes.filter(cliente => 
      cliente.supervisor === supervisorName
    );
    
    res.json({
      status: "success",
      data: clientes,
      total: clientes.length
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ 
      status: "error", 
      message: "Erro ao buscar clientes" 
    });
  }
};

// Registrar nova venda
const registrarVenda = async (req, res) => {
  try {
    const vendaData = req.body;
    vendaData.supervisor = req.user.username; // Forçar o supervisor ser o usuário logado
    
    const response = await axios.post(WEB_APP_URL, {
      ...vendaData,
      action: 'registrarVenda'
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ 
      status: "error", 
      message: "Erro ao registrar venda" 
    });
  }
};

// Registrar pós-venda
const registrarPosVenda = async (req, res) => {
  try {
    const posVendaData = req.body;
    
    const response = await axios.post(WEB_APP_URL, {
      ...posVendaData,
      action: 'registrarPosVenda'
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao registrar pós-venda:', error);
    res.status(500).json({ 
      status: "error", 
      message: "Erro ao registrar pós-venda" 
    });
  }
};

module.exports = { getClientes, registrarVenda, registrarPosVenda };