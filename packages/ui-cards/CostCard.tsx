import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const CostCardSchema = baseCardSchema;
export type CostCardProps = BaseCardProps;

export function CostCard(props: CostCardProps) {
  return <BaseCard {...props} />;
}

export default CostCard;
