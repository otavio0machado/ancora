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
    "Dia estavel. Siga o plano como previsto, uma coisa de cada vez. Se surgir um imprevisto, adapte — nao acumule.",
  minimumVersion:
    "Faca o essencial: um check-in, uma prioridade, cuide do basico (agua, comida, movimento). O resto e bonus.",
  overloadAlert: false,
  overloadMessage: undefined,
  encouragement:
    "Voce esta aqui, presente. Isso ja e regulacao.",
  habitsToSkip: [],
  valueConnection:
    "Um dia estavel e terreno fertil. Escolha uma acao hoje que represente quem voce quer ser.",
  riskPrediction: undefined,
};

// Low energy + low mood (depression day)
const FALLBACK_DEPRESSION_DAY: AIDayAdjustOutput = {
  suggestedPlan:
    "Dia de protecao maxima. Nao e dia de produtividade — e dia de sobrevivencia com dignidade. Cuide do corpo: agua, comida, banho se possivel. Uma micro-acao alinhada a um valor ja e suficiente.",
  minimumVersion:
    "Existir hoje ja conta. Se levantar da cama, beber agua e registrar como se sente — isso E o dia.",
  overloadAlert: true,
  overloadMessage:
    "Energia baixa + humor baixo indica que seu sistema esta em modo de conservacao. Forcar produtividade agora vai custar caro depois. Proteja-se.",
  encouragement:
    "Dias assim nao duram para sempre, mesmo que pareca que sim. Respeitar seus limites hoje e sabedoria, nao fraqueza.",
  habitsToSkip: ["Todos os habitos de alta demanda — mantenha apenas os de cuidado basico"],
  valueConnection:
    "Cuidar de si em dias dificeis e um ato de valor. Voce esta honrando seu compromisso com a propria saude.",
  riskPrediction:
    "Humor baixo + energia baixa aumenta o risco de buscar alivio rapido (impulsos) especialmente a noite. Planeje algo leve e acolhedor para esse horario.",
};

// Low energy only (not necessarily low mood)
const FALLBACK_LOW_ENERGY: AIDayAdjustOutput = {
  suggestedPlan:
    "Dia de versao minima. Proteja sua energia: apenas o essencial, sem cobrar produtividade de si. Priorize uma coisa que importa e faca com presenca.",
  minimumVersion:
    "Se conseguir fazer uma coisa pequena alinhada com seus valores, e suficiente. O resto espera.",
  overloadAlert: false,
  overloadMessage: undefined,
  encouragement:
    "Energia baixa nao e fraqueza. E informacao. Respeitar isso e sabedoria — quem sabe ouvir o corpo vai mais longe.",
  habitsToSkip: ["Habitos que exigem energia fisica ou cognitiva intensa"],
  valueConnection:
    "Mesmo em dias de baixa energia, fazer o minimo com intencao e um ato alinhado com quem voce quer ser.",
  riskPrediction:
    "Energia baixa pode tornar a resistencia a impulsos mais dificil no final do dia. Considere ir dormir mais cedo.",
};

// High anxiety
const FALLBACK_HIGH_ANXIETY: AIDayAdjustOutput = {
  suggestedPlan:
    "Priorize regulacao ANTES de produtividade. Comece com 5 minutos de respiracao (inspire 4s, segure 4s, expire 6s). Depois — e so depois — decida o minimo viavel do dia.",
  minimumVersion:
    "Respirar com intencao, beber agua, e fazer UMA coisa pequena. Nada mais e necessario. Voce pode adicionar depois se se sentir capaz.",
  overloadAlert: true,
  overloadMessage:
    "Ansiedade alta sinaliza que seu sistema nervoso esta em alerta. Colocar muita coisa no prato agora amplifica a reatividade. Menos e mais hoje.",
  encouragement:
    "A ansiedade mente sobre urgencia. Voce pode ir devagar e ainda assim avancar. Nao precisa resolver tudo agora.",
  habitsToSkip: ["Habitos com alta demanda cognitiva ou prazos apertados"],
  valueConnection:
    "Regular-se antes de agir e inteligencia emocional em acao. Voce esta cuidando da base.",
  riskPrediction:
    "Ansiedade alta tende a gerar impulsos de escape (redes sociais, comida, etc). Esteja atento especialmente nos momentos de transicao entre atividades.",
};

