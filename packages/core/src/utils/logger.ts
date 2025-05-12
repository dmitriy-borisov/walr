interface LoggerOptions {
  errorStyles: string;
  logStyles: string;
}

const DEFAULT_OPTIONS: LoggerOptions = {
  logStyles: 'color:#f17d08;font-weight:bold;',
  errorStyles: 'color:#fa2a2a;font-weight:bold;',
};

export class Logger<T = 'request' | 'response' | 'error'> {
  private options: LoggerOptions;

  constructor(
    private serviceName: string,
    options: Partial<LoggerOptions> = {},
  ) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
  }

  log(type: T, method: string | symbol, ...args: unknown[]) {
    console.log(
      `%c[${this.serviceName}:${method.toString()}:${type}]:%c`,
      type === 'error' ? this.options.errorStyles : this.options.logStyles,
      'color:initial',
      ...args,
    );
  }
}
