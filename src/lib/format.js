export function formatMinutes(minutes) {
  if (!minutes && minutes !== 0) {
    return 'Без времени';
  }
  return `${minutes} мин`;
}

export function formatMoneyRub(priceCents) {
  if (priceCents == null) {
    return null;
  }
  return `${Math.round(priceCents / 100)} руб`;
}

export function formatAmount(amount, unit) {
  if (amount == null && !unit) {
    return '';
  }
  if (amount == null) {
    return unit || '';
  }
  return `${amount}${unit ? ` ${unit}` : ''}`;
}

export function getRecipePriceLabel(recipe) {
  if (!recipe?.missing_ingredients?.length) {
    return 'Всё есть';
  }
  const sum = recipe.missing_ingredients.reduce((acc, item) => acc + (item.cheapest_product?.price_cents || 0), 0);
  return sum > 0 ? `${Math.round(sum / 100)} руб` : `Не хватает: ${recipe.missing_ingredients.length}`;
}
