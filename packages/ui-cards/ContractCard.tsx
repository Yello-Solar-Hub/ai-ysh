import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const ContractCardSchema = baseCardSchema;
export type ContractCardProps = BaseCardProps;

export function ContractCard(props: ContractCardProps) {
  return <BaseCard {...props} />;
}

export default ContractCard;
