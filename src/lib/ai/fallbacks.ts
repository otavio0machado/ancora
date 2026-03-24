// ============================================================
// Local fallback responses for Ancora AI
// Rich DBT/ACT content in Brazilian Portuguese
// These must be good enough to BE the primary experience
// Every fallback is therapeutically informed and context-aware
// ============================================================

import type { CheckIn } from "@/types/database";
import type {
  AIDayAdjustOutput,
  AIImpulseOutput,
  AIMicrocopyOutput,
  AIRecoveryOutput,
  AIPatternOutput,
} from "@/types/ai";

// =====================================================================
//  DAY ADJUSTMENT FALLBACKS
//  State-aware, with habits to skip, value connections, risk predictions
// =====================================================================

// Default: balanced/stable day
const FALLBACK_STABLE: AIDayAdjustOutput = {
  suggestedPlan:
    "Dia estável. Siga o plano como previsto, uma coisa de cada vez. Se surgir um imprevisto, adapte — não acumule.",
  minimumVersion:
    "Faça o essencial: um check-in, uma prioridade, cuide do básico (água, comida, movimento). O resto é bônus.",
  overloadAlert: false,
  overloadMessage: undefined,
  encouragement:
    "Você está aqui, presente. Isso já é regulação.",
  habitsToSkip: [],
  valueConnection:
    "Um dia estável é terreno fértil. Escolha uma ação hoje que represente quem você quer ser.",
  riskPrediction: undefined,
};

// Low energy + low mood (depression day)
const FALLBACK_DEPRESSION_DAY: AIDayAdjustOutput = {
  suggestedPlan:
    "Dia de proteção máxima. Não é dia de produtividade — é dia de sobrevivência com dignidade. Cuide do corpo: água, comida, banho se possível. Uma micro-ação alinhada a um valor já é suficiente.",
  minimumVersion:
    "Existir hoje já conta. Se levantar da cama, beber água e registrar como se sente — isso É o dia.",
  overloadAlert: true,
  overloadMessage:
    "Energia baixa + humor baixo indica que seu sistema está em modo de conservação. Forçar produtividade agora vai custar caro depois. Proteja-se.",
  encouragement:
    "Dias assim não duram para sempre, mesmo que pareça que sim. Respeitar seus limites hoje é sabedoria, não fraqueza.",
  habitsToSkip: ["Todos os hábitos de alta demanda — mantenha apenas os de cuidado básico"],
  valueConnection:
    "Cuidar de si em dias difíceis é um ato de valor. Você está honrando seu compromisso com a própria saúde.",
  riskPrediction:
    "Humor baixo + energia baixa aumenta o risco de buscar alívio rápido (impulsos) especialmente à noite. Planeje algo leve e acolhedor para esse horário.",
};

// Low energy only (not necessarily low mood)
const FALLBACK_LOW_ENERGY: AIDayAdjustOutput = {
  suggestedPlan:
    "Dia de versão mínima. Proteja sua energia: apenas o essencial, sem cobrar produtividade de si. Priorize uma coisa que importa e faça com presença.",
  minimumVersion:
    "Se conseguir fazer uma coisa pequena alinhada com seus valores, é suficiente. O resto espera.",
  overloadAlert: false,
  overloadMessage: undefined,
  encouragement:
    "Energia baixa não é fraqueza. É informação. Respeitar isso é sabedoria — quem sabe ouvir o corpo vai mais longe.",
  habitsToSkip: ["Hábitos que exigem energia física ou cognitiva intensa"],
  valueConnection:
    "Mesmo em dias de baixa energia, fazer o mínimo com intenção é um ato alinhado com quem você quer ser.",
  riskPrediction:
    "Energia baixa pode tornar a resistência a impulsos mais difícil no final do dia. Considere ir dormir mais cedo.",
};

// High anxiety
const FALLBACK_HIGH_ANXIETY: AIDayAdjustOutput = {
  suggestedPlan:
    "Priorize regulação ANTES de produtividade. Comece com 5 minutos de respiração (inspire 4s, segure 4s, expire 6s). Depois — e só depois — decida o mínimo viável do dia.",
  minimumVersion:
    "Respirar com intenção, beber água, e fazer UMA coisa pequena. Nada mais é necessário. Você pode adicionar depois se se sentir capaz.",
  overloadAlert: true,
  overloadMessage:
    "Ansiedade alta sinaliza que seu sistema nervoso está em alerta. Colocar muita coisa no prato agora amplifica a reatividade. Menos é mais hoje.",
  encouragement:
    "A ansiedade mente sobre urgência. Você pode ir devagar e ainda assim avançar. Não precisa resolver tudo agora.",
  habitsToSkip: ["Hábitos com alta demanda cognitiva ou prazos apertados"],
  valueConnection:
    "Regular-se antes de agir é inteligência emocional em ação. Você está cuidando da base.",
  riskPrediction:
    "Ansiedade alta tende a gerar impulsos de escape (redes sociais, comida, etc). Esteja atento especialmente nos momentos de transição entre atividades.",
};

