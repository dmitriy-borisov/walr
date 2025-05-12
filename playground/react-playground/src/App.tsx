import './App.css';
import {
  RiftDAppSDKProvider,
  useRiftDAppSDK,
  WalletExtension,
} from '@walr/react';
import { useEffect, useState } from 'react';
import { WalletButton } from './components/WalletButton';

function Content() {
  const [wallets, setWallets] = useState<WalletExtension[]>([]);
  const { getInstalledWallets, address } = useRiftDAppSDK();

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

      <hr />
      <span>Address: {address}</span>
    </>
  );
}

export const App = () => {
  return (
    <RiftDAppSDKProvider>
      <Content />
    </RiftDAppSDKProvider>
  );
};
