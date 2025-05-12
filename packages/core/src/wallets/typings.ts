import type {
  Address,
  Eip712TypedData,
  EthPersonalAPI,
  HexString256Bytes,
  JsonRpcId,
  JsonRpcIdentifier,
  Web3EthExecutionAPI,
} from 'web3-types';

export interface AvalancheExecutionAPI {
  avalanche_getAccounts: (data: []) => {
    active: boolean;
    index: number;
    addressAVM: string;
    addressBTC: string;
    addressC: string;
    addressCoreEth: string;
    addressPVM: string;
    id: string;
    name: string;
    type: 'primary' | 'imported';
    walletId: string;
    walletName: string;
    walletType?: 'mnemonic';
  }[];

  avalanche_getAccountPubKey: (data: []) => {
    evm: string;
    xp: string;
  };

  avalanche_sendTransaction: (data: {
    transactionHex: string;
    chainAlias: 'X' | 'P' | 'C';
    externalIndices: number[];
    internalIndices: number[];
    utxos: string[];
    feeTolerance?: number;
  }) => string;

  avalanche_signTransaction: (data: {
    transactionHex: string;
    chainAlias: 'X' | 'P';
    utxos: string[];
  }) => {
    signedTransactionHex: string;
    signatures: { signature: string; sigIndices: number[] }[];
  };
}

export interface WalletExecutionAPI {
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3326.md
  wallet_switchEthereumChain: (chain: { chainId: string }) => void;

  wallet_addEthereumChain: (chain: {
    chainId: string;
    chainName?: string;
    rpcUrls?: string[];
    blockExplorerUrls?: string[];
    iconUrls?: string[];
    nativeCurrency?: {
      decimals: number;
      name: string;
      symbol: string;
    };
  }) => null;

  wallet_getPermissions: () => {
    id: string;
    parentCapability: string;
    invoker: string;
    caveats: {
      type: string;
      value: unknown;
      name: string;
    }[];
    date: number;
  }[];
}

export interface WalletExecutionAPINonArray {
  wallet_watchAsset: (
    params:
      | {
          type: 'ERC20';
          options: {
            address: string;
            symbol?: string;
            decimals?: number;
            image?: string;
          };
        }
      | {
          type: 'ERC721' | 'ERC1155';
          options: {
            address: string;
            tokenId: string;
          };
        },
  ) => boolean;
}

export interface EthWalletExtensionAPI
  extends Web3EthExecutionAPI,
    EthPersonalAPI,
    AvalancheExecutionAPI,
    WalletExecutionAPI,
    WalletExecutionAPINonArray {
  eth_signTypedData_v4: (
    address: Address,
    typedData: string | Eip712TypedData,
  ) => HexString256Bytes;
}

export type EthWalletRequestParams<K extends keyof EthWalletExtensionAPI> =
  K extends keyof (AvalancheExecutionAPI & WalletExecutionAPINonArray)
    ? Parameters<EthWalletExtensionAPI[K]>[0]
    : Parameters<EthWalletExtensionAPI[K]>;

export type EthWalletResponse<K extends keyof EthWalletExtensionAPI> =
  ReturnType<EthWalletExtensionAPI[K]>;

export interface EthWalletRequest<K extends keyof EthWalletExtensionAPI> {
  method: K;
  params: EthWalletRequestParams<K>;
  readonly jsonrpc?: JsonRpcIdentifier;
  readonly id?: JsonRpcId;
  readonly requestOptions?: unknown;
}

export interface ChainParams {
  chainId: number | string;
  blockExplorerUrls: string[];
  chainName: string;
  rpcUrls: string[];
}

export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}