// Overload risk: high anxiety + high impulsivity + low energy
const FALLBACK_OVERLOAD_RISK: AIDayAdjustOutput = {
  suggestedPlan:
    "ALERTA DE SOBRECARGA. Reduza drasticamente as expectativas. Hoje é dia de proteção: foque em regulação emocional, não em realização. Respiração, água, movimento leve.",
  minimumVersion:
    "Sobreviver com dignidade. Cuidados básicos + uma micro-ação alinhada a um valor. Se isso for tudo, está perfeito.",
  overloadAlert: true,
  overloadMessage:
    "Ansiedade alta + impulsividade alta + energia baixa = receita para espiral. Você está em zona de risco. Proteja-se reduzindo demandas e priorizando regulação.",
  encouragement:
    "Reconhecer o risco é já uma forma de cuidado. Você está se protegendo ao observar isso.",
  habitsToSkip: ["Todos os hábitos não-essenciais — só mantenha cuidado básico e regulação"],
  valueConnection:
    "Escolher se proteger quando está vulnerável é um ato de respeito consigo mesmo.",
  riskPrediction:
    "Esse estado gera alto risco de impulsos em cascata. Use TIP (água gelada) preventivamente e evite ficar sozinho sem atividade definida.",
};

// High energy + high impulsivity (risky high / mania risk)
const FALLBACK_RISKY_HIGH: AIDayAdjustOutput = {
  suggestedPlan:
    "Energia alta + impulsividade alta. Canalize a energia com estrutura: blocos de 45 minutos com pausas obrigatórias. Evite decisões grandes. Cuidado com hiperfoco — parece produtividade, mas pode ser mania leve.",
  minimumVersion:
    "Faça o planejado e PARE. Não adicione tarefas só porque 'está rendendo'. A impulsividade disfarçada de motivação é perigosa.",
  overloadAlert: true,
  overloadMessage:
    "Energia alta com impulsividade alta pode parecer positivo, mas é uma configuração de risco. Você pode se comprometer demais, tomar decisões impulsivas ou ignorar limites. Estrutura e pausas são essenciais.",
  encouragement:
    "Energia é um recurso valioso. Use-a com intenção e ela trabalha a seu favor.",
  habitsToSkip: [],
  valueConnection:
    "Disciplinar a energia abundante é um ato de maturidade. Você está escolhendo direção, não apenas velocidade.",
  riskPrediction:
    "Risco de crash energético no final do dia. Se não dosar agora, a noite pode trazer queda abrupta + impulsos. Programe desaceleração a partir das 19h.",
};

// Poor sleep scenario
const FALLBACK_POOR_SLEEP: AIDayAdjustOutput = {
  suggestedPlan:
    "Sono ruim afeta TUDO: humor, foco, tolerância, impulsividade. Reduza as expectativas em pelo menos 50%. Evite decisões importantes. Priorize o essencial e vá devagar.",
  minimumVersion:
    "Hoje o mínimo é O dia. Uma prioridade, versão mínima dos hábitos, e cuidar do básico. Cochilo de 20 min se possível.",
  overloadAlert: true,
  overloadMessage:
    "Privação de sono amplifica reatividade emocional e reduz tolerância ao desconforto. Seu cérebro está operando com menos recursos que o normal.",
  encouragement:
    "Sono ruim não é culpa sua. Adaptar o dia a essa realidade é inteligência, não preguiça.",
  habitsToSkip: ["Hábitos que exigem concentração prolongada ou esforço físico intenso"],
  valueConnection:
    "Respeitar os limites do seu corpo quando dormiu mal é cuidar da base que sustenta tudo.",
  riskPrediction:
    "Sono ruim aumenta significativamente o risco de impulsos ao longo de todo o dia, especialmente entre 14h-16h (queda natural) e à noite. Planeje ancoragens nesses horários.",
};