// Overload risk: high anxiety + high impulsivity + low energy
const FALLBACK_OVERLOAD_RISK: AIDayAdjustOutput = {
  suggestedPlan:
    "ALERTA DE SOBRECARGA. Reduza drasticamente as expectativas. Hoje e dia de protecao: foque em regulacao emocional, nao em realizacao. Respiracao, agua, movimento leve.",
  minimumVersion:
    "Sobreviver com dignidade. Cuidados basicos + uma micro-acao alinhada a um valor. Se isso for tudo, esta perfeito.",
  overloadAlert: true,
  overloadMessage:
    "Ansiedade alta + impulsividade alta + energia baixa = receita para espiral. Voce esta em zona de risco. Proteja-se reduzindo demandas e priorizando regulacao.",
  encouragement:
    "Reconhecer o risco e ja uma forma de cuidado. Voce esta se protegendo ao observar isso.",
  habitsToSkip: ["Todos os habitos nao-essenciais — so mantenha cuidado basico e regulacao"],
  valueConnection:
    "Escolher se proteger quando esta vulneravel e um ato de respeito consigo mesmo.",
  riskPrediction:
    "Esse estado gera alto risco de impulsos em cascata. Use TIP (agua gelada) preventivamente e evite ficar sozinho sem atividade definida.",
};

// High energy + high impulsivity (risky high / mania risk)
const FALLBACK_RISKY_HIGH: AIDayAdjustOutput = {
  suggestedPlan:
    "Energia alta + impulsividade alta. Canalize a energia com estrutura: blocos de 45 minutos com pausas obrigatorias. Evite decisoes grandes. Cuidado com hiperfoco — parece produtividade, mas pode ser mania leve.",
  minimumVersion:
    "Faca o planejado e PARE. Nao adicione tarefas so porque 'esta rendendo'. A impulsividade disfarçada de motivacao e perigosa.",
  overloadAlert: true,
  overloadMessage:
    "Energia alta com impulsividade alta pode parecer positivo, mas e uma configuracao de risco. Voce pode se comprometer demais, tomar decisoes impulsivas ou ignorar limites. Estrutura e pausas sao essenciais.",
  encouragement:
    "Energia e um recurso valioso. Use-a com intencao e ela trabalha a seu favor.",
  habitsToSkip: [],
  valueConnection:
    "Disciplinar a energia abundante e um ato de maturidade. Voce esta escolhendo direcao, nao apenas velocidade.",
  riskPrediction:
    "Risco de crash energetico no final do dia. Se nao dosar agora, a noite pode trazer queda abrupta + impulsos. Programe desaceleracao a partir das 19h.",
};

