/* prenota.js — Panificio Tenaglia
   Validazione form + apertura WhatsApp con messaggio preformattato */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NUMERO WHATSAPP ZENZIO ── */
  const WA_NUMBER = '393406169211';   /* formato internazionale senza + */

  /* ── ELEMENTI DOM ── */
  const form        = document.getElementById('form-prenota');
  const formWrap    = document.getElementById('form-wrap');
  const successBox  = document.getElementById('prenota-success');
  const btnReset    = document.getElementById('btn-reset');

  /* ── PRE-SELEZIONA SEDE DA URL (?sede=1) ── */
  const params   = new URLSearchParams(window.location.search);
  const sedeParam = params.get('sede');
  if (sedeParam) {
    const sedeSelect = document.getElementById('sede');
    if (sedeSelect) sedeSelect.value = sedeParam;
  }

  /* ── DATA MINIMA = DOMANI ── */
  const inputData = document.getElementById('data-ritiro');
  if (inputData) {
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    const yyyy = domani.getFullYear();
    const mm   = String(domani.getMonth() + 1).padStart(2, '0');
    const dd   = String(domani.getDate()).padStart(2, '0');
    inputData.min   = `${yyyy}-${mm}-${dd}`;
    inputData.value = `${yyyy}-${mm}-${dd}`;  /* pre-compila con domani */
  }

  /* ── VALIDAZIONE CAMPO SINGOLO ── */
  function validateField(input) {
    const errorEl = document.getElementById(`error-${input.id}`);
    let valid = true;
    let msg   = '';

    if (input.required && !input.value.trim()) {
      valid = false;
      msg   = 'Campo obbligatorio';
    } else if (input.type === 'tel' && input.value.trim()) {
      const cleaned = input.value.replace(/\s/g, '');
      if (!/^[+]?[\d]{8,15}$/.test(cleaned)) {
        valid = false;
        msg   = 'Inserisci un numero di telefono valido';
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

  /* Valida on-blur su ogni campo */
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(el);
    });
  });

  /* ── COSTRUISCE MESSAGGIO WHATSAPP ── */
  function buildMessage(data) {
    const sedeLabels = {
      '1': 'Sede 1 — Orsogna (Via Raffaele Paolucci, 7)',
      '2': 'Sede 2'
    };

    /* Formatta la data in italiano */
    const dataObj = new Date(data.dataRitiro + 'T00:00:00');
    const dataFmt = dataObj.toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const righe = [
      '🍞 *NUOVA PRENOTAZIONE — Panificio Tenaglia*',
      '',
      `👤 *Nome:* ${data.nome}`,
      `📞 *Telefono:* ${data.telefono}`,
      '',
      `🏪 *Sede ritiro:* ${sedeLabels[data.sede] || data.sede}`,
      `📅 *Data:* ${dataFmt}`,
      `🕐 *Ora indicativa:* ${data.ora}`,
      '',
      `🛒 *Ordine:*`,
      ...data.prodotti.map(p => `   • ${p.quantita}x ${p.tipo}`),
      '',
      data.note ? `📝 *Note:* ${data.note}` : null,
      '',
      '─────────────────────',
      'Messaggio inviato dal sito Panificio Tenaglia'
    ].filter(r => r !== null);

    return righe.join('\n');
  }

  /* ── RACCOGLIE I PRODOTTI DAL DOM ── */
  function raccogliProdotti() {
    const righe = document.querySelectorAll('.prodotto-row');
    const prodotti = [];
    righe.forEach(riga => {
      const tipo = riga.querySelector('.prodotto-tipo').value;
      const qty  = riga.querySelector('.prodotto-qty').value;
      if (tipo && qty > 0) prodotti.push({ tipo, quantita: qty });
    });
    return prodotti;
  }

  /* ── SUBMIT ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    /* Valida tutti i campi */
    const campi   = form.querySelectorAll('.form-input, .form-select, .form-textarea');
    const privacy = document.getElementById('privacy');
    let tuttoOk   = true;

    campi.forEach(c => { if (!validateField(c)) tuttoOk = false; });
    if (!validateField(privacy)) tuttoOk = false;

    /* Controlla che ci sia almeno un prodotto */
    const prodotti = raccogliProdotti();
    const errProd  = document.getElementById('error-prodotti');
    if (prodotti.length === 0) {
      tuttoOk = false;
      if (errProd) { errProd.textContent = 'Aggiungi almeno un prodotto'; errProd.classList.add('visible'); }
    } else {
      if (errProd) errProd.classList.remove('visible');
    }

    if (!tuttoOk) {
      /* Scrolla al primo errore */
      const primo = form.querySelector('.error, .form-error.visible');
      if (primo) primo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* Costruisce e apre WhatsApp */
    const messaggio = buildMessage({
      nome:       document.getElementById('nome').value.trim(),
      telefono:   document.getElementById('telefono').value.trim(),
      sede:       document.getElementById('sede').value,
      dataRitiro: document.getElementById('data-ritiro').value,
      ora:        document.getElementById('ora-ritiro').value,
      prodotti,
      note:       document.getElementById('note').value.trim()
    });

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(messaggio)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    /* Mostra schermata di conferma */
    formWrap.style.display   = 'none';
    successBox.classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── RESET (torna al form) ── */
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      formWrap.style.display = 'block';
      successBox.classList.remove('visible');
      /* Ripristina data minima */
      if (inputData) {
        const domani = new Date();
        domani.setDate(domani.getDate() + 1);
        const yyyy = domani.getFullYear();
        const mm   = String(domani.getMonth() + 1).padStart(2, '0');
        const dd   = String(domani.getDate()).padStart(2, '0');
        inputData.value = `${yyyy}-${mm}-${dd}`;
      }
    });
  }

  /* ── AGGIUNGI / RIMUOVI RIGHE PRODOTTO ── */
  const prodottiWrap = document.getElementById('prodotti-wrap');
  const btnAggiungi  = document.getElementById('btn-aggiungi-prodotto');
  let   rowCount     = 1;

  const tipiPane = [
    { value: '',                   label: '— Scegli il tipo —' },
    { value: 'Pane Casereccio',    label: '🍞 Pane Casereccio' },
    { value: 'Filone Abruzzese',   label: '🥖 Filone Abruzzese' },
  ];

  function creaRiga(idx) {
    const div = document.createElement('div');
    div.className = 'prodotto-row form-row';
    div.style.alignItems = 'flex-end';
    div.innerHTML = `
      <div class="form-group">
        ${idx === 0 ? '<label class="form-label">Tipo di pane <span class="required">*</span></label>' : ''}
        <select class="form-select prodotto-tipo" required aria-label="Tipo di pane ${idx + 1}">
          ${tipiPane.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="max-width: 100px;">
        ${idx === 0 ? '<label class="form-label">Quantità</label>' : ''}
        <input type="number" class="form-input prodotto-qty"
               value="1" min="1" max="20"
               aria-label="Quantità prodotto ${idx + 1}" />
      </div>
      ${idx > 0 ? `<button type="button" class="btn-rimuovi-prodotto"
              aria-label="Rimuovi questo prodotto"
              style="background:none;border:none;cursor:pointer;color:var(--terracotta);
                     font-size:1.2rem;padding:0.75rem 0.25rem;align-self:flex-end;">✕</button>` : '<div></div>'}
    `;

    /* Gestione rimozione riga */
    const btnRimuovi = div.querySelector('.btn-rimuovi-prodotto');
    if (btnRimuovi) {
      btnRimuovi.addEventListener('click', () => {
        div.remove();
        /* Nasconde il bottone "Aggiungi" se si scende a 0 righe — non può succedere perché
           la prima riga non ha il tasto rimuovi, ma per sicurezza: */
        const errProd = document.getElementById('error-prodotti');
        if (errProd) errProd.classList.remove('visible');
      });
    }

    return div;
  }

  /* Prima riga già presente nell'HTML, aggiungi ulteriori dal JS */
  if (btnAggiungi) {
    btnAggiungi.addEventListener('click', () => {
      if (rowCount >= 5) return;   /* max 5 prodotti */
      rowCount++;
      prodottiWrap.appendChild(creaRiga(rowCount - 1));
      if (rowCount >= 5) btnAggiungi.disabled = true;
    });
  }

  /* Inizializza la prima riga manualmente (è nell'HTML, ma popoliamo le options) */
  const primoSelect = prodottiWrap.querySelector('.prodotto-tipo');
  if (primoSelect && primoSelect.options.length === 0) {
    tipiPane.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.value;
      opt.textContent = t.label;
      primoSelect.appendChild(opt);
    });
  }

});