export function getFallbackDayAdjust(checkIn: CheckIn): AIDayAdjustOutput {
  const { energy, mood, anxiety, impulsivity, sleep_quality, sleep_hours } = checkIn;

  // Poor sleep override (takes precedence over most states)
  if (
    (sleep_quality !== null && sleep_quality !== undefined && sleep_quality <= 2) ||
    (sleep_hours !== null && sleep_hours !== undefined && sleep_hours < 5)
  ) {
    return FALLBACK_POOR_SLEEP;
  }

  // Overload risk: high anxiety + high impulsivity + low energy
  if (anxiety >= 4 && impulsivity >= 4 && energy <= 2) {
    return FALLBACK_OVERLOAD_RISK;
  }

  // Depression day: low energy + low mood
  if (energy <= 2 && mood <= 2) {
    return FALLBACK_DEPRESSION_DAY;
  }

  // Risky high: high energy + high impulsivity
  if (energy >= 4 && impulsivity >= 4) {
    return FALLBACK_RISKY_HIGH;
  }

  // High anxiety scenario
  if (anxiety >= 4) {
    return FALLBACK_HIGH_ANXIETY;
  }

  // Low energy scenario
  if (energy <= 2) {
    return FALLBACK_LOW_ENERGY;
  }

  // Stable day
  return FALLBACK_STABLE;
}

// =====================================================================
//  IMPULSE PROTOCOL FALLBACKS
//  With defusion exercises, value reminders, alternative behaviors
// =====================================================================

const BASE_BREATHING = { inhale: 4, hold: 4, exhale: 6 };

