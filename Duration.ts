import selfReplacing from "../selfReplacing";

export const milliSeconds = (amount: number): Duration =>
  milliSecond.times(amount);
export const seconds = (amount: number): Duration => second.times(amount);
export const minutes = (amount: number): Duration => minute.times(amount);
export const hours = (amount: number): Duration => hour.times(amount);
export const days = (amount: number): Duration => day.times(amount);
export const weeks = (amount: number): Duration => week.times(amount);

export class Duration {
  private readonly duration: number;

  public constructor(duration: number) {
    if (
      typeof duration === "number" &&
      duration > -Infinity &&
      duration < Infinity
    ) {
      this.duration = duration;
    } else {
      throw new Error(`error in Duration constructor: ${duration}`);
    }
  }

  @selfReplacing
  public get milliSeconds(): number {
    return this.duration / milliSecond.duration;
  }

  @selfReplacing
  public get seconds(): number {
    return this.duration / second.duration;
  }

  public static max(...durations: Duration[]): Duration {
    return durations.reduce((result, duration) =>
      result.milliSeconds < duration.milliSeconds ? duration : result
    );
  }

  public static min(...durations: Duration[]): Duration {
    return durations.reduce((result, duration) =>
      result.milliSeconds > duration.milliSeconds ? duration : result
    );
  }

  public minus(duration: Duration): Duration {
    return new Duration(this.duration - duration.duration);
  }

  public plus(duration: Duration): Duration {
    return new Duration(this.duration + duration.duration);
  }

  public times(factor: number): Duration {
    return new Duration(this.duration * factor);
  }

  public div(factor: number): Duration {
    return new Duration(this.duration / factor);
  }

  public lt(duration: Duration): boolean {
    return this.duration < duration.duration;
  }

  public gt(duration: Duration): boolean {
    return this.duration > duration.duration;
  }

  public cmp(duration: Duration): -1 | 0 | 1 {
    const difference = this.duration - duration.duration;
    return difference < 0 ? -1 : difference > 0 ? 1 : 0;
  }
}

const milliSecond = new Duration(1);
const second = milliSeconds(1e3);
const minute = seconds(60);
const hour = minutes(60);
const day = hours(24);
const week = days(7);
