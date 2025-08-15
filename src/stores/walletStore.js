import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const useWalletStore = create(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      walletType: null, // برای ذخیره نوع کیف پول (metamask, coinbase, binance)
      connect: async (walletType) => {
        try {
          let provider;
          let accounts;

          if (walletType === 'metamask') {
            if (!window.ethereum?.isMetaMask) {
              throw new Error('MetaMask is not installed. Please install it to connect.');
            }
            provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            if (BigInt(network.chainId) !== BigInt(1)) {
              throw new Error('Please switch to Ethereum Mainnet in MetaMask.');
            }
            accounts = await provider.send('eth_requestAccounts', []);
          } else if (walletType === 'coinbase') {
            if (!window.ethereum?.isCoinbaseWallet) {
              throw new Error('Coinbase Wallet is not installed. Please install it to connect.');
            }
            const coinbaseWallet = new CoinbaseWalletSDK({
              appName: 'YourAppName',
              appChainIds: [1], // Ethereum Mainnet
            });
            provider = new ethers.BrowserProvider(coinbaseWallet.makeWeb3Provider());
            const network = await provider.getNetwork();
            if (BigInt(network.chainId) !== BigInt(1)) {
              throw new Error('Please switch to Ethereum Mainnet in Coinbase Wallet.');
            }
            accounts = await provider.send('eth_requestAccounts', []);
          } else if (walletType === 'binance') {
            if (!window.BinanceChain) {
              throw new Error('Binance Wallet is not installed. Please install it to connect.');
            }
            provider = new ethers.BrowserProvider(window.BinanceChain);
            const network = await provider.getNetwork();
            if (BigInt(network.chainId) !== BigInt(56)) { // BNB Chain Mainnet
              throw new Error('Please switch to BNB Chain Mainnet in Binance Wallet.');
            }
            accounts = await provider.send('eth_requestAccounts', []);
          } else {
            throw new Error('Unsupported wallet type.');
          }

          if (accounts.length > 0) {
            set({ address: accounts[0], isConnected: true, walletType });
            console.log(`${walletType} connected:`, accounts[0]);
          }
        } catch (error) {
          console.error('Connection failed:', error);
          throw error;
        }
      },
      disconnect: () => {
        set({ address: null, isConnected: false, walletType: null });
        console.log('Wallet disconnected');
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);

export default useWalletStore;