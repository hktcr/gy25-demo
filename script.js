// Konfiguration och Data
const THEMES = ['Celler', 'Kretslopp', 'Människokroppen', 'Genetik', 'Ekologi'];
const TAGS = [
    '#fotosyntes_och_cellandning', 
    '#kolets_kretslopp', 
    '#dna_och_arv', 
    '#biologisk_mångfald', 
    '#celltyper', 
    '#energiprincipen'
];

const DOTS_COUNT = 150;
const dots = [];

// DOM Element
const canvas = document.getElementById('canvas');
const btnFolder = document.getElementById('btn-folder-view');
const btnTag = document.getElementById('btn-tag-view');
const btnVmom = document.getElementById('btn-create-vmom');
const btnGy25 = document.getElementById('btn-gy25');
const tagControls = document.getElementById('tag-controls');
const tagButtonsContainer = document.getElementById('tag-buttons-container');
const vmomControls = document.getElementById('vmom-controls');
const viewDesc = document.getElementById('view-description');

// State
let currentMode = 'folder'; // 'folder' | 'tag'
let selectedTag = null;
let isVmomActive = false;
let isGy25Active = false;

// Skapa Box-element (UI-bakgrunder)
const boxes = {
    Celler: createBox('Celler'),
    Kretslopp: createBox('Kretslopp'),
    Människokroppen: createBox('Kroppen'),
    Genetik: createBox('Genetik'),
    Ekologi: createBox('Ekologi'),
    Vmom: createBox('vmom: Celler & Genetik'), 
    Pool: createBox('Hela Uppgiftsbanken (Osorterad Pool)'),
    Active: createBox('Valt Tema (Dynamiskt Innehållspaket)'),
    Niva1: createBox('Nivå 1 (Gy25)'),
    Niva2: createBox('Nivå 2 (Gy25)')
};

function createBox(title) {
    const el = document.createElement('div');
    el.className = 'area-box';
    const t = document.createElement('div');
    t.className = 'area-title';
    t.textContent = title;
    el.appendChild(t);
    canvas.appendChild(el);
    return el;
}

// Generera "Pluppar"
function initDots() {
    for (let i = 0; i < DOTS_COUNT; i++) {
        const moment = THEMES[i % THEMES.length];
        const myTags = [];
        
        let color;
        if (moment === 'Celler') color = '#3b82f6';
        else if (moment === 'Kretslopp') color = '#10b981';
        else if (moment === 'Människokroppen') color = '#f59e0b';
        else if (moment === 'Genetik') color = '#8b5cf6';
        else if (moment === 'Ekologi') color = '#06b6d4';

        const r = Math.random();
        if (moment === 'Celler') {
            if (r < 0.6) myTags.push('#celltyper');
            if (Math.random() < 0.5) myTags.push('#fotosyntes_och_cellandning');
            if (Math.random() < 0.3) myTags.push('#dna_och_arv');
        } else if (moment === 'Kretslopp') {
            if (r < 0.7) myTags.push('#kolets_kretslopp');
            if (Math.random() < 0.5) myTags.push('#energiprincipen');
            if (Math.random() < 0.3) myTags.push('#fotosyntes_och_cellandning');
        } else if (moment === 'Människokroppen') {
            if (r < 0.4) myTags.push('#celltyper');
            if (Math.random() < 0.4) myTags.push('#energiprincipen');
            if (Math.random() < 0.2) myTags.push('#fotosyntes_och_cellandning');
        } else if (moment === 'Genetik') {
            if (r < 0.8) myTags.push('#dna_och_arv');
            if (Math.random() < 0.4) myTags.push('#biologisk_mångfald');
            if (Math.random() < 0.2) myTags.push('#celltyper');
        } else if (moment === 'Ekologi') {
            if (r < 0.7) myTags.push('#biologisk_mångfald');
            if (Math.random() < 0.5) myTags.push('#kolets_kretslopp');
            if (Math.random() < 0.4) myTags.push('#energiprincipen');
        }

        if (myTags.length === 0 || Math.random() < 0.1) {
            myTags.push(TAGS[Math.floor(Math.random() * TAGS.length)]);
        }

        const el = document.createElement('div');
        el.className = 'plupp';
        el.style.backgroundColor = color;
        el.style.color = color;
        
        const size = 12 + Math.random() * 6;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        
        const isVmomTarget = (moment === 'Celler' || moment === 'Genetik') && Math.random() < 0.5;

        // Tilldela Gy25 nivå med extremt tydlig bias baserat på moment
        let gy25 = null;
        const gR = Math.random();
        
        if (moment === 'Människokroppen') {
            // Endast Nivå 1 (100%)
            gy25 = 1;
        } 
        else if (moment === 'Ekologi') {
            // Endast Nivå 2 (100%)
            gy25 = 2;
        } 
        else if (moment === 'Celler') {
            // Tungt Nivå 1, visst överlapp, men ALDRIG ren Nivå 2
            if (gR < 0.85) gy25 = 1;           
            else gy25 = 'both'; 
        } 
        else if (moment === 'Genetik') {
            // Tungt Nivå 2, visst överlapp, men ALDRIG ren Nivå 1
            if (gR < 0.85) gy25 = 2;           
            else gy25 = 'both'; 
        }
        else if (moment === 'Kretslopp') {
            // Den röda tråden som går genom båda och överlappar
            if (gR < 0.30) gy25 = 1;
            else if (gR < 0.60) gy25 = 2;
            else gy25 = 'both'; 
        }

        const dot = { 
            id: i, el: el, moment: moment, 
            tags: [...new Set(myTags)], color: color,
            isVmomTarget: isVmomTarget,
            gy25: gy25
        };
        dots.push(dot);
        canvas.appendChild(el);
    }
}

