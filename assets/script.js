const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAGv6UkdKQxnDO_k_FSln5VDLWSbQCOBX8u2MtpF1etmk2GGTHqWPjq2U46-e3shXb/exec';

const form = document.getElementById('clienteForm');
const successMessage = document.getElementById('successMessage');
const newVendaBtn = document.getElementById('newVendaBtn');

// Campos obrigatórios
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

// Elementos do supervisor
const supervisorSelect = document.getElementById('supervisor');
const outroSupervisorInput = document.getElementById('outroSupervisor');
const supervisorError = document.getElementById('supervisor-error');

// Máscara de telefone
const telefoneInput = document.getElementById('telefone');
const telefoneError = document.getElementById('telefone-error');

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupTelefoneMask();
    setupSupervisorSelect();
    setupFormValidation();
    setupDateField();
    setupNewVendaButton();
});

function updateCurrentDate() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = now.toLocaleDateString('pt-BR', options);
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        currentDateElement.textContent = formattedDate;
    }
}

function setupTelefoneMask() {
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
}

function setupSupervisorSelect() {
    supervisorSelect.addEventListener('change', function() {
        if (this.value === 'Outro') {
            outroSupervisorInput.style.display = 'block';
            outroSupervisorInput.required = true;
            supervisorError.textContent = '';
            supervisorError.style.display = 'none';
        } else {
            outroSupervisorInput.style.display = 'none';
            outroSupervisorInput.required = false;
            outroSupervisorInput.value = '';
        }
    });

    outroSupervisorInput.addEventListener('input', function() {
        if (supervisorSelect.value === 'Outro' && !this.value.trim()) {
            supervisorError.textContent = 'Por favor, digite o nome do supervisor';
            supervisorError.style.display = 'block';
        } else {
            supervisorError.style.display = 'none';
        }
    });
}

function setupFormValidation() {
    requiredFields.forEach(field => {
        if (field.id === 'supervisor') return;
        
        const input = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        input.addEventListener('input', function() {
            validateField(input, errorElement);
        });
    });

    // Validação especial para e-mail
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    
    emailInput.addEventListener('input', function() {
        validateEmailField(emailInput, emailError);
    });
}

function validateField(input, errorElement) {
    if (!input.value.trim()) {
        input.style.borderColor = 'var(--error)';
        errorElement.textContent = 'Este campo é obrigatório';
        errorElement.style.display = 'block';
    } else {
        input.style.borderColor = 'var(--border)';
        errorElement.style.display = 'none';
    }
}

function validateEmailField(input, errorElement) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!input.value.trim()) {
        input.style.borderColor = 'var(--error)';
        errorElement.textContent = 'Este campo é obrigatório';
        errorElement.style.display = 'block';
    } else if (!emailRegex.test(input.value)) {
        input.style.borderColor = 'var(--error)';
        errorElement.textContent = 'Por favor, insira um e-mail válido';
        errorElement.style.display = 'block';
    } else {
        input.style.borderColor = 'var(--border)';
        errorElement.style.display = 'none';
    }
}

function setupDateField() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataVenda').value = today;
}

function setupNewVendaButton() {
    newVendaBtn.addEventListener('click', function() {
        successMessage.classList.add('hidden');
        form.classList.remove('hidden');
    });
}

function validateForm() {
    let isValid = true;
    
    // Validação do supervisor
    if (supervisorSelect.value === 'Outro' && !outroSupervisorInput.value.trim()) {
        outroSupervisorInput.style.borderColor = 'var(--error)';
        supervisorError.textContent = 'Por favor, digite o nome do supervisor';
        supervisorError.style.display = 'block';
        isValid = false;
    } else if (!supervisorSelect.value) {
        supervisorSelect.style.borderColor = 'var(--error)';
        supervisorError.textContent = 'Por favor, selecione um supervisor';
        supervisorError.style.display = 'block';
        isValid = false;
    } else {
        supervisorSelect.style.borderColor = 'var(--border)';
        outroSupervisorInput.style.borderColor = 'var(--border)';
        supervisorError.style.display = 'none';
    }
    
    // Validação dos demais campos
    requiredFields.forEach(field => {
        if (field.id === 'supervisor') return;
        
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
    
    // Reset dos estilos de erro
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        input.style.borderColor = 'var(--border)';
        errorElement.style.display = 'none';
    });
    
    // Reset especial para supervisor
    supervisorSelect.selectedIndex = 0;
    outroSupervisorInput.style.display = 'none';
    outroSupervisorInput.value = '';
    outroSupervisorInput.required = false;
    
    // Define a data atual
    setupDateField();
}

async function submitForm(data) {
    try {
        // Se selecionou "Outro", pega o valor do input
        if (data.supervisor === 'Outro') {
            data.supervisor = outroSupervisorInput.value.trim();
        }
        
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
        supervisor: supervisorSelect.value === 'Outro' ? outroSupervisorInput.value.trim() : supervisorSelect.value,
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
    
    // Carregando do botão de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        await submitForm(formData);
        
        // Mostrar os resultados do envio
        document.getElementById('success-details').innerHTML = `
            <strong>Venda registrada para:</strong><br>
            <strong>Cliente:</strong> ${formData.cliente}<br>
            <strong>Estabelecimento:</strong> ${formData.estabelecimento}<br>
            <strong>Concorrência:</strong> ${formData.concorrencia}<br>
            <strong>Cust ID:</strong> ${formData.custId}<br>
            <strong>Consultor:</strong> ${formData.consultor}<br>
            <strong>Supervisor:</strong> ${formData.supervisor}<br>
            <strong>Serial:</strong> ${formData.serial}<br>
            <strong>Data:</strong> ${new Date(formData.dataVenda).toLocaleDateString('pt-BR')}
        `;
        
        // Esconder formulário e mostrar mensagem de sucesso
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        resetForm();
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});