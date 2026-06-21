/* mappa.js — Panificio Tenaglia
   Leaflet + OpenStreetMap, zero API key */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DATI SEDI ── */
  const sedi = [
    {
      id: 1,
      nome: 'Orsogna — Sede Principale',
      indirizzo: 'Via Raffaele Paolucci, 7 — 66036 Orsogna (CH)',
      lat: 42.2197,
      lng: 14.2831,
      attiva: true
    },
    {
      id: 2,
      nome: 'Seconda Sede',
      indirizzo: 'Indirizzo da aggiornare',
      /* AGGIORNARE lat/lng quando si ha l'indirizzo */
      lat: 42.25,
      lng: 14.30,
      attiva: true
    }
  ];

  /* ── COLORE PIN PERSONALIZZATO ── */
  function makeIcon(numero) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
              fill="#C8963E"/>
        <circle cx="18" cy="18" r="10" fill="#FAF6F0"/>
        <text x="18" y="22.5" text-anchor="middle"
              font-family="'Lato', sans-serif" font-size="11"
              font-weight="700" fill="#3E2A1A">${numero}</text>
      </svg>`;
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -46]
    });
  }

  // Contenitore globale per salvare le mappe create
  const istanzeMappe = {};

  /* ── FUNZIONE: INIZIALIZZA MAPPA ── */
  function initMap(containerId, sede) {
    const mapEl = document.getElementById(containerId);
    if (!mapEl) return;

    const map = L.map(containerId, {
      center: [sede.lat, sede.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false   /* evita zoom accidentale su mobile */
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    L.marker([sede.lat, sede.lng], { icon: makeIcon(sede.id) })
      .addTo(map)
      .bindPopup(`
        <strong style="font-family: Georgia, serif; font-size: 14px;">${sede.nome}</strong><br>
        <span style="font-size: 12px; color: #7A5C45;">${sede.indirizzo}</span>
      `, { maxWidth: 220 })
      .openPopup();

    /* Abilita scroll zoom solo dopo interazione */
    map.on('click', () => map.scrollWheelZoom.enable());

    // Salva l'istanza della mappa per poterla recuperare al cambio Tab
    istanzeMappe[containerId] = map;
  }

  /* ── INIZIALIZZA TUTTE LE MAPPE ── */
  sedi.forEach(s => {
    if (s.attiva) {
      initMap(`map-sede-${s.id}`, s);
    }
  });

  /* ── TABS ── */
  const tabs   = document.querySelectorAll('.pv-tab');
  const panels = document.querySelectorAll('.pv-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('disabled')) return;

      tabs.forEach(t   => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) {
        target.classList.add('active');
        
        /* Correzione del ricalcolo dimensioni mappa */
        setTimeout(() => {
          target.querySelectorAll('[id^="map-sede-"]').forEach(mapEl => {
            const mapObj = istanzeMappe[mapEl.id];
            if (mapObj) {
              mapObj.invalidateSize();
            }
          });
        }, 100);
      }
    });
  });

  /* ── EVIDENZIA GIORNO CORRENTE NEGLI ORARI ── */
  const oggi = new Date().getDay(); /* 0=dom, 1=lun, …, 6=sab */
  document.querySelectorAll(`[data-giorno="${oggi}"]`).forEach(row => {
    row.classList.add('oggi');
  });

});