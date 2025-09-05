import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const LayoutCardSchema = baseCardSchema;
export type LayoutCardProps = BaseCardProps;

export function LayoutCard(props: LayoutCardProps) {
  return <BaseCard {...props} />;
}

export default LayoutCard;
