# Arquitetura de Dados, Persistência e Inteligência Analítica

## 1) Schemas de Banco de Dados

> **Stack alvo:** PostgreSQL 15+ com `UUID`, `JSONB`, `TIMESTAMPTZ`, índices BTREE/GIN e particionamento para eventos volumétricos.

## 1.1 Tabela `accounts`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Identificador da conta/tenant |
| legal_name | VARCHAR(180) | NOT NULL | Razão social |
| trade_name | VARCHAR(180) | NULL | Nome fantasia |
| document | VARCHAR(20) | UNIQUE, NOT NULL | CNPJ/CPF normalizado |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'active' | Estado da conta |
| settings | JSONB | NOT NULL, DEFAULT '{}'::jsonb | Configurações da conta |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Auditoria |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Auditoria |

- **[User Inputs]:** cadastro da empresa (nome, documento, preferências).
- **[System Outputs]:** `id` da conta, `settings` padronizado, trilha temporal.
- **[Outcomes Esperados]:** segregação multi-tenant e governança por conta.
- **[Variáveis de Contexto]:** índice `ux_accounts_document`; lock otimista por `updated_at`.

## 1.2 Tabela `users`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Usuário global |
| account_id | UUID | FK -> accounts.id, NOT NULL | Tenant do usuário |
| email | VARCHAR(255) | NOT NULL | E-mail |
| phone_e164 | VARCHAR(20) | NULL | Telefone normalizado |
| full_name | VARCHAR(150) | NOT NULL | Nome completo |
| role | VARCHAR(30) | NOT NULL | owner/integrator/analyst/admin |
| preferences | JSONB | NOT NULL, DEFAULT '{}'::jsonb | Preferências da UX |
| created_at | TIMESTAMPTZ | NOT NULL | Auditoria |
| updated_at | TIMESTAMPTZ | NOT NULL | Auditoria |

- **[User Inputs]:** dados de autenticação e perfil.
- **[System Outputs]:** perfil consolidado e permissões por papel.
- **[Outcomes Esperados]:** rastreabilidade de autoria e controle de acesso.
- **[Variáveis de Contexto]:** índice composto `(account_id, email)` único.

## 1.3 Tabela `leads`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Lead único |
| account_id | UUID | FK -> accounts.id, NOT NULL | Tenant do lead |
| source | VARCHAR(40) | NOT NULL | whatsapp/site/callcenter/campaign |
| external_ref | VARCHAR(120) | NULL | ID externo de origem |
| name | VARCHAR(150) | NOT NULL | Nome do lead |
| phone_e164 | VARCHAR(20) | NOT NULL | Contato |
| email | VARCHAR(255) | NULL | Contato secundário |
| address_raw | TEXT | NULL | Endereço como recebido |
| address_geo | JSONB | NULL | latitude/longitude + precisão |
| profile_data | JSONB | NOT NULL, DEFAULT '{}'::jsonb | Enriquecimentos |
| status | VARCHAR(40) | NOT NULL | new/validated/enriched/qualified/lost |
| created_at | TIMESTAMPTZ | NOT NULL | Auditoria |
| updated_at | TIMESTAMPTZ | NOT NULL | Auditoria |

- **[User Inputs]:** cadastro manual, chatbot, CRM ou webhook.
- **[System Outputs]:** lead validado e enriquecido (`profile_data`).
- **[Outcomes Esperados]:** melhor roteamento comercial e redução de duplicidade.
- **[Variáveis de Contexto]:** índice `GIN(profile_data)`; deduplicação por `(account_id, phone_e164)`.

## 1.4 Tabela `sites`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Unidade consumidora/local |
| lead_id | UUID | FK -> leads.id, NOT NULL | Lead proprietário |
| distributor_code | VARCHAR(20) | NULL | Código da concessionária |
| uc_number | VARCHAR(40) | NULL | Número da unidade consumidora |
| roof_area_m2 | NUMERIC(10,2) | NULL | Área útil de telhado |
| roof_type | VARCHAR(40) | NULL | cerâmico/metálico/laje etc. |
| geolocation | JSONB | NULL | lat/lng + altitude |
| constraints | JSONB | NOT NULL, DEFAULT '{}'::jsonb | sombreamento/regras locais |
| created_at | TIMESTAMPTZ | NOT NULL | Auditoria |
| updated_at | TIMESTAMPTZ | NOT NULL | Auditoria |

- **[User Inputs]:** endereço, fotos, informações técnicas locais.
- **[System Outputs]:** parâmetros técnicos do local para dimensionamento.
- **[Outcomes Esperados]:** precisão técnica na proposta.
- **[Variáveis de Contexto]:** índice espacial via extensão (opcional PostGIS).

