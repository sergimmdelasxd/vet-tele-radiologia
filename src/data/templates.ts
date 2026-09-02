import { ReportTemplate } from '@/types';

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // ==========================================
  // MODELOS DE RADIOGRAFIA (RAIO-X)
  // ==========================================
  {
    id: 'tpl-torax-normal',
    modality: 'RADIOGRAFIA',
    title: 'Tórax Canino/Felino - Padrão Normal',
    category: 'Tórax',
    technique: 'Estudo radiográfico do tórax obtido em projeções ortogonais (Laterolateral Direita, Laterolateral Esquerda e Ventrodorsal), com boa técnica radiográfica e contraste adequado.',
    findings: 'Campos pulmonares apresentando radiopacidade e trama vascular normais, sem evidências de infiltrados alveolares, intersticiais, brônquicos ou nodulares.\nSilhueta cardíaca com dimensões e contornos anatômicos preservados. Eixo cardíaco normal.\nTraqueia com trajeto, calibre e lúmen preservados.\nEspaço pleural sem evidências de efusões ou pneumotórax.\nMediastino cranial e diafragma íntegros, com convexidade preservada.\nEstruturas ósseas da caixa torácica e coluna vertebral torácica sem alterações morfológicas evidentes.',
    conclusion: 'Estudo radiográfico do tórax dentro dos padrões de normalidade radiográfica para a espécie e idade relatadas.',
    recommendations: 'Correlação com a evolução clínica e ausculta cardiopulmonar. Repetir o exame caso haja piora dos sinais respiratórios.'
  },
  {
    id: 'tpl-torax-icc',
    modality: 'RADIOGRAFIA',
    title: 'Tórax - Cardiomegalia com Congestão / Edema Pulmonar (ICC)',
    category: 'Tórax',
    technique: 'Estudo radiográfico do tórax em projeções Laterolateral Direita e Ventrodorsal.',
    findings: 'Silhueta cardíaca acentuadamente aumentada em dimensões globais (com predomínio em átrio e ventrículo esquerdos), promovendo elevação dorsal da traqueia intratorácica.\nAumento do índice cardíaco vertebral (VHS estimado acima do padrão de referência para a raça).\nCampos pulmonares com infiltrado interstício-alveolar difuso em campos perihilares e dorsocaudais, compatível com edema pulmonar cardiogênico.\nIngurgitamento de veias pulmonares craniais.\nSem evidências de efusão pleural no presente momento.',
    conclusion: '1. Cardiomegalia acentuada (predomínio de câmaras esquerdas).\n2. Padrão interstício-alveolar compatível com congestão e edema pulmonar cardiogênico (Insuficiência Cardíaca Congestiva descompensada).',
    recommendations: 'Conduta cardiológica emergencial recomendada (oxigenioterapia, diuréticos conforme avaliação clínica). Ecocardiograma com Doppler recomendado após estabilização hemodinâmica do paciente.'
  },
  {
    id: 'tpl-abdomen-normal',
    modality: 'RADIOGRAFIA',
    title: 'Abdômen - Padrão de Normalidade',
    category: 'Abdômen',
    technique: 'Estudo radiográfico da cavidade abdominal nas projeções Laterolateral Direita e Ventrodorsal.',
    findings: 'Detalhe do contraste peritoneal satisfatório para a condição corporal do paciente.\nEstômago em topografia habitual, com moderada quantidade de gás e conteúdo alimentar, de aspecto fisiológico.\nAlças intestinais delgadas distribuídas homogeneamente, sem distensões focais ou sinais obstrutivos.\nCólons com quantidade moderada de fezes de densidade normal.\nFígado com dimensões preservadas, contornos regulares e bordos afilados, não ultrapassando o arco costal caudalmente.\nBaço com dimensões anatômicas no plano radiográfico.\nRins visibilizados bilateralmente com contornos e radiopacidades preservadas.\nVesícula urinária com moderada repleção, radiopacidade líquida homogênea, sem radiopacidades calculiformes.',
    conclusion: 'Estudo radiográfico da cavidade abdominal dentro dos padrões de normalidade para a espécie.',
    recommendations: 'Acompanhamento clínico. Ultrassonografia abdominal complementar recomendada caso haja persistência de desconforto.'
  },
  {
    id: 'tpl-fratura-membro',
    modality: 'RADIOGRAFIA',
    title: 'Membros - Fratura Óssea Diafisária',
    category: 'Membros/Esquelético',
    technique: 'Estudo radiográfico do membro acometido em projeções ortogonais craniocaudal e mediolateral.',
    findings: 'Identificada solução de continuidade óssea completa, simples, de traço oblíquo/transverso no terço médio da diáfise dos ossos rádio e ulna.\nDesvio axial de aproximadamente 15 graus em sentido cranial e cavalgamento ósseo de 8 mm entre os fragmentos proximal e distal.\nAumento moderado de volume de tecidos moles adjacentes com perda focal dos planos fasciais, condizente com hematoma/edema pós-traumático.\nAusência de fragmentos ósseos livres cominutivos evidentes no foco fraturário.',
    conclusion: 'Fratura diafisária completa de rádio e ulna com desvio e cavalgamento dos cotos ósseos.',
    recommendations: 'Imobilização provisória e encaminhamento imediato para osteossíntese cirúrgica ortopédica (placa e parafusos bloqueados / fixador externo).'
  },

  // ==========================================
  // MODELOS DE ULTRASSONOGRAFIA (USG)
  // ==========================================
  {
    id: 'tpl-usg-abdominal-normal',
    modality: 'ULTRASSOM',
    title: 'USG Abdominal Total - Padrão de Normalidade',
    category: 'USG Abdominal',
    technique: 'Exame ultrassonográfico abdominal realizado em aparelho de alta resolução utilizando transdutor microconvexo e linear multifrequencial (5.0 a 10.0 MHz), após tricotomia ampla e aplicação de gel acústico.',
    findings: 'FÍGADO: Dimensões anatômicas preservadas, bordos afilados, ecotextura fina e homogênea, ecogenicidade normal. Arquitetura vascular portal preservada.\nVESÍCULA BILIAR: Moderadamente repleta por conteúdo anecogênico límpido, paredes finas e lisas, sem evidências de lama ou colelitíase.\nBAÇO: Dimensões preservadas, cápsula regular, parênquima homogêneo com padrão "em céu estrelado" preservado.\nRINS: Simétricos, contornos regulares, boa definição da relação corticomedular. Córtex renal com ecogenicidade fisiológica. Pelve renal sem dilatações.\nBEXIGA URINÁRIA: Boa repleção, paredes regulares e normoespessas, conteúdo anecogênico límpido, sem sedimentos, coágulos ou cálculos.\nTRATO GASTROINTESTINAL: Estratificação parietal preservada em todos os segmentos. Motilidade observada. Espessuras parietais dentro dos limites da normalidade.\nPÂNCREAS E ADRENAIS: Topografia habitual, sem alterações ecográficas evidentes.\nCAVIDADE PERITONEAL: Ausência de líquido livre abdominal ou linfonodomegalias.',
    conclusion: 'Exame ultrassonográfico abdominal sem evidências de alterações ecográficas patológicas no momento da avaliação.',
    recommendations: 'Acompanhamento clínico de rotina.'
  },
  {
    id: 'tpl-usg-renal-urolitiase',
    modality: 'ULTRASSOM',
    title: 'USG Abdominal - Nefropatia Crônica e Urolitíase Vesical',
    category: 'USG Abdominal',
    technique: 'Estudo ultrassonográfico abdominal minucioso com ênfase no sistema urinário (rins, ureteres e bexiga).',
    findings: 'RINS: Dimensões reduzidas bilateralmente, contornos irregulares com perda da distinção corticomedular anatômica. Córtex renal difusamente hiperecogênico com presença de múltiplos focos de mineralização na transição córtico-medular.\nBEXIGA URINÁRIA: Repleta, apresentando discreto espessamento parietal irregular difuso (3.2 mm). No lúmen vesical identifica-se estrutura hiperecogênica arciforme móvel à mudança de decúbito, medindo aproximadamente 14.2 mm, projetando sombra acústica posterior limpa. Quantidade moderada de sedimento celular em suspensão.\nFÍGADO E DEMAIS ÓRGÃOS: Sem alterações ecográficas significativas.',
    conclusion: '1. Sinais ultrassonográficos compatíveis com Nefropatia Crônica bilateral em estágio avançado.\n2. Urolitíase vesical única e cistite associada.\n3. Sedimento celular vesical aumentado.',
    recommendations: 'Avaliação da função renal sérica (Ureia, Creatinina, SDMA, eletrólitos) e Urinálise tipo I com urocultura e antibiograma. Considerar intervenção cirúrgica (cistotomia) ou manejo dietoterápico para dissolução conforme o tipo de cálculo.'
  },
  {
    id: 'tpl-usg-gestacional',
    modality: 'ULTRASSOM',
    title: 'USG Gestacional - Acompanhamento Obstétrico e Viabilidade Fetal',
    category: 'USG Gestacional',
    technique: 'Ultrassonografia obstétrica com Doppler colorido para identificação de vesículas gestacionais, viabilidade e frequência cardíaca fetal.',
    findings: 'ÚTERO: Gravídico. Identificadas 4 (quatro) vesículas gestacionais contendo concepto e líquido amniótico anecogênico límpido em volume adequado.\nVIABILIDADE FETAL: Todos os conceptos apresentam movimentação ativa e atividade cardíaca rítmica vigorosa ao Doppler.\nFREQUÊNCIA CARDÍACA FETAL (BCF): Média de 230 a 240 bpm (Normal > 220 bpm), sem indícios de sofrimento fetal no momento do exame.\nPLACENTAS: Zonal típica, sem áreas de descolamento ou hematomas retroplacentários observados.\nESTIMATIVA DE IDADE GESTACIONAL: Aproximadamente 32 a 35 dias (baseado no diâmetro biparietal e comprimento coronha-garupa).',
    conclusion: '1. Gestação tópica compatível com aproximadamente 5 semanas de evolução.\n2. Viabilidade fetal preservada para todas as 4 vesículas avaliadas, sem sinais ecográficos de sofrimento fetal.',
    recommendations: 'Repetir o exame por volta dos 50 a 55 dias de gestação para reavaliação de viabilidade pré-parto e contagem radiográfica confirmatória do número exato de fetos.'
  },
  {
    id: 'tpl-usg-afast-emergencia',
    modality: 'ULTRASSOM',
    title: 'USG Emergencial (A-FAST) - Trauma / Líquido Livre Abdominal',
    category: 'USG Urgência',
    technique: 'Protocolo focado A-FAST (Abdominal Focused Assessment with Sonography for Trauma) avaliando os 4 sítios acústicos fundamentais: Diafragmático-Hepático (DH), Esplenorrenal (SR), Cistocólico (CC) e Hepatorrenal (HR).',
    findings: 'SÍTIO DIAFRAGMÁTICO-HEPÁTICO (DH): Presença de lâmina de fluido anecogênico livre entre os lobos hepáticos e o diafragma.\nSÍTIO ESPLENORRENAL (SR): Acúmulo evidente de líquido livre anecogênico/hipoecogênico circundando o polo caudal esplênico e rim esquerdo.\nSÍTIO CISTOCÓLICO (CC): Líquido livre detectado perivesical.\nSÍTIO HEPATORRENAL (HR): Líquido livre evidente no recesso.\nSCORE DE LÍQUIDO LIVRE (AFS - Abdominal Fluid Score): 4/4 (Volume de líquido livre abdominal significativo).\nINTEGRIDADE VESICAL: Bexiga urinária íntegra, com contornos mantidos.',
    conclusion: 'A-FAST Positivo (Score 4/4): Efusão abdominal volumosa livre (hemoperitônio / uroperitônio pós-traumático a diferenciar).',
    recommendations: 'Abdominocentese imediata guiada por ultrassom para análise citológica e bioquímica do líquido (hematócrito, creatinina e potássio do fluido vs sérico). Estabilização hemodinâmica emergencial e suporte cirúrgico.'
  }
];
