import React from "react";
import { z } from "zod";
import { BaseCard, baseCardSchema, BaseCardProps } from "./BaseCard";

export const ProductRecsCardSchema = baseCardSchema;
export type ProductRecsCardProps = BaseCardProps;

export function ProductRecsCard(props: ProductRecsCardProps) {
  return <BaseCard {...props} />;
}

export default ProductRecsCard;
