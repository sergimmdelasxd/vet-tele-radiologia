# 🐾 VetTeleRad — Telerradiologia & Teleultrassonografia Veterinária

Sistema completo e moderno para **Telerradiografia e Ultrassonografia Veterinária**, conectando clínicas e hospitais veterinários parceiros (terceiros) a médicos veterinários radiologistas e ultrassonografistas para emissão ágil de laudos à distância.

---

## 🚀 Como Executar

O servidor de desenvolvimento já está rodando em:
👉 **[http://localhost:3000](http://localhost:3000)**

Para iniciar manualmente:
```bash
cd projeto
npm run dev
```

---

## 👥 Perfis de Acesso e Contas de Teste

A aplicação conta com controle de acesso baseado em papéis (RBAC) e contas pré-configuradas (com botões de **login demo em 1 clique** no portal):

| Tipo de Usuário | E-mail | Senha | Funcionalidades Principais |
| :--- | :--- | :--- | :--- |
| **Clínica Parceira (Terceiro)** | `clinica@vetlife.com.br` | `123456` | Solicitar exames de **Raio-X ou Ultrassom**, anexar cortes/fotos, informar preparo (jejum/tricotomia), acompanhar status em tempo real e baixar laudos oficiais em PDF. |
| **Médica Veterinária Radiologista / Ultrassonografista** | `radiologista@vetrad.com.br` | `123456` | Worklist integrada, filtros por modalidade (Raio-X e Ultrassom), **Visualizador PACS Web**, modelos rápidos estruturados de laudo e assinatura digital com **CRMV**. |
| **Central / Administrador** | `admin@vetrad.com.br` | `admin123` | Visão analítica global, métricas de exames por modalidade (Raio-X vs USG), SLA e gestão de clínicas. |

> 💡 **Novas Clínicas**: Qualquer terceiro pode se registrar diretamente pela página **[Cadastrar Clínica](/cadastro)** informando Nome Fantasia, CNPJ, Responsável Técnico e CRMV.

---

## 🛠️ Recursos de Ultrassonografia (USG) Adicionados

### 1. Pedidos Especializados de Ultrassom
- **Tipos de Ultrassom Suportados**:
  - *Ultrassonografia Abdominal Total*
  - *Acompanhamento Obstétrico / Gestacional (Viabilidade Fetal)*
  - *Ultrassonografia do Trato Urinário (Rins e Bexiga)*
  - *Triagem A-FAST / T-FAST Emergencial (Trauma / Líquido Livre)*
  - *Ultrassonografia Cervical e Tireoide*
  - *Ultrassonografia Ocular*
- **Campos Clínicos Específicos**:
  - Preparo: Jejum alimentar (8h, 12h, Sem Jejum/Emergência)
  - Tricotomia prévia realizada
  - Seleção de órgãos de interesse prioritário (Fígado, Rins, Baço, Bexiga, Pâncreas, Adrenais, etc.)

### 2. Modelos de Laudo de Ultrassom Pré-configurados
- *USG Abdominal Total - Padrão de Normalidade*
- *USG Abdominal - Nefropatia Crônica e Urolitíase Vesical*
- *USG Gestacional - Acompanhamento Obstétrico e Viabilidade Fetal*
- *USG Emergencial (A-FAST) - Trauma / Líquido Livre Peritoneal*

### 3. Laudo Timbrado Oficial de Ultrassonografia
- Cabeçalho específico: *"LAUDO DE ULTRASSONOGRAFIA VETERINÁRIA"*
- Registro de técnica, transdutores, frequências e preparo clínico
- Descrição detalhada dos órgãos avaliados
- Conclusão diagnóstica destacada
- Galeria de cortes ecográficos anexos
- Carimbo com assinatura digital e registro no CRMV

---

## 📁 Estrutura do Projeto

```
vet-tele-radiologia/
├── public/
│   ├── xrays/                     # Radiografias de alta definição para testes
│   │   ├── canine-thorax-lateral.svg
│   │   ├── canine-thorax-vd.svg
│   │   └── canine-limb-fracture.svg
│   └── ultrasound/                # Cortes ultrassonográficos realistas
│       ├── usg-abdominal-liver-kidney.svg
│       ├── usg-gestational-fetus.svg
│       └── usg-bladder-calculus.svg
├── src/
│   ├── app/
│   │   ├── api/exams/             # Endpoints com suporte a Radiografia & Ultrassom
│   │   ├── cadastro/              # Cadastro de clínicas parceiras
│   │   ├── dashboard/             # Painel adaptativo com filtros por modalidade
│   │   ├── laudo/[id]/            # Página de laudo compartilhável
│   │   └── page.tsx               # Landing page institucional
│   ├── components/
│   │   ├── dashboard/NewExamModal.tsx # Envio de novos pedidos de Raio-X e USG
│   │   ├── report/ReportEditor.tsx    # Editor com templates de Raio-X e Ultrassom
│   │   ├── report/ReportDocument.tsx  # Laudo timbrado para impressão e PDF
│   │   └── viewer/DicomXrayViewer.tsx # Visualizador de chapas e cortes ecográficos
│   ├── data/
│   │   └── templates.ts           # Templates veterinários (Raio-X e USG)
│   ├── lib/db.ts                  # Banco de dados persistente com sementes
│   └── types/index.ts             # Tipos TypeScript (ExamModality, Exam, Report)
```
