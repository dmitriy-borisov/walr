import { parseChainId } from '../utils/parseChainId';
import type {
  ChainParams,
  EthWalletExtensionAPI,
  EthWalletRequest,
  EthWalletResponse,
  NativeCurrency,
} from './typings';

export class WalletExtension {
  constructor(private details: Eip6963Details) {}

  get info() {
    return this.details.info;
  }

  get provider() {
    return this.details.provider;
  }

  async request<K extends keyof EthWalletExtensionAPI>(
    req: EthWalletRequest<K>,
  ): Promise<EthWalletResponse<K>> {
    return this.provider.request(req);
  }

  async addNetwork(chain: ChainParams, nativeCurrency: NativeCurrency) {
    const { chainId, chainName, blockExplorerUrls, rpcUrls } = chain;

    return this.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: parseChainId(chainId),
          blockExplorerUrls,
          chainName,
          rpcUrls,
          nativeCurrency,
        },
      ],
    });
  }

  async switchNetwork(chainId: number | string) {
    return this.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: parseChainId(chainId),
        },
      ],
    });
  }
}
