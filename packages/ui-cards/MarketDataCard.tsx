import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const MarketDataCardSchema = baseCardSchema;
export type MarketDataCardProps = BaseCardProps;

export function MarketDataCard(props: MarketDataCardProps) {
  return <BaseCard {...props} />;
}

export default MarketDataCard;