function initTagButtons() {
    TAGS.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag.replace(/_/g, ' ');
        btn.addEventListener('click', () => {
            isGy25Active = false; // Stäng av gy25 om vi klickar på vanlig tagg
            btnGy25.classList.remove('active');

            if (selectedTag === tag) {
                selectedTag = null;
                btn.classList.remove('active');
            } else {
                document.querySelectorAll('#tag-buttons-container .tag-btn').forEach(b => b.classList.remove('active'));
                selectedTag = tag;
                btn.classList.add('active');
            }
            updateLayout();
        });
        tagButtonsContainer.appendChild(btn);
    });
}

function updateLayout() {
    if (currentMode === 'folder') {
        tagControls.classList.add('hidden');
        vmomControls.classList.remove('hidden');
        isGy25Active = false; 
        btnGy25.classList.remove('active');

        if (isVmomActive) {
            viewDesc.innerHTML = `<strong>Virtuella moment (vmom):</strong> Vid skapandet av ett virtuellt moment extraheras uppgifterna fysiskt från sina ursprungliga mappar (umom). Bristen på dynamik medför att ursprungsstrukturen urholkas.`;
        } else {
            viewDesc.innerHTML = `<strong>Diskret struktur (umom):</strong> Varje uppgift existerar uteslutande i en specifik hierarki. Delning mellan domäner är inte möjlig utan duplicering.`;
        }
    } else {
        vmomControls.classList.add('hidden');
        tagControls.classList.remove('hidden');
        
        if (isGy25Active) {
            viewDesc.innerHTML = `<strong>Ämnesbetyg och progression (Gy25):</strong> Uppgifter tilldelas multipla attribut (t.ex. Nivå 1 och Nivå 2). Uppgifter i gränssnittet mellan nivåerna (mittlinjen) återanvänds systematiskt utan redundans.`;
        } else {
            viewDesc.innerHTML = `<strong>Platt databasstruktur (Taggar):</strong> Uppgiftsbanken fungerar som en platt pool. Vid filtrering via taggar samlas relevant material temporärt, utan att låsa uppgifterna.`;
        }
    }

    const boxLayouts = getBoxLayouts();
    
    // Uppdatera boxar
    THEMES.forEach(theme => applyBox(boxes[theme], boxLayouts[theme]));
    applyBox(boxes.Vmom, boxLayouts.Vmom);
    applyBox(boxes.Pool, boxLayouts.Pool);
    
    // Tag mode (vanlig)
    if (currentMode === 'tag' && !isGy25Active && selectedTag) {
        applyBox(boxes.Active, boxLayouts.Active);
        boxes.Active.querySelector('.area-title').textContent = `Paket: ${selectedTag.replace(/_/g, ' ')}`;
        boxes.Active.classList.add('active-zone');
    } else {
        applyBox(boxes.Active, null);
        boxes.Active.classList.remove('active-zone');
    }

    // Gy25 Mode
    if (currentMode === 'tag' && isGy25Active) {
        applyBox(boxes.Niva1, boxLayouts.Niva1);
        applyBox(boxes.Niva2, boxLayouts.Niva2);
        boxes.Niva1.classList.add('active-zone');
        boxes.Niva2.classList.add('active-zone');
    } else {
        applyBox(boxes.Niva1, null);
        applyBox(boxes.Niva2, null);
        boxes.Niva1.classList.remove('active-zone');
        boxes.Niva2.classList.remove('active-zone');
    }

    // Animera plupparna
    dots.forEach(dot => {
        let targetBox;
        
        if (currentMode === 'folder') {
            dot.el.classList.remove('dimmed', 'highlighted');
            if (isVmomActive && (dot.moment === 'Celler' || dot.moment === 'Genetik')) {
                // ALLA från Celler och Genetik dras in i vmom
                targetBox = boxLayouts.Vmom;
            } else {
                targetBox = boxLayouts[dot.moment];
            }
        } else {
            // Tagg-läge
            if (isGy25Active) {
                // Gy25 logik
                if (dot.gy25 === 1) {
                    targetBox = { left: 15, top: 5, width: 33, height: 40 }; 
                    dot.el.classList.add('highlighted');
                    dot.el.classList.remove('dimmed');
                    dot.el.style.zIndex = '10';
                } else if (dot.gy25 === 2) {
                    targetBox = { left: 52, top: 5, width: 33, height: 40 }; 
                    dot.el.classList.add('highlighted');
                    dot.el.classList.remove('dimmed');
                    dot.el.style.zIndex = '10';
                } else if (dot.gy25 === 'both') {
                    // Mittenlinjen! Den överlappar båda lådorna.
                    targetBox = { left: 48.5, top: 5, width: 3, height: 40 }; 
                    dot.el.classList.add('highlighted');
                    dot.el.classList.remove('dimmed');
                    dot.el.style.zIndex = '30'; 
                } else {
                    targetBox = boxLayouts.Pool;
                    dot.el.classList.add('dimmed');
                    dot.el.classList.remove('highlighted');
                    dot.el.style.zIndex = '5';
                }
            } else {
                // Vanlig tagg-logik
                dot.el.style.zIndex = '10';
                if (selectedTag) {
                    if (dot.tags.includes(selectedTag)) {
                        targetBox = boxLayouts.Active;
                        dot.el.classList.add('highlighted');
                        dot.el.classList.remove('dimmed');
                    } else {
                        targetBox = boxLayouts.Pool;
                        dot.el.classList.add('dimmed');
                        dot.el.classList.remove('highlighted');
                    }
                } else {
                    targetBox = boxLayouts.Pool;
                    dot.el.classList.remove('dimmed', 'highlighted');
                }
            }
        }

        const padX = 2; 
        const padY = 15; 
        const randomX = targetBox.left + padX + (Math.random() * (targetBox.width - padX*2));
        const randomY = targetBox.top + padY + (Math.random() * (targetBox.height - padY - 4));
        
        dot.el.style.left = `${randomX}%`;
        dot.el.style.top = `${randomY}%`;
    });
}

