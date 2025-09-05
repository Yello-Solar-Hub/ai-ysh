import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const ProposalCardSchema = baseCardSchema;
export type ProposalCardProps = BaseCardProps;

export function ProposalCard(props: ProposalCardProps) {
  return <BaseCard {...props} />;
}

export default ProposalCard;
