import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const TechnicalCardSchema = baseCardSchema;
export type TechnicalCardProps = BaseCardProps;

export function TechnicalCard(props: TechnicalCardProps) {
  return <BaseCard {...props} />;
}

export default TechnicalCard;
