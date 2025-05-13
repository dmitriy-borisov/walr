import { useMemo, useState } from 'react';
import {
  ctx,
  type Context,
  type BaseContext,
  type ConnectedContext,
  type UnconnectedContext,
} from './ctx';
import {
  type ChainParams,
  createSmartContractController,
  WalletExtension,
  WalletsService,
  type Abi,
  type NativeCurrency,
} from '@walr/core';

interface WalrProviderProps extends React.PropsWithChildren {
  rdnsPriority?: string[];
  changeAddressStrategy?: 'disconnect' | 'reconnect';
  debug?: boolean;
}

export function WalrProvider({
  children,
  debug,
  changeAddressStrategy = 'reconnect',
}: WalrProviderProps) {
  const [connected, setConnected] = useState<WalletExtension | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const walletsService = useMemo(() => new WalletsService(), []);
  const [chain, setChain] = useState<ChainParams | null>(null);

  const connect = async (wallet: WalletExtension) => {
    wallet.provider.removeAllListeners?.('accountsChanged');
    const [address] = await wallet.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    wallet.provider.once('accountsChanged', () => {
      switch (changeAddressStrategy) {
        case 'disconnect':
          disconnect();
          return;
        case 'reconnect':
          connect(wallet);
          return;
      }
    });
    setAddress(address);
    setConnected(wallet);

    return address;
  };

  const disconnect = () => {
    connected?.provider.removeAllListeners?.('accountsChanged');
    setAddress(null);
    setConnected(null);
  };

  const getInstalledWallets = async () => {
    const res = await walletsService.loadWallets();
    return Array.from(res.values());
  };

  const selectChain = async (
    chain: ChainParams,
    nativeCurrency: NativeCurrency,
  ): Promise<boolean> => {
    if (!connected) {
      throw new Error('Wallet was not connected');
    }

    try {
      await connected.switchNetwork(chain.chainId).catch(async (e) => {
        if (typeof e === 'object' && !!e && 'code' in e && e.code === 4902) {
          await connected
            .addNetwork(chain, nativeCurrency)
            .then(() => true)
            .catch(() => false);
        }

        return false;
      });

      setChain(chain);
      return true;
    } catch {
      return false;
    }
  };

  const createSmartContract = <T extends Abi>(
    address: string,
    abi: T,
    loggerName?: string,
  ) => {
    return createSmartContractController(address, abi, connected, {
      debug,
      rpcUrl: chain?.rpcUrls[0],
      loggerName,
    });
  };

  const contextValues = useMemo<Context>(() => {
    const base: BaseContext = {
      connect,
      disconnect,
      getInstalledWallets,
      createSmartContract,
      selectChain,
    };

    if (!address || !connected) {
      return {
        ...base,
        address: null,
        connected: null,
      } satisfies UnconnectedContext;
    }

    return {
      ...base,
      address,
      connected,
    } satisfies ConnectedContext;
  }, [address, connected]);

  return <ctx.Provider value={contextValues}>{children}</ctx.Provider>;
}
