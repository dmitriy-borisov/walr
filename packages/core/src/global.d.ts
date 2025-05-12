/* eslint-disable no-var */
declare const _nominal: unique symbol;

declare type Nominal<
  I extends string,
  T extends string | number = string,
> = T & {
  readonly [_nominal]: I;
};

declare type GUID<I extends string> = Nominal<I, string>;

declare interface Eip6963Details {
  info: {
    uuid: GUID<'eip6963'>;
    name: string;
    icon: string;
    rdns: Nominal<'rdns'>;
  };
  provider: import('web3-types').Eip1193Compatible<
    import('web3-types').EthExecutionAPI
  >;
}

declare interface EipEventsMap {
  'eip6963:announceProvider': CustomEvent<Eip6963Details>;
}

declare namespace globalThis {
  function addEventListener<K extends keyof EipEventsMap>(
    type: K,
    listener: (this: Window, ev: EipEventsMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  );
  function removeEventListener<K extends keyof EipEventsMap>(
    type: K,
    listener: (this: Window, ev: EipEventsMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  );
  var ethereum: import('web3-types').Eip1193Compatible;
}

declare namespace globalThis {
  function test(): Eip6963Details;
  var test2: Eip6963Details;
}
