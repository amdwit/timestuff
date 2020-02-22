import { Duration, milliSeconds } from './Duration';

interface MomentMethods {
  minus(duration: Duration): Moment;

  minus(moment: Moment): Duration;
}

export class Moment implements MomentMethods {
  private readonly timestamp: Duration;

  private constructor(timestamp: Duration) {
    this.timestamp = timestamp;
  }

  public get age(): Duration {
    return Moment.now().minus(this);
  }

  public get iso(): string {
    return new Date(this.timestamp.milliSeconds).toISOString();
  }

  public static fromTimestamp(timestamp: Duration): Moment {
    return new Moment(timestamp);
  }

  public static fromIso(iso: string): Moment {
    return new Moment(milliSeconds(new Date(iso).valueOf()));
  }

  public static now(): Moment {
    return new Moment(milliSeconds(Date.now()));
  }

  public minus(momentOrDuration: Moment | Duration): any {
    if (momentOrDuration instanceof Moment) {
      return this.timestamp.minus(momentOrDuration.timestamp);
    } else if (momentOrDuration instanceof Duration) {
      return new Moment(this.timestamp.minus(momentOrDuration));
    }
  }

  public plus(duration: Duration): Moment {
    return new Moment(this.timestamp.plus(duration));
  }

  public getTimestamp(): number {
    return this.timestamp.milliSeconds;
  }

  public cmp(moment: Moment): -1 | 0 | 1 {
    return this.timestamp.cmp(moment.timestamp);
  }

  public eq(moment: Moment): boolean {
    return this.cmp(moment) === 0;
  }
}
