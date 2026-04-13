import { RateCalculator } from "@/components/rate-calculator/rate-calculator";

export default function RateCalculatorPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Rate Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calculate your rates based on platform, content type, and market data.
        </p>
      </div>
      <RateCalculator />
    </div>
  );
}
