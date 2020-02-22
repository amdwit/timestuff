import { Duration, seconds } from './Duration';
import { Moment } from './Moment';

const setTimeoutWrap: (
  action: () => void,
  period: number
) => NodeJS.Timer | number = setTimeout;
const clearTimeoutWrap: (timer: any) => void = clearTimeout;

export type Timer = Promise<void>;
export const timeout = (period: Duration): Timer => {
  // @ts-ignore
  let timer: number | NodeJS.Timer;
  return new Promise((resolve, reject): void => {
    timer = setTimeoutWrap(() => resolve(void 0), period.milliSeconds);
  });
};

export const timeoutAt = (
  moment: Moment,
  cancelHandler: () => void = () => void 0
): Timer => {
  return timeout(moment.minus(Moment.now()));
};

interface RunOptions<T> {
  resolve: (t: T) => void;
  interval: Duration;
  period?: Duration;
  cancelHandler: () => void;
  reject: (reason?: any) => void;
  job: () => Promise<void | Duration>;
  timeoutTimer?: Timer | null;
  startWithJob?: boolean;
}

const run = <T>(options: RunOptions<T>): void => {
  let cancelRequested = false;
  let timer: Timer;
  const iteration = (delay?: Duration | void) => {
    if (!cancelRequested) {
      timer = timeout(delay ? delay : options.interval);
      timer.then(options.job).then(iteration);
    }
  };
  if (options.startWithJob) {
    options.job().then(iteration);
  } else {
    iteration();
  }
};

export const setIntervalJob = <T>(
  job: (
    resolve: (t: T) => void,
    reject: (e: Error) => void
  ) => Promise<void | Duration>,
  { interval, cancelHandler, startWithJob }: Partial<RunOptions<T>>
): Promise<T> => {
  let runOptions: RunOptions<T>;
  let stopTimer = () => cancelRun && cancelRun();
  let cancelRun: () => void;
  const promise = new Promise<T>((resolve, reject): void => {
    runOptions = {
      resolve,
      interval: interval || seconds(30),
      cancelHandler: cancelHandler || (() => void 0),
      reject,
      startWithJob,
      job: async () => job(resolve, reject)
    };
    run(runOptions);
  });
  promise.then(stopTimer);
  promise.catch(stopTimer);
  return promise;
};

export const tryForSomePeriod = <T>(
  job: () => Promise<T>,
  { period, interval, startWithJob }: Partial<RunOptions<T>> = {}
): Promise<T> => {
  let busy = false;
  let cancelRequested = false;
  let periodTimeout: any | null = null;
  let checkReject: (reason?: any) => void;
  const check = async (
    resolve: (t: T) => void,
    reject: (e: Error) => void
  ): Promise<void | Duration> => {
    busy = true;
    checkReject = reject;
    try {
      const result = await job();
      if (periodTimeout !== null) clearTimeout(periodTimeout);
      resolve(result!);
    } catch (error) {
      if (cancelRequested) {
        reject(error);
      }
    }
    busy = false;
    return undefined;
  };
  const promise = setIntervalJob(check, {
    startWithJob,
    interval: interval || seconds(1)
  });
  periodTimeout = setTimeout(() => {
    cancelRequested = true;
    if (!busy && checkReject) {
      checkReject(new Error("try timeout"));
    }
  }, (period || seconds(30)).milliSeconds);
  return promise;
};
