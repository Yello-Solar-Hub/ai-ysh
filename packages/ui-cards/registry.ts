import type { BaseCardProps } from "./BaseCard";
import { IntentCard } from "./IntentCard";
import { PanelCard } from "./PanelCard";
import { OpportunityCard } from "./OpportunityCard";
import { ExpansionCard } from "./ExpansionCard";
import { OptimizationCard } from "./OptimizationCard";
import { LeadCard } from "./LeadCard";
import { AnomaliesCard } from "./AnomaliesCard";
import { RiskCard } from "./RiskCard";
import { ComplianceCard } from "./ComplianceCard";
import { ConsumptionCard } from "./ConsumptionCard";
import { TechnicalCard } from "./TechnicalCard";
import { FinancialCard } from "./FinancialCard";
import { FinancingCard } from "./FinancingCard";
import { PreSizingCard } from "./PreSizingCard";
import { SystemSizeCard } from "./SystemSizeCard";
import { LayoutCard } from "./LayoutCard";
import { GenerationCard } from "./GenerationCard";
import { CostCard } from "./CostCard";
import { BOMCard } from "./BOMCard";
import { ProductRecsCard } from "./ProductRecsCard";
import { ProposalCard } from "./ProposalCard";
import { ContractCard } from "./ContractCard";
import { MarketDataCard } from "./MarketDataCard";

export type CardComponent = (props: BaseCardProps) => JSX.Element;

export interface CardMeta {
  component: CardComponent;
  actions: Array<"Run" | "Preview" | "Export">;
}

const COMMON_ACTIONS: Array<"Run" | "Preview" | "Export"> = ["Run", "Preview", "Export"];

export const registry: Record<string, CardMeta> = {
  Intent: { component: IntentCard, actions: COMMON_ACTIONS },
  Panel: { component: PanelCard, actions: COMMON_ACTIONS },
  Opportunity: { component: OpportunityCard, actions: COMMON_ACTIONS },
  Expansion: { component: ExpansionCard, actions: COMMON_ACTIONS },
  Optimization: { component: OptimizationCard, actions: COMMON_ACTIONS },
  Lead: { component: LeadCard, actions: COMMON_ACTIONS },
  Anomalies: { component: AnomaliesCard, actions: COMMON_ACTIONS },
  Risk: { component: RiskCard, actions: COMMON_ACTIONS },
  Compliance: { component: ComplianceCard, actions: COMMON_ACTIONS },
  Consumption: { component: ConsumptionCard, actions: COMMON_ACTIONS },
  Technical: { component: TechnicalCard, actions: COMMON_ACTIONS },
  Financial: { component: FinancialCard, actions: COMMON_ACTIONS },
  Financing: { component: FinancingCard, actions: COMMON_ACTIONS },
  PreSizing: { component: PreSizingCard, actions: COMMON_ACTIONS },
  SystemSize: { component: SystemSizeCard, actions: COMMON_ACTIONS },
  Layout: { component: LayoutCard, actions: COMMON_ACTIONS },
  Generation: { component: GenerationCard, actions: COMMON_ACTIONS },
  Cost: { component: CostCard, actions: COMMON_ACTIONS },
  BOM: { component: BOMCard, actions: COMMON_ACTIONS },
  ProductRecs: { component: ProductRecsCard, actions: COMMON_ACTIONS },
  Proposal: { component: ProposalCard, actions: COMMON_ACTIONS },
  Contract: { component: ContractCard, actions: COMMON_ACTIONS },
  MarketData: { component: MarketDataCard, actions: COMMON_ACTIONS },
};

export default registry;
