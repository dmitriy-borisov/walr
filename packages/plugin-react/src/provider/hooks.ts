import { useContext } from 'react';
import { ctx, type ConnectedContext, type Context } from './ctx';

export function useWalr(): Context {
  const res = useContext(ctx);
  if (!res) {
    throw new Error(`'WalrProvider' was not found in React tree`);
  }

  return res;
}

export function useWalrConnected(): ConnectedContext {
  const res = useWalr();
  if (!res.address || !res.connected) {
    throw new Error(`Does not connect any wallet`);
  }

  return res;
}