## 1.5 Tabela `energy_bills`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Fatura processada |
| site_id | UUID | FK -> sites.id, NOT NULL | Unidade associada |
| billing_month | DATE | NOT NULL | Competência (1º dia do mês) |
| kwh_consumed | NUMERIC(12,3) | NOT NULL | Consumo |
| amount_brl | NUMERIC(12,2) | NOT NULL | Valor total |
| tariff_brl_kwh | NUMERIC(10,5) | NULL | Tarifa média |
| invoice_payload | JSONB | NOT NULL | OCR/extração estruturada |
| source_file_url | TEXT | NULL | Local do arquivo |
| quality_score | NUMERIC(5,2) | DEFAULT 0 | Confiabilidade extração |
| created_at | TIMESTAMPTZ | NOT NULL | Auditoria |

- **[User Inputs]:** upload de conta, leitura OCR, integração API.
- **[System Outputs]:** série temporal de consumo/tarifa confiável.
- **[Outcomes Esperados]:** base para cálculo de economia e viabilidade.
- **[Variáveis de Contexto]:** unique `(site_id, billing_month)`; lock de idempotência por hash do arquivo.

## 1.6 Tabela `dimensioning_runs`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Execução de dimensionamento |
| site_id | UUID | FK -> sites.id, NOT NULL | Local avaliado |
| input_snapshot | JSONB | NOT NULL | Input congelado para reproducibilidade |
| panel_model | VARCHAR(80) | NOT NULL | Modelo do módulo |
| inverter_model | VARCHAR(80) | NOT NULL | Modelo do inversor |
| system_kwp | NUMERIC(10,3) | NOT NULL | Potência pico sugerida |
| estimated_monthly_gen_kwh | NUMERIC(12,3) | NOT NULL | Geração mensal estimada |
| losses_pct | NUMERIC(5,2) | NOT NULL | Perdas globais |
| warnings | JSONB | NOT NULL, DEFAULT '[]'::jsonb | Alertas de regra |
| created_by | UUID | FK -> users.id, NOT NULL | Autor |
| created_at | TIMESTAMPTZ | NOT NULL | Auditoria |

- **[User Inputs]:** restrições do projeto e parâmetros de equipamento.
- **[System Outputs]:** configuração técnica recomendada e alertas.
- **[Outcomes Esperados]:** desenho validado para proposta comercial.
- **[Variáveis de Contexto]:** índice `(site_id, created_at desc)` para recuperar última simulação.

## 1.7 Tabela `viability_analyses`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Análise econômico-financeira |
| dimensioning_run_id | UUID | FK -> dimensioning_runs.id, NOT NULL | Base técnica |
| financing_terms | JSONB | NOT NULL | taxa, prazo, entrada |
| capex_brl | NUMERIC(14,2) | NOT NULL | Investimento |
| opex_year_brl | NUMERIC(14,2) | NOT NULL | OPEX anual |
| npv_brl | NUMERIC(14,2) | NOT NULL | VPL |
| irr_pct | NUMERIC(7,4) | NULL | TIR |
| payback_months | INT | NULL | Retorno |
| lcoe_brl_kwh | NUMERIC(10,5) | NULL | Custo nivelado de energia |
| scenario_matrix | JSONB | NOT NULL | cenários base/otimista/pessimista |
| created_at | TIMESTAMPTZ | NOT NULL | Auditoria |

- **[User Inputs]:** preço de equipamentos, taxa de desconto, inflação energética.
- **[System Outputs]:** KPIs financeiros para decisão.
- **[Outcomes Esperados]:** priorização de negócios com maior retorno.
- **[Variáveis de Contexto]:** índice parcial por `npv_brl > 0`; lock por versão de cenário.

## 1.8 Tabela `analytics_events` (particionada)

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| id | UUID | PK | Evento |
| account_id | UUID | FK -> accounts.id, NOT NULL | Tenant |
| event_ts | TIMESTAMPTZ | NOT NULL | Instante do evento |
| event_name | VARCHAR(80) | NOT NULL | Nome lógico do evento |
| actor_user_id | UUID | FK -> users.id, NULL | Usuário de origem |
| entity_type | VARCHAR(50) | NULL | lead/site/proposal |
| entity_id | UUID | NULL | Entidade relacionada |
| payload | JSONB | NOT NULL | Dados do evento |

- **[User Inputs]:** cliques, mudanças de status, disparos de automação.
- **[System Outputs]:** trilha de eventos para BI near-real-time.
- **[Outcomes Esperados]:** inteligência de funil e monitoramento operacional.
- **[Variáveis de Contexto]:** partição mensal por `event_ts`; índice `GIN(payload)`.

