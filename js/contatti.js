/* contatti.js — Panificio Tenaglia
   Form contatto generico con invio via WhatsApp */

document.addEventListener('DOMContentLoaded', () => {

  const WA_NUMBER = '393406169211';

  const form       = document.getElementById('form-contatti');
  const formWrap   = document.getElementById('contatti-form-wrap');
  const successBox = document.getElementById('contatti-success');
  const btnReset   = document.getElementById('btn-reset-contatti');

  if (!form) return;

  /* ── VALIDAZIONE CAMPO SINGOLO ── */
  function validateField(input) {
    const errorEl = document.getElementById(`error-${input.id}`);
    let valid = true;
    let msg   = '';

    if (input.required && !input.value.trim()) {
      valid = false;
      msg   = 'Campo obbligatorio';
    } else if (input.type === 'email' && input.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        valid = false;
        msg   = 'Inserisci un indirizzo email valido';
      }
    } else if (input.type === 'checkbox' && !input.checked) {
      valid = false;
      msg   = 'Devi accettare per procedere';
    }

    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.toggle('visible', !valid);
    }
    input.classList.toggle('error', !valid);
    return valid;
  }

  /* Valida on-blur */
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('blur',  () => validateField(el));
    el.addEventListener('input', () => { if (el.classList.contains('error')) validateField(el); });
  });

  /* ── COSTRUISCE MESSAGGIO WHATSAPP ── */
  function buildMessage(data) {
    const argomentoLabels = {
      'info-generali':    'Informazioni generali',
      'forniture':        'Forniture / Richiesta commerciale',
      'eventi':           'Evento o occasione speciale',
      'collaborazioni':   'Collaborazioni',
      'altro':            'Altro'
    };

    const righe = [
      '✉️ *MESSAGGIO DAL SITO — Panificio Tenaglia*',
      '',
      `👤 *Nome:* ${data.nome}`,
      `📧 *Email:* ${data.email}`,
      data.telefono ? `📞 *Telefono:* ${data.telefono}` : null,
      '',
      `📌 *Argomento:* ${argomentoLabels[data.argomento] || data.argomento}`,
      '',
      `💬 *Messaggio:*`,
      data.messaggio,
      '',
      '─────────────────────',
      'Messaggio inviato dal sito Panificio Tenaglia'
    ].filter(r => r !== null);

    return righe.join('\n');
  }

  /* ── SUBMIT ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const campi  = form.querySelectorAll('.form-input, .form-select, .form-textarea');
    const privacy = document.getElementById('privacy-contatti');
    let tuttoOk  = true;

    campi.forEach(c  => { if (!validateField(c)) tuttoOk = false; });
    if (!validateField(privacy)) tuttoOk = false;

    if (!tuttoOk) {
      const primo = form.querySelector('.error, .form-error.visible');
      if (primo) primo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const messaggio = buildMessage({
      nome:      document.getElementById('c-nome').value.trim(),
      email:     document.getElementById('c-email').value.trim(),
      telefono:  document.getElementById('c-telefono').value.trim(),
      argomento: document.getElementById('c-argomento').value,
      messaggio: document.getElementById('c-messaggio').value.trim()
    });

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(messaggio)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    formWrap.style.display = 'none';
    successBox.classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── RESET ── */
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      formWrap.style.display = 'block';
      successBox.classList.remove('visible');
    });
  }

});
