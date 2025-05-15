import { useWalrConnected } from '@walr/plugin-react';
import { usdcAbi } from './abis/usdc';
import { ETHEREUM_CHAIN, ETHEREUM_NATIVE_CURRENCY } from './constants/chain';

const usdcAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

export function USDC() {
  const { createSmartContract, selectChain, address } = useWalrConnected();
  const getBalance = async () => {
    await selectChain(ETHEREUM_CHAIN, ETHEREUM_NATIVE_CURRENCY);
    const contract = createSmartContract(usdcAddress, usdcAbi);
    const balance = await contract.balanceOf(address as `0x${string}`);
    console.log(balance);
  };

  return (
    <section>
      <h2>USDC Smart Contract (Ethereum Sepolia)</h2>
      <button onClick={() => getBalance()}>Get Balance</button>
    </section>
  );
}
