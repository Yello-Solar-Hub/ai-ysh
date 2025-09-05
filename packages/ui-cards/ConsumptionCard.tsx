import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const ConsumptionCardSchema = baseCardSchema;
export type ConsumptionCardProps = BaseCardProps;

export function ConsumptionCard(props: ConsumptionCardProps) {
  return <BaseCard {...props} />;
}

export default ConsumptionCard;
