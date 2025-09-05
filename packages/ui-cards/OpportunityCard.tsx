import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const OpportunityCardSchema = baseCardSchema;
export type OpportunityCardProps = BaseCardProps;

export function OpportunityCard(props: OpportunityCardProps) {
  return <BaseCard {...props} />;
}

export default OpportunityCard;
