import { DollarSign } from "lucide-react";
import { PriceIndicator as PriceIndicatorType } from "../modelSelectConfig";
export const PriceIndicator = ({ level }: { level: PriceIndicatorType }) => {
  const getColor = (index: number) => {
    if (level === PriceIndicatorType.LOW && index === 0)
      return "text-success-500";
    if (level === PriceIndicatorType.MEDIUM && index <= 1)
      return "text-warning-500";
    if (level === PriceIndicatorType.HIGH && index <= 2)
      return "text-error-500";
    return "text-neutral-300";
  };

  return (
    <div className="flex items-center -space-x-1">
      {[0, 1, 2].map((index) => (
        <DollarSign key={index} className={`w-3.5 ${getColor(index)}`} />
      ))}
    </div>
  );
};
