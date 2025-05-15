import type { ChainParams, NativeCurrency } from '@walr/plugin-react';

export const ETHEREUM_CHAIN: ChainParams = {
  chainId: 11155111,
  rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
  blockExplorerUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
  chainName: 'Ethereum Sepolia',
};

export const ETHEREUM_NATIVE_CURRENCY: NativeCurrency = {
  decimals: 18,
  name: 'Ethereum',
  symbol: 'ETH',
};
