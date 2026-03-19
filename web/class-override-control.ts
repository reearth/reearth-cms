// ============================================================
// tsconfig.json requirement:
//   "noImplicitOverride": true
//   This forces subclasses to use `override` keyword explicitly
// ============================================================

// ─── Layer 1: Base Class ─────────────────────────────────────
abstract class BaseLogger {
  // ✅ Non-overridable: readonly arrow function properties
  // Subclasses CANNOT redeclare these (TS error with readonly)
  protected readonly getTimestamp = (): string => {
    return new Date().toISOString();
  };

  protected readonly formatPrefix = (level: string): string => {
    return `[${this.getTimestamp()}] [${level}]`;
  };

  // ✅ Placeholder methods: meant to be overridden by subclasses
  protected abstract formatMessage(message: string): string;
  protected abstract getLogLevel(): string;

  // ✅ Template method pattern — calls both sealed & abstract methods
  protected readonly log = (message: string): void => {
    const prefix = this.formatPrefix(this.getLogLevel());
    const formatted = this.formatMessage(message);
    this.write(`${prefix} ${formatted}`);
  };

  // Another overridable hook — controls output destination
  protected abstract write(output: string): void;
}

// ─── Layer 2: Middle Class ───────────────────────────────────
abstract class TransportLogger extends BaseLogger {
  // ✅ Non-overridable at this layer
  protected readonly sanitize = (input: string): string => {
    return input.replace(/[<>]/g, "");
  };

  protected readonly buildPayload = (
    message: string,
  ): { timestamp: string; level: string; message: string } => {
    return {
      timestamp: this.getTimestamp(), // reusing base's sealed method
      level: this.getLogLevel(),
      message: this.sanitize(message),
    };
  };

  // ✅ Implement one abstract from base — still protected
  protected override formatMessage(message: string): string {
    return this.sanitize(message);
  }

  // ✅ New placeholder for Layer 3 to implement
  protected abstract getTransportName(): string;

  // `getLogLevel()` and `write()` are still abstract — passed down
}

// ─── Layer 3: Final (Concrete) Classes ───────────────────────
class ConsoleLogger extends TransportLogger {
  // ✅ Now PUBLIC — this is the consumer-facing API
  public override readonly log = (message: string): void => {
    // We can still call the sealed buildPayload from Layer 2
    const payload = this.buildPayload(message);
    this.write(`${this.formatPrefix(payload.level)} ${payload.message}`);
  };

  // Implement remaining abstract methods
  protected override getLogLevel(): string {
    return "INFO";
  }

  protected override getTransportName(): string {
    return "console";
  }

  protected override write(output: string): void {
    console.log(`[${this.getTransportName()}] ${output}`);
  }

  // ✅ Public helper — only final class exposes this
  public getInfo(): string {
    return `Transport: ${this.getTransportName()}, Level: ${this.getLogLevel()}`;
  }
}

class HttpLogger extends TransportLogger {
  private endpoint: string;

  constructor(endpoint: string) {
    super();
    this.endpoint = endpoint;
  }

  public override readonly log = (message: string): void => {
    const payload = this.buildPayload(message);
    this.write(JSON.stringify(payload));
  };

  protected override getLogLevel(): string {
    return "WARN";
  }

  protected override getTransportName(): string {
    return "http";
  }

  protected override write(output: string): void {
    console.log(`[${this.getTransportName()}] POST ${this.endpoint}:`, output);
    // In real code: fetch(this.endpoint, { method: 'POST', body: output })
  }

  public getInfo(): string {
    return `Transport: ${this.getTransportName()}, Endpoint: ${this.endpoint}`;
  }
}

// ─── Usage ───────────────────────────────────────────────────
const consoleLogger = new ConsoleLogger();
consoleLogger.log("Server started on port 3000");
// => [console] [2025-02-17T...] [INFO] Server started on port 3000

const httpLogger = new HttpLogger("https://logs.example.com/ingest");
httpLogger.log("Disk usage above <threshold>");
// => [http] POST https://logs.example.com/ingest: {"timestamp":"...","level":"WARN","message":"Disk usage above threshold"}

console.log(consoleLogger.getInfo());
// => Transport: console, Level: INFO

// ─── What gets BLOCKED by this pattern ───────────────────────
//
// class BadLogger extends TransportLogger {
//   // ❌ TS Error: Cannot assign to 'sanitize' because it is a read-only property
//   protected override readonly sanitize = (input: string) => input;
//
//   // ❌ TS Error: Cannot assign to 'getTimestamp' because it is a read-only property
//   protected override readonly getTimestamp = () => "hacked";
//
//   // ❌ TS Error (with noImplicitOverride): must use `override`
//   protected getLogLevel() { return "DEBUG"; }
//                ^ Missing 'override' modifier
// }
