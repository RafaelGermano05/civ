// Configurações do Google Apps Script
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAGv6UkdKQxnDO_k_FSln5VDLWSbQCOBX8u2MtpF1etmk2GGTHqWPjq2U46-e3shXb/exec';

const form = document.getElementById('clienteForm');
const successMessage = document.getElementById('successMessage');
const newVendaBtn = document.getElementById('newVendaBtn');

// campos obrigatórios da base google sheets
const requiredFields = [
    { id: 'supervisor', errorId: 'supervisor-error' },
    { id: 'consultor', errorId: 'consultor-error' },
    { id: 'cliente', errorId: 'cliente-error' },
    { id: 'estabelecimento', errorId: 'estabelecimento-error' },
    { id: 'custId', errorId: 'custId-error' },
    { id: 'telefone', errorId: 'telefone-error' },
    { id: 'email', errorId: 'email-error' },
    { id: 'dataVenda', errorId: 'dataVenda-error' },
    { id: 'serial', errorId: 'serial-error' },
    { id: 'concorrencia', errorId: 'concorrencia-error' }
];

const telefoneInput = document.getElementById('telefone');
const telefoneError = document.getElementById('telefone-error');

telefoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    
    e.target.value = value;
    
    // Validação
    if (value.length < 14) { 
        telefoneInput.style.borderColor = 'var(--error)';
        telefoneError.textContent = 'Telefone incompleto';
        telefoneError.style.display = 'block';
    } else {
        telefoneInput.style.borderColor = 'var(--border)';
        telefoneError.style.display = 'none';
    }
});

function updateCurrentDate() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = now.toLocaleDateString('pt-BR', options);
    document.getElementById('current-date').textContent = formattedDate;
}

function validateForm() {
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--error)';
            errorElement.textContent = 'Este campo é obrigatório';
            errorElement.style.display = 'block';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border)';
            errorElement.style.display = 'none';
        }
    });
    
    // Validação adicional para e-mail
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailInput.value.trim() && !emailRegex.test(emailInput.value)) {
        emailInput.style.borderColor = 'var(--error)';
        emailError.textContent = 'Por favor, insira um e-mail válido';
        emailError.style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

function resetForm() {
    form.reset();
    requiredFields.forEach(field => {
        document.getElementById(field.id).style.borderColor = 'var(--border)';
        document.getElementById(field.errorId).style.display = 'none';
    });
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataVenda').value = today;
}

// envia os dados para o Google Sheets
async function submitForm(data) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        return { status: "success" };
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = {
        supervisor: document.getElementById('supervisor').value.trim(),
        consultor: document.getElementById('consultor').value.trim(),
        cliente: document.getElementById('cliente').value.trim(),
        estabelecimento: document.getElementById('estabelecimento').value.trim(),
        custId: document.getElementById('custId').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        email: document.getElementById('email').value.trim(),
        dataVenda: document.getElementById('dataVenda').value,
        serial: document.getElementById('serial').value.trim(),
        observacoes: document.getElementById('observacoes').value.trim(),
        concorrencia: document.getElementById('concorrencia').value.trim()

    };
    
    // carregando do botão de submit 
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        await submitForm(formData);
        
        // mostrar os resultados do envio 
        document.getElementById('success-details').innerHTML = `
            <strong>Venda registrada para:</strong><br>
            <strong>Cliente:</strong> ${formData.cliente}<br>
            <strong>Estabelecimento:</strong> ${formData.estabelecimento}<br>
            <strong>Concorrência:</strong> ${formData.concorrencia}<br>
            <strong>Cust ID:</strong> ${formData.custId}<br>
            <strong>Consultor:</strong> ${formData.consultor}<br>
            <strong>Serial:</strong> ${formData.serial}<br>
            <strong>Data:</strong> ${new Date(formData.dataVenda).toLocaleDateString('pt-BR')}
        `;
        
        // Esconder formulário e mostrar mensagem de sucesso
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        resetForm();
    } /* catch (error) {
        alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    }*/ finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Botão para nova venda
newVendaBtn.addEventListener('click', () => {
    successMessage.classList.add('hidden');
    form.classList.remove('hidden');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataVenda').value = today;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        input.addEventListener('input', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = 'var(--error)';
                errorElement.textContent = 'Este campo é obrigatório';
                errorElement.style.display = 'block';
            } else {
                this.style.borderColor = 'var(--border)';
                errorElement.style.display = 'none';
            }
        });
    });
    
    // Validação especial para e-mail
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    emailInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = 'var(--error)';
            emailError.textContent = 'Este campo é obrigatório';
            emailError.style.display = 'block';
        } else if (!emailRegex.test(this.value)) {
            this.style.borderColor = 'var(--error)';
            emailError.textContent = 'Por favor, insira um e-mail válido';
            emailError.style.display = 'block';
        } else {
            this.style.borderColor = 'var(--border)';
            emailError.style.display = 'none';
        }
    });
});