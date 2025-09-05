import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const PanelCardSchema = baseCardSchema;
export type PanelCardProps = BaseCardProps;

export function PanelCard(props: PanelCardProps) {
  return <BaseCard {...props} />;
}

export default PanelCard;
