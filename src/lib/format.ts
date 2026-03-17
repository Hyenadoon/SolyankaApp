export function formatMinutes(value: number | null | undefined) {
  if (!value || value <= 0) {
    return 'Без спешки';
  }
  return `${value} мин`;
}

export function formatAmount(amount: number | null | undefined, unit: string | null | undefined) {
  if (amount == null && !unit) {
    return 'Без точного количества';
  }
  if (amount == null) {
    return unit ?? 'Без точного количества';
  }
  if (!unit) {
    return `${amount}`;
  }
  return `${amount} ${unit}`;
}

export function formatRublesFromCents(priceCents: number | null | undefined) {
  if (priceCents == null) {
    return 'Цена уточняется';
  }
  return `${Math.round(priceCents / 100)} руб`;
}

export function sumMissingIngredientsCost(missingIngredients: Array<{ cheapest_product?: { price_cents: number | null } | null }>) {
  const total = missingIngredients.reduce((sum, item) => sum + (item.cheapest_product?.price_cents ?? 0), 0);
  return formatRublesFromCents(total);
}
