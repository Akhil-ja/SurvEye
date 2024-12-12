export const calculateSurveyPrice = (pages, sampleSize, durationDays) => {
  const basePagePrice = 0.05;

  const sampleSizeMultiplier = (sampleSize / 20) * 0.05;

  const durationFactor = Math.max(0.05, 1 - durationDays / 90);

  const pagesCost = pages.length * basePagePrice;
  const sampleSizeCost = pagesCost * sampleSizeMultiplier;
  const durationCost = (pagesCost + sampleSizeCost) * durationFactor;

  const totalPrice = pagesCost + sampleSizeCost + durationCost;

  return {
    totalPrice: totalPrice.toFixed(3),
    breakdown: {
      basePagesCost: pagesCost.toFixed(3),
      sampleSizeCost: sampleSizeCost.toFixed(3),
      durationCost: durationCost.toFixed(3),
    },
  };
};
