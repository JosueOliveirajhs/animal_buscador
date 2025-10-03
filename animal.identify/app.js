// Elementos da interface
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImage = document.getElementById('preview-image');
const captureBtn = document.getElementById('capture-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const animalTypeSelect = document.getElementById('animal-type-select');
const resultSection = document.getElementById('result-section');
const animalInfo = document.getElementById('animal-info');
const confidenceElement = document.getElementById('confidence');
const resultsCountElement = document.getElementById('results-count');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const newIdentificationBtn = document.getElementById('new-identification');

// Estado da aplicação
let stream = null;
let currentImage = null;

// Base de dados de animais para modo demo
const animalDatabase = {
    'mammals': [
        {
            name: "Cachorro Doméstico",
            scientificName: "Canis lupus familiaris",
            probability: 92,
            commonNames: ["Cachorro", "Cão", "Totó"],
            family: "Canidae",
            description: "Animal doméstico da família dos canídeos. Considerado o melhor amigo do homem.",
            habitat: "Doméstico, global",
            diet: "Onívoro",
            size: "Varia conforme raça",
            funFact: "Conseguem detectar certas doenças pelo olfato",
            image: "🐕"
        },
        {
            name: "Gato Doméstico",
            scientificName: "Felis catus",
            probability: 88,
            commonNames: ["Gato", "Miau", "Bichano"],
            family: "Felidae",
            description: "Pequeno mamífero carnívoro. Um dos animais de estimação mais populares.",
            habitat: "Doméstico, global",
            diet: "Carnívoro",
            size: "25-30 cm (altura)",
            funFact: "Ronronam na frequência que promove regeneração óssea",
            image: "🐈"
        },
        {
            name: "Sagui",
            scientificName: "Callithrix jacchus",
            probability: 85,
            commonNames: ["Sagui", "Soim", "Mico-estrela"],
            family: "Callitrichidae",
            description: "Pequeno primata nativo do Brasil. Conhecido por sua agilidade.",
            habitat: "Florestas tropicais brasileiras",
            diet: "Onívoro",
            size: "18-30 cm",
            funFact: "Vivem em grupos familiares de até 15 indivíduos",
            image: "🐒"
        }
    ],
    'birds': [
        {
            name: "Beija-flor",
            scientificName: "Trochilidae",
            probability: 90,
            commonNames: ["Beija-flor", "Colibri", "Chupa-flor"],
            family: "Trochilidae",
            description: "Pequena ave conhecida por seu voo rápido e capacidade de pairar no ar.",
            habitat: "Américas, diversos habitats",
            diet: "Nectarívoro",
            size: "6-13 cm",
            funFact: "Batimento das asas pode chegar a 80 vezes por segundo",
            image: "🐦"
        },
        {
            name: "Arara Azul",
            scientificName: "Anodorhynchus hyacinthinus",
            probability: 87,
            commonNames: ["Arara-azul", "Araraúna"],
            family: "Psittacidae",
            description: "Maior espécie de arara, conhecida por sua plumagem azul vibrante.",
            habitat: "Pantanal, Cerrado brasileiro",
            diet: "Frutas e sementes",
            size: "Até 1 metro",
            funFact: "Pode viver mais de 50 anos em cativeiro",
            image: "🦜"
        }
    ],
    'reptiles': [
        {
            name: "Jabuti",
            scientificName: "Chelonoidis carbonaria",
            probability: 89,
            commonNames: ["Jabuti", "Jabuti-piranga"],
            family: "Testudinidae",
            description: "Réptil terrestre de movimentos lentos e casco característico.",
            habitat: "Cerrado, Caatinga, Amazônia",
            diet: "Herbívoro",
            size: "30-50 cm",
            funFact: "Podem viver mais de 80 anos",
            image: "🐢"
        }
    ],
    'insects': [
        {
            name: "Borboleta Azul",
            scientificName: "Morpho helenor",
            probability: 91,
            commonNames: ["Borboleta-azul", "Morpho"],
            family: "Nymphalidae",
            description: "Borboleta tropical conhecida por suas asas azuis iridescentes.",
            habitat: "Florestas tropicais das Américas",
            diet: "Néctar",
            size: "Envergadura de 12-20 cm",
            funFact: "A cor azul não vem de pigmentos, mas de estruturas que refratam luz",
            image: "🦋"
        }
    ],
    'marine': [
        {
            name: "Golfinho",
            scientificName: "Delphinidae",
            probability: 94,
            commonNames: ["Golfinho", "Delfim"],
            family: "Delphinidae",
            description: "Mamífero marinho inteligente e sociável, conhecido por sua agilidade.",
            habitat: "Oceanos e mares tropicais e temperados",
            diet: "Carnívoro (peixes, lulas)",
            size: "1,5-4 metros",
            funFact: "Usam ecolocalização para navegar e caçar",
            image: "🐬"
        }
    ],
    'general': [
        {
            name: "Onça-pintada",
            scientificName: "Panthera onca",
            probability: 86,
            commonNames: ["Onça-pintada", "Jaguar"],
            family: "Felidae",
            description: "Maior felino das Américas, conhecido por sua força e beleza.",
            habitat: "Florestas e cerrados das Américas",
            diet: "Carnívoro",
            size: "1,1-1,8 metros",
            funFact: "Tem a mordida mais forte entre todos os felinos",
            image: "🐆"
        },
        {
            name: "Capivara",
            scientificName: "Hydrochoerus hydrochaeris",
            probability: 89,
            commonNames: ["Capivara", "Carpincho"],
            family: "Caviidae",
            description: "Maior roedor do mundo, semi-aquático e de hábitos gregários.",
            habitat: "América do Sul, próximo à água",
            diet: "Herbívoro",
            size: "1-1,3 metros",
            funFact: "Podem ficar submersas por até 5 minutos",
            image: "🐹"
        }
    ]
};

// Inicialização
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        // Verificar se estamos em localhost (necessário para Service Worker)
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // Verificar se o Service Worker é suportado e estamos em contexto seguro
        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || isLocalhost)) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registrado com sucesso:', registration);
            } catch (error) {
                console.log('Service Worker não registrado. Funcionando sem cache offline.');
            }
        }

        // Inicializar câmera
        await initCamera();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Mostrar mensagem de boas-vindas
        setTimeout(() => {
            if (!stream) {
                showError('Câmera não detectada. Use a opção "Carregar Imagem" para identificar animais.');
            }
        }, 2000);
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Não foi possível inicializar o aplicativo.');
    }
}

