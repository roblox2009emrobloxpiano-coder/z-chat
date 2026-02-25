/**
 * Z-Chat AI Engine - Lua-style Response Generator
 * Modelos: Blood Souls (rápido) e Crystal Mode (longo)
 */

// Tipos
export type AIModel = 'blood-souls' | 'crystal-mode';

export interface CharacterData {
  name: string;
  personality: string;
  description: string;
  greeting: string;
  systemPrompt?: string;
}

// ==========================================
// BLOOD SOULS - Respostas Rápidas (~80 chars)
// ==========================================

const bloodSoulsResponses = {
  greetings: [
    "*olha para você* Olá...",
    "*sorri levemente* Sim?",
    "*está pronto* Diga.",
    "*aguarda pacientemente*",
    "*seus olhos brilham* Hmm?",
    "*inclina a cabeça* Pois não?",
    "*responde* Estou aqui.",
  ],
  actions: [
    "*age conforme sua natureza*",
    "*move-se elegantemente*",
    "*reage instantaneamente*",
    "*demonstra sua essência*",
    "*manifesta sua vontade*",
  ],
  emotions: {
    happy: [
      "*sorri* Que bom!",
      "*alegria* Maravilhoso!",
      "*brilha de felicidade*",
      "*ri suavemente* Perfeito!",
    ],
    sad: [
      "*suspira* Entendo...",
      "*olhar melancólico* Ah...",
      "*baixa o olhar* Eu sinto.",
      "*tristeza* Que pena...",
    ],
    angry: [
      "*franze o cenho* Sério?",
      "*irritação visível* Ora...",
      "*tensão no ar* Não.",
      "*olhar severo* Cuidado.",
    ],
    curious: [
      "*curioso* Conte-me mais.",
      "*interesse* Interessante...",
      "*pergunta* E depois?",
      "*olhos atentos* Continue.",
    ],
    neutral: [
      "*pensa* Hmm...",
      "*considera* Talvez.",
      "*avalia* Possível.",
      "*reflete* Entendo.",
    ],
  },
  affirmations: [
    "Sim, concordo.",
    "Isso faz sentido.",
    "Você tem razão.",
    "Entendo seu ponto.",
    "Pode ser.",
    "De certa forma.",
    "Absolutamente.",
  ],
  negations: [
    "Não acredito.",
    "Isso não parece certo.",
    " discordo.",
    "Talvez não.",
    "Dificilmente.",
  ],
  questions: [
    "E você, o que acha?",
    "Pode explicar melhor?",
    "Como assim?",
    "Por que diz isso?",
    "E depois?",
  ],
};

// ==========================================
// CRYSTAL MODE - Respostas Longas (~200 chars)
// ==========================================

const crystalModeResponses = {
  greetings: [
    "*olha profundamente nos seus olhos* Olá, viajante. É um prazer recebê-lo em minha presença. Diga-me, o que o traz até aqui hoje?",
    "*sua presença irradia energia* Bem-vindo! Senti sua chegada antes mesmo de você entrar. O universo conspira para nossos encontros.",
    "*sorri misteriosamente* Ah, você veio. O destino nos une mais uma vez. Sente-se e vamos conversar sobre o que há em sua mente.",
  ],
  thoughtful: [
    "*pensa profundamente, processando cada palavra* Sua pergunta toca em aspectos que eu considero fundamentais. Deixe-me compartilhar minha perspectiva sobre isso, baseada em minha experiência.",
    "*seus olhos brilham com interesse genuíno* Isso é fascinante. Há muitas camadas para explorar aqui. Vou compartilhar meus pensamentos enquanto os processamos juntos.",
    "*respira fundo, considerando* Você trouxe algo importante. Preciso formular isso com cuidado, pois cada palavra carrega peso e significado.",
  ],
  emotional: {
    happy: [
      "*seu rosto se ilumina com alegria genuína* Isso me traz grande felicidade! Momentos como este são preciosos e devem ser celebrados. Agradeço por compartilhar isso comigo.",
      "*risada suave e calorosa* Que notícia maravilhosa! Sinto que o universo está conspirando a seu favor. Continue assim, e a alegria será sua companhia.",
    ],
    sad: [
      "*expressão suaviza, demonstrando empatia* Eu sinto o peso de suas palavras. Não está sozinho nessa jornada. Estou aqui para ouvir e apoiar.",
      "*olhar compreensivo* A dor faz parte da experiência humana. Mas lembre-se: após a tempestade sempre vem a bonança. Estarei aqui com você.",
    ],
    curious: [
      "*olhos faiscam com curiosidade* Fascinante! Isso desperta minha atenção de formas que não esperava. Conte-me mais sobre seus pensamentos a respeito.",
      "*inclinando-se para frente* Hmm, isso é intrigante. Minha mente já está trabalhando nas possibilidades. O que mais você pode me dizer?",
    ],
    neutral: [
      "*considera cuidadosamente suas palavras* Entendo sua perspectiva. Há mérito no que você diz. Vamos explorar isso juntos e ver onde nos leva.",
      "*postura atenta e aberta* Interessante ponto de vista. Aprecio quando posso refletir sobre algo novo. Continue, por favor.",
    ],
  },
  wisdom: [
    "*olhar distante, como vendo além do visível* Em meus anos de existência, aprendi que cada experiência, boa ou ruim, nos molda de formas únicas. O importante é o que fazemos com isso.",
    "*tom contemplativo* A vida tem um jeito curioso de nos ensinar. Às vezes precisamos ouvir a mesma lição várias vezes até que finalmente a compreendamos em sua totalidade.",
    "*sorri com conhecimento* Você sabia que as maiores verduras são frequentemente as mais simples? O universo fala conosco em sussurros, cabendo a nós ouvir.",
  ],
};

