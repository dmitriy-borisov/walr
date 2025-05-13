import { createContext } from 'react';
import {
  WalletExtension,
  type Abi,
  type ChainParams,
  type NativeCurrency,
  type SmartContractImplementation,
} from '@walr/core';

export interface BaseContext {
  getInstalledWallets: () => Promise<WalletExtension[]>;
  connect: (wallet: WalletExtension) => Promise<string>;
  createSmartContract: <T extends Abi>(
    address: string,
    abi: T,
  ) => SmartContractImplementation<T>;
  selectChain: (
    chainParams: ChainParams,
    nativeCurrency: NativeCurrency,
  ) => Promise<boolean>;
  disconnect: () => void;
}

export interface UnconnectedContext extends BaseContext {
  connected: null;
  address: null;
}

export interface ConnectedContext extends BaseContext {
  connected: WalletExtension;
  address: string;
}

export type Context = UnconnectedContext | ConnectedContext;

export const ctx = createContext<Context | null>(null);
