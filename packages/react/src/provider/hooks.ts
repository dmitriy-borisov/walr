import { useContext } from 'react';
import { ctx, type ConnectedContext, type Context } from './ctx';

export function useRiftDAppSDK(): Context {
  const res = useContext(ctx);
  if (!res) {
    throw new Error(`'RiftDAppSDKProvider' was not found in React tree`);
  }

  return res;
}

export function useRiftDAppSdkConnected(): ConnectedContext {
  const res = useRiftDAppSDK();
  if (!res.address || !res.connected) {
    throw new Error(`Does not connect any wallet`);
  }

  return res;
}
