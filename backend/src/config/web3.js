const { ethers } = require('ethers');

function buildIpfsApiBaseUrl(config = {}) {
  if (config.url) {
    const trimmed = config.url.replace(/\/+$/, '');
    if (trimmed.endsWith('/api/v0')) {
      return trimmed;
    }
    return `${trimmed}/api/v0`;
  }

  const protocol = config.protocol || 'https';
  const host = config.host || '127.0.0.1';
  const port = config.port || 5001;
  return `${protocol}://${host}:${port}/api/v0`;
}

function createIPFSRpcClient(config = {}) {
  const headers = config.headers || {};
  const baseUrl = buildIpfsApiBaseUrl(config);

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPFS RPC ${response.status}: ${errorText || response.statusText}`);
    }

    return response;
  }

  return {
    async version() {
      const response = await request('/version');
      return response.json();
    },

    async add(data, options = {}) {
      const form = new FormData();
      const payload = data instanceof Uint8Array || Buffer.isBuffer(data) ? data : Buffer.from(String(data));
      const blob = new Blob([payload]);
      form.append('file', blob, 'upload.bin');

      const searchParams = new URLSearchParams();
      if (typeof options.pin !== 'undefined') {
        searchParams.set('pin', String(options.pin));
      }

      const response = await request(`/add?${searchParams.toString()}`, {
        method: 'POST',
        body: form
      });

      const result = await response.json();
      return {
        path: result.Hash,
        size: Number(result.Size || 0)
      };
    },

    async *cat(cid) {
      const response = await request(`/cat?arg=${encodeURIComponent(cid)}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      yield buffer;
    }
  };
}

class Web3Config {
  constructor() {
    this.blockchain = {
      provider: null,
      wallet: null,
      isInitialized: false,
      network: process.env.EVM_NETWORK || 'evm',
      chainId: Number(process.env.EVM_CHAIN_ID || 0) || null,
      rpcUrl: process.env.EVM_RPC_URL || null,
      registryContract: process.env.EVM_REGISTRY_CONTRACT || null,
      explorerUrl: process.env.EVM_EXPLORER_URL || null
    };

    this.ipfs = {
      client: null,
      isInitialized: false,
      gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    };
  }

  async initializeBlockchain() {
    try {
      const rpcUrl = process.env.EVM_RPC_URL;
      const relayerKey = process.env.EVM_RELAYER_PRIVATE_KEY;

      if (!rpcUrl || !relayerKey) {
        console.log('⚠️ Configuration EVM incomplète, mode démo blockchain activé');
        this.blockchain.isInitialized = false;
        this.blockchain.provider = null;
        this.blockchain.wallet = null;
        return false;
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(relayerKey, provider);
      const network = await provider.getNetwork();
      const detectedChainId = Number(network.chainId);
      const configuredChainId = Number(process.env.EVM_CHAIN_ID || 0) || null;

      if (configuredChainId && configuredChainId !== detectedChainId) {
        throw new Error(
          `EVM_CHAIN_ID (${configuredChainId}) ne correspond pas au réseau RPC (${detectedChainId})`
        );
      }

      this.blockchain.provider = provider;
      this.blockchain.wallet = wallet;
      this.blockchain.chainId = configuredChainId || detectedChainId;
      this.blockchain.network = process.env.EVM_NETWORK || network.name || 'evm';
      this.blockchain.rpcUrl = rpcUrl;
      this.blockchain.registryContract = process.env.EVM_REGISTRY_CONTRACT || null;
      this.blockchain.explorerUrl = process.env.EVM_EXPLORER_URL || null;
      this.blockchain.isInitialized = true;

      console.log(
        `✅ EVM connecté (${this.blockchain.network}, chainId=${this.blockchain.chainId})`
      );
      console.log(`🔑 Relayer EVM: ${wallet.address}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation EVM:', error.message);
      this.blockchain.isInitialized = false;
      this.blockchain.provider = null;
      this.blockchain.wallet = null;
      return false;
    }
  }

  async initializeIPFS() {
    try {
      const providers = [
        {
          name: 'Custom Kubo RPC',
          enabled: !!process.env.IPFS_API_URL,
          config: {
            url: process.env.IPFS_API_URL,
            headers: process.env.IPFS_API_TOKEN
              ? {
                  Authorization: `Bearer ${process.env.IPFS_API_TOKEN}`
                }
              : undefined
          }
        },
        {
          name: 'Infura',
          enabled:
            !!process.env.IPFS_PROJECT_ID && !!process.env.IPFS_PROJECT_SECRET,
          config: {
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
              authorization: `Basic ${Buffer.from(
                `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
              ).toString('base64')}`
            }
          }
        }
      ];

      for (const provider of providers) {
        if (!provider.enabled) continue;

        try {
          this.ipfs.client = createIPFSRpcClient(provider.config);
          const version = await this.ipfs.client.version();
          this.ipfs.isInitialized = true;
          console.log(
            `✅ IPFS connecté via ${provider.name}, version ${version.version}`
          );
          return true;
        } catch (error) {
          console.log(`⚠️ Échec IPFS ${provider.name}: ${error.message}`);
        }
      }

      console.log('⚠️ Aucun provider IPFS configuré, mode démo IPFS activé');
      this.ipfs.client = null;
      this.ipfs.isInitialized = false;
      return false;
    } catch (error) {
      console.error('❌ Erreur initialisation IPFS:', error.message);
      this.ipfs.client = null;
      this.ipfs.isInitialized = false;
      return false;
    }
  }

  async initialize() {
    console.log('🚀 Initialisation des services Web3 (EVM + IPFS)...');

    const blockchain = await this.initializeBlockchain();
    const ipfs = await this.initializeIPFS();

    if (blockchain || ipfs) {
      console.log('✅ Services Web3 initialisés (mode live ou démo)');
    } else {
      console.log('⚠️ Services Web3 en mode démo complet');
    }

    return {
      blockchain,
      ipfs
    };
  }

  getBlockchainConfig() {
    return this.blockchain;
  }

  getIPFSConfig() {
    return this.ipfs;
  }

  // Compatibilité descendante avec anciens services Hedera (désactivée)
  getHederaConfig() {
    return {
      isInitialized: false,
      deprecated: true
    };
  }

  validateBlockchainConfig() {
    const required = ['EVM_RPC_URL', 'EVM_RELAYER_PRIVATE_KEY'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.warn('⚠️ Variables EVM manquantes:', missing.join(', '));
      return false;
    }
    return true;
  }

  validateHederaConfig() {
    return false;
  }

  validateIPFSConfig() {
    const providers = [
      ['IPFS_API_URL'],
      ['IPFS_PROJECT_ID', 'IPFS_PROJECT_SECRET'],
    ];

    return providers.some((keys) => keys.every((key) => process.env[key]));
  }
}

module.exports = new Web3Config();
