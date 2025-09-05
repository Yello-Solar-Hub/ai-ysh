import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const PreSizingCardSchema = baseCardSchema;
export type PreSizingCardProps = BaseCardProps;

export function PreSizingCard(props: PreSizingCardProps) {
  return <BaseCard {...props} />;
}

export default PreSizingCard;