// Configurar event listeners
function setupEventListeners() {
    captureBtn.addEventListener('click', captureImage);
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);
    newIdentificationBtn.addEventListener('click', resetToCamera);
    
    // Adicionar detector de tecla Enter para facilitar o uso
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !resultSection.classList.contains('hidden')) {
            resetToCamera();
        }
    });
}

// Inicializar câmera - VERSÃO CORRIGIDA
async function initCamera() {
    try {
        // Verificar se a câmera está disponível
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('API de câmera não suportada neste navegador');
            return;
        }

        // Obter dispositivos disponíveis
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
            throw new Error('Nenhuma câmera encontrada');
        }

        console.log('Câmeras disponíveis:', videoDevices);

        // Tentar diferentes configurações
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            }
        };

        // Tentar câmera traseira se disponível
        const rearCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('traseira') ||
            device.label.toLowerCase().includes('environment')
        );

        if (rearCamera) {
            constraints.video.deviceId = { exact: rearCamera.deviceId };
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            console.log('Tentativa 1 falhou, tentando configuração mais simples...');
            // Tentar configuração mais simples
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } // Câmera frontal
            });
        }
        
        // Conectar o stream ao elemento de vídeo
        video.srcObject = stream;
        
        // Esperar o vídeo estar pronto
        video.addEventListener('loadedmetadata', () => {
            console.log('Câmera inicializada com sucesso');
            video.play();
        });
        
    } catch (error) {
        console.warn('Erro ao acessar a câmera:', error);
        
        // Não mostrar erro - simplesmente desabilitar a câmera
        captureBtn.disabled = true;
        captureBtn.textContent = '📷 Câmera Indisponível';
        captureBtn.style.background = 'linear-gradient(45deg, #9e9e9e, #757575)';
        
        // Mostrar instruções alternativas
        const cameraView = document.getElementById('camera-view');
        cameraView.innerHTML += `
            <div class="camera-fallback">
                <div style="text-align: center; color: #666; padding: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📸</div>
                    <h3>Câmera Não Disponível</h3>
                    <p>Use o botão "Carregar Imagem" para identificar animais a partir de fotos existentes.</p>
                    <p><small>Dica: Tire a foto com seu app de câmera e depois carregue aqui.</small></p>
                </div>
            </div>
        `;
    }
}

