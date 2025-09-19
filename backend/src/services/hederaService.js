const {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TokenTransferTransaction,
  AccountBalanceQuery,
  TransactionId,
  Hbar,
  Status
} = require('@hashgraph/sdk');
const web3Config = require('../config/web3');

class HederaService {
  constructor() {
    this.client = null;
    this.accountId = null;
    this.privateKey = null;
    this.network = process.env.HEDERA_NETWORK || 'testnet';
    this.isInitialized = false;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
  }

  async initialize() {
    try {
      // Utiliser la configuration centralisée
      const config = web3Config.getHederaConfig();
      if (!config.isInitialized) {
        console.log('⚠️ Configuration Hedera non initialisée, mode démo activé');
        return false;
      }

      this.client = config.client;
      this.accountId = config.accountId;
      this.privateKey = config.privateKey;
      this.isInitialized = true;

      console.log(`✅ Hedera ${this.network} service initialisé`);
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation Hedera Service:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  // Méthode utilitaire pour les retry avec backoff exponentiel
  async executeWithRetry(operation, operationName) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${operationName} - Tentative ${attempt}/${this.retryConfig.maxRetries} échouée:`, error.message);
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${operationName} échoué après ${this.retryConfig.maxRetries} tentatives: ${lastError.message}`);
  }

  // Méthode pour valider les paramètres
  validateParams(params, requiredFields) {
    const missing = requiredFields.filter(field => !params[field]);
    if (missing.length > 0) {
      throw new Error(`Paramètres manquants: ${missing.join(', ')}`);
    }
  }

  // Service HCS (Hedera Consensus Service) - Pour l'immutabilité des données
  async createTopic(topicMemo = 'Nkwa V Cultural Content') {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(topicMemo)
        .setMaxTransactionFee(new Hbar(2));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const topicId = receipt.topicId;

      console.log(`✅ Topic HCS créé: ${topicId.toString()}`);
      return {
        success: true,
        topicId: topicId.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('❌ Erreur création topic HCS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async submitMessage(topicId, message) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const messageData = JSON.stringify({
        timestamp: new Date().toISOString(),
        content: message,
        platform: 'Nkwa V'
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(messageData);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      console.log(`✅ Message HCS soumis: ${receipt.sequenceNumber}`);
      return {
        success: true,
        sequenceNumber: receipt.sequenceNumber.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('❌ Erreur soumission message HCS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Service HTS (Hedera Token Service) - Pour les tokens de récompense
  async createToken(tokenName, tokenSymbol, initialSupply = 1000000) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType('FUNGIBLE_COMMON')
        .setDecimals(2)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(this.accountId)
        .setSupplyType('INFINITE')
        .setMaxTransactionFee(new Hbar(30));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const tokenId = receipt.tokenId;

      console.log(`✅ Token HTS créé: ${tokenId.toString()}`);
      return {
        success: true,
        tokenId: tokenId.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('❌ Erreur création token HTS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async mintTokens(tokenId, amount) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const transaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      console.log(`✅ ${amount} tokens mintés`);
      return {
        success: true,
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('❌ Erreur mint tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async transferTokens(tokenId, recipientId, amount) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const transaction = new TokenTransferTransaction()
        .addTokenTransfer(tokenId, this.accountId, -amount)
        .addTokenTransfer(tokenId, recipientId, amount);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      console.log(`✅ ${amount} tokens transférés vers ${recipientId}`);
      return {
        success: true,
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('❌ Erreur transfert tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Service de certification NFT pour le contenu culturel
  async createContentNFT(contentId, contentHash, metadata) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      // Créer un NFT unique pour chaque contenu culturel
      const nftMetadata = {
        name: `Nkwa V Content #${contentId}`,
        description: `Certification blockchain pour le contenu culturel ${contentId}`,
        image: `https://ipfs.io/ipfs/${contentHash}`,
        attributes: [
          {
            trait_type: "Content Type",
            value: metadata.type
          },
          {
            trait_type: "Origin",
            value: metadata.origin
          },
          {
            trait_type: "Language",
            value: metadata.language
          },
          {
            trait_type: "Certification Date",
            value: new Date().toISOString()
          }
        ],
        external_url: `https://nkwa-vault.vercel.app/content/${contentId}`,
        background_color: "000000"
      };

      // Soumettre les métadonnées sur HCS pour l'immutabilité
      const hcsResult = await this.submitMessage(
        process.env.HEDERA_CONTENT_TOPIC_ID,
        {
          contentId,
          contentHash,
          metadata: nftMetadata,
          action: 'NFT_CREATION'
        }
      );

      return {
        success: true,
        contentId,
        contentHash,
        nftMetadata,
        hcsSequenceNumber: hcsResult.sequenceNumber,
        transactionId: hcsResult.transactionId
      };
    } catch (error) {
      console.error('❌ Erreur création NFT contenu:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Service de récompenses pour les contributeurs
  async rewardContributor(contributorId, contributionType, amount) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const rewardTokenId = process.env.HEDERA_REWARD_TOKEN_ID;
      if (!rewardTokenId) {
        throw new Error('Token de récompense non configuré');
      }

      // Transférer des tokens de récompense
      const transferResult = await this.transferTokens(
        rewardTokenId,
        contributorId,
        amount
      );

      if (transferResult.success) {
        // Enregistrer la récompense sur HCS
        await this.submitMessage(
          process.env.HEDERA_REWARDS_TOPIC_ID,
          {
            contributorId,
            contributionType,
            amount,
            timestamp: new Date().toISOString(),
            action: 'REWARD_DISTRIBUTION'
          }
        );

        console.log(`✅ Récompense de ${amount} tokens distribuée à ${contributorId}`);
      }

      return transferResult;
    } catch (error) {
      console.error('❌ Erreur distribution récompense:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Vérifier le statut d'une transaction
  async getTransactionStatus(transactionId) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const transactionIdObj = TransactionId.fromString(transactionId);
      const receipt = await transactionIdObj.getReceipt(this.client);
      
      return {
        success: true,
        status: receipt.status.toString(),
        isSuccessful: receipt.status === Status.Success
      };
    } catch (error) {
      console.error('❌ Erreur vérification transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir le solde d'un compte
  async getAccountBalance(accountId) {
    if (!this.isInitialized) {
      throw new Error('Service Hedera non initialisé');
    }

    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(this.client);

      return {
        success: true,
        hbars: balance.hbars.toString(),
        tokens: balance.tokens.toString()
      };
    } catch (error) {
      console.error('❌ Erreur récupération solde:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instance singleton
const hederaService = new HederaService();

module.exports = hederaService;