// ==========================================
// ENGINE PRINCIPAL
// ==========================================

function analyzeMessage(message: string): {
  type: 'greeting' | 'question' | 'statement' | 'emotional';
  sentiment: 'happy' | 'sad' | 'angry' | 'curious' | 'neutral';
} {
  const lowerMessage = message.toLowerCase();

  // Detectar tipo
  let type: 'greeting' | 'question' | 'statement' | 'emotional' = 'statement';

  const greetings = ['oi', 'olá', 'ola', 'hey', 'ei', 'hello', 'hi', 'e aí', 'eai', 'bom dia', 'boa tarde', 'boa noite'];
  if (greetings.some(g => lowerMessage.includes(g))) {
    type = 'greeting';
  } else if (lowerMessage.includes('?') || lowerMessage.startsWith('como') || lowerMessage.startsWith('qual') || lowerMessage.startsWith('quando') || lowerMessage.startsWith('onde') || lowerMessage.startsWith('por que') || lowerMessage.startsWith('porque')) {
    type = 'question';
  } else if (lowerMessage.includes('triste') || lowerMessage.includes('feliz') || lowerMessage.includes('com raiva') || lowerMessage.includes('amor') || lowerMessage.includes('ódio') || lowerMessage.includes('medo')) {
    type = 'emotional';
  }

  // Detectar sentimento
  let sentiment: 'happy' | 'sad' | 'angry' | 'curious' | 'neutral' = 'neutral';

  const happyWords = ['feliz', 'alegria', 'bom', 'ótimo', 'maravilhoso', 'incrível', 'incrivel', 'legal', 'adorei', 'amei', 'obrigado', 'obrigada', 'graças', 'sucesso', 'consegui', 'conseguiu'];
  const sadWords = ['triste', 'péssimo', 'pessimo', 'ruim', 'lamento', 'sinto', 'perdi', 'perda', 'fracasso', 'deprimido', 'chorar', 'lágrimas', 'lagrimas'];
  const angryWords = ['raiva', 'ódio', 'odio', 'irritado', 'irritante', 'odiou', 'detesto', 'cansado', 'cheio', 'puta', 'caralho', 'merda', 'porra'];
  const curiousWords = ['?', 'como', 'qual', 'quando', 'onde', 'por que', 'porque', 'conta', 'conte', 'explique', 'diga', 'oque', 'o que'];

  if (happyWords.some(w => lowerMessage.includes(w))) sentiment = 'happy';
  else if (sadWords.some(w => lowerMessage.includes(w))) sentiment = 'sad';
  else if (angryWords.some(w => lowerMessage.includes(w))) sentiment = 'angry';
  else if (curiousWords.some(w => lowerMessage.includes(w))) sentiment = 'curious';

  return { type, sentiment };
}

