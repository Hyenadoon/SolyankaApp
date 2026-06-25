export const RECIPE_GOAL_DEFAULT = 'survive';

export const RECIPE_GOAL_TABS = [
  { value: 'gain', label: 'набираю' },
  { value: 'lose', label: 'худею' },
  { value: RECIPE_GOAL_DEFAULT, label: 'выжить' },
];

const GAIN_TERMS = [
  ['говя', 3], ['свин', 3], ['куриц', 2], ['индейк', 2], ['фарш', 3], ['бекон', 2], ['ветчин', 2],
  ['рыб', 2], ['лосос', 3], ['семг', 3], ['сёмг', 3], ['тунец', 2], ['яйц', 2],
  ['творог', 2], ['сыр', 2], ['молок', 1], ['слив', 1], ['сметан', 1], ['йогурт', 1],
  ['рис', 2], ['греч', 2], ['паста', 2], ['макарон', 2], ['картоф', 2], ['хлеб', 1], ['мук', 1],
  ['фасол', 2], ['нут', 2], ['чечев', 2], ['горох', 2], ['орех', 2], ['арахис', 2], ['масло', 1],
];

const LOSE_POSITIVE_TERMS = [
  ['овощ', 2], ['салат', 2], ['капуст', 2], ['огур', 2], ['томат', 2], ['помид', 2], ['перец', 1],
  ['кабач', 2], ['баклаж', 1], ['морков', 1], ['свёкл', 1], ['свекл', 1], ['зелень', 1], ['шпинат', 2],
  ['рыб', 2], ['тунец', 2], ['треск', 2], ['кревет', 2], ['морепр', 2], ['куриц', 1], ['индейк', 2],
  ['яйц', 1], ['творог', 1], ['кефир', 1], ['йогурт', 1], ['суп', 1],
];

const LOSE_NEGATIVE_TERMS = [
  ['сахар', 3], ['мед', 2], ['мёд', 2], ['сироп', 2], ['шоколад', 3], ['варенье', 2], ['джем', 2],
  ['майонез', 3], ['сливоч', 2], ['масло слив', 3], ['масло', 1], ['сыр', 2], ['сметан', 2],
  ['свин', 3], ['бекон', 3], ['колбас', 3], ['ветчин', 2], ['фарш', 2],
  ['паста', 2], ['макарон', 2], ['рис', 1], ['картоф', 1], ['хлеб', 2], ['мук', 2], ['тесто', 2],
];

const GOAL_THRESHOLDS = {
  gain: 7,
  lose: 2,
};

function getIngredientNames(recipe) {
  return [
    recipe?.ingredients,
    recipe?.matched_ingredients,
    recipe?.missing_ingredients,
  ]
    .flatMap((items) => (Array.isArray(items) ? items : []))
    .map((item) => item?.name || item?.ingredient_name || '')
    .filter(Boolean);
}

function getRecipeText(recipe) {
  return [
    recipe?.name,
    recipe?.title,
    recipe?.description,
    ...getIngredientNames(recipe),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreTerms(text, terms) {
  return terms.reduce((score, [term, weight]) => (
    text.includes(term) ? score + weight : score
  ), 0);
}

function getSafeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getRecipeGoalScore(recipe, goal = RECIPE_GOAL_DEFAULT) {
  const text = getRecipeText(recipe);
  const cookingTime = getSafeNumber(recipe?.cooking_time_minutes, 90);
  const ingredientsCount = getIngredientNames(recipe).length || getSafeNumber(recipe?.total_ingredients, 0);

  if (goal === 'gain') {
    return scoreTerms(text, GAIN_TERMS)
      + (ingredientsCount >= 6 ? 1 : 0)
      + (cookingTime >= 30 ? 1 : 0);
  }

  if (goal === 'lose') {
    return scoreTerms(text, LOSE_POSITIVE_TERMS)
      - scoreTerms(text, LOSE_NEGATIVE_TERMS)
      + (cookingTime <= 45 ? 1 : 0)
      + (ingredientsCount <= 8 ? 1 : 0);
  }

  const missingCount = getSafeNumber(recipe?.missing_count, recipe?.ready_to_cook ? 0 : 3);
  const matchedCount = getSafeNumber(recipe?.matched_count, 0);
  const matchRatio = getSafeNumber(recipe?.match_ratio, 0);

  return (recipe?.ready_to_cook ? 20 : 0)
    + Math.max(0, 8 - missingCount * 2)
    + matchedCount
    + matchRatio * 6
    + Math.max(0, 60 - cookingTime) / 10
    + Math.max(0, 10 - ingredientsCount) / 2;
}

export function filterRecipesByGoal(recipes, goal = RECIPE_GOAL_DEFAULT, options = {}) {
  const safeRecipes = Array.isArray(recipes) ? recipes : [];
  if (!safeRecipes.length) return [];

  const scored = safeRecipes.map((recipe, index) => ({
    recipe,
    index,
    score: getRecipeGoalScore(recipe, goal),
  }));

  const threshold = GOAL_THRESHOLDS[goal];
  const minResults = Math.min(options.minResults ?? 3, safeRecipes.length);
  const matched = threshold == null
    ? scored
    : scored.filter((item) => item.score >= threshold);
  const source = matched.length >= minResults ? matched : scored;

  return source
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTime = getSafeNumber(a.recipe?.cooking_time_minutes, 9999);
      const bTime = getSafeNumber(b.recipe?.cooking_time_minutes, 9999);
      if (aTime !== bTime) return aTime - bTime;
      return a.index - b.index;
    })
    .map((item) => item.recipe);
}
