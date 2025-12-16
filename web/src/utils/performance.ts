import { Constant } from "./constant";

export class PerformanceTimer {
  private start: number;
  private readonly label: string;

  constructor(label: string) {
    this.start = performance.now();
    this.label = label;
  }

  public reset(): void {
    this.start = performance.now();
  }

  public elapsed(): number {
    return performance.now() - this.start;
  }

  public log(): void {
    if (Constant.IS_DEV) {
      console.log(`[Performance] ${this.label}: ${this.elapsed().toFixed(2)}ms`);
    }
  }
}
