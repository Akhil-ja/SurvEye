export const calculateSurveyPrice = (pages, sampleSize, durationDays) => {
  const basePagePrice = 5;

  const sampleSizeMultiplier = Math.ceil(sampleSize / 20) * 0.5;

  const durationFactor = Math.max(0.5, 1 - durationDays / 90);

  const pagesCost = pages.length * basePagePrice;
  const sampleSizeCost = pagesCost * sampleSizeMultiplier;
  const durationCost = (pagesCost + sampleSizeCost) * durationFactor;

  const totalPrice = pagesCost + sampleSizeCost + durationCost;

  return {
    totalPrice: Math.ceil(totalPrice),
    breakdown: {
      basePagesCost: pagesCost,
      sampleSizeCost: sampleSizeCost,
      durationCost: durationCost,
    },
  };
};
