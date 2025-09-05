import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const LeadCardSchema = baseCardSchema;
export type LeadCardProps = BaseCardProps;

export function LeadCard(props: LeadCardProps) {
  return <BaseCard {...props} />;
}

export default LeadCard;
