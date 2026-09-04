import { ReportTemplate } from '@/types';

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // ==========================================
  // 1. PELVE (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-pelve',
    modality: 'RADIOGRAFIA',
    title: 'Pelve e Articulações Coxofemorais - Padrão Normal / Triagem',
    category: 'Membros & Articulações',
    technique: 'Estudo radiográfico da pelve e articulações coxofemorais em projeção Ventrodorsal (VD) com membros pélvicos estendidos, paralelos e com rotação interna dos fêmures, incluindo patelas no campo.',
    findings: 'Cabeças femorais esféricas, de contornos regulares e superfície articular lisa bilateralmente.\nArticulações coxofemorais congruentes, com mais de 50% da cabeça femoral contida na fossa acetabular.\nBordos acetabulares craniais e dorsais regulares, sem proliferações osteofíticas ou esclerose subcondral patológica.\nColos femorais delgados, sem neoformação óssea (ausência de linha de Morgan).\nEspaços articulares uniformes e simétricos.\nÂngulo de Norberg estimado bilateralmente dentro dos limites da normalidade (> 105°).\nSínfise púbica e ossos ilíacos com densidades e alinhamento preservados, sem evidências de fraturas.',
    conclusion: '1. Estudo radiográfico da pelve dentro dos padrões de normalidade radiográfica.\n2. Ausência de sinais radiográficos compatíveis com Displasia Coxofemoral ou osteoartrose no momento.',
    recommendations: 'Em pacientes jovens em fase de desenvolvimento esquelético, sugere-se reavaliação radiográfica após a maturidade óssea definitiva conforme preconizado pela raça.'
  },

  // ==========================================
  // 2. TÓRAX (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-torax',
    modality: 'RADIOGRAFIA',
    title: 'Tórax Canino/Felino - Estudo em 3 Projeções (Padrão Normal)',
    category: 'Cavidades & Tronco',
    technique: 'Estudo radiográfico do tórax obtido em projeções ortogonais (Laterolateral Direita, Laterolateral Esquerda e Ventrodorsal), com boa técnica radiográfica em pico inspiratório.',
    findings: 'Campos pulmonares apresentando radiopacidade e trama broncovascular preservadas, sem evidências de infiltrados alveolares, intersticiais ou nodulações patológicas.\nSilhueta cardíaca com dimensões e contornos anatômicos normais, com volume e contato esterno-cardíaco preservados (VHS dentro dos valores de referência para a raça).\nTraqueia intratorácica de trajeto retilíneo e calibre uniforme, sem colapsos ou desvios anormais.\nEspaço pleural sem espessamentos, efusão líquida ou pneumotórax.\nCúpula diafragmática íntegra, com convexidade fisiológica e inserções preservadas.\nArcabouço costal e coluna torácica sem alterações morfológicas significativas.',
    conclusion: 'Estudo radiográfico torácico dentro dos limites de normalidade radiográfica para a espécie e idade relatadas.',
    recommendations: 'Correlação com a evolução clínica e ausculta cardiopulmonar. Repetir o exame caso haja persistência ou piora de sintomas respiratórios.'
  },

  // ==========================================
  // 3. ABDÔMEN (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-abdomen',
    modality: 'RADIOGRAFIA',
    title: 'Abdômen Simples - Estudo Radiográfico de Rotina (Padrão Normal)',
    category: 'Cavidades & Tronco',
    technique: 'Estudo radiográfico da cavidade abdominal nas projeções ortogonais Laterolateral Direita e Ventrodorsal.',
    findings: 'Detalhe de contraste peritoneal satisfatório para o escore corporal do paciente.\nEstômago em localização habitual, com quantidade fisiológica de gás e conteúdo fluido/alimentar, sem dilatações obstrutivas ou corpos estranhos radiopacos.\nAlças de intestino delgado uniformemente distribuídas, com calibre luminal normal, sem padrão de plissamento ou retenção obstrutiva de gás em cacho de uvas.\nCólons preenchidos por conteúdo fecal de radiopacidade habitual e quantidade moderada de gás no reto.\nFígado com dimensões preservadas, contornos regulares e bordos ventrais afilados contidos no arco costal.\nBaço anatômico no plano radiográfico ventrodorsal.\nRins visibilizados bilateralmente em topografia retroperitoneal, com morfologia e radiopacidades preservadas.\nVesícula urinária com moderada repleção líquida, contornos regulares, sem cálculos radiopacos radiograficamente detectáveis.',
    conclusion: 'Estudo radiográfico da cavidade abdominal dentro dos padrões de normalidade.',
    recommendations: 'Acompanhamento clínico. Caso haja dor abdominal persistente ou vômitos recorrentes, recomenda-se ultrassonografia abdominal complementar para avaliação das camadas murais e parênquimas.'
  },

  // ==========================================
  // 4. CARPO (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-carpo',
    modality: 'RADIOGRAFIA',
    title: 'Carpo e Metacarpos - Estudo Radiográfico Ortopédico',
    category: 'Membros & Articulações',
    technique: 'Estudo radiográfico da articulação do carpo e metacarpos nas projeções ortogonais Dorsopalmar (DP) e Mediolateral (ML).',
    findings: 'Articulações antebraquiocárpica, mediocárpica e carpometacárpica alinhadas, com interlinhas articulares uniformes e preservadas.\nOssos do carpo (radial, ulnar, acessório e cárpicos de I a IV) com densidades, contornos e relações mantidas, sem osteofitose periarticular ou esclerose subcondral patológica.\nOssos metacarpianos com corticais contínuas, espessuras normais e cavidades medulares homogêneas.\nAusência de soluções de continuidade óssea completas ou incompletas (sem fraturas evidentes) ou luxações/subluxações carpometacárpicas.\nTecidos moles periarticulares com volume e radiopacidade normais, sem evidência de efusão ou edema focal.',
    conclusion: 'Estudo radiográfico do carpo e metacarpo sem alterações articulares osteoproliferativas ou fraturas ósseas agudas.',
    recommendations: 'Em caso de suspeita de instabilidade ligamentar ou hiperextensão do carpo pós-trauma, realizar incidências sob estresse mecânico (hiperextensão forçada).'
  },

  // ==========================================
  // 5. COLUNA TORÁCICA (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-coluna-toracica',
    modality: 'RADIOGRAFIA',
    title: 'Coluna Torácica - Estudo Estrutural (T1 a T13)',
    category: 'Coluna Vertebral',
    technique: 'Estudo radiográfico da coluna vertebral torácica (T1 a T13) nas projeções ortogonais Laterolateral (LL) e Ventrodorsal (VD).',
    findings: 'Alinhamento do eixo vertebral torácico mantido, sem desvios escolióticos ou xifóticos anômalos.\nCorpos vertebrais de T1 a T13 íntegros, com radiopacidade óssea preservada, corticais uniformes e processos espinhosos de conformação normal.\nEspaços discais intervertebrais com amplitude simétrica e uniforme ao longo de todo o segmento torácico, sem diminuições focais ou mineralizações do núcleo pulposo no interior do canal vertebral.\nArticulações costovertebrais e processos articulares com contornos regulares, sem proliferações osteofíticas ventrais ou espondiloses deformantes proeminentes.\nForames intervertebrais com conformação ovalada e radiotransparência preservadas.',
    conclusion: 'Coluna torácica com morfologia e alinhamento preservados, sem sinais de discopatia mineralizada ou espondilose anquilosante.',
    recommendations: 'Correlação com exame neurológico detalhado (reflexos espinhais e palpação epaxial). Métodos avançados (TC/RM) a critério clínico caso haja déficits motores.'
  },

  // ==========================================
  // 6. COLUNA LOMBAR (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-coluna-lombar',
    modality: 'RADIOGRAFIA',
    title: 'Coluna Lombar e Junção Lombossacra (L1 a L7 - S1)',
    category: 'Coluna Vertebral',
    technique: 'Estudo radiográfico da coluna lombar (L1 a L7) e transição lombossacra (L7-S1) nas projeções Laterolateral (LL) e Ventrodorsal (VD).',
    findings: 'Alinhamento vertebral preservado nos eixos laterolateral e ventrodorsal.\nCorpos vertebrais lombares com formato anatômico preservado e densidade óssea homogênea.\nEspaços discais intervertebrais de L1 a L7 com dimensões simétricas e paralelas.\nJunção lombossacra (L7-S1) com alinhamento mantido e canal vertebral sem estreitamentos ósseos extrínsecos aparentes.\nForames intervertebrais lombares amplos e radiotransparentes, sem opacidades mineralizadas suspeitas.\nAusência de pontes ósseas intervertebrais (espondilose deformante) ou lesões osteolíticas nos platôs vertebrais (sem sinais de espondilodiscite).',
    conclusion: 'Estudo radiográfico da coluna lombar e transição lombossacra dentro dos padrões normais para a espécie.',
    recommendations: 'Correlação com exame físico e palpação lombossacra. Em caso de dor na elevação da cauda ou suspeita de síndrome da cauda equina, considerar tomografia ou ressonância magnética.'
  },

  // ==========================================
  // 7. COLUNA TORACOLOMBAR (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-coluna-toracolombar',
    modality: 'RADIOGRAFIA',
    title: 'Coluna Toracolombar - Triagem de Discopatias (T11 a L3)',
    category: 'Coluna Vertebral',
    technique: 'Estudo radiográfico focado na transição toracolombar (T10 a L3) nas projeções ortogonais Laterolateral centrada e Ventrodorsal.',
    findings: 'Alinhamento dos corpos vertebrais íntegro, sem evidência de luxação ou subluxação vertebral no segmento toracolombar.\nEspaços discais intervertebrais na transição T11-T12, T12-T13, T13-L1, L1-L2 e L2-L3 com aberturas discais preservadas e simétricas.\nAusência de opacidades mineralizadas projetadas no interior dos forames intervertebrais ou no assoalho do canal vertebral (ausência de discopatias tipo Hansen I calcificadas aparentes).\nPlatôs vertebrais adjacentes contínuos, com margens bem definidas, sem esclerose subcondral patológica ou colapso vertebral.\nProcessos articulares sem osteofitose ou deformidades associadas.',
    conclusion: 'Coluna toracolombar sem sinais radiográficos conclusivos de extrusão discal mineralizada ou espondilopatia degenerativa evidente.',
    recommendations: 'Ressaltamos que hérnias discais não mineralizadas (Hansen tipo II ou extrusões sem calcificação radiográfica) necessitam de exame tomográfico ou de ressonância magnética para avaliação definitiva da medula espinhal.'
  },

  // ==========================================
  // 8. COLUNA CERVICAL (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-coluna-cervical',
    modality: 'RADIOGRAFIA',
    title: 'Coluna Cervical - Estudo Estrutural (C1 a C7)',
    category: 'Coluna Vertebral',
    technique: 'Estudo radiográfico da coluna cervical (C1 a C7) nas projeções Laterolateral em posição neutra e Ventrodorsal centrada.',
    findings: 'Alinhamento e curvatura fisiológica da coluna cervical mantidos.\nArticulação atlantoaxial (C1-C2) congruente, com dente do áxis íntegro, de dimensões anatômicas normais e distância atlantoaxial dorsal preservada (sem sinais de subluxação atlantoaxial evidente).\nCorpos vertebrais de C2 a C7 com contornos e radiopacidades preservados.\nEspaços intervertebrais discais cervicais com larguras preservadas e sem calcificações in situ ou no interior do canal espinhal.\nForames intervertebrais com conformação anatômica livre de proliferações ósseas obstrutivas.\nTecidos moles cervicais ventrais e traqueia com trajeto anatômico normal.',
    conclusion: 'Estudo radiográfico da coluna cervical dentro dos limites da normalidade para a espécie e idade relatadas.',
    recommendations: 'Acompanhamento neurológico. Em caso de cervicalgia intensa ou tetraparesia, evitar manipulações forçadas e proceder com diagnóstico por imagem avançado (Tomografia / RM).'
  },

  // ==========================================
  // 9. COTOVELO (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-cotovelo',
    modality: 'RADIOGRAFIA',
    title: 'Cotovelo - Triagem Ortopédica e Displasia de Cotovelo',
    category: 'Membros & Articulações',
    technique: 'Estudo radiográfico da articulação do cotovelo nas projeções ortogonais Mediolateral (ML) em flexão a 90° e Craniocaudal (CrCd).',
    findings: 'Articulação umerorradioulnar com congruência e interlinha articular preservada em toda a extensão.\nProcesso ancôneo da ulna fusionado à diáfise ulnar, com margens dorsais lisas e regulares, sem linha de radiotransparência de não união (ausência de não união do processo ancôneo - NUPA).\nProcesso coronóide medial da ulna visibilizado com contorno nítido, sem evidência de fragmentação (FPCM) ou esclerose da incisura troclear ulnar.\nCôndilos umerais com contornos anatômicos regulares, sem achatamento subcondral ou osteocondrite dissecante (OCD) evidente.\nAusência de proliferações osteofíticas marginais ou efusão articular na cápsula craniodorsal.',
    conclusion: 'Articulação do cotovelo congruente, sem sinais radiográficos de osteoartrose ou displasia de cotovelo no presente estudo.',
    recommendations: 'Em pacientes com claudicação persistente do membro torácico e suspeita de fragmentação inicial de coronóide medial (FPCM oculta ao RX), recomenda-se tomografia computadorizada do cotovelo.'
  },

  // ==========================================
  // 10. CRÂNIO (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-cranio',
    modality: 'RADIOGRAFIA',
    title: 'Crânio e Face - Estudo Radiográfico Estrutural',
    category: 'Cabeça',
    technique: 'Estudo radiográfico do crânio obtido nas projeções Laterolateral (LL), Dorsoventral (DV) e rostrocaudal com boca aberta.',
    findings: 'Calota craniana com contornos ósseos contínuos e espessuras simétricas, sem áreas de lise óssea, afundamentos ou fraturas.\nSeios nasais e frontais apresentando padrão de radiotransparência simétrico e homogêneo bilateralmente, com septo nasal íntegro e conchas nasais preservadas, sem velamento mucoso ou efeito de massa expansiva.\nBulas timpânicas com paredes ósseas delgadas, lisas e lúmen preenchido fisiologicamente por gás (radiotransparente), sem espessamento parietal ou sinais de otite média.\nMandíbulas e arcos zigomáticos alinhados e íntegros, sem solução de continuidade.\nArticulações temporomandibulares congruentes e simétricas.',
    conclusion: 'Estudo radiográfico do crânio sem alterações osteolíticas, seios nasais arejados e bulas timpânicas preservadas.',
    recommendations: 'Em caso de secreção nasal unilateral crônica ou sintomas neurológicos vestibulares, indica-se rinoscopia ou tomografia computadorizada de crânio para avaliação milimétrica de tecidos moles profundos.'
  },

  // ==========================================
  // 11. JOELHO (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-joelho',
    modality: 'RADIOGRAFIA',
    title: 'Joelho - Articulação Femorotibiopatelar e Integridade Ligamentar',
    category: 'Membros & Articulações',
    technique: 'Estudo radiográfico da articulação do joelho nas projeções ortogonais Mediolateral (ML) flexionada a 90° e Caudocranial (CdCr).',
    findings: 'Articulação femorotibiopatelar congruente, com alinhamento e interlinha fêmoro-tibial medial e lateral preservadas.\nPatela posicionada centralmente no sulco troclear femoral, sem desvios mediais ou laterais (sem luxação patelar evidente no plano radiográfico).\nCoxim adiposo infrapatelar radiotransparente e preservado, sem sinais de compressão ou apagamento por efusão articular volumosa.\nFabelas femorais e sesamóide poplíteo íntegros e em topografia habitual.\nEspaço articular fêmoro-tibial sem evidência de gaveta anterior tibial (deslocamento cranial da tíbia) no decúbito.\nAusência de osteófitos no polo distal da patela, cristas trocleares ou platô tibial (sem sinais de osteoartrose secundária a ruptura de ligamento cruzado cranial - RLCC).',
    conclusion: 'Articulação femorotibiopatelar congruente, sem sinais radiográficos indiretos de efusão articular ou osteofitose por instabilidade ligamentar.',
    recommendations: 'Lembramos que o diagnóstico definitivo de ruptura parcial de ligamento cruzado cranial deve ser complementado com testes clínicos ortopédicos específicos (teste de gaveta e compressão tibial).'
  },

  // ==========================================
  // 12. RÁDIO E ULNA (RAIO-X)
  // ==========================================
  {
    id: 'tpl-rx-radio-ulna',
    modality: 'RADIOGRAFIA',
    title: 'Rádio e Ulna (Antebraço) - Estudo Estrutural Diafisário',
    category: 'Membros & Articulações',
    technique: 'Estudo radiográfico do antebraço (rádio e ulna) nas projeções ortogonais Craniocaudal (CrCd) e Mediolateral (ML), incluindo articulações do cotovelo e carpo adjacentes.',
    findings: 'Diáfises ósseas de rádio e ulna com paralelismo e curvaturas anatômicas preservadas.\nCorticais ósseas contínuas, homogêneas e bem delimitadas, sem reações periosteais ativas, lise cortical ou soluções de continuidade (sem evidências de fraturas completas, incompletas ou em galho verde).\nCavidade medular com radiopacidade habitual, sem lesões osteolíticas focais ou sinais de panosteíte.\nEspaço interósseo preservado ao longo do comprimento dos ossos do antebraço.\nFises de crescimento (em caso de animais jovens) com espessuras simétricas e fechamento sincronizado, sem desvios angulares (sem síndrome do rádio curto).\nTecidos moles do membro com volume e contornos anatômicos normais.',
    conclusion: 'Rádio e ulna íntegros, sem alterações ósseas focais, fraturas ou deformidades angulares evidentes.',
    recommendations: 'Correlação com exame físico e palpação ortopédica.'
  },

  // ==========================================
  // 13. ULTRASSOM ABDOMINAL (USG)
  // ==========================================
  {
    id: 'tpl-usg-abdominal-total',
    modality: 'ULTRASSOM',
    title: 'Ultrassom Abdominal Total - Varredura de Rotina Completa (Padrão Normal)',
    category: 'Cavidades & Tronco',
    technique: 'Exame ultrassonográfico abdominal total realizado com aparelho de alta resolução, transdutores microconvexo e linear multifrequenciais (5.0 a 10.0 MHz), após tricotomia ampla e aplicação de gel acústico condutor.',
    findings: 'FÍGADO: Dimensões anatômicas preservadas, bordos afilados e cápsula regular. Ecotextura fina e homogênea, ecogenicidade normal. Sistema vascular portal e veias hepáticas de calibre preservado.\nVESÍCULA BILIAR: Moderadamente distendida por conteúdo anecogênico homogêneo (bile líquida), paredes finas, lisas e normoespessas, sem cálculos ou sedimento litiásico.\nBAÇO: Dimensões e contornos preservados, parênquima homogêneo com padrão finamente granuloso, vascularização hilar ao Doppler preservada.\nRINS: Simétricos, contornos lisos e regulares. Boa distinção da relação corticomedular. Ecogenicidade cortical preservada. Pelves renais sem evidência de ectasia ou cálculos obstrutivos.\nBEXIGA URINÁRIA: Boa repleção hídrica, paredes lisas e regulares, conteúdo luminal anecogênico sem sedimento celular, coágulos ou urolitíases.\nTRATO GASTROINTESTINAL: Estômago e alças intestinais com estratificação parietal preservada em todos os segmentos. Motilidade observada. Espessuras das camadas dentro dos limites fisiológicos.\nPÂNCREAS E ADRENAIS: Em topografias anatômicas habituais, sem aumentos de volume ou perda de ecotextura evidente.\nCAVIDADE PERITONEAL: Ausência de líquido livre abdominal peritoneal ou linfonodomegalias mesentéricas.',
    conclusion: 'Exame ultrassonográfico da cavidade abdominal sem alterações ecográficas patológicas detectáveis no momento.',
    recommendations: 'Acompanhamento clínico de rotina.'
  },

  // ==========================================
  // 14. TFAST (USG)
  // ==========================================
  {
    id: 'tpl-usg-tfast',
    modality: 'ULTRASSOM',
    title: 'TFAST - Triagem Torácica Focada em Trauma e Emergência (POCUS)',
    category: 'Protocolos de Emergência (POCUS)',
    technique: 'Avaliação ultrassonográfica torácica focada à beira do leito (TFAST - Thoracic Focused Assessment with Sonography for Trauma) nos sítios acústicos fundamentais bilaterais: Tórax Dorsal (CTS), Pericárdico (PCS) e Hepático-Diafragmático (DH).',
    findings: 'SÍTIO TÓRAX DORSAL (CTS) BILATERAL:\n- Identificado deslizamento pleural normal (Lung Sliding) ativo bilateralmente.\n- Presença de Linhas A horizontais fisiológicas, sem ausência de deslizamento ou presença de ponto de pulmão (Lung Point).\n- Ausência de sinais ecográficos de pneumotórax.\n\nSÍTIO PERICÁRDICO (PCS) / CARDÍACO:\n- Janela ecocardiográfica com contratilidade cardíaca rítmica presente.\n- Ausência de líquido anecogênico acumulado no saco pericárdico (sem efusão pericárdica ou tamponamento cardíaco).\n\nSÍTIO HEPÁTICO-DIAFRAGMÁTICO (DH):\n- Visualizada linha diafragmática íntegra com cauda de cometa e sinal de espelho preservados.\n- Ausência de líquido livre no espaço pleural caudal.',
    conclusion: 'Protocolo TFAST Negativo: Ausência de evidências ecográficas de pneumotórax ou efusão pericárdica/pleural no momento da avaliação à beira do leito.',
    recommendations: 'Monitorização clínica contínua dos parâmetros respiratórios e oximetria de pulso. Repetir o protocolo TFAST caso haja descompensação ou piora respiratória do paciente.'
  },

  // ==========================================
  // 15. AFAST (USG)
  // ==========================================
  {
    id: 'tpl-usg-afast',
    modality: 'ULTRASSOM',
    title: 'AFAST - Triagem Abdominal Focada em Trauma e Líquido Livre (POCUS)',
    category: 'Protocolos de Emergência (POCUS)',
    technique: 'Avaliação ultrassonográfica abdominal focada à beira do leito (AFAST - Abdominal Focused Assessment with Sonography for Trauma) investigando os 4 sítios fundamentais para pontuação de fluido abdominal (AFS - Abdominal Fluid Score).',
    findings: 'SÍTIO DIAFRAGMÁTICO-HEPÁTICO (DH):\n- Ausência de acúmulo de líquido livre entre lobos hepáticos e diafragma ou perivesicular.\n\nSÍTIO ESPLENORRENAL (SR):\n- Ausência de lâmina anecogênica no polo cranial do rim esquerdo e espaço peri-esplênico.\n\nSÍTIO CISTOCÓLICO (CC):\n- Bexiga urinária íntegra, repleta, sem acúmulo de fluido livre anecogênico no recesso pélvico perivesical.\n\nSÍTIO HEPATORRENAL (HR):\n- Ausência de líquido livre na interface entre o rim direito e o lobo caudado hepático.\n\nESCORE DE FLUIDO ABDOMINAL (AFS - Abdominal Fluid Score): 0/4 (Negativo).',
    conclusion: 'Protocolo AFAST Negativo (Escore AFS: 0/4): Ausência de líquido livre cavitário abdominal detectável no momento da triagem de emergência.',
    recommendations: 'Repetir a varredura AFAST em 4 a 6 horas (ou imediatamente em caso de queda de hematócrito, hipotensão ou sinais de choque hemorrágico pós-trauma).'
  },

  // ==========================================
  // 16. VETBLUE (USG)
  // ==========================================
  {
    id: 'tpl-usg-vetblue',
    modality: 'ULTRASSOM',
    title: 'VetBlue - Ultrassonografia Pulmonar Regional à Beira do Leito',
    category: 'Protocolos de Emergência (POCUS)',
    technique: 'Exame ultrassonográfico pulmonar regional padronizado (VetBlue - Veterinary Bedside Lung Ultrasound Examination) com transdutor microconvexo/linear nos 4 sítios pulmonares anatômicos bilaterais: Caudodorsal (CD), Perihilar (PH), Médio (MD) e Cranial (CR).',
    findings: 'SÍTIO CAUDODORSAL (CD) BILATERAL:\n- Linha pleural regular com sinal de deslizamento (Lung Sliding) ativo e preservado.\n- Predomínio de Linhas A fisiológicas (linhas hiperecogênicas equidistantes horizontais).\n- Ausência de Linhas B patológicas (> 3 por campo acústico intercostal).\n\nSÍTIO PERIHILAR (PH) BILATERAL:\n- Deslizamento pleural evidente. Ausência de padrão interstício-alveolar ou sinais de edema pulmonar cardiogênico.\n\nSÍTIO MÉDIO (MD) BILATERAL:\n- Parênquima subpleural com aeração normal. Sem áreas de consolidação ou sinal de hepatização pulmonar.\n\nSÍTIO CRANIAL (CR) BILATERAL:\n- Deslizamento pleural mantido. Ausência de broncogramas aéreos dinâmicos ou lesões nodulares periféricas.\n\nSINAIS ADICIONAIS:\n- Ausência de linhas de fragmentação pleural, pneumotórax ou efusão pleural associada.',
    conclusion: 'Protocolo VetBlue com predomínio de Perfil A pulmonar fisiológico bilateralmente, sem evidências ecográficas de síndrome interstício-alveolar (edema/contusão) ou consolidação no momento.',
    recommendations: 'Correlação direta com padrão de respiração, ausculta pulmonar e gasometria. Repetir o VetBlue caso haja instalação de taquipneia, tosse aguda ou cianose.'
  }
];
