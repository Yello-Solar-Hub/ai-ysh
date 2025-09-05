import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const FinancingCardSchema = baseCardSchema;
export type FinancingCardProps = BaseCardProps;

export function FinancingCard(props: FinancingCardProps) {
  return <BaseCard {...props} />;
}

export default FinancingCard;