export const FALLBACK_IMPULSE_PROTOCOLS: Record<string, AIImpulseOutput> = {
  smoking: {
    immediateActions: [
      "Coloque água gelada nos pulsos e rosto por 30 segundos — a mudança de temperatura interrompe o ciclo do impulso ativando o reflexo de mergulho (técnica TIP).",
      "STOP: Pare o que está fazendo. Dê um passo para trás. Observe o impulso sem agir. Depois, conscientemente, escolha o próximo passo.",
      "Adiamento de 10 minutos: diga a si mesmo 'vou esperar 10 minutos e reavaliar'. A neurociência mostra que a maioria dos impulsos perde força nesse intervalo.",
    ],
    patternReading:
      "Impulsos de fumar frequentemente aparecem em momentos de estresse, tédio ou transição entre atividades. Observe: o que estava acontecendo 5 minutos antes do impulso surgir?",
    regulatoryPhrase:
      "Esse impulso é real, mas é temporário. Ele não define o que você faz a seguir. Você já sobreviveu a esse momento antes.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Repita internamente: 'Estou tendo o pensamento de que preciso fumar. Posso observar esse pensamento sem obedecer a ele. O pensamento está aqui, mas eu não sou ele.'",
    valueReminder:
      "Cada cigarro não fumado é um voto a favor da sua saúde e liberdade. Você está escolhendo quem quer ser.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Mascar algo com sabor intenso (menta, gengibre) — ativa circuitos orais semelhantes",
      "Fazer 2 minutos de exercício intenso (flexões, agachamentos) — redireciona a energia física",
      "Respirar profundamente com as mãos no peito — simula a mecânica da tragada com benefício real",
    ],
  },
  social_media: {
    immediateActions: [
      "Coloque o celular em outro cômodo por 10 minutos. Distância física reduz drasticamente a força do impulso — o que está longe dos olhos perde poder.",
      "Aterramento 5-4-3-2-1: nomeie 5 coisas que você vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que sente o gosto. Isso ancora você no presente.",
      "Ação oposta: em vez de buscar estímulo digital, faça algo com as mãos — lavar louça, desenhar, alongar. O corpo quebra o loop mental.",
    ],
    patternReading:
      "Redes sociais costumam ser buscadas quando há desconforto emocional não nomeado — tédio, solidão, ansiedade difusa. O scroll infinito anestesia, mas não resolve. Tente nomear: o que você está sentindo agora?",
    regulatoryPhrase:
      "Você não precisa preencher cada segundo de desconforto. O vazio passa. É no silêncio que você se ouve.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Observe: 'Estou tendo a urgência de pegar o celular. Posso notar essa urgência sem obedecê-la. Ela é como uma coceira — intensa no início, mas diminui se eu não coçar.'",
    valueReminder:
      "O tempo que você não gasta scrolling é tempo devolvido para o que realmente importa para você. Cada minuto resistido é presença reconquistada.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Ligar ou mandar áudio para um amigo — satisfaz a necessidade de conexão de forma real",
      "Caminhar 10 minutos ao ar livre — movimento + ambiente novo quebra o ciclo",
      "Escrever 3 coisas que você está sentindo agora — nomear é o primeiro passo da regulação",
    ],
  },
  pornography: {
    immediateActions: [
      "Mude de ambiente AGORA. Saia do cômodo, vá para um espaço aberto ou com outras pessoas. Mudar o contexto físico interrompe o ciclo neurológico.",
      "Água gelada no rosto e pulsos por 30 segundos — a mudança de temperatura corporal ativa o sistema parassimpático e interrompe a excitação (reflexo de mergulho).",
      "Exercício intenso por 5 minutos: flexões, polichinelos, agachamentos. Redirecione a energia física — a ativação muscular compete com a excitação.",
    ],
    patternReading:
      "Esse impulso frequentemente surge em momentos de solidão, tédio, estresse ou baixa autoestima. Não é sobre desejo sexual — é sobre regulação emocional. O orgasmo é o analgésico mais rápido que o cérebro conhece.",
    regulatoryPhrase:
      "Você está tendo um impulso. Não é uma necessidade. Você pode sentir a urgência e escolher o que fazer a seguir. Já fez isso antes.",
    breathingExercise: { inhale: 4, hold: 7, exhale: 8 },
    defusionExercise:
      "Diga internamente: 'Estou tendo o pensamento de que preciso disso para me sentir melhor. Posso observar esse pensamento com curiosidade, sem julgamento, sem obediência. Ele é um visitante, não o dono da casa.'",
    valueReminder:
      "A pessoa que você quer ser está do outro lado dessa escolha. Resistir agora é um ato de liberdade e respeito consigo mesmo.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Tomar um banho gelado ou lavar o rosto com água fria — reset fisiológico poderoso",
      "Sair para caminhar, mesmo que por 10 minutos — o movimento em ambiente aberto muda o estado",
      "Escrever o que está sentindo no diário do app — externalizar a emoção reduz a pressão interna",
    ],
  },
  binge_eating: {
    immediateActions: [
      "Beba um copo grande de água gelada devagar, prestando atenção a cada gole — mindfulness sensorial que interrompe a automaticidade do impulso.",
      "STOP: Pare. Respire fundo 3 vezes. Pergunte-se: 'Estou com fome física ou emocional?' As duas são válidas, mas pedem respostas diferentes.",
      "Adiamento de 10 minutos com ação: vá caminhar por 10 minutos. Se depois de voltar ainda quiser comer, coma — mas com presença e sem julgamento.",
    ],
    patternReading:
      "Comer compulsivo é quase sempre uma tentativa de regular emoções. A comida funciona no curto prazo como analgésico emocional — mas o alívio é fugaz e o custo emocional posterior é alto. Qual emoção está pedindo cuidado agora?",
    regulatoryPhrase:
      "Suas emoções são válidas e merecem cuidado. Você pode encontrar formas de cuidado que nutrem sem custar tanto depois.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Observe: 'Estou tendo a urgência de comer para me sentir melhor. Posso reconhecer essa urgência como uma tentativa de cuidado — e escolher um cuidado diferente agora.'",
    valueReminder:
      "Cuidar do seu corpo com intenção e respeito é um ato alinhado com quem você quer ser. Você merece cuidado que nutre de verdade.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Preparar um chá quente com atenção plena — o ritual aquece e acalma sem o custo do binge",
      "Tomar um banho quente com música calma — ativa o sistema de cuidado de forma não-alimentar",
      "Ligar para alguém e conversar por 10 minutos — conexão social regula o emocional",
    ],
  },
  substance: {
    immediateActions: [
      "Mude de ambiente IMEDIATAMENTE. Vá para um lugar onde o acesso à substância seja difícil ou impossível. Distância física é sua aliada mais poderosa agora.",
      "Ligue ou mande mensagem para alguém de confiança. Você não precisa explicar tudo — só diga que está passando por um momento difícil e precisa de companhia.",
      "Água gelada no rosto + respiração forçada: inspire 4s, segure 4s, expire 8s. Repita 5 vezes. Isso ativa o nervo vago e reduz a urgência fisiológica.",
    ],
    patternReading:
      "Impulsos por substâncias são frequentemente tentativas de escapar de dor emocional intolerável. O escape funciona — é por isso é tão sedutor. Mas é temporário e tem custo cumulativo. A dor que fica precisa de outro tipo de cuidado.",
    regulatoryPhrase:
      "Você já passou por isso antes e sobreviveu. Esse momento, por mais intenso que seja, também vai passar. Você é maior que esse impulso.",
    breathingExercise: { inhale: 4, hold: 4, exhale: 8 },
    defusionExercise:
      "Repita: 'Estou tendo o pensamento de que só a substância pode me ajudar agora. Posso observar esse pensamento e lembrar que ele é uma mentira que meu cérebro conta quando está em dor. Já sobrevivi a essa mentira antes.'",
    valueReminder:
      "Cada momento que você resiste é um voto a favor da sua liberdade, da sua saúde, e das pessoas que importam pra você.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Exercício físico intenso por 10 minutos — libera endorfinas e redireciona a energia",
      "Ir a um lugar público com pessoas (café, praça) — a presença social reduz a vulnerabilidade",
      "Escrever uma carta para o seu eu do futuro sobre porquê você está resistindo agora",
    ],
  },
  other: {
    immediateActions: [
      "Técnica TIP: mude sua temperatura corporal (água gelada no rosto), faça exercício intenso por 2 minutos, depois respiração pausada (4-4-6). Essa sequência interrompe o ciclo do impulso fisiologicamente.",
      "STOP: Pare. Dê um passo para trás. Observe o impulso como se fosse uma nuvem passando pelo céu. Depois escolha conscientemente: o que EU quero fazer agora?",
      "Adiamento de 10 minutos: prometa a si mesmo esperar apenas 10 minutos. Use esse tempo para nomear o que está sentindo e o que disparou o impulso.",
    ],
    patternReading:
      "Impulsos são sinais do corpo e da mente, não comandos. Cada impulso carrega informação sobre o que você está precisando. Que emoção está por baixo?",
    regulatoryPhrase:
      "Você não é o seu impulso. Você é quem observa o impulso e decide o que fazer com ele. Essa distância é poder.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Pratique: 'Estou tendo o pensamento de que preciso fazer isso agora. Posso notar esse pensamento, agradecer meu cérebro por tentar me ajudar, e escolher outra coisa.'",
    valueReminder:
      "O que você faz nos próximos 10 minutos é um voto. Para que versão de você esse voto vai?",
    successProbability: undefined,
    alternativeBehaviors: [
      "Mudar de ambiente — qualquer mudança de cenário física quebra o loop",
      "Fazer algo com as mãos: lavar louça, organizar uma gaveta, desenhar — ação física tira do piloto automático",
      "Colocar uma música e se mover — dança, alongamento, caminhada — o corpo tem sabedoria própria",
    ],
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

  // For very high intensity, add success probability
  if (intensity >= 8) {
    return {
      ...protocol,
      successProbability:
        "A intensidade está alta, mas lembre-se: os impulsos mais intensos também são os que perdem força mais rápido. Os primeiros 10 minutos são os mais difíceis.",
    };
  }

  return protocol;
}

