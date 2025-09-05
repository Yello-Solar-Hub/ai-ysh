import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const SystemSizeCardSchema = baseCardSchema;
export type SystemSizeCardProps = BaseCardProps;

export function SystemSizeCard(props: SystemSizeCardProps) {
  return <BaseCard {...props} />;
}

export default SystemSizeCard;