// Poor sleep scenario
const FALLBACK_POOR_SLEEP: AIDayAdjustOutput = {
  suggestedPlan:
    "Sono ruim afeta TUDO: humor, foco, tolerancia, impulsividade. Reduza as expectativas em pelo menos 50%. Evite decisoes importantes. Priorize o essencial e va devagar.",
  minimumVersion:
    "Hoje o minimo e O dia. Uma prioridade, versao minima dos habitos, e cuidar do basico. Cochilo de 20 min se possivel.",
  overloadAlert: true,
  overloadMessage:
    "Privacao de sono amplifica reatividade emocional e reduz tolerancia ao desconforto. Seu cerebro esta operando com menos recursos que o normal.",
  encouragement:
    "Sono ruim nao e culpa sua. Adaptar o dia a essa realidade e inteligencia, nao preguica.",
  habitsToSkip: ["Habitos que exigem concentracao prolongada ou esforco fisico intenso"],
  valueConnection:
    "Respeitar os limites do seu corpo quando dormiu mal e cuidar da base que sustenta tudo.",
  riskPrediction:
    "Sono ruim aumenta significativamente o risco de impulsos ao longo de todo o dia, especialmente entre 14h-16h (queda natural) e a noite. Planeje ancoragens nesses horarios.",
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
      "Coloque agua gelada nos pulsos e rosto por 30 segundos — a mudanca de temperatura interrompe o ciclo do impulso ativando o reflexo de mergulho (tecnica TIP).",
      "STOP: Pare o que esta fazendo. De um passo para tras. Observe o impulso sem agir. Depois, conscientemente, escolha o proximo passo.",
      "Adiamento de 10 minutos: diga a si mesmo 'vou esperar 10 minutos e reavaliar'. A neurociencia mostra que a maioria dos impulsos perde forca nesse intervalo.",
    ],
    patternReading:
      "Impulsos de fumar frequentemente aparecem em momentos de estresse, tedio ou transicao entre atividades. Observe: o que estava acontecendo 5 minutos antes do impulso surgir?",
    regulatoryPhrase:
      "Esse impulso e real, mas e temporario. Ele nao define o que voce faz a seguir. Voce ja sobreviveu a esse momento antes.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Repita internamente: 'Estou tendo o pensamento de que preciso fumar. Posso observar esse pensamento sem obedecer a ele. O pensamento esta aqui, mas eu nao sou ele.'",
    valueReminder:
      "Cada cigarro nao fumado e um voto a favor da sua saude e liberdade. Voce esta escolhendo quem quer ser.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Mascar algo com sabor intenso (menta, gengibre) — ativa circuitos orais semelhantes",
      "Fazer 2 minutos de exercicio intenso (flexoes, agachamentos) — redireciona a energia fisica",
      "Respirar profundamente com as maos no peito — simula a mecanica da tragada com beneficio real",
    ],
  },
  social_media: {
    immediateActions: [
      "Coloque o celular em outro comodo por 10 minutos. Distancia fisica reduz drasticamente a forca do impulso — o que esta longe dos olhos perde poder.",
      "Aterramento 5-4-3-2-1: nomeie 5 coisas que voce ve, 4 que toca, 3 que ouve, 2 que cheira, 1 que sente o gosto. Isso ancora voce no presente.",
      "Acao oposta: em vez de buscar estimulo digital, faca algo com as maos — lavar louca, desenhar, alongar. O corpo quebra o loop mental.",
    ],
    patternReading:
      "Redes sociais costumam ser buscadas quando ha desconforto emocional nao nomeado — tedio, solidao, ansiedade difusa. O scroll infinito anestesia, mas nao resolve. Tente nomear: o que voce esta sentindo agora?",
    regulatoryPhrase:
      "Voce nao precisa preencher cada segundo de desconforto. O vazio passa. E no silencio que voce se ouve.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Observe: 'Estou tendo a urgencia de pegar o celular. Posso notar essa urgencia sem obedece-la. Ela e como uma coceira — intensa no inicio, mas diminui se eu nao cocar.'",
    valueReminder:
      "O tempo que voce nao gasta scrolling e tempo devolvido para o que realmente importa para voce. Cada minuto resistido e presenca reconquistada.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Ligar ou mandar audio para um amigo — satisfaz a necessidade de conexao de forma real",
      "Caminhar 10 minutos ao ar livre — movimento + ambiente novo quebra o ciclo",
      "Escrever 3 coisas que voce esta sentindo agora — nomear e o primeiro passo da regulacao",
    ],
  },
  pornography: {
    immediateActions: [
      "Mude de ambiente AGORA. Saia do comodo, va para um espaco aberto ou com outras pessoas. Mudar o contexto fisico interrompe o ciclo neurologico.",
      "Agua gelada no rosto e pulsos por 30 segundos — a mudanca de temperatura corporal ativa o sistema parassimpatico e interrompe a excitacao (reflexo de mergulho).",
      "Exercicio intenso por 5 minutos: flexoes, polichinelos, agachamentos. Redirecione a energia fisica — a ativacao muscular compete com a excitacao.",
    ],
    patternReading:
      "Esse impulso frequentemente surge em momentos de solidao, tedio, estresse ou baixa autoestima. Nao e sobre desejo sexual — e sobre regulacao emocional. O orgasmo e o analgesico mais rapido que o cerebro conhece.",
    regulatoryPhrase:
      "Voce esta tendo um impulso. Nao e uma necessidade. Voce pode sentir a urgencia e escolher o que fazer a seguir. Ja fez isso antes.",
    breathingExercise: { inhale: 4, hold: 7, exhale: 8 },
    defusionExercise:
      "Diga internamente: 'Estou tendo o pensamento de que preciso disso para me sentir melhor. Posso observar esse pensamento com curiosidade, sem julgamento, sem obediencia. Ele e um visitante, nao o dono da casa.'",
    valueReminder:
      "A pessoa que voce quer ser esta do outro lado dessa escolha. Resistir agora e um ato de liberdade e respeito consigo mesmo.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Tomar um banho gelado ou lavar o rosto com agua fria — reset fisiologico poderoso",
      "Sair para caminhar, mesmo que por 10 minutos — o movimento em ambiente aberto muda o estado",
      "Escrever o que esta sentindo no diario do app — externalizar a emocao reduz a pressao interna",
    ],
  },
  binge_eating: {
    immediateActions: [
      "Beba um copo grande de agua gelada devagar, prestando atencao a cada gole — mindfulness sensorial que interrompe a automaticidade do impulso.",
      "STOP: Pare. Respire fundo 3 vezes. Pergunte-se: 'Estou com fome fisica ou emocional?' As duas sao validas, mas pedem respostas diferentes.",
      "Adiamento de 10 minutos com acao: va caminhar por 10 minutos. Se depois de voltar ainda quiser comer, coma — mas com presenca e sem julgamento.",
    ],
    patternReading:
      "Comer compulsivo e quase sempre uma tentativa de regular emocoes. A comida funciona no curto prazo como analgesico emocional — mas o alivio e fugaz e o custo emocional posterior e alto. Qual emocao esta pedindo cuidado agora?",
    regulatoryPhrase:
      "Suas emocoes sao validas e merecem cuidado. Voce pode encontrar formas de cuidado que nutrem sem custar tanto depois.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Observe: 'Estou tendo a urgencia de comer para me sentir melhor. Posso reconhecer essa urgencia como uma tentativa de cuidado — e escolher um cuidado diferente agora.'",
    valueReminder:
      "Cuidar do seu corpo com intencao e respeito e um ato alinhado com quem voce quer ser. Voce merece cuidado que nutre de verdade.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Preparar um cha quente com atencao plena — o ritual aquece e acalma sem o custo do binge",
      "Tomar um banho quente com musica calma — ativa o sistema de cuidado de forma nao-alimentar",
      "Ligar para alguem e conversar por 10 minutos — conexao social regula o emocional",
    ],
  },
  substance: {
    immediateActions: [
      "Mude de ambiente IMEDIATAMENTE. Va para um lugar onde o acesso a substancia seja dificil ou impossivel. Distancia fisica e sua aliada mais poderosa agora.",
      "Ligue ou mande mensagem para alguem de confianca. Voce nao precisa explicar tudo — so diga que esta passando por um momento dificil e precisa de companhia.",
      "Agua gelada no rosto + respiracao forcada: inspire 4s, segure 4s, expire 8s. Repita 5 vezes. Isso ativa o nervo vago e reduz a urgencia fisiologica.",
    ],
    patternReading:
      "Impulsos por substancias sao frequentemente tentativas de escapar de dor emocional intoleravel. O escape funciona — e por isso e tao sedutor. Mas e temporario e tem custo cumulativo. A dor que fica precisa de outro tipo de cuidado.",
    regulatoryPhrase:
      "Voce ja passou por isso antes e sobreviveu. Esse momento, por mais intenso que seja, tambem vai passar. Voce e maior que esse impulso.",
    breathingExercise: { inhale: 4, hold: 4, exhale: 8 },
    defusionExercise:
      "Repita: 'Estou tendo o pensamento de que so a substancia pode me ajudar agora. Posso observar esse pensamento e lembrar que ele e uma mentira que meu cerebro conta quando esta em dor. Ja sobrevivi a essa mentira antes.'",
    valueReminder:
      "Cada momento que voce resiste e um voto a favor da sua liberdade, da sua saude, e das pessoas que importam pra voce.",
    successProbability: undefined,
    alternativeBehaviors: [
      "Exercicio fisico intenso por 10 minutos — libera endorfinas e redireciona a energia",
      "Ir a um lugar publico com pessoas (cafe, praca) — a presenca social reduz a vulnerabilidade",
      "Escrever uma carta para o seu eu do futuro sobre porque voce esta resistindo agora",
    ],
  },
  other: {
    immediateActions: [
      "Tecnica TIP: mude sua temperatura corporal (agua gelada no rosto), faca exercicio intenso por 2 minutos, depois respiracao pausada (4-4-6). Essa sequencia interrompe o ciclo do impulso fisiologicamente.",
      "STOP: Pare. De um passo para tras. Observe o impulso como se fosse uma nuvem passando pelo ceu. Depois escolha conscientemente: o que EU quero fazer agora?",
      "Adiamento de 10 minutos: prometa a si mesmo esperar apenas 10 minutos. Use esse tempo para nomear o que esta sentindo e o que disparou o impulso.",
    ],
    patternReading:
      "Impulsos sao sinais do corpo e da mente, nao comandos. Cada impulso carrega informacao sobre o que voce esta precisando. Que emocao esta por baixo?",
    regulatoryPhrase:
      "Voce nao e o seu impulso. Voce e quem observa o impulso e decide o que fazer com ele. Essa distancia e poder.",
    breathingExercise: BASE_BREATHING,
    defusionExercise:
      "Pratique: 'Estou tendo o pensamento de que preciso fazer isso agora. Posso notar esse pensamento, agradecer meu cerebro por tentar me ajudar, e escolher outra coisa.'",
    valueReminder:
      "O que voce faz nos proximos 10 minutos e um voto. Para que versao de voce esse voto vai?",
    successProbability: undefined,
    alternativeBehaviors: [
      "Mudar de ambiente — qualquer mudanca de cenario fisica quebra o loop",
      "Fazer algo com as maos: lavar louca, organizar uma gaveta, desenhar — acao fisica tira do piloto automatico",
      "Colocar uma musica e se mover — danca, alongamento, caminhada — o corpo tem sabedoria propria",
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
        "A intensidade esta alta, mas lembre-se: os impulsos mais intensos tambem sao os que perdem forca mais rapido. Os primeiros 10 minutos sao os mais dificeis.",
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
      "Voce fumou. E um fato, nao uma sentenca. O caminho de mudanca nunca e uma linha reta — e feito de tentativas, e cada tentativa ensina algo. Voce esta aqui registrando, e isso ja e um ato de cuidado.",
    triggerAnalysis:
      "O impulso encontrou uma janela. Talvez estresse acumulado, talvez um gatilho social, talvez um momento de baixa guarda. Nao e fraqueza — e o cerebro fazendo o que aprendeu a fazer. A informacao esta no contexto: o que estava acontecendo nos 30 minutos antes?",
    returnAction:
      "Beba um copo de agua com atencao plena agora. Sinta a temperatura, o gosto. Esse pequeno ato reconecta voce ao presente e marca o momento da retomada.",
    valueReconnection:
      "Voce cedeu, e voce esta aqui. O fato de estar registrando mostra que seu compromisso com a mudanca nao desapareceu. Os valores permanecem — o caminho apenas deu uma curva.",
    nextTimeStrategy:
      "Na proxima vez que o impulso surgir, tente a regra dos 10 minutos antes de qualquer outra coisa: 'Vou esperar 10 minutos e reavaliar.' Coloque um timer. A maioria dos impulsos perde forca significativa nesse intervalo.",
  },
  social_media: {
    compassionMessage:
      "Voce usou redes sociais mais do que queria. Acontece — o design dessas plataformas existe literalmente para capturar sua atencao. Voce nao esta lutando contra forca de vontade, esta lutando contra bilhoes em engenharia de persuasao.",
    triggerAnalysis:
      "O scroll geralmente aparece quando algo precisa ser anestesiado — tedio, ansiedade, solidao, sensacao de vazio. O celular e o analgesico mais acessivel que existe. Que desconforto estava pedindo atencao?",
    returnAction:
      "Coloque o celular em outro comodo agora e faca uma coisa com as maos: lavar um copo, alongar, escrever uma frase. Qualquer acao fisica no mundo real marca a retomada.",
    valueReconnection:
      "O tempo e o recurso mais precioso que voce tem. Estar aqui refletindo sobre como usou esse tempo mostra que voce se importa com a propria presenca e intencionalidade.",
    nextTimeStrategy:
      "Antes de pegar o celular na proxima vez, pergunte em voz alta: 'O que estou sentindo agora?' Nomear a emocao antes do impulso muda tudo — voce passa de automatico para consciente.",
  },
  pornography: {
    compassionMessage:
      "Voce cedeu. E agora esta aqui, olhando de frente para o que aconteceu. Isso exige coragem. Sem vergonha — vergonha alimenta o ciclo; compaixao o interrompe.",
    triggerAnalysis:
      "Esse comportamento quase nunca e sobre desejo — e sobre regulacao emocional. Solidao, estresse, tedio, baixa autoestima: todos gritam por alivio, e o orgasmo e o analgesico mais rapido que o cerebro conhece. A pergunta nao e 'por que cedi?' — e 'que dor eu estava tentando aliviar?'",
    returnAction:
      "Levante, va ate o banheiro, lave o rosto com agua fria. Essa micro-acao marca fisicamente a transicao entre o que aconteceu e o que vem agora. Voce esta retomando.",
    valueReconnection:
      "A pessoa que voce quer ser ainda esta ai. Um deslize nao muda seus valores — muda so o caminho para chegar neles. E voce esta corrigindo o percurso agora mesmo.",
    nextTimeStrategy:
      "Na proxima vez que sentir o impulso surgindo, mude de ambiente imediatamente — saia do comodo. A distancia fisica e a intervencao mais eficaz nesse momento. Nao tente resistir parado no mesmo lugar.",
  },
  binge_eating: {
    compassionMessage:
      "Voce comeu mais do que queria. O desconforto fisico e emocional que vem depois e real, e valido. Mas esse momento nao define voce. Comer para regular emocoes e um dos comportamentos humanos mais universais — nao e falha de carater.",
    triggerAnalysis:
      "Geralmente, o comer compulsivo e precedido por uma emocao que nao encontrou outra saida: estresse, tristeza, ansiedade, sensacao de vazio. A comida funciona como abraco temporario. O que estava precisando de acolhimento?",
    returnAction:
      "Beba agua morna com limao devagar. Nao para 'compensar' — mas como um gesto de cuidado gentil com o corpo. Esse ato e o primeiro passo da retomada: cuidar em vez de punir.",
    valueReconnection:
      "Cuidar da sua relacao com a comida e um ato de amor proprio. O fato de estar aqui refletindo mostra que voce quer uma relacao diferente consigo mesmo. Esse desejo e poderoso.",
    nextTimeStrategy:
      "Antes de comer quando nao tiver fome fisica, tente escrever uma frase sobre o que esta sentindo. Apenas uma frase. Nomear a emocao reduz a pressao que ela exerce, e pode ser suficiente para criar espaco entre o impulso e a acao.",
  },
  substance: {
    compassionMessage:
      "Voce usou. Isso nao apaga nenhum dia que voce ficou limpo. Cada dia de resistencia continua valendo — ele nao desaparece. A recuperacao nao e uma contagem que zera; e uma tendencia que se fortalece com cada retomada.",
    triggerAnalysis:
      "O uso de substancias quase sempre e uma tentativa de escapar de algo insuportavel. Nao e fraqueza — e o cerebro buscando alivio da unica forma que conhece bem. Que dor estava gritando? Que situacao estava pesada demais?",
    returnAction:
      "Se estiver seguro fisicamente, beba agua e coma algo leve. Cuide do corpo primeiro. Se precisar de ajuda medica, busque. Se precisar falar com alguem, ligue agora. Voce nao precisa fazer isso sozinho.",
    valueReconnection:
      "Voce esta aqui registrando. Isso nao e algo que alguem sem comprometimento faz. Seus valores — liberdade, saude, as pessoas que importam — continuam vivos. A recaida nao os apagou.",
    nextTimeStrategy:
      "Na proxima vez que sentir o impulso, ligue para uma pessoa de confianca ANTES de agir. Nao precisa explicar tudo — so diga 'estou num momento dificil, posso falar com voce?' A conexao humana e o antidoto mais poderoso.",
  },
  other: {
    compassionMessage:
      "Voce cedeu a um impulso. Sem julgamento. O caminho de mudanca e feito de tentativas — e voce esta tentando. Estar aqui agora, olhando para o que aconteceu, e o oposto de desistir.",
    triggerAnalysis:
      "Todo impulso tem uma funcao: tenta resolver algo — aliviar desconforto, preencher um vazio, escapar de algo doloroso. O que esse impulso estava tentando resolver pra voce?",
    returnAction:
      "Faca uma coisa gentil por voce agora: beber agua, lavar o rosto, respirar 3 vezes com intencao. Qualquer ato de cuidado marca a retomada.",
    valueReconnection:
      "Voce esta aqui. Isso significa que seus valores ainda estao ativos. Um deslize nao muda quem voce quer ser — so mostra que o caminho tem curvas.",
    nextTimeStrategy:
      "Na proxima vez, tente inserir um espaco entre o impulso e a acao: 10 minutos + nomear a emocao por baixo. Esse espaco cresce com a pratica.",
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
        "Continue registrando check-ins, impulsos e tecnicas. Quanto mais dados, mais precisos ficam os padroes. A analise profunda requer pelo menos 2 semanas de registros consistentes.",
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
      message: "Bom dia. Antes de comecar, faz sentido checar como voce esta.",
      tone: "gentle",
    },
    {
      message: "Voce esta aqui. Isso ja e o primeiro passo do dia.",
      tone: "grounding",
    },
    {
      message: "Novo dia, mesma ancora. Como voce esta se sentindo agora?",
      tone: "gentle",
    },
    {
      message: "Mais um dia. Nao precisa ser perfeito — precisa ser seu.",
      tone: "validating",
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
    {
      message: "Anotado. O simples ato de observar ja muda a relacao com o que se sente.",
      tone: "validating",
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
        "Resistir nao e facil. Reconheca essa escolha — ela importa.",
      tone: "encouraging",
    },
    {
      message:
        "O impulso veio e voce ficou. Cada vez que isso acontece, o caminho fica um pouco mais solido.",
      tone: "grounding",
    },
    {
      message:
        "Voce observou o impulso e nao obedeceu. Isso e defusao cognitiva em pratica.",
      tone: "validating",
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
    {
      message:
        "Voltar importa mais do que nunca cair. E voce esta voltando.",
      tone: "encouraging",
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
        "O minimo nao e pouco — e o que manteve a corrente viva hoje.",
      tone: "validating",
    },
    {
      message:
        "Feito. Consistencia nao exige perfeicao, exige presenca. Voce esteve presente.",
      tone: "grounding",
    },
  ],
  habit_ideal: [
    {
      message:
        "Versao ideal feita. Nao porque voce e obrigado, mas porque escolheu. Reconheca isso.",
      tone: "validating",
    },
    {
      message:
        "Completo. Quando acao e valor se alinham, algo solido se constroi.",
      tone: "grounding",
    },
    {
      message:
        "Voce fez a versao completa. Sem inflacao, sem fogos de artificio — so o reconhecimento de que voce honrou o compromisso.",
      tone: "encouraging",
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
        "Bem-vindo de volta. O Ancora esta aqui, sem cobrancas. Quando quiser, faca um check-in.",
      tone: "gentle",
    },
    {
      message:
        "Pausas fazem parte. Voce esta aqui agora e isso e suficiente.",
      tone: "validating",
    },
    {
      message:
        "A porta nunca fechou. Retomar e um ato de coragem silenciosa.",
      tone: "encouraging",
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
  recovery_start: [
    {
      message:
        "Voce esta aqui. Depois de cair, levantar e o que mais importa. Sem pressa, sem vergonha.",
      tone: "gentle",
    },
    {
      message:
        "Retomar nao e 'compensar'. E escolher, de novo, o caminho que importa. Um passo de cada vez.",
      tone: "validating",
    },
    {
      message:
        "O caminho nao e reto. O que conta e a direcao, nao a perfeicao. Voce esta apontando pro lado certo.",
      tone: "encouraging",
    },
  ],
  overload_detected: [
    {
      message:
        "Sobrecarga detectada. Hora de reduzir, nao de forcar. Menos e mais agora.",
      tone: "grounding",
    },
    {
      message:
        "Seu sistema esta sobrecarregado. Permissao concedida para fazer menos. Isso e inteligencia.",
      tone: "validating",
    },
    {
      message:
        "Detectamos indicadores de sobrecarga. O mais corajoso agora e desacelerar.",
      tone: "gentle",
    },
  ],
  pattern_insight: [
    {
      message:
        "Um padrao apareceu nos seus dados. Informacao, nao julgamento — so mais uma peca do quebra-cabeca.",
      tone: "grounding",
    },
    {
      message:
        "Seus dados revelaram algo interessante. Conhecer seus padroes e poder.",
      tone: "encouraging",
    },
    {
      message:
        "Novo insight detectado. Quanto mais voce se observa, mais claras ficam as conexoes.",
      tone: "validating",
    },
  ],
  value_reminder: [
    {
      message:
        "Lembre-se: cada acao de hoje e um voto para quem voce quer ser amanha.",
      tone: "grounding",
    },
    {
      message:
        "Seus valores sao sua bussola. Mesmo em dias turbulentos, eles mostram o norte.",
      tone: "encouraging",
    },
    {
      message:
        "O que voce esta fazendo agora esta alinhado com o que importa pra voce?",
      tone: "gentle",
    },
  ],
  anti_obsession: [
    {
      message:
        "Voce ja registrou o suficiente. O app e ferramenta, nao obrigacao. Pode soltar.",
      tone: "gentle",
    },
    {
      message:
        "Perfeccionismo com registros e tao nocivo quanto nao registrar. Respire. Descanse.",
      tone: "validating",
    },
    {
      message:
        "A regulacao inclui saber parar de monitorar. Voce esta cuidando de si ao descansar tambem.",
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
      message: "Voce esta aqui. Isso importa.",
      tone: "gentle",
    };
  }

  // Pick a random variant for variety
  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}