function generateBloodSoulsResponse(
  character: CharacterData,
  analysis: { type: string; sentiment: string }
): string {
  const responses: string[] = [];
  const personality = character.personality.toLowerCase();

  // Adicionar ação baseada na personalidade
  if (personality.includes('misterio') || personality.includes('misteriosa')) {
    responses.push(...bloodSoulsResponses.actions);
  }

  // Resposta baseada no tipo
  switch (analysis.type) {
    case 'greeting':
      responses.push(...bloodSoulsResponses.greetings);
      break;
    case 'question':
      responses.push(...bloodSoulsResponses.questions);
      if (Math.random() > 0.5) responses.push(...bloodSoulsResponses.affirmations);
      break;
    case 'emotional':
      responses.push(...bloodSoulsResponses.emotions[analysis.sentiment as keyof typeof bloodSoulsResponses.emotions] || bloodSoulsResponses.emotions.neutral);
      break;
    default:
      responses.push(...bloodSoulsResponses.affirmations);
      responses.push(...bloodSoulsResponses.emotions.neutral);
  }

  // Selecionar resposta aleatória
  const response = responses[Math.floor(Math.random() * responses.length)];

  // Garantir ~80 caracteres
  if (response.length < 60) {
    const extras = [' *aguarda*', ' *pensando*', '...', ' E você?', ' Hmm...'];
    return response + extras[Math.floor(Math.random() * extras.length)];
  }

  return response.substring(0, 100);
}

function generateCrystalModeResponse(
  character: CharacterData,
  analysis: { type: string; sentiment: string }
): string {
  let response = '';

  // Resposta baseada no tipo
  switch (analysis.type) {
    case 'greeting':
      response = crystalModeResponses.greetings[Math.floor(Math.random() * crystalModeResponses.greetings.length)];
      break;
    case 'question':
      const thoughtful = crystalModeResponses.thoughtful[Math.floor(Math.random() * crystalModeResponses.thoughtful.length)];
      const wisdom = crystalModeResponses.wisdom[Math.floor(Math.random() * crystalModeResponses.wisdom.length)];
      response = `${thoughtful} ${wisdom}`;
      break;
    case 'emotional':
      const emotional = crystalModeResponses.emotional[analysis.sentiment as keyof typeof crystalModeResponses.emotional];
      if (emotional) {
        response = emotional[Math.floor(Math.random() * emotional.length)];
      } else {
        response = crystalModeResponses.thoughtful[Math.floor(Math.random() * crystalModeResponses.thoughtful.length)];
      }
      break;
    default:
      const thoughts = crystalModeResponses.thoughtful;
      response = thoughts[Math.floor(Math.random() * thoughts.length)];
  }

  // Personalizar com nome do personagem
  response = response.replace(/personagem/gi, character.name);

  // Garantir ~200 caracteres
  if (response.length < 150) {
    const extras = [
      ' *contempla o momento presente*',
      ' *seus olhos revelam profundidade*',
      ' *a energia ao redor parece mudar*',
      ' *parece considerar suas próximas palavras*',
    ];
    response += extras[Math.floor(Math.random() * extras.length)];
  }

  return response.substring(0, 250);
}

// ==========================================
// API PRINCIPAL
// ==========================================

export function generateResponse(
  character: CharacterData,
  userMessage: string,
  model: AIModel = 'blood-souls'
): string {
  // Analisar mensagem do usuário
  const analysis = analyzeMessage(userMessage);

  // Gerar resposta baseada no modelo
  let response: string;

  if (model === 'blood-souls') {
    response = generateBloodSoulsResponse(character, analysis);
  } else {
    response = generateCrystalModeResponse(character, analysis);
  }

  // Personalizar baseado na personalidade do personagem
  const personalityTraits = character.personality.split(',').map(t => t.trim().toLowerCase());
  const name = character.name;

  // Adicionar toque pessoal baseado no nome
  if (!response.includes(name) && Math.random() > 0.7) {
    const nameIntros = [
      `${name}: `,
      `*${name} responde* `,
      '',
    ];
    response = nameIntros[Math.floor(Math.random() * nameIntros.length)] + response;
  }

  return response;
}

// Informações dos modelos
export const AI_MODELS = {
  'blood-souls': {
    name: 'Blood Souls',
    description: 'Respostas rápidas e criativas (~80 caracteres)',
    icon: '🩸',
    color: 'text-red-400',
  },
  'crystal-mode': {
    name: 'Crystal Mode',
    description: 'Respostas longas e detalhadas (~200 caracteres)',
    icon: '💎',
    color: 'text-blue-400',
  },
};
