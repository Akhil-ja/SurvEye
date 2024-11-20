import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateSurveyPrice } from "@/utils/calculatePrice";

const SurveyPriceCalculator = ({ pages, surveyData }) => {
  const [price, setPrice] = useState({ totalPrice: 0, breakdown: {} });

  useEffect(() => {
    if (!surveyData || !pages) return;

    // Calculate duration in days
    const startDate = new Date(surveyData.duration.startDate);
    const endDate = new Date(surveyData.duration.endDate);
    const durationDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const calculatedPrice = calculateSurveyPrice(
      pages,
      surveyData.sampleSize,
      durationDays
    );

    setPrice(calculatedPrice);
  }, [pages, surveyData]);

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Survey Price Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Cost ({pages.length} pages):</span>
            <span className="font-semibold">
              ${price.breakdown.basePagesCost?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              Sample Size Adjustment ({surveyData.sampleSize} participants):
            </span>
            <span className="font-semibold">
              ${price.breakdown.sampleSizeCost?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Duration Adjustment:</span>
            <span className="font-semibold">
              ${price.breakdown.durationCost?.toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Price:</span>
              <span className="text-primary">${price.totalPrice}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyPriceCalculator;
