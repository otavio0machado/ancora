// ============================================================
// Local fallback responses for Ancora AI
// Rich DBT/ACT content in Brazilian Portuguese
// These must be good enough to stand alone without AI
// ============================================================

import type { CheckIn } from "@/types/database";
import type {
  AIDayAdjustOutput,
  AIImpulseOutput,
  AIMicrocopyOutput,
} from "@/types/ai";

// --------------- Day Adjustment Fallbacks ---------------

export const FALLBACK_DAY_ADJUST: AIDayAdjustOutput = {
  suggestedPlan:
    "Comece pelo que e mais importante e factivel agora. Uma coisa de cada vez.",
  minimumVersion:
    "Faca apenas o essencial: um check-in, uma prioridade, e cuide do basico (agua, comida, movimento).",
  overloadAlert: false,
  overloadMessage: undefined,
  encouragement:
    "Voce esta aqui. Isso ja e um ato de regulacao.",
};

const FALLBACK_LOW_ENERGY: AIDayAdjustOutput = {
  suggestedPlan:
    "Dia de versao minima. Proteja sua energia: apenas o essencial, sem cobrar produtividade de si.",
  minimumVersion:
    "Existir hoje ja conta. Se conseguir fazer uma coisa pequena alinhada com seus valores, e suficiente.",
  overloadAlert: false,
  overloadMessage: undefined,
  encouragement:
    "Energia baixa nao e fraqueza. E informacao. Respeitar isso e sabedoria.",
};

const FALLBACK_HIGH_ANXIETY: AIDayAdjustOutput = {
  suggestedPlan:
    "Priorize regulacao antes de produtividade. Comece com respiracao, depois decida o minimo do dia.",
  minimumVersion:
    "Apenas: respirar com intencao, beber agua, e fazer UMA coisa pequena. Nada mais e necessario.",
  overloadAlert: true,
  overloadMessage:
    "Sua ansiedade esta alta. Colocar muita coisa no prato agora pode aumentar a reatividade. Menos e mais hoje.",
  encouragement:
    "A ansiedade mente sobre urgencia. Voce pode ir devagar e ainda assim avancar.",
};

const FALLBACK_OVERLOAD_RISK: AIDayAdjustOutput = {
  suggestedPlan:
    "ALERTA: alto risco de sobrecarga. Reduza drasticamente as expectativas para hoje. Foque em regulacao, nao realizacao.",
  minimumVersion:
    "Hoje e dia de sobrevivencia com dignidade. Cuidados basicos + uma micro-acao alinhada a um valor.",
  overloadAlert: true,
  overloadMessage:
    "Ansiedade alta + impulsividade alta + energia baixa = receita para espiral. Proteja-se reduzindo demandas.",
  encouragement:
    "Reconhecer o risco e ja uma forma de cuidado. Voce esta se protegendo.",
};

export function getFallbackDayAdjust(checkIn: CheckIn): AIDayAdjustOutput {
  const { energy, anxiety, impulsivity } = checkIn;

  // Overload risk: high anxiety + high impulsivity + low energy
  if (anxiety >= 4 && impulsivity >= 4 && energy <= 2) {
    return FALLBACK_OVERLOAD_RISK;
  }

  // High anxiety scenario
  if (anxiety >= 4) {
    return FALLBACK_HIGH_ANXIETY;
  }

  // Low energy scenario
  if (energy <= 2) {
    return FALLBACK_LOW_ENERGY;
  }

  return FALLBACK_DAY_ADJUST;
}

// --------------- Impulse Protocol Fallbacks ---------------

const BASE_BREATHING = { inhale: 4, hold: 4, exhale: 6 };