---

## 2) Relacionamentos e Datasets

## 2.1 Cardinalidade

- `accounts (1) -> (N) users`
- `accounts (1) -> (N) leads`
- `leads (1) -> (N) sites`
- `sites (1) -> (N) energy_bills`
- `sites (1) -> (N) dimensioning_runs`
- `dimensioning_runs (1) -> (N) viability_analyses`
- `accounts (1) -> (N) analytics_events`

### Relação N:N (via tabela ponte)

`tags` e `lead_tags`:
- `tags(id, account_id, name)`
- `lead_tags(lead_id, tag_id, created_at)`

Uso: segmentação comercial e campanhas dinâmicas.

## 2.2 Datasets e origens

| Dataset | Origem | Latência | Qualidade |
|---|---|---|---|
| Cadastro de leads | WhatsApp API, formulários web, CRM | segundos/minutos | validação sintática + dedupe |
| Consumo energético | OCR de conta, integração concessionária | minutos/horas | score de extração + reconciliação |
| Dados geoespaciais | Geocoding provider + input manual | segundos | precisão por nível (rooftop/range) |
| Catálogo de equipamentos | ERP/inventário + curadoria técnica | diária | versionamento por fornecedor |
| Eventos de produto | tracking interno | near-real-time | schema registry + DLQ |

- **[User Inputs]:** payloads externos heterogêneos.
- **[System Outputs]:** datasets conformados em modelo canônico.
- **[Outcomes Esperados]:** visão unificada e auditável do pipeline.
- **[Variáveis de Contexto]:** SLA por fonte, regras de retry, DLQ.

---

## 3) Estruturas de Arquivos JSON

## 3.1 Payload de criação/atualização de lead

```json
{
  "event_id": "f4cb5d85-fd6b-42e7-bf7c-711d609ebb36",
  "source": "whatsapp",
  "timestamp": "2026-05-23T14:42:11Z",
  "account_id": "37f1adbd-fec9-4202-bd8f-e60415ec8623",
  "lead": {
    "external_ref": "wa-msg-9938831",
    "name": "Carlos Mendes",
    "phone_e164": "+5511999999999",
    "email": "carlos.mendes@email.com",
    "address_raw": "Rua das Acácias, 123 - Campinas/SP"
  },
  "consent": {
    "lgpd_opt_in": true,
    "channel": "whatsapp",
    "collected_at": "2026-05-23T14:42:05Z"
  }
}
```

## 3.2 Snapshot de dimensionamento

```json
{
  "site_id": "a1dcd110-35e0-4f78-a55b-69175eaefe20",
  "roof": {
    "area_m2": 86.5,
    "azimuth_deg": 12,
    "tilt_deg": 18,
    "shading_factor": 0.91
  },
  "consumption": {
    "avg_monthly_kwh": 742.3,
    "seasonality_index": [1.02, 0.97, 0.95, 0.93, 0.90, 0.88, 0.92, 0.99, 1.03, 1.06, 1.10, 1.15]
  },
  "equipment_constraints": {
    "allowed_panel_models": ["P550-MONO", "P585-TOPCON"],
    "max_inverter_kw": 8.0
  }
}
```

## 3.3 Configuração de regras analíticas (`analytics-rules.json`)

```json
{
  "version": "2026.05.23",
  "currency": "BRL",
  "discount_rate_annual": 0.1225,
  "energy_tariff_growth_annual": 0.065,
  "default_losses_pct": 17.5,
  "validation": {
    "min_bills_required": 6,
    "max_roof_shading": 0.35,
    "max_payback_months": 84
  },
  "weights": {
    "npv": 0.45,
    "payback": 0.30,
    "roof_feasibility": 0.25
  }
}
```

- **[User Inputs]:** eventos de canais, anexos, parâmetros técnicos e de negócio.
- **[System Outputs]:** documentos normalizados, snapshots imutáveis e regras versionadas.
- **[Outcomes Esperados]:** reprocessamento confiável, auditoria e explicabilidade.
- **[Variáveis de Contexto]:** `version`, `event_id`, hash do payload para idempotência.

---

## 4) Lógicas e Cálculos

## 4.1 Validação e normalização de lead

### Regras
1. `phone_e164` deve seguir regex `^\+[1-9]\d{7,14}$`.
2. Duplicidade: mesmo `(account_id, phone_e164)` em janela de 90 dias => `status=duplicated_candidate`.
3. Score de completude:

\[
score = 25\cdot has\_name + 25\cdot has\_phone + 20\cdot has\_address + 15\cdot has\_email + 15\cdot has\_consent
\]