function getBoxLayouts() {
    if (currentMode === 'folder') {
        if (isVmomActive) {
            // Celler och Genetik FÖRSVINNER, Vmom tar deras plats (och slår ihop dem)
            return {
                Celler: null,
                Kretslopp: { left: 21.5, top: 10, width: 18, height: 80 },
                Människokroppen: { left: 41, top: 10, width: 18, height: 80 },
                Genetik: null,
                Ekologi: { left: 80, top: 10, width: 18, height: 80 },
                Vmom: { left: 2, top: 10, width: 18, height: 80 }, // Lägger vmom på första platsen
                Pool: null, Active: null, Niva1: null, Niva2: null
            };
        } else {
            return {
                Celler: { left: 2, top: 10, width: 18, height: 80 },
                Kretslopp: { left: 21.5, top: 10, width: 18, height: 80 },
                Människokroppen: { left: 41, top: 10, width: 18, height: 80 },
                Genetik: { left: 60.5, top: 10, width: 18, height: 80 },
                Ekologi: { left: 80, top: 10, width: 18, height: 80 },
                Vmom: null, Pool: null, Active: null, Niva1: null, Niva2: null
            };
        }
    } else {
        return {
            Celler: null, Kretslopp: null, Människokroppen: null, Genetik: null, Ekologi: null, Vmom: null,
            Pool: { left: 5, top: 55, width: 90, height: 40 },
            Active: { left: 15, top: 5, width: 70, height: 40 },
            Niva1: { left: 15, top: 5, width: 35, height: 40 },
            Niva2: { left: 50, top: 5, width: 35, height: 40 }
        };
    }
}

function applyBox(boxEl, coords) {
    if (!coords) {
        boxEl.style.opacity = '0';
        boxEl.style.pointerEvents = 'none';
        return;
    }
    boxEl.style.opacity = '1';
    boxEl.style.pointerEvents = 'auto';
    boxEl.style.left = `${coords.left}%`;
    boxEl.style.top = `${coords.top}%`;
    boxEl.style.width = `${coords.width}%`;
    boxEl.style.height = `${coords.height}%`;
}

// Events
btnFolder.addEventListener('click', () => {
    currentMode = 'folder';
    btnFolder.classList.add('active');
    btnTag.classList.remove('active');
    updateLayout();
});

btnTag.addEventListener('click', () => {
    currentMode = 'tag';
    btnTag.classList.add('active');
    btnFolder.classList.remove('active');
    updateLayout();
});

btnVmom.addEventListener('click', () => {
    isVmomActive = !isVmomActive;
    if (isVmomActive) {
        btnVmom.classList.add('active');
        btnVmom.textContent = 'Stäng vmom';
    } else {
        btnVmom.classList.remove('active');
        btnVmom.textContent = 'Skapa "vmom" (Celler + Genetik)';
    }
    updateLayout();
});

btnGy25.addEventListener('click', () => {
    isGy25Active = !isGy25Active;
    if (isGy25Active) {
        btnGy25.classList.add('active');
        selectedTag = null; // Rensa ev. andra taggar
        document.querySelectorAll('#tag-buttons-container .tag-btn').forEach(b => b.classList.remove('active'));
    } else {
        btnGy25.classList.remove('active');
    }
    updateLayout();
});

// Init
initDots();
initTagButtons();
setTimeout(updateLayout, 100);
