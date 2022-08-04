let id = 1;
const noop = async () => {};

export class Process<T, R> {
  readonly id: number;
  readonly name: string;
  progress: number = 0;
  readonly priority: number;
  completed: boolean = false;
  running: boolean = false;
  readonly spawnMax: number;
  readonly action: (input: T) => Promise<R>;
  readonly onStart: () => Promise<T>;
  readonly onComplete: (input: R) => Promise<void>;
  readonly onFail: (error: any) => Promise<void>;
  readonly onRetry: () => Promise<void>;
  readonly onEnqueue: () => Promise<void>;
  readonly onDequeue: () => Promise<void>;

  constructor(
    name: string,
    priority: number,
    spawnMax: number,
    onStart: () => Promise<T>,
    action: (input: T) => Promise<R>,
    onComplete: (input: R) => Promise<void> = noop,
    onFail: (error: any) => Promise<void> = noop,
    onRetry: () => Promise<void> = noop,
    onEnqueue: () => Promise<void> = noop,
    onDequeue: () => Promise<void> = noop
  ) {
    this.name = name;
    this.priority = priority;
    this.spawnMax = spawnMax;
    this.onStart = onStart;
    this.onComplete = onComplete;
    this.onFail = onFail;
    this.onRetry = onRetry;
    this.onEnqueue = onEnqueue;
    this.onDequeue = onDequeue;
    this.action = action;
    this.id = id;
    id += 1;
  }

  async start(attempt: number = 1) {
    if (this.running && attempt === 1) {
      return;
    }

    this.running = true;

    try {
      if (attempt > 1) {
        await this.onRetry();
      }

      const input = await this.onStart();
      const result = await this.action(input);
      await this.onComplete(result);
      this.running = false;
      return result;
    } catch (e) {
      if (attempt < 3) {
        await this.start(attempt + 1);
      } else {
        this.running = false;
        await this.onFail(e);
      }
    }
  }

  async pause() {}

  async stop() {

  }
}
