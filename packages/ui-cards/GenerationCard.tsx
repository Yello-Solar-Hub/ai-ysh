import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const GenerationCardSchema = baseCardSchema;
export type GenerationCardProps = BaseCardProps;

export function GenerationCard(props: GenerationCardProps) {
  return <BaseCard {...props} />;
}

export default GenerationCard;
