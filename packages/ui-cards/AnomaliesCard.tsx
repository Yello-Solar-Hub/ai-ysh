import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const AnomaliesCardSchema = baseCardSchema;
export type AnomaliesCardProps = BaseCardProps;

export function AnomaliesCard(props: AnomaliesCardProps) {
  return <BaseCard {...props} />;
}

export default AnomaliesCard;
