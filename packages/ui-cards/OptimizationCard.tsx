import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const OptimizationCardSchema = baseCardSchema;
export type OptimizationCardProps = BaseCardProps;

export function OptimizationCard(props: OptimizationCardProps) {
  return <BaseCard {...props} />;
}

export default OptimizationCard;
