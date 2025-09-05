import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const IntentCardSchema = baseCardSchema;
export type IntentCardProps = BaseCardProps;

export function IntentCard(props: IntentCardProps) {
  return <BaseCard {...props} />;
}

export default IntentCard;
