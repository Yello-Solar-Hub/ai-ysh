import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const BOMCardSchema = baseCardSchema;
export type BOMCardProps = BaseCardProps;

export function BOMCard(props: BOMCardProps) {
  return <BaseCard {...props} />;
}

export default BOMCard;
