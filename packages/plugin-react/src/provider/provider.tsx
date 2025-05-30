import { useEffect, useMemo, useState } from 'react';
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
import { getWalletPriority } from './helpers';
import {
  clearSession,
  getLatestSession,
  setSession,
} from '../services/session';

interface WalrProviderProps extends React.PropsWithChildren {
  rdnsPriority?: string[];
  sessionTime?: number;
  changeAddressStrategy?: 'disconnect' | 'reconnect';
  onChangeAddress?: (address: string) => void;
  debug?: boolean;
}

export function WalrProvider({
  children,
  debug,
  onChangeAddress,
  sessionTime,
  rdnsPriority = [],
  changeAddressStrategy = 'reconnect',
}: WalrProviderProps) {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<WalletExtension | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const walletsService = useMemo(() => new WalletsService(), []);
  const [chain, setChain] = useState<ChainParams | null>(null);

  const connect = async (wallet: WalletExtension) => {
    setIsConnecting(true);
    wallet.provider.removeAllListeners?.('accountsChanged');
    const [address] = await wallet.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    wallet.provider.once('accountsChanged', async () => {
      switch (changeAddressStrategy) {
        case 'disconnect':
          disconnect();
          return;
        case 'reconnect':
          const address = await connect(wallet);
          onChangeAddress?.(address);
          return;
      }
    });
    setAddress(address);
    setConnected(wallet);
    setIsConnecting(false);
    if (sessionTime) {
      setSession(wallet.info.rdns);
    }
    return address;
  };

  const disconnect = () => {
    connected?.provider.removeAllListeners?.('accountsChanged');
    setAddress(null);
    setConnected(null);
    clearSession();
  };

  const getInstalledWallets = async () => {
    const res = await walletsService.loadWallets();
    return Array.from(res.values()).sort((a, b) => {
      const aWeight = getWalletPriority(rdnsPriority, a.info.rdns);
      const bWeight = getWalletPriority(rdnsPriority, b.info.rdns);

      if (aWeight < bWeight) {
        return 1;
      }

      if (aWeight > bWeight) {
        return -1;
      }

      return 0;
    });
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

  // Check session
  useEffect(() => {
    if (!sessionTime) {
      return;
    }

    const latestSession = getLatestSession();
    if (!latestSession) {
      return;
    }

    if (Date.now() > latestSession.timestamp + sessionTime) {
      return;
    }

    getInstalledWallets().then((res) => {
      const latestWallet = res.find(
        (wallet) => wallet.info.rdns === latestSession.rdns,
      );

      if (latestWallet) {
        connect(latestWallet);
      }
    });
  }, []);

  const contextValues = useMemo<Context>(() => {
    const base: BaseContext = {
      isConnecting,
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
