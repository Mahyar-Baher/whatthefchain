import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const useWalletStore = create(
  persist(
    // eslint-disable-next-line no-unused-vars
    (set, get) => ({
      address: null,
      isConnected: false,
      walletType: null,
      balance: null,
      chainUnit: null,
      chainId: null,
      networkName: null,
      ensName: null,
      connect: async (walletType) => {
        try {
          let provider;
          let accounts;
          let unit;
          let chainId;
          let networkName;

          if (walletType === 'metamask') {
            if (!window.ethereum?.isMetaMask) {
              throw new Error('MetaMask is not installed. Please install it to connect.');
            }
            provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            chainId = BigInt(network.chainId).toString();
            networkName = network.name || 'Unknown';
            if (chainId !== '1') {
              throw new Error('Please switch to Ethereum Mainnet in MetaMask.');
            }
            accounts = await provider.send('eth_requestAccounts', []);
            unit = 'ETH';
          } else if (walletType === 'coinbase') {
            if (!window.ethereum?.isCoinbaseWallet) {
              throw new Error('Coinbase Wallet is not installed. Please install it to connect.');
            }
            const coinbaseWallet = new CoinbaseWalletSDK({
              appName: 'YourAppName',
              appChainIds: [1],
            });
            provider = new ethers.BrowserProvider(coinbaseWallet.makeWeb3Provider());
            const network = await provider.getNetwork();
            chainId = BigInt(network.chainId).toString();
            networkName = network.name || 'Unknown';
            if (chainId !== '1') {
              throw new Error('Please switch to Ethereum Mainnet in Coinbase Wallet.');
            }
            accounts = await provider.send('eth_requestAccounts', []);
            unit = 'ETH';
          } else if (walletType === 'binance') {
            if (!window.BinanceChain) {
              throw new Error('Binance Wallet is not installed. Please install it to connect.');
            }
            provider = new ethers.BrowserProvider(window.BinanceChain);
            const network = await provider.getNetwork();
            chainId = BigInt(network.chainId).toString();
            networkName = network.name || 'Unknown';
            if (chainId !== '56') {
              throw new Error('Please switch to BNB Chain Mainnet in Binance Wallet.');
            }
            accounts = await provider.send('eth_requestAccounts', []);
            unit = 'BNB';
          } else {
            throw new Error('Unsupported wallet type.');
          }

          if (accounts.length > 0) {
            const balance = await provider.getBalance(accounts[0]);
            const formattedBalance = ethers.formatEther(balance);
            let ensName = null;
            if (chainId === '1') { // فقط برای Ethereum Mainnet
              try {
                ensName = await provider.lookupAddress(accounts[0]) || null;
              } catch (e) {
                console.log('ENS lookup failed:', e);
              }
            }
            set({ 
              address: accounts[0], 
              isConnected: true, 
              walletType,
              balance: formattedBalance,
              chainUnit: unit,
              chainId,
              networkName,
              ensName
            });
            console.log(`${walletType} connected:`, {
              address: accounts[0],
              balance: `${formattedBalance} ${unit}`,
              chainId,
              networkName,
              ensName
            });

            // گوش دادن به تغییرات شبکه یا آدرس
            if (window.ethereum) {
              window.ethereum.on('accountsChanged', async (newAccounts) => {
                if (newAccounts.length > 0) {
                  const newBalance = await provider.getBalance(newAccounts[0]);
                  const newFormattedBalance = ethers.formatEther(newBalance);
                  let newEnsName = null;
                  if (chainId === '1') {
                    try {
                      newEnsName = await provider.lookupAddress(newAccounts[0]) || null;
                    } catch (e) {
                      console.log('ENS lookup failed:', e);
                    }
                  }
                  set({
                    address: newAccounts[0],
                    balance: newFormattedBalance,
                    ensName: newEnsName
                  });
                } else {
                  set({ 
                    address: null, 
                    isConnected: false, 
                    walletType: null, 
                    balance: null, 
                    chainUnit: null,
                    chainId: null,
                    networkName: null,
                    ensName: null
                  });
                }
              });
              window.ethereum.on('chainChanged', async (newChainId) => {
                const newNetwork = await provider.getNetwork();
                set({
                  chainId: BigInt(newChainId).toString(),
                  networkName: newNetwork.name || 'Unknown'
                });
              });
            }
          }
        } catch (error) {
          console.error('Connection failed:', error);
          throw error;
        }
      },
      disconnect: () => {
        set({ 
          address: null, 
          isConnected: false, 
          walletType: null, 
          balance: null, 
          chainUnit: null,
          chainId: null,
          networkName: null,
          ensName: null
        });
        console.log('Wallet disconnected');
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);

export default useWalletStore;