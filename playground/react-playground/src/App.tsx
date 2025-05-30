import './App.css';
import { WalrProvider, useWalr, WalletExtension } from '@walr/plugin-react';
import { useEffect, useState } from 'react';
import { WalletButton } from './components/WalletButton';
import { USDC } from './USDC';

function Content() {
  const [wallets, setWallets] = useState<WalletExtension[]>([]);
  const { connected, getInstalledWallets, address } = useWalr();

  const loadWallets = async () => {
    const res = await getInstalledWallets();
    setWallets(res);
  };

  useEffect(() => {
    loadWallets();
  }, []);

  return (
    <>
      <h1>React Playground</h1>

      <div className="wallets-list">
        {wallets.map((wallet) => (
          <WalletButton key={wallet.info.rdns} wallet={wallet} />
        ))}
      </div>

      {connected && (
        <>
          <hr />
          <span>Address: {address}</span>
          {connected && <USDC />}
        </>
      )}
    </>
  );
}

export const App = () => {
  return (
    <WalrProvider>
      <Content />
    </WalrProvider>
  );
};