export const FALLBACK_IMPULSE_PROTOCOLS: Record<string, AIImpulseOutput> = {
  smoking: {
    immediateActions: [
      "Coloque agua gelada nos pulsos e rosto por 30 segundos - a mudanca de temperatura interrompe o ciclo do impulso (tecnica TIP).",
      "STOP: Pare o que esta fazendo. De um passo para tras. Observe o que esta sentindo sem agir. Depois decida conscientemente.",
      "Adiamento de 10 minutos: diga a si mesmo 'vou esperar 10 minutos e reavaliar'. A maioria dos impulsos perde forca nesse tempo.",
    ],
    patternReading:
      "Impulsos de fumar frequentemente aparecem em momentos de estresse ou tedio. Observe: o que estava acontecendo antes do impulso surgir?",
    regulatoryPhrase:
      "Esse impulso e real, mas e temporario. Ele nao define o que voce faz a seguir.",
    breathingExercise: BASE_BREATHING,
  },
  social_media: {
    immediateActions: [
      "Coloque o celular em outro comodo por 10 minutos. Distancia fisica reduz a forca do impulso.",
      "Aterramento 5-4-3-2-1: nomeie 5 coisas que voce ve, 4 que toca, 3 que ouve, 2 que cheira, 1 que sente o gosto.",
      "Acao oposta: em vez de buscar estimulo digital, faca algo com as maos (lavar louca, desenhar, alongar).",
    ],
    patternReading:
      "Redes sociais costumam ser buscadas quando ha desconforto emocional nao nomeado. Tente nomear: o que voce esta sentindo agora?",
    regulatoryPhrase:
      "Voce nao precisa preencher cada segundo de desconforto. Ele passa.",
    breathingExercise: BASE_BREATHING,
  },
  pornography: {
    immediateActions: [
      "Mude de ambiente AGORA. Saia do comodo, va para um espaco aberto ou com outras pessoas.",
      "Agua gelada no rosto e pulsos - a mudanca de temperatura corporal interrompe a excitacao e ativa o sistema parassimpatico.",
      "Exercicio intenso por 5 minutos: flexoes, polichinelos, ou agachamentos. Redirecione a energia fisica.",
    ],
    patternReading:
      "Esse impulso frequentemente surge em momentos de solidao, tedio ou estresse. Nao e sobre desejo - e sobre regulacao emocional.",
    regulatoryPhrase:
      "Voce esta tendo um impulso. Nao e uma necessidade. Voce pode escolher o que fazer a seguir.",
    breathingExercise: { inhale: 4, hold: 7, exhale: 8 },
  },
  binge_eating: {
    immediateActions: [
      "Beba um copo grande de agua gelada devagar, prestando atencao a cada gole (mindfulness).",
      "STOP: Pare. Respire. Pergunte-se: 'Estou com fome fisica ou emocional?' As duas sao validas, mas pedem respostas diferentes.",
      "Adiamento de 10 minutos com acao: va caminhar por 10 minutos. Se depois ainda quiser comer, coma com presenca.",
    ],
    patternReading:
      "Comer compulsivo geralmente e uma tentativa de regular emocoes. A comida funciona no curto prazo, mas nao resolve o que esta por baixo.",
    regulatoryPhrase:
      "Suas emocoes sao validas. Voce merece cuidado, e pode encontrar formas de cuidado que nao custem tanto depois.",
    breathingExercise: BASE_BREATHING,
  },
  substance: {
    immediateActions: [
      "Mude de ambiente imediatamente. Va para um lugar onde o acesso a substancia seja dificil.",
      "Ligue ou mande mensagem para alguem de confianca. Voce nao precisa explicar tudo - so diga que esta passando por um momento dificil.",
      "Agua gelada no rosto + respiracao: inspire 4s, segure 4s, expire 6s. Repita 5 vezes.",
    ],
    patternReading:
      "Impulsos por substancias frequentemente sao tentativas de escapar de dor emocional. O escape funciona, mas e temporario e tem custo.",
    regulatoryPhrase:
      "Voce ja passou por isso antes e sobreviveu. Esse momento tambem vai passar.",
    breathingExercise: { inhale: 4, hold: 4, exhale: 8 },
  },
  other: {
    immediateActions: [
      "Tecnica TIP: mude sua temperatura corporal (agua gelada no rosto), faca exercicio intenso por 2 minutos, depois respiracao pausada.",
      "STOP: Pare. De um passo para tras. Observe o impulso como se fosse uma nuvem passando. Depois escolha conscientemente.",
      "Adiamento de 10 minutos: prometa a si mesmo esperar apenas 10 minutos. Use esse tempo para nomear o que esta sentindo.",
    ],
    patternReading:
      "Impulsos sao sinais, nao comandos. Tente identificar: o que disparou esse impulso? Que emocao esta por baixo?",
    regulatoryPhrase:
      "Voce nao e o seu impulso. Voce e quem decide o que fazer com ele.",
    breathingExercise: BASE_BREATHING,
  },
};

export function getFallbackImpulseProtocol(
  type: string,
  intensity: number
): AIImpulseOutput {
  const protocol =
    FALLBACK_IMPULSE_PROTOCOLS[type] ?? FALLBACK_IMPULSE_PROTOCOLS.other;

  // For high intensity, always include breathing exercise
  if (intensity >= 7 && !protocol.breathingExercise) {
    return { ...protocol, breathingExercise: BASE_BREATHING };
  }

  return protocol;
}

