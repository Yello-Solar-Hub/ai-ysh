import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const FinancialCardSchema = baseCardSchema;
export type FinancialCardProps = BaseCardProps;

export function FinancialCard(props: FinancialCardProps) {
  return <BaseCard {...props} />;
}

export default FinancialCard;