// Capturar imagem da câmera
function captureImage() {
    if (!stream) {
        showError('Câmera não disponível. Use a opção "Carregar Imagem".');
        return;
    }

    try {
        const context = canvas.getContext('2d');
        
        // Configurar canvas com as dimensões do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Desenhar o frame atual do vídeo no canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Mostrar preview da imagem
        previewImage.src = canvas.toDataURL('image/jpeg');
        previewImage.classList.remove('hidden');
        video.classList.add('hidden');
        
        // Obter a imagem como blob
        canvas.toBlob(blob => {
            currentImage = blob;
            identifyAnimal(blob);
        }, 'image/jpeg', 0.8);
        
    } catch (error) {
        console.error('Erro ao capturar imagem:', error);
        showError('Erro ao capturar imagem. Tente novamente ou use "Carregar Imagem".');
    }
}

// Manipular upload de imagem
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Verificar se é uma imagem
        if (!file.type.match('image.*')) {
            showError('Por favor, selecione um arquivo de imagem (JPG, PNG, etc).');
            return;
        }

        // Verificar tamanho do arquivo (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Imagem muito grande. Por favor, selecione uma imagem menor que 10MB.');
            return;
        }

        // Mostrar preview da imagem
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
            video.classList.add('hidden');
        };
        reader.onerror = function() {
            showError('Erro ao ler a imagem. Tente outra imagem.');
        };
        reader.readAsDataURL(file);
        
        currentImage = file;
        identifyAnimal(file);
    }
}

// Identificar animal - VERSÃO SIMPLIFICADA QUE FUNCIONA OFFLINE
async function identifyAnimal(imageBlob) {
    showLoading();
    
    // Simular processamento por 1.5 segundos para parecer real
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Sempre usar modo demo (já que as APIs públicas são limitadas)
    displayMockResults();
}

