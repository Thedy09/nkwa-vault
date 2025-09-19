const { Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
const { create } = require('ipfs-http-client');

class Web3Config {
  constructor() {
    this.hedera = {
      client: null,
      accountId: null,
      privateKey: null,
      network: process.env.HEDERA_NETWORK || 'testnet',
      isInitialized: false,
      topics: {
        content: process.env.HEDERA_CONTENT_TOPIC_ID,
        rewards: process.env.HEDERA_REWARDS_TOPIC_ID
      },
      tokens: {
        reward: process.env.HEDERA_REWARD_TOKEN_ID,
        nft: process.env.HEDERA_NFT_TOKEN_ID
      }
    };
    
    this.ipfs = {
      client: null,
      isInitialized: false,
      gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
      pinning: {
        service: process.env.IPFS_PINNING_SERVICE || 'infura',
        apiKey: process.env.IPFS_PINNING_API_KEY
      }
    };
  }

  async initializeHedera() {
    try {
      // Validation des variables d'environnement - OBLIGATOIRE
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error('Configuration Hedera OBLIGATOIRE - HEDERA_ACCOUNT_ID et HEDERA_PRIVATE_KEY requis');
      }

      this.hedera.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      this.hedera.privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

      // Configuration du client avec retry et timeout
      this.hedera.client = Client.forName(this.hedera.network);
      this.hedera.client.setOperator(this.hedera.accountId, this.hedera.privateKey);
      
      // Configuration des timeouts
      this.hedera.client.setMaxQueryPayment(1000000000); // 1 HBAR
      this.hedera.client.setMaxTransactionFee(1000000000); // 1 HBAR

      // Test de connexion avec retry
      const maxRetries = 3;
      let retries = 0;
      
      while (retries < maxRetries) {
        try {
          const balance = await this.hedera.client.getAccountBalance(this.hedera.accountId);
          console.log(`✅ Hedera ${this.hedera.network} connecté - Solde: ${balance.hbars.toString()}`);
          this.hedera.isInitialized = true;
          return true;
        } catch (error) {
          retries++;
          console.log(`⚠️ Tentative ${retries}/${maxRetries} - Erreur Hedera:`, error.message);
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * retries));
          }
        }
      }
      
      throw new Error('Impossible de se connecter à Hedera après plusieurs tentatives');
    } catch (error) {
      console.error('❌ Erreur initialisation Hedera:', error.message);
      this.hedera.isInitialized = false;
      return false;
    }
  }

  async initializeIPFS() {
    try {
      // Configuration IPFS - OBLIGATOIRE pour le stockage décentralisé
      const providers = [
        {
          name: 'Infura',
          config: {
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
              authorization: `Basic ${Buffer.from(`${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`).toString('base64')}`
            }
          }
        },
        {
          name: 'Pinata',
          config: {
            host: 'api.pinata.cloud',
            port: 443,
            protocol: 'https',
            headers: {
              'pinata_api_key': process.env.PINATA_API_KEY,
              'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
            }
          }
        },
        {
          name: 'Web3.Storage',
          config: {
            host: 'api.web3.storage',
            port: 443,
            protocol: 'https',
            headers: {
              'Authorization': `Bearer ${process.env.WEB3_STORAGE_TOKEN}`
            }
          }
        }
      ];

      // Essayer chaque provider dans l'ordre
      for (const provider of providers) {
        try {
          if (provider.name === 'Infura' && (!process.env.IPFS_PROJECT_ID || !process.env.IPFS_PROJECT_SECRET)) {
            continue;
          }
          if (provider.name === 'Pinata' && (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY)) {
            continue;
          }
          if (provider.name === 'Web3.Storage' && !process.env.WEB3_STORAGE_TOKEN) {
            continue;
          }

          this.ipfs.client = create(provider.config);
          const version = await this.ipfs.client.version();
          console.log(`✅ IPFS connecté via ${provider.name}, version:`, version.version);
          this.ipfs.isInitialized = true;
          return true;
        } catch (error) {
          console.log(`⚠️ Échec connexion ${provider.name}:`, error.message);
          continue;
        }
      }

      throw new Error('Aucun provider IPFS configuré - IPFS OBLIGATOIRE pour le stockage décentralisé');
    } catch (error) {
      console.error('❌ Erreur initialisation IPFS:', error.message);
      this.ipfs.isInitialized = false;
      return false;
    }
  }

  async initialize() {
    console.log('🚀 Initialisation des services Web3...');
    
    const hederaResult = await this.initializeHedera();
    const ipfsResult = await this.initializeIPFS();
    
    if (hederaResult && ipfsResult) {
      console.log('✅ Services Web3 (pilier central) initialisés avec succès');
    } else {
      throw new Error('Échec initialisation Web3 - Services OBLIGATOIRES pour Nkwa V');
    }
    
    return {
      hedera: hederaResult,
      ipfs: ipfsResult
    };
  }

  getHederaConfig() {
    return this.hedera;
  }

  getIPFSConfig() {
    return this.ipfs;
  }

  // Méthodes de validation
  validateHederaConfig() {
    const required = ['HEDERA_ACCOUNT_ID', 'HEDERA_PRIVATE_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Variables Hedera manquantes:', missing.join(', '));
      return false;
    }
    return true;
  }

  validateIPFSConfig() {
    const providers = [
      { name: 'Infura', keys: ['IPFS_PROJECT_ID', 'IPFS_PROJECT_SECRET'] },
      { name: 'Pinata', keys: ['PINATA_API_KEY', 'PINATA_SECRET_API_KEY'] },
      { name: 'Web3.Storage', keys: ['WEB3_STORAGE_TOKEN'] }
    ];

    const available = providers.filter(provider => 
      provider.keys.every(key => process.env[key])
    );

    if (available.length === 0) {
      console.warn('⚠️ Aucun provider IPFS configuré');
      return false;
    }
    
    console.log('✅ Providers IPFS disponibles:', available.map(p => p.name).join(', '));
    return true;
  }
}

module.exports = new Web3Config();
