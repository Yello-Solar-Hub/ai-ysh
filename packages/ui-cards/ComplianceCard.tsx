import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const ComplianceCardSchema = baseCardSchema;
export type ComplianceCardProps = BaseCardProps;

export function ComplianceCard(props: ComplianceCardProps) {
  return <BaseCard {...props} />;
}

export default ComplianceCard;