// =====================================================================
//  RECOVERY FALLBACKS
//  Compassionate, no-shame, forward-looking
// =====================================================================

const RECOVERY_FALLBACKS: Record<string, AIRecoveryOutput> = {
  smoking: {
    compassionMessage:
      "Você fumou. É um fato, não uma sentença. O caminho de mudança nunca é uma linha reta — é feito de tentativas, e cada tentativa ensina algo. Você está aqui registrando, e isso já é um ato de cuidado.",
    triggerAnalysis:
      "O impulso encontrou uma janela. Talvez estresse acumulado, talvez um gatilho social, talvez um momento de baixa guarda. Não é fraqueza — é o cérebro fazendo o que aprendeu a fazer. A informação está no contexto: o que estava acontecendo nos 30 minutos antes?",
    returnAction:
      "Beba um copo de água com atenção plena agora. Sinta a temperatura, o gosto. Esse pequeno ato reconecta você ao presente e marca o momento da retomada.",
    valueReconnection:
      "Você cedeu, e você está aqui. O fato de estar registrando mostra que seu compromisso com a mudança não desapareceu. Os valores permanecem — o caminho apenas deu uma curva.",
    nextTimeStrategy:
      "Na próxima vez que o impulso surgir, tente a regra dos 10 minutos antes de qualquer outra coisa: 'Vou esperar 10 minutos e reavaliar.' Coloque um timer. A maioria dos impulsos perde força significativa nesse intervalo.",
  },
  social_media: {
    compassionMessage:
      "Você usou redes sociais mais do que queria. Acontece — o design dessas plataformas existe literalmente para capturar sua atenção. Você não está lutando contra força de vontade, está lutando contra bilhões em engenharia de persuasão.",
    triggerAnalysis:
      "O scroll geralmente aparece quando algo precisa ser anestesiado — tédio, ansiedade, solidão, sensação de vazio. O celular é o analgésico mais acessível que existe. Que desconforto estava pedindo atenção?",
    returnAction:
      "Coloque o celular em outro cômodo agora e faça uma coisa com as mãos: lavar um copo, alongar, escrever uma frase. Qualquer ação física no mundo real marca a retomada.",
    valueReconnection:
      "O tempo é o recurso mais precioso que você tem. Estar aqui refletindo sobre como usou esse tempo mostra que você se importa com a própria presença e intencionalidade.",
    nextTimeStrategy:
      "Antes de pegar o celular na próxima vez, pergunte em voz alta: 'O que estou sentindo agora?' Nomear a emoção antes do impulso muda tudo — você passa de automático para consciente.",
  },
  pornography: {
    compassionMessage:
      "Você cedeu. E agora está aqui, olhando de frente para o que aconteceu. Isso exige coragem. Sem vergonha — vergonha alimenta o ciclo; compaixão o interrompe.",
    triggerAnalysis:
      "Esse comportamento quase nunca é sobre desejo — é sobre regulação emocional. Solidão, estresse, tédio, baixa autoestima: todos gritam por alívio, e o orgasmo é o analgésico mais rápido que o cérebro conhece. A pergunta não é 'por que cedi?' — é 'que dor eu estava tentando aliviar?'",
    returnAction:
      "Levante, vá até o banheiro, lave o rosto com água fria. Essa micro-ação marca fisicamente a transição entre o que aconteceu e o que vem agora. Você está retomando.",
    valueReconnection:
      "A pessoa que você quer ser ainda está aí. Um deslize não muda seus valores — muda só o caminho para chegar neles. E você está corrigindo o percurso agora mesmo.",
    nextTimeStrategy:
      "Na próxima vez que sentir o impulso surgindo, mude de ambiente imediatamente — saia do cômodo. A distância física é a intervenção mais eficaz nesse momento. Não tente resistir parado no mesmo lugar.",
  },
  binge_eating: {
    compassionMessage:
      "Você comeu mais do que queria. O desconforto físico e emocional que vem depois é real, é válido. Mas esse momento não define você. Comer para regular emoções é um dos comportamentos humanos mais universais — não é falha de caráter.",
    triggerAnalysis:
      "Geralmente, o comer compulsivo é precedido por uma emoção que não encontrou outra saída: estresse, tristeza, ansiedade, sensação de vazio. A comida funciona como abraço temporário. O que estava precisando de acolhimento?",
    returnAction:
      "Beba água morna com limão devagar. Não para 'compensar' — mas como um gesto de cuidado gentil com o corpo. Esse ato é o primeiro passo da retomada: cuidar em vez de punir.",
    valueReconnection:
      "Cuidar da sua relação com a comida é um ato de amor próprio. O fato de estar aqui refletindo mostra que você quer uma relação diferente consigo mesmo. Esse desejo é poderoso.",
    nextTimeStrategy:
      "Antes de comer quando não tiver fome física, tente escrever uma frase sobre o que está sentindo. Apenas uma frase. Nomear a emoção reduz a pressão que ela exerce, e pode ser suficiente para criar espaço entre o impulso e a ação.",
  },
  substance: {
    compassionMessage:
      "Você usou. Isso não apaga nenhum dia que você ficou limpo. Cada dia de resistência continua valendo — ele não desaparece. A recuperação não é uma contagem que zera; é uma tendência que se fortalece com cada retomada.",
    triggerAnalysis:
      "O uso de substâncias quase sempre é uma tentativa de escapar de algo insuportável. Não é fraqueza — é o cérebro buscando alívio da única forma que conhece bem. Que dor estava gritando? Que situação estava pesada demais?",
    returnAction:
      "Se estiver seguro fisicamente, beba água e coma algo leve. Cuide do corpo primeiro. Se precisar de ajuda médica, busque. Se precisar falar com alguém, ligue agora. Você não precisa fazer isso sozinho.",
    valueReconnection:
      "Você está aqui registrando. Isso não é algo que alguém sem comprometimento faz. Seus valores — liberdade, saúde, as pessoas que importam — continuam vivos. A recaída não os apagou.",
    nextTimeStrategy:
      "Na próxima vez que sentir o impulso, ligue para uma pessoa de confiança ANTES de agir. Não precisa explicar tudo — só diga 'estou num momento difícil, posso falar com você?' A conexão humana é o antídoto mais poderoso.",
  },
  other: {
    compassionMessage:
      "Você cedeu a um impulso. Sem julgamento. O caminho de mudança é feito de tentativas — e você está tentando. Estar aqui agora, olhando para o que aconteceu, é o oposto de desistir.",
    triggerAnalysis:
      "Todo impulso tem uma função: tenta resolver algo — aliviar desconforto, preencher um vazio, escapar de algo doloroso. O que esse impulso estava tentando resolver pra você?",
    returnAction:
      "Faça uma coisa gentil por você agora: beber água, lavar o rosto, respirar 3 vezes com intenção. Qualquer ato de cuidado marca a retomada.",
    valueReconnection:
      "Você está aqui. Isso significa que seus valores ainda estão ativos. Um deslize não muda quem você quer ser — só mostra que o caminho tem curvas.",
    nextTimeStrategy:
      "Na próxima vez, tente inserir um espaço entre o impulso e a ação: 10 minutos + nomear a emoção por baixo. Esse espaço cresce com a prática.",
  },
};

