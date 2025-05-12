import { ContractTransactionResponse, ethers, type InterfaceAbi } from 'ethers';
import type {
  ExtractAbiFunctionNames,
  AbiParameterToPrimitiveType,
  ExtractAbiFunction,
  AbiParameter,
  Abi,
  AbiParametersToPrimitiveTypes,
} from 'abitype';
import { Logger } from '../utils/logger';
import { WalletExtension } from '../wallets';

type ExtractPrimitivesFromMethod<T> = {
  [K in keyof T]: T[K] extends AbiParameter
    ? AbiParameterToPrimitiveType<T[K]>
    : never;
};

// type ContractMethodArguments<
//   ABI extends Abi,
//   T extends ExtractAbiFunctionNames<ABI>,
// > = [
//   ...ExtractPrimitivesFromMethod<ExtractAbiFunction<ABI, T>['inputs']>,
//   { value?: unknown; accessList?: unknown }?,
// ];

type ContractMethodResponse<
  ABI extends Abi,
  T extends ExtractAbiFunctionNames<ABI>,
> = ExtractPrimitivesFromMethod<ExtractAbiFunction<ABI, T>['outputs']>;

type ExtendedContractMethodResponse<
  ABI extends Abi,
  T extends ExtractAbiFunctionNames<ABI>,
> =
  ContractMethodResponse<ABI, T> extends { '0': unknown }
    ? ContractMethodResponse<ABI, T>[0]
    : object;

type ContractMethod<ABI extends Abi, T extends ExtractAbiFunctionNames<ABI>> = (
  ...args: AbiParametersToPrimitiveTypes<ExtractAbiFunction<ABI, T>['inputs']>
  //...args: ContractMethodArguments<ABI, T> // unknown[]
) => Promise<
  ContractTransactionResponse & ExtendedContractMethodResponse<ABI, T>
>;

type ContractMethods<ABI extends Abi> = {
  [Key in ExtractAbiFunctionNames<ABI>]: ContractMethod<ABI, Key>;
};

type ContractInterface<ABI extends Abi> = ContractMethods<ABI> & {};

class BaseContract<ABI extends Abi> extends ethers.BaseContract {
  constructor(
    address: string,
    abi: ABI,
    runner?: null | ethers.ContractRunner,
  ) {
    super(address, abi as InterfaceAbi, runner);
  }
}

export type SmartContractImplementation<ABI extends Abi> = BaseContract<ABI> &
  ContractInterface<ABI>;

const SmartContract: new <ABI extends Abi>(
  address: string,
  abi: ABI,
  runner?: null | ethers.ContractRunner,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => SmartContractImplementation<ABI> = BaseContract as any;

interface SmartContractControllerOptions {
  debug?: boolean;
  rpcUrl?: string;
  loggerName: string;
}

const DEFAULT_SMART_CONTRACT_CONTROLLER_OPTIONS: SmartContractControllerOptions =
  {
    debug: false,
    loggerName: 'contract',
  };

/**
 * Create Interface with methods of smart contract
 * @param address Address of smart contract on chain
 * @param abi ABI of the smart contract
 * @param runner Caller of the smart contract
 * @returns Interface with methods of smart contract
 */
export function createSmartContractController<ABI extends Abi>(
  address: string,
  abi: ABI,
  runner?: null | ethers.ContractRunner | WalletExtension,
  options: Partial<SmartContractControllerOptions> = DEFAULT_SMART_CONTRACT_CONTROLLER_OPTIONS,
) {
  const opts = Object.assign(
    {},
    DEFAULT_SMART_CONTRACT_CONTROLLER_OPTIONS,
    options,
  );

  const ethersProvider = !(runner instanceof WalletExtension)
    ? runner
    : new ethers.BrowserProvider(runner.provider);

  const contract = new SmartContract(address, abi, ethersProvider);
  const logger = new Logger(opts.loggerName, {
    logStyles: 'color:#f17d08;font-weight:bold;',
    errorStyles: 'color:#fa2a2a;font-weight:bold;',
  });

  return new Proxy(contract, {
    get: (target, prop, receiver) => {
      const handler = Reflect.get(target, prop, receiver);

      if (
        typeof handler === 'function' &&
        handler.constructor === (async () => {}).constructor
      ) {
        return async (...args: unknown[]) => {
          if (opts.debug) {
            logger.log('request', prop, ...args);
          }
          return (
            handler(...args)
              .then((res: unknown) => {
                if (opts.debug) {
                  logger.log('response', prop, res);
                }

                return res;
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .catch(async (err: any) => {
                if (
                  !!options.rpcUrl &&
                  'action' in err &&
                  err.action === 'estimateGas' &&
                  'transaction' in err
                ) {
                  const provider = new ethers.JsonRpcProvider(options.rpcUrl);
                  return provider.estimateGas(err.transaction).catch((e) => {
                    let name = '';

                    if ('data' in e) {
                      const selecter = e.data.slice(0, 10);
                      const errorName = contract.interface.getError(selecter);
                      name = errorName?.name || '';
                    }

                    if (opts.debug) {
                      logger.log('error', prop, { ...e, name });
                    }

                    throw e;
                  });
                }

                if (opts.debug) {
                  logger.log('error', prop, { ...err });
                }
                throw err;
              })
          );
        };
      }

      return handler;
    },
  });
}