- **[User Inputs]:** nome, telefone, endereço, consentimento.
- **[System Outputs]:** lead normalizado + `quality_score`.
- **[Outcomes Esperados]:** redução de retrabalho comercial e erro cadastral.
- **[Variáveis de Contexto]:** janela temporal de dedupe (90 dias), threshold mínimo de score (>=70).

## 4.2 Cálculo de consumo de referência

Se há histórico de 12 meses:
\[
consumo\_medio = \frac{\sum_{m=1}^{12} kwh_m}{12}
\]

Se há 6 a 11 meses, usar média ponderada por sazonalidade regional:
\[
consumo\_anual\_estimado = \sum_{m=1}^{12}(\hat{kwh}_m) \quad ; \quad consumo\_medio = \frac{consumo\_anual\_estimado}{12}
\]

- **[User Inputs]:** série mensal de faturas.
- **[System Outputs]:** baseline de consumo para dimensionamento.
- **[Outcomes Esperados]:** melhor aderência da geração projetada.
- **[Variáveis de Contexto]:** mínimo de 6 contas; índice sazonal por distribuidora.

## 4.3 Dimensionamento fotovoltaico

\[
P_{kwp} = \frac{consumo\_medio\_{kwh} \cdot 12}{HSP\_{anual} \cdot PR}
\]

Onde:
- `HSP_anual`: horas de sol pleno anual equivalente.
- `PR`: performance ratio (ex.: `0.78` a `0.85`).

Limites:
- `P_kwp <= max_inverter_kw * 1.3`
- `módulos = ceil((P_kwp*1000)/Wp_modulo)`

- **[User Inputs]:** consumo médio, HSP local, limites de equipamento.
- **[System Outputs]:** potência sugerida e quantidade de módulos.
- **[Outcomes Esperados]:** sistema tecnicamente viável com menor oversizing.
- **[Variáveis de Contexto]:** PR dinâmico por sombreamento e temperatura.

## 4.4 Viabilidade financeira (VPL, TIR, Payback)

Fluxo de caixa mensal:
\[
FC_t = Economia_t - ParcelaFin_t - OPEX_t
\]

VPL:
\[
VPL = -CAPEX + \sum_{t=1}^{n} \frac{FC_t}{(1+i)^t}
\]

Payback simples:
- menor `t` tal que `\sum_{j=1}^{t} FC_j >= CAPEX`.

TIR:
- taxa `r` que zera o VPL: `VPL(r)=0` (Newton-Raphson com fallback bisseção).

- **[User Inputs]:** CAPEX, taxa de desconto, tarifa, financiamento.
- **[System Outputs]:** `npv_brl`, `irr_pct`, `payback_months`.
- **[Outcomes Esperados]:** decisão objetiva de investimento.
- **[Variáveis de Contexto]:** inflação tarifária, degradação anual dos módulos, inadimplência estimada.

## 4.5 Score de priorização comercial

\[
score\_{prioridade} = 100 \cdot (w_1\cdot norm(VPL) + w_2\cdot norm(1/Payback) + w_3\cdot fit\_tecnico)
\]

Com `w1+w2+w3=1` e pesos configuráveis no JSON de regras.

- **[User Inputs]:** KPIs técnicos + financeiros.
- **[System Outputs]:** ranking de leads/projetos.
- **[Outcomes Esperados]:** aumento de conversão e foco em maior margem.
- **[Variáveis de Contexto]:** pesos por estratégia trimestral, limites de risco por carteira.

---

## Recomendações de Performance, Concorrência e Governança

1. **Índices**
   - BTREE: FKs e filtros temporais (`created_at`, `billing_month`).
   - GIN: colunas `JSONB` consultadas por chave.
   - Índices parciais para status críticos (`status in ('qualified','proposal_sent')`).

2. **Concorrência/locking**
   - `SELECT ... FOR UPDATE SKIP LOCKED` para workers de filas.
   - Idempotência por `event_id` + unique constraint.
   - `UPSERT` (`ON CONFLICT`) para ingestões repetidas.

3. **Particionamento e retenção**
   - `analytics_events` por mês.
   - Política de retenção: bruto 13 meses, agregado 5 anos.

4. **Qualidade e observabilidade**
   - Testes de contrato de schema (JSON Schema/TypeBox).
   - Métricas: latência de ingestão, taxa de erro OCR, taxa de dedupe.
   - DLQ com reprocessamento controlado.

5. **Segurança e LGPD**
   - Criptografia em repouso e em trânsito.
   - Mascaramento de PII em ambientes não produtivos.
   - Trilhas de auditoria para acesso e mutação de dados sensíveis.