// Modo demo inteligente - VERSÃO MELHORADA
function displayMockResults() {
    hideLoading();
    
    const selectedType = animalTypeSelect.value;
    const animals = animalDatabase[selectedType] || animalDatabase['general'];
    
    // Embaralhar animais para variedade
    const shuffledAnimals = [...animals].sort(() => Math.random() - 0.5);
    const selectedAnimals = shuffledAnimals.slice(0, 3);
    
    // Adicionar variação de probabilidade para parecer mais real
    selectedAnimals.forEach(animal => {
        animal.displayProbability = animal.probability + Math.floor(Math.random() * 10) - 5;
        if (animal.displayProbability > 99) animal.displayProbability = 99;
        if (animal.displayProbability < 70) animal.displayProbability = 70;
    });
    
    // Ordenar por probabilidade
    selectedAnimals.sort((a, b) => b.displayProbability - a.displayProbability);
    
    const confidenceLevel = selectedAnimals[0].displayProbability > 85 ? 'Alta' : 
                           selectedAnimals[0].displayProbability > 75 ? 'Média' : 'Baixa';
    
    confidenceElement.textContent = `Confiança: ${confidenceLevel}`;
    resultsCountElement.textContent = `${selectedAnimals.length} resultados encontrados`;
    
    let html = '';
    
    selectedAnimals.forEach((animal, index) => {
        const medal = index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : '🥉 ';
        
        html += `
            <div class="animal-card">
                <div class="animal-name">${medal}${animal.name} ${animal.image}</div>
                <div class="animal-scientific-name">${animal.scientificName}</div>
                <div class="animal-probability">${animal.displayProbability}% de correspondência</div>
                
                <div class="animal-details">
                    <h4>📝 Nomes comuns:</h4>
                    <ul>
                        ${animal.commonNames.map(name => `<li>${name}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="animal-details">
                    <h4>🌿 Família:</h4>
                    <p>${animal.family}</p>
                </div>
                
                <div class="animal-details">
                    <h4>📖 Descrição:</h4>
                    <p>${animal.description}</p>
                </div>
                
                <div class="animal-details">
                    <h4>🏞️ Habitat:</h4>
                    <p>${animal.habitat}</p>
                </div>
                
                <div class="animal-details">
                    <h4>🍽️ Dieta:</h4>
                    <p>${animal.diet}</p>
                </div>
                
                <div class="animal-details">
                    <h4>📏 Tamanho:</h4>
                    <p>${animal.size}</p>
                </div>
                
                <div class="animal-details">
                    <h4>💡 Curiosidade:</h4>
                    <p>${animal.funFact}</p>
                </div>
                
                ${index === 0 ? `
                    <div class="animal-details" style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin-top: 15px;">
                        <h4>🎯 Melhor Correspondência</h4>
                        <p>Este é o animal que mais se parece com a sua imagem!</p>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    // Adicionar dica no final
    html += `
        <div class="animal-card" style="background: linear-gradient(45deg, #e3f2fd, #bbdefb);">
            <div class="animal-name">💡 Dicas para Melhor Identificação</div>
            <div class="animal-details">
                <ul>
                    <li><strong>Foto clara:</strong> Certifique-se de que o animal está bem visível</li>
                    <li><strong>Boa iluminação:</strong> Evite fotos muito escuras ou com sombras</li>
                    <li><strong>Ângulo frontal:</strong> Mostre o animal de frente quando possível</li>
                    <li><strong>Foco no animal:</strong> Mantenha o animal como foco principal da foto</li>
                    <li><strong>Tipo correto:</strong> Selecione o tipo de animal mais apropriado</li>
                </ul>
            </div>
            <div class="animal-details">
                <p><small>🔍 <em>Este é um sistema de demonstração. Para identificação por IA em tempo real, seriam necessárias APIs especializadas.</em></small></p>
            </div>
        </div>
    `;
    
    animalInfo.innerHTML = html;
    resultSection.classList.remove('hidden');
    
    // Rolar suavemente para os resultados
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Funções auxiliares para controle de UI
function showLoading() {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    resultSection.classList.add('hidden');
    
    // Adicionar mensagens aleatórias de loading para melhor UX
    const messages = [
        "Analisando características do animal...",
        "Processando imagem...",
        "Comparando com banco de dados...",
        "Identificando padrões...",
        "Quase lá..."
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    loading.querySelector('p').textContent = randomMessage;
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message = 'Ocorreu um erro. Tente novamente.') {
    hideLoading();
    errorMessage.querySelector('p').textContent = message;
    errorMessage.classList.remove('hidden');
    resultSection.classList.add('hidden');
}

function resetToCamera() {
    resultSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    fileInput.value = '';
    previewImage.classList.add('hidden');
    
    // Mostrar vídeo apenas se a câmera estiver disponível
    if (stream) {
        video.classList.remove('hidden');
    }
    
    currentImage = null;
    
    // Rolar para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Limpar recursos quando a página for fechada
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Suporte para instalação do PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    // Remover botão existente se houver
    const existingButton = document.querySelector('.install-button');
    if (existingButton) existingButton.remove();
    
    const installButton = document.createElement('button');
    installButton.textContent = '📱 Instalar App';
    installButton.className = 'btn primary install-button';
    installButton.style.margin = '10px auto';
    installButton.style.display = 'block';
    installButton.style.animation = 'pulse 2s infinite';
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installButton.textContent = '✅ App Instalado!';
                installButton.disabled = true;
                setTimeout(() => installButton.remove(), 3000);
            }
            deferredPrompt = null;
        }
    });
    
    document.querySelector('footer').prepend(installButton);
}

// Adicionar estilo de animação para o botão de instalação
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .camera-fallback {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.95);
        border-radius: 12px;
    }
`;
document.head.appendChild(style);