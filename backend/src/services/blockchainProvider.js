const { ethers } = require('ethers');
const web3Config = require('../config/web3');
const { logError, logInfo } = require('../utils/logger');

const CULTURAL_REGISTRY_ABI = [
  'function certify_content(string content_id, bytes32 content_hash, string metadata_cid, string content_type, string license_name, address contributor)',
  'function recertify_content(string content_id, bytes32 content_hash, string metadata_cid, string content_type, string license_name, address contributor)',
  'function get_content(string content_id) view returns (bytes32 content_hash, string metadata_cid, string content_type, string license_name, address contributor, uint256 timestamp, bool exists)',
  'function record_reward(address contributor, uint256 points, string reason)',
  'function total_certifications() view returns (uint256)',
  'function owner() view returns (address)'
];

class BlockchainProvider {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.registryContract = null;
    this.registryContractAddress = null;
    this.network = process.env.EVM_NETWORK || 'evm';
    this.chainId = Number(process.env.EVM_CHAIN_ID || 0) || null;
    this.explorerUrl = process.env.EVM_EXPLORER_URL || null;
    this.isInitialized = false;
    this.demoMode = true;
    this.inMemoryCertifications = new Map();
  }

  async initialize() {
    try {
      const config = web3Config.getBlockchainConfig();

      this.provider = config.provider || null;
      this.wallet = config.wallet || null;
      this.network = config.network || this.network;
      this.chainId = config.chainId || this.chainId;
      this.explorerUrl = config.explorerUrl || this.explorerUrl;
      this.registryContractAddress = config.registryContract || null;
      this.isInitialized = !!this.provider && !!this.wallet;
      this.demoMode = !this.isInitialized || !this.registryContractAddress;

      if (this.isInitialized && this.registryContractAddress) {
        this.registryContract = new ethers.Contract(
          this.registryContractAddress,
          CULTURAL_REGISTRY_ABI,
          this.wallet
        );
        logInfo('Blockchain provider initialised with registry contract', {
          network: this.network,
          chainId: this.chainId,
          registryContract: this.registryContractAddress
        });
      } else {
        this.registryContract = null;
        logInfo('Blockchain provider initialised in demo mode', {
          hasRpc: !!this.provider,
          hasRelayer: !!this.wallet,
          hasRegistryContract: !!this.registryContractAddress
        });
      }

      return this.isInitialized;
    } catch (error) {
      this.provider = null;
      this.wallet = null;
      this.registryContract = null;
      this.isInitialized = false;
      this.demoMode = true;
      logError(error, {
        service: 'BlockchainProvider',
        operation: 'initialize'
      });
      return false;
    }
  }

  isAvailable() {
    return this.isInitialized;
  }

  isReady() {
    return this.isInitialized && !!this.registryContract;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      ready: this.isReady(),
      demo: this.demoMode,
      network: this.network,
      chainId: this.chainId,
      relayerAddress: this.wallet?.address || null,
      registryContract: this.registryContractAddress || null,
      explorerUrl: this.explorerUrl || null
    };
  }

  hashContent(payload) {
    const normalized =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    return ethers.id(normalized);
  }

  toBytes32(value) {
    if (!value) return ethers.ZeroHash;
    if (typeof value === 'string' && value.startsWith('0x') && value.length === 66) {
      return value;
    }
    return ethers.id(String(value));
  }

  normalizeAddress(address) {
    if (!address && this.wallet?.address) return this.wallet.address;
    if (!address) return ethers.ZeroAddress;

    try {
      return ethers.getAddress(address);
    } catch (error) {
      return this.wallet?.address || ethers.ZeroAddress;
    }
  }

  getExplorerTransactionUrl(txHash) {
    if (!txHash || !this.explorerUrl) return null;
    return `${this.explorerUrl.replace(/\/$/, '')}/tx/${txHash}`;
  }

  async certifyContent(payload) {
    const contentId = String(payload.contentId || '').slice(0, 64);
    const metadataCid = String(payload.metadataCid || '').slice(0, 128);
    const contentType = String(payload.contentType || 'CONTENT').slice(0, 32);
    const license = String(payload.license || 'CC-BY').slice(0, 32);
    const contributor = this.normalizeAddress(payload.contributor);
    const contentHash = this.toBytes32(
      payload.contentHash || this.hashContent(payload.rawContent || payload)
    );

    if (!contentId) {
      throw new Error('contentId is required for blockchain certification');
    }

    if (this.isReady()) {
      const tx = await this.registryContract.certify_content(
        contentId,
        contentHash,
        metadataCid,
        contentType,
        license,
        contributor
      );
      const receipt = await tx.wait();

      return {
        success: true,
        demo: false,
        contentId,
        contentHash,
        metadataCid,
        contentType,
        license,
        contributor,
        txHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        explorerUrl: this.getExplorerTransactionUrl(receipt.hash)
      };
    }

    const txHash = ethers.id(
      `${contentId}:${contentHash}:${metadataCid}:${Date.now()}`
    );
    const mockRecord = {
      contentId,
      contentHash,
      metadataCid,
      contentType,
      license,
      contributor,
      txHash,
      blockNumber: 0,
      timestamp: Math.floor(Date.now() / 1000)
    };

    this.inMemoryCertifications.set(contentId, mockRecord);

    return {
      success: true,
      demo: true,
      ...mockRecord,
      explorerUrl: null
    };
  }

  async recertifyContent(payload) {
    const contentId = String(payload.contentId || '').slice(0, 64);
    const metadataCid = String(payload.metadataCid || '').slice(0, 128);
    const contentType = String(payload.contentType || 'CONTENT').slice(0, 32);
    const license = String(payload.license || 'CC-BY').slice(0, 32);
    const contributor = this.normalizeAddress(payload.contributor);
    const contentHash = this.toBytes32(
      payload.contentHash || this.hashContent(payload.rawContent || payload)
    );

    if (!contentId) {
      throw new Error('contentId is required for blockchain recertification');
    }

    if (this.isReady()) {
      const tx = await this.registryContract.recertify_content(
        contentId,
        contentHash,
        metadataCid,
        contentType,
        license,
        contributor
      );
      const receipt = await tx.wait();

      return {
        success: true,
        demo: false,
        contentId,
        contentHash,
        metadataCid,
        contentType,
        license,
        contributor,
        txHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        explorerUrl: this.getExplorerTransactionUrl(receipt.hash)
      };
    }

    const txHash = ethers.id(
      `recertify:${contentId}:${contentHash}:${metadataCid}:${Date.now()}`
    );
    const mockRecord = {
      contentId,
      contentHash,
      metadataCid,
      contentType,
      license,
      contributor,
      txHash,
      blockNumber: 0,
      timestamp: Math.floor(Date.now() / 1000)
    };

    this.inMemoryCertifications.set(contentId, mockRecord);

    return {
      success: true,
      demo: true,
      ...mockRecord,
      explorerUrl: null
    };
  }

  async getContent(contentId) {
    const id = String(contentId || '').slice(0, 64);
    if (!id) {
      throw new Error('contentId is required');
    }

    if (this.isReady()) {
      const content = await this.registryContract.get_content(id);
      return {
        success: true,
        demo: false,
        contentId: id,
        contentHash: content[0],
        metadataCid: content[1],
        contentType: content[2],
        license: content[3],
        contributor: content[4],
        timestamp: Number(content[5]),
        exists: Boolean(content[6])
      };
    }

    const inMemory = this.inMemoryCertifications.get(id);
    if (!inMemory) {
      return {
        success: true,
        demo: true,
        contentId: id,
        exists: false
      };
    }

    return {
      success: true,
      demo: true,
      ...inMemory,
      exists: true
    };
  }

  async recordReward(payload) {
    const contributor = this.normalizeAddress(payload.contributor);
    const points = Number(payload.points || 0);
    const reason = String(payload.reason || 'CONTRIBUTION').slice(0, 64);

    if (this.isReady() && typeof this.registryContract.record_reward === 'function') {
      const tx = await this.registryContract.record_reward(
        contributor,
        points,
        reason
      );
      const receipt = await tx.wait();

      return {
        success: true,
        demo: false,
        contributor,
        points,
        reason,
        txHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        explorerUrl: this.getExplorerTransactionUrl(receipt.hash)
      };
    }

    const txHash = ethers.id(
      `reward:${contributor}:${points}:${reason}:${Date.now()}`
    );

    return {
      success: true,
      demo: true,
      contributor,
      points,
      reason,
      txHash,
      blockNumber: 0,
      explorerUrl: null
    };
  }

  async getStats() {
    const status = this.getStatus();
    let balanceEth = null;
    let totalCertifications = this.inMemoryCertifications.size;

    try {
      if (this.provider && this.wallet) {
        const balance = await this.provider.getBalance(this.wallet.address);
        balanceEth = ethers.formatEther(balance);
      }

      if (this.isReady()) {
        const total = await this.registryContract.total_certifications();
        totalCertifications = Number(total);
      }
    } catch (error) {
      logError(error, {
        service: 'BlockchainProvider',
        operation: 'getStats'
      });
    }

    return {
      ...status,
      balanceEth,
      totalCertifications
    };
  }
}

module.exports = new BlockchainProvider();
