/* ==========================================================================
   Orçamento online
   ----------------------------------------------------------------------------
   - Monta as opções de veículo e de serviço a partir de js/config.js
   - Calcula a estimativa em tempo real (preço base × fator do veículo)
   - Valida os campos e abre o WhatsApp com o orçamento já escrito
   - Expõe window.Budget.addService(id), usado pelo catálogo e pelos banners
   Depende de js/config.js (carregado antes).
   ========================================================================== */
(function () {
  'use strict';

  const form = document.getElementById('budgetForm');
  if (!form) return;

  const { services, vehicleTypes } = window.SITE_CONFIG;
  const { money, whatsappUrl } = window.SiteUtils;

  const els = {
    vehicles: document.getElementById('vehicleOptions'),
    services: document.getElementById('serviceOptions'),
    name: document.getElementById('bName'),
    phone: document.getElementById('bPhone'),
    model: document.getElementById('bVehicle'),
    note: document.getElementById('bNote'),
    summaryVehicle: document.getElementById('summaryVehicle'),
    summaryList: document.getElementById('summaryList'),
    summaryTotal: document.getElementById('summaryTotal'),
    clear: document.getElementById('clearBudget'),
    status: document.getElementById('formStatus'),
  };

  /* ---------- 1. Montagem das opções ---------- */

  function renderOptions() {
    // O primeiro veículo vem marcado no HTML (atributo checked), para que form.reset() o mantenha.
    els.vehicles.innerHTML = vehicleTypes.map((type, index) => `
      <label class="option">
        <input type="radio" name="vehicle" value="${type.id}"${index === 0 ? ' checked' : ''}>
        <span class="option__body">
          <span class="option__head">
            <span class="option__mark" aria-hidden="true"></span>
            <span class="option__title">${type.label}</span>
          </span>
          <span class="option__desc">${type.description}</span>
        </span>
      </label>`).join('');

    els.services.innerHTML = services.map((service) => `
      <label class="option">
        <input type="checkbox" name="services" value="${service.id}">
        <span class="option__body">
          <span class="option__head">
            <span class="option__mark" aria-hidden="true"></span>
            <span class="option__title">${service.name}</span>
          </span>
          <span class="option__desc">${service.description}</span>
          <span class="option__price" data-price-for="${service.id}"></span>
        </span>
      </label>`).join('');
  }

  /* ---------- 2. Cálculo ---------- */

  const getVehicle = () => {
    const id = form.querySelector('input[name="vehicle"]:checked')?.value;
    return vehicleTypes.find((type) => type.id === id) || vehicleTypes[0];
  };

  const getSelectedIds = () =>
    Array.from(form.querySelectorAll('input[name="services"]:checked'), (input) => input.value);

  function getQuote() {
    const vehicle = getVehicle();
    const selected = getSelectedIds();
    const items = services
      .filter((service) => selected.includes(service.id))
      .map((service) => ({
        id: service.id,
        name: service.name,
        value: Math.round(service.price * vehicle.factor),
      }));
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return { vehicle, items, total };
  }

  /* ---------- 3. Atualização da tela ---------- */

  function render() {
    const { vehicle, items, total } = getQuote();

    // Cada serviço mostra o preço já ajustado pelo tipo de veículo
    services.forEach((service) => {
      const priceEl = form.querySelector(`[data-price-for="${service.id}"]`);
      if (priceEl) priceEl.textContent = money(Math.round(service.price * vehicle.factor));
    });

    // Destaca os cartões marcados
    form.querySelectorAll('.option').forEach((option) => {
      option.classList.toggle('is-selected', option.querySelector('input').checked);
    });

    els.summaryVehicle.textContent = `Veículo: ${vehicle.label}`;
    els.summaryList.innerHTML = items.length
      ? items.map((item) => `<li><span>${item.name}</span><strong>${money(item.value)}</strong></li>`).join('')
      : '<li class="is-empty">Nenhum serviço selecionado ainda.</li>';

    setTotal(total);
  }

  // Anima o total somente quando o valor muda
  function setTotal(total) {
    els.summaryTotal.textContent = money(total);
    if (String(total) !== els.summaryTotal.dataset.value) {
      els.summaryTotal.dataset.value = String(total);
      els.summaryTotal.classList.remove('is-bumping');
      void els.summaryTotal.offsetWidth; // reinicia a animação
      els.summaryTotal.classList.add('is-bumping');
    }
  }

  function setStatus(message, isError = false) {
    els.status.textContent = message;
    els.status.classList.toggle('is-error', isError);
  }

  /* ---------- 4. Validação e erros ---------- */

  function validate() {
    const errors = [];
    if (els.name.value.trim().length < 2) {
      errors.push(['bName', 'Informe seu nome.']);
    }
    // Celular com DDD: 11 dígitos, sendo o terceiro um 9
    if (!/^\d{2}9\d{8}$/.test(els.phone.value.replace(/\D/g, ''))) {
      errors.push(['bPhone', 'Informe um celular com DDD. Exemplo: (00) 90000-0000']);
    }
    if (!getSelectedIds().length) {
      errors.push(['services', 'Escolha pelo menos um serviço.']);
    }
    return errors;
  }

  function showError(key, message) {
    const errorEl = form.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
    const field = document.getElementById(key);
    if (field) field.setAttribute('aria-invalid', 'true');
  }

  function clearError(key) {
    const errorEl = form.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
    const field = document.getElementById(key);
    if (field) field.removeAttribute('aria-invalid');
  }

  const clearAllErrors = () => ['bName', 'bPhone', 'services'].forEach(clearError);

  /* Máscara do celular: (00) 90000-0000 */
  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  /* ---------- 5. Ações ---------- */

  // Marca um serviço (usado pelo catálogo e pelos banners)
  function addService(id) {
    const input = form.querySelector(`input[name="services"][value="${id}"]`);
    if (!input) return false;

    const alreadySelected = input.checked;
    input.checked = true;
    clearError('services');
    render();
    setStatus(alreadySelected
      ? 'Este serviço já está no seu orçamento.'
      : 'Serviço adicionado ao orçamento.');
    return true;
  }

  function clearBudget() {
    form.reset();
    clearAllErrors();
    setStatus('');
    render();
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearAllErrors();

    const errors = validate();
    if (errors.length) {
      errors.forEach(([key, message]) => showError(key, message));
      setStatus('Revise os campos destacados para gerar seu orçamento.', true);

      // Leva o foco ao primeiro campo com problema
      const [firstKey] = errors[0];
      const target = firstKey === 'services'
        ? form.querySelector('input[name="services"]')
        : document.getElementById(firstKey);
      target.focus();
      return;
    }

    const { vehicle, items, total } = getQuote();
    const model = els.model.value.trim();
    const note = els.note.value.trim();

    const lines = [
      'Olá, Drive Car Mecânica! Gostaria de solicitar um orçamento.',
      '',
      `Nome: ${els.name.value.trim()}`,
      `WhatsApp: ${els.phone.value}`,
      `Veículo: ${vehicle.label}${model ? ` (${model})` : ''}`,
      '',
      'Serviços:',
      ...items.map((item) => `- ${item.name}: ${money(item.value)}`),
      '',
      `Estimativa total: ${money(total)}`,
    ];
    if (note) lines.push('', `Observações: ${note}`);

    window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener,noreferrer');
    setStatus('Abrimos o WhatsApp com seu orçamento. Confira a mensagem e envie.');
  }

  /* ---------- 6. Inicialização ---------- */

  function init() {
    renderOptions();
    render();

    form.addEventListener('change', (event) => {
      if (event.target.name === 'services') clearError('services');
      render();
    });

    els.phone.addEventListener('input', () => {
      els.phone.value = formatPhone(els.phone.value);
      clearError('bPhone');
    });

    els.name.addEventListener('input', () => clearError('bName'));
    els.clear.addEventListener('click', clearBudget);
    els.summaryTotal.addEventListener('animationend', () => {
      els.summaryTotal.classList.remove('is-bumping');
    });
    form.addEventListener('submit', handleSubmit);
  }

  init();

  window.Budget = { addService };
})();