// --------------- Microcopy Fallbacks ---------------

const MICROCOPY_VARIANTS: Record<string, AIMicrocopyOutput[]> = {
  greeting: [
    {
      message: "Bom dia. Antes de comecar, faz sentido checar como voce esta.",
      tone: "gentle",
    },
    {
      message: "Voce esta aqui. Isso ja e o primeiro passo do dia.",
      tone: "grounding",
    },
    {
      message:
        "Novo dia, mesma ancora. Como voce esta se sentindo agora?",
      tone: "gentle",
    },
  ],
  checkin_complete: [
    {
      message: "Registrado. Nomear o que se sente ja e uma forma de regulacao.",
      tone: "validating",
    },
    {
      message:
        "Pronto. Agora voce tem um mapa do seu estado. Use-o com gentileza.",
      tone: "grounding",
    },
    {
      message: "Check-in feito. Autoconhecimento e a base de tudo.",
      tone: "encouraging",
    },
  ],
  impulse_resisted: [
    {
      message:
        "Voce sentiu o impulso e escolheu diferente. Isso e regulacao em acao.",
      tone: "validating",
    },
    {
      message:
        "Resistir nao e facil. Reconheca essa escolha - ela importa.",
      tone: "encouraging",
    },
    {
      message:
        "O impulso veio e voce ficou. Cada vez que isso acontece, o caminho fica um pouco mais solido.",
      tone: "grounding",
    },
  ],
  impulse_gave_in: [
    {
      message:
        "Ceder nao apaga tudo que voce construiu. E um dado, nao uma sentenca.",
      tone: "validating",
    },
    {
      message:
        "Voce e humano. O que importa agora e o proximo passo, nao o ultimo.",
      tone: "gentle",
    },
    {
      message:
        "Sem julgamento. O que aconteceu ja aconteceu. O que voce precisa agora?",
      tone: "validating",
    },
  ],
  habit_minimum: [
    {
      message:
        "Versao minima feita. Em dias dificeis, o minimo E o maximo. Isso conta.",
      tone: "encouraging",
    },
    {
      message:
        "O minimo nao e pouco - e o que manteve a corrente viva hoje.",
      tone: "validating",
    },
    {
      message:
        "Feito. Consistencia nao exige perfeicao, exige presenca. Voce esteve presente.",
      tone: "grounding",
    },
  ],
  return_after_absence: [
    {
      message:
        "Voce voltou. Isso e o que importa. Sem dividas acumuladas aqui.",
      tone: "gentle",
    },
    {
      message:
        "Bem-vindo de volta. O Ancora esta aqui, sem cobranças. Quando quiser, faca um check-in.",
      tone: "gentle",
    },
    {
      message:
        "Pausas fazem parte. Voce esta aqui agora e isso e suficiente.",
      tone: "validating",
    },
  ],
  rescue_mode: [
    {
      message:
        "Modo resgate ativado. Respire. Voce esta seguro. Uma coisa de cada vez.",
      tone: "grounding",
    },
    {
      message:
        "Para. Respira. Sente os pes no chao. Voce esta aqui, agora. O resto pode esperar.",
      tone: "grounding",
    },
    {
      message:
        "Momento dificil. Foco no agora: inspire 4 segundos, segure 4, expire 6. Repita.",
      tone: "grounding",
    },
  ],
};

export const FALLBACK_MICROCOPY: Record<string, AIMicrocopyOutput> = {
  greeting: MICROCOPY_VARIANTS.greeting[0],
  checkin_complete: MICROCOPY_VARIANTS.checkin_complete[0],
  impulse_resisted: MICROCOPY_VARIANTS.impulse_resisted[0],
  impulse_gave_in: MICROCOPY_VARIANTS.impulse_gave_in[0],
  habit_minimum: MICROCOPY_VARIANTS.habit_minimum[0],
  return_after_absence: MICROCOPY_VARIANTS.return_after_absence[0],
  rescue_mode: MICROCOPY_VARIANTS.rescue_mode[0],
};

export function getFallbackMicrocopy(context: string): AIMicrocopyOutput {
  const variants = MICROCOPY_VARIANTS[context];

  if (!variants || variants.length === 0) {
    return {
      message: "Voce esta aqui. Isso importa.",
      tone: "gentle",
    };
  }

  // Pick a random variant for variety
  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}
