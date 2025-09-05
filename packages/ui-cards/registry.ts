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

export const registry: Record<string, CardMeta> = {
  Intent: { component: IntentCard, actions: ["Run", "Preview", "Export"] },
  Panel: { component: PanelCard, actions: ["Run", "Preview", "Export"] },
  Opportunity: { component: OpportunityCard, actions: ["Run", "Preview", "Export"] },
  Expansion: { component: ExpansionCard, actions: ["Run", "Preview", "Export"] },
  Optimization: { component: OptimizationCard, actions: ["Run", "Preview", "Export"] },
  Lead: { component: LeadCard, actions: ["Run", "Preview", "Export"] },
  Anomalies: { component: AnomaliesCard, actions: ["Run", "Preview", "Export"] },
  Risk: { component: RiskCard, actions: ["Run", "Preview", "Export"] },
  Compliance: { component: ComplianceCard, actions: ["Run", "Preview", "Export"] },
  Consumption: { component: ConsumptionCard, actions: ["Run", "Preview", "Export"] },
  Technical: { component: TechnicalCard, actions: ["Run", "Preview", "Export"] },
  Financial: { component: FinancialCard, actions: ["Run", "Preview", "Export"] },
  Financing: { component: FinancingCard, actions: ["Run", "Preview", "Export"] },
  PreSizing: { component: PreSizingCard, actions: ["Run", "Preview", "Export"] },
  SystemSize: { component: SystemSizeCard, actions: ["Run", "Preview", "Export"] },
  Layout: { component: LayoutCard, actions: ["Run", "Preview", "Export"] },
  Generation: { component: GenerationCard, actions: ["Run", "Preview", "Export"] },
  Cost: { component: CostCard, actions: ["Run", "Preview", "Export"] },
  BOM: { component: BOMCard, actions: ["Run", "Preview", "Export"] },
  ProductRecs: { component: ProductRecsCard, actions: ["Run", "Preview", "Export"] },
  Proposal: { component: ProposalCard, actions: ["Run", "Preview", "Export"] },
  Contract: { component: ContractCard, actions: ["Run", "Preview", "Export"] },
  MarketData: { component: MarketDataCard, actions: ["Run", "Preview", "Export"] },
};

export default registry;