export function getFallbackRecovery(impulseType: string): AIRecoveryOutput {
  return RECOVERY_FALLBACKS[impulseType] ?? RECOVERY_FALLBACKS.other;
}

// =====================================================================
//  PATTERN ANALYSIS FALLBACK
//  Returned when there isn't enough data or AI is unavailable
// =====================================================================

export const FALLBACK_PATTERN_ANALYSIS: AIPatternOutput = {
  timePatterns: [],
  triggerCorrelations: [],
  emotionalCycles: [],
  techniqueEffectiveness: [],
  riskWindows: [],
  progressIndicators: [
    {
      metric: "Dados coletados",
      trend: "improving",
      detail:
        "Continue registrando check-ins, impulsos e técnicas. Quanto mais dados, mais precisos ficam os padrões. A análise profunda requer pelo menos 2 semanas de registros consistentes.",
    },
  ],
};

// =====================================================================
//  MICROCOPY FALLBACKS
//  All contexts with 3+ variants each, therapeutically informed
// =====================================================================

const MICROCOPY_VARIANTS: Record<string, AIMicrocopyOutput[]> = {
  greeting: [
    {
      message: "Bom dia. Antes de começar, faz sentido checar como você está.",
      tone: "gentle",
    },
    {
      message: "Você está aqui. Isso já é o primeiro passo do dia.",
      tone: "grounding",
    },
    {
      message: "Novo dia, mesma âncora. Como você está se sentindo agora?",
      tone: "gentle",
    },
    {
      message: "Mais um dia. Não precisa ser perfeito — precisa ser seu.",
      tone: "validating",
    },
  ],
  checkin_complete: [
    {
      message: "Registrado. Nomear o que se sente já é uma forma de regulação.",
      tone: "validating",
    },
    {
      message:
        "Pronto. Agora você tem um mapa do seu estado. Use-o com gentileza.",
      tone: "grounding",
    },
    {
      message: "Check-in feito. Autoconhecimento é a base de tudo.",
      tone: "encouraging",
    },
    {
      message: "Anotado. O simples ato de observar já muda a relação com o que se sente.",
      tone: "validating",
    },
  ],
  impulse_resisted: [
    {
      message:
        "Você sentiu o impulso e escolheu diferente. Isso é regulação em ação.",
      tone: "validating",
    },
    {
      message:
        "Resistir não é fácil. Reconheça essa escolha — ela importa.",
      tone: "encouraging",
    },
    {
      message:
        "O impulso veio e você ficou. Cada vez que isso acontece, o caminho fica um pouco mais sólido.",
      tone: "grounding",
    },
    {
      message:
        "Você observou o impulso e não obedeceu. Isso é defusão cognitiva em prática.",
      tone: "validating",
    },
  ],
  impulse_gave_in: [
    {
      message:
        "Ceder não apaga tudo que você construiu. É um dado, não uma sentença.",
      tone: "validating",
    },
    {
      message:
        "Você é humano. O que importa agora é o próximo passo, não o último.",
      tone: "gentle",
    },
    {
      message:
        "Sem julgamento. O que aconteceu já aconteceu. O que você precisa agora?",
      tone: "validating",
    },
    {
      message:
        "Voltar importa mais do que nunca cair. E você está voltando.",
      tone: "encouraging",
    },
  ],
  habit_minimum: [
    {
      message:
        "Versão mínima feita. Em dias difíceis, o mínimo É o máximo. Isso conta.",
      tone: "encouraging",
    },
    {
      message:
        "O mínimo não é pouco — é o que manteve a corrente viva hoje.",
      tone: "validating",
    },
    {
      message:
        "Feito. Consistência não exige perfeição, exige presença. Você esteve presente.",
      tone: "grounding",
    },
  ],
  habit_ideal: [
    {
      message:
        "Versão ideal feita. Não porque você é obrigado, mas porque escolheu. Reconheça isso.",
      tone: "validating",
    },
    {
      message:
        "Completo. Quando ação e valor se alinham, algo sólido se constrói.",
      tone: "grounding",
    },
    {
      message:
        "Você fez a versão completa. Sem inflação, sem fogos de artifício — só o reconhecimento de que você honrou o compromisso.",
      tone: "encouraging",
    },
  ],
  return_after_absence: [
    {
      message:
        "Você voltou. Isso é o que importa. Sem dívidas acumuladas aqui.",
      tone: "gentle",
    },
    {
      message:
        "Bem-vindo de volta. O Âncora está aqui, sem cobranças. Quando quiser, faça um check-in.",
      tone: "gentle",
    },
    {
      message:
        "Pausas fazem parte. Você está aqui agora e isso é suficiente.",
      tone: "validating",
    },
    {
      message:
        "A porta nunca fechou. Retomar é um ato de coragem silenciosa.",
      tone: "encouraging",
    },
  ],
  rescue_mode: [
    {
      message:
        "Modo resgate ativado. Respire. Você está seguro. Uma coisa de cada vez.",
      tone: "grounding",
    },
    {
      message:
        "Para. Respira. Sente os pés no chão. Você está aqui, agora. O resto pode esperar.",
      tone: "grounding",
    },
    {
      message:
        "Momento difícil. Foco no agora: inspire 4 segundos, segure 4, expire 6. Repita.",
      tone: "grounding",
    },
  ],
  recovery_start: [
    {
      message:
        "Você está aqui. Depois de cair, levantar é o que mais importa. Sem pressa, sem vergonha.",
      tone: "gentle",
    },
    {
      message:
        "Retomar não é 'compensar'. É escolher, de novo, o caminho que importa. Um passo de cada vez.",
      tone: "validating",
    },
    {
      message:
        "O caminho não é reto. O que conta é a direção, não a perfeição. Você está apontando pro lado certo.",
      tone: "encouraging",
    },
  ],
  overload_detected: [
    {
      message:
        "Sobrecarga detectada. Hora de reduzir, não de forçar. Menos é mais agora.",
      tone: "grounding",
    },
    {
      message:
        "Seu sistema está sobrecarregado. Permissão concedida para fazer menos. Isso é inteligência.",
      tone: "validating",
    },
    {
      message:
        "Detectamos indicadores de sobrecarga. O mais corajoso agora é desacelerar.",
      tone: "gentle",
    },
  ],
  pattern_insight: [
    {
      message:
        "Um padrão apareceu nos seus dados. Informação, não julgamento — só mais uma peça do quebra-cabeça.",
      tone: "grounding",
    },
    {
      message:
        "Seus dados revelaram algo interessante. Conhecer seus padrões é poder.",
      tone: "encouraging",
    },
    {
      message:
        "Novo insight detectado. Quanto mais você se observa, mais claras ficam as conexões.",
      tone: "validating",
    },
  ],
  value_reminder: [
    {
      message:
        "Lembre-se: cada ação de hoje é um voto para quem você quer ser amanhã.",
      tone: "grounding",
    },
    {
      message:
        "Seus valores são sua bússola. Mesmo em dias turbulentos, eles mostram o norte.",
      tone: "encouraging",
    },
    {
      message:
        "O que você está fazendo agora está alinhado com o que importa pra você?",
      tone: "gentle",
    },
  ],
  anti_obsession: [
    {
      message:
        "Você já registrou o suficiente. O app é ferramenta, não obrigação. Pode soltar.",
      tone: "gentle",
    },
    {
      message:
        "Perfeccionismo com registros é tão nocivo quanto não registrar. Respire. Descanse.",
      tone: "validating",
    },
    {
      message:
        "A regulação inclui saber parar de monitorar. Você está cuidando de si ao descansar também.",
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
  habit_ideal: MICROCOPY_VARIANTS.habit_ideal[0],
  return_after_absence: MICROCOPY_VARIANTS.return_after_absence[0],
  rescue_mode: MICROCOPY_VARIANTS.rescue_mode[0],
  recovery_start: MICROCOPY_VARIANTS.recovery_start[0],
  overload_detected: MICROCOPY_VARIANTS.overload_detected[0],
  pattern_insight: MICROCOPY_VARIANTS.pattern_insight[0],
  value_reminder: MICROCOPY_VARIANTS.value_reminder[0],
  anti_obsession: MICROCOPY_VARIANTS.anti_obsession[0],
};

export function getFallbackMicrocopy(context: string): AIMicrocopyOutput {
  const variants = MICROCOPY_VARIANTS[context];

  if (!variants || variants.length === 0) {
    return {
      message: "Você está aqui. Isso importa.",
      tone: "gentle",
    };
  }

  // Pick a random variant for variety
  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}
