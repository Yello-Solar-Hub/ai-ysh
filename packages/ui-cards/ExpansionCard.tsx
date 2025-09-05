import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const ExpansionCardSchema = baseCardSchema;
export type ExpansionCardProps = BaseCardProps;

export function ExpansionCard(props: ExpansionCardProps) {
  return <BaseCard {...props} />;
}

export default ExpansionCard;
