export function getWalletPriority(
  rdnsPriorities: string[],
  walletRdns: string,
): number {
  return rdnsPriorities.indexOf(walletRdns) >= 0
    ? rdnsPriorities.length - rdnsPriorities.indexOf(walletRdns) + 1
    : 0;
}
