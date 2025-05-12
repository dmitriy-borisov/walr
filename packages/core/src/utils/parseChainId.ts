export function chainIdToHex(chainId: number | string): string {
  return '0x' + parseInt(chainId.toString()).toString(16);
}

export function parseChainId(chainId: string | number): string {
  if (chainId.toString().startsWith('0x')) {
    return chainId.toString();
  }

  return chainIdToHex(chainId);
}
