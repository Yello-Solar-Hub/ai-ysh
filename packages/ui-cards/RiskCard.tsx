import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const RiskCardSchema = baseCardSchema;
export type RiskCardProps = BaseCardProps;

export function RiskCard(props: RiskCardProps) {
  return <BaseCard {...props} />;
}

export default RiskCard;
