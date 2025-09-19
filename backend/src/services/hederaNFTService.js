const { Client, PrivateKey, TokenId, AccountId, TokenMintTransaction, TokenCreateTransaction, TokenType, TokenSupplyType, TokenInfoQuery, AccountBalanceQuery, NftId, TokenNftInfoQuery } = require('@hashgraph/sdk');

class HederaNFTService {
  constructor() {
    this.client = null;
    this.treasuryAccountId = null;
    this.treasuryPrivateKey = null;
    this.tokenId = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Configuration Hedera
      const accountId = process.env.HEDERA_ACCOUNT_ID || 'your-hedera-account-id';
      const privateKey = process.env.HEDERA_PRIVATE_KEY || 'your-hedera-private-key';
      
      if (accountId === 'your-hedera-account-id' || privateKey === 'your-hedera-private-key') {
        console.log('⚠️ Configuration Hedera manquante, mode démo activé');
        this.isInitialized = false;
        return;
      }

      this.client = Client.forTestnet().setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));
      this.treasuryAccountId = AccountId.fromString(accountId);
      this.treasuryPrivateKey = PrivateKey.fromString(privateKey);
      
      // Créer ou récupérer le token NFT
      await this.createOrGetNFTToken();
      
      this.isInitialized = true;
      console.log('✅ Service Hedera NFT initialisé');
    } catch (error) {
      console.log('❌ Erreur initialisation Hedera NFT:', error.message);
      this.isInitialized = false;
    }
  }

  async createOrGetNFTToken() {
    try {
      // Vérifier si le token existe déjà
      const tokenId = process.env.HEDERA_NFT_TOKEN_ID;
      if (tokenId) {
        this.tokenId = TokenId.fromString(tokenId);
        console.log('✅ Token NFT existant récupéré:', tokenId);
        return;
      }

      // Créer un nouveau token NFT
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("Musée Virtuel Africain")
        .setTokenSymbol("MVA")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(this.treasuryAccountId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setAdminKey(this.treasuryPrivateKey.publicKey)
        .setSupplyKey(this.treasuryPrivateKey.publicKey)
        .setPauseKey(this.treasuryPrivateKey.publicKey)
        .setFreezeKey(this.treasuryPrivateKey.publicKey)
        .setWipeKey(this.treasuryPrivateKey.publicKey)
        .execute(this.client);

      const tokenCreateReceipt = await tokenCreateTx.getReceipt(this.client);
      this.tokenId = tokenCreateReceipt.tokenId;
      
      console.log('✅ Nouveau token NFT créé:', this.tokenId.toString());
      console.log('💡 Ajoutez HEDERA_NFT_TOKEN_ID=' + this.tokenId.toString() + ' à votre .env');
    } catch (error) {
      console.log('❌ Erreur création token NFT:', error.message);
      throw error;
    }
  }

  async mintNFT(metadata) {
    if (!this.isInitialized) {
      return this.createMockNFT(metadata);
    }

    try {
      // Mint NFT avec metadata
      const mintTx = await new TokenMintTransaction()
        .setTokenId(this.tokenId)
        .setMetadata([Buffer.from(JSON.stringify(metadata))])
        .execute(this.client);

      const mintReceipt = await mintTx.getReceipt(this.client);
      const nftId = mintReceipt.serials[0];
      
      console.log(`✅ NFT minté: Token ID ${this.tokenId}, Serial ${nftId}`);
      
      return {
        success: true,
        tokenId: this.tokenId.toString(),
        serialNumber: nftId.toString(),
        metadata: metadata
      };
    } catch (error) {
      console.log('❌ Erreur mint NFT:', error.message);
      return this.createMockNFT(metadata);
    }
  }

  async createMockNFT(metadata) {
    console.log('🔧 Mode démo - NFT simulé créé');
    return {
      success: true,
      tokenId: '0.0.123456',
      serialNumber: Math.floor(Math.random() * 10000).toString(),
      metadata: metadata,
      mock: true
    };
  }

  async getNFTInfo(tokenId, serialNumber) {
    if (!this.isInitialized) {
      return this.getMockNFTInfo(serialNumber);
    }

    try {
      const nftId = new NftId(TokenId.fromString(tokenId), parseInt(serialNumber));
      const nftInfo = await new TokenNftInfoQuery()
        .setNftId(nftId)
        .execute(this.client);

      return {
        success: true,
        nftId: nftId.toString(),
        accountId: nftInfo.accountId.toString(),
        metadata: nftInfo.metadata ? JSON.parse(nftInfo.metadata.toString()) : null
      };
    } catch (error) {
      console.log('❌ Erreur récupération NFT:', error.message);
      return this.getMockNFTInfo(serialNumber);
    }
  }

  getMockNFTInfo(serialNumber) {
    return {
      success: true,
      nftId: `0.0.123456:${serialNumber}`,
      accountId: '0.0.123456',
      metadata: {
        name: 'Masque Africain - Mode Démo',
        description: 'NFT de démonstration',
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        culture: 'Démo',
        country: 'Afrique'
      },
      mock: true
    };
  }

  async getAllNFTs() {
    if (!this.isInitialized) {
      return this.getMockNFTs();
    }

    try {
      // Récupérer tous les NFTs du token
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(this.tokenId)
        .execute(this.client);

      const nfts = [];
      for (let i = 1; i <= tokenInfo.totalSupply; i++) {
        const nftInfo = await this.getNFTInfo(this.tokenId.toString(), i.toString());
        if (nftInfo.success && nftInfo.metadata) {
          nfts.push({
            id: `NFT-${this.tokenId.toString()}-${i}`,
            type: 'nft',
            tokenId: this.tokenId.toString(),
            serialNumber: i.toString(),
            ...nftInfo.metadata
          });
        }
      }

      return nfts;
    } catch (error) {
      console.log('❌ Erreur récupération NFTs:', error.message);
      return this.getMockNFTs();
    }
  }

  getMockNFTs() {
    return [
      {
        id: 'NFT-0.0.123456-1',
        type: 'nft',
        tokenId: '0.0.123456',
        serialNumber: '1',
        name: 'Masque Gouro - Côte d\'Ivoire',
        description: 'Masque cérémoniel Gouro, collection virtuelle',
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        source: 'Smithsonian / Open Access',
        license: 'CC0',
        culture: 'Gouro',
        country: 'Côte d\'Ivoire',
        tags: ['masque', 'bois', 'rituel'],
        minted: true,
        mock: true
      },
      {
        id: 'NFT-0.0.123456-2',
        type: 'nft',
        tokenId: '0.0.123456',
        serialNumber: '2',
        name: 'Statue Ashanti - Ghana',
        description: 'Statue en bronze représentant un chef Ashanti',
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        source: 'Musée du Quai Branly',
        license: 'CC0',
        culture: 'Ashanti',
        country: 'Ghana',
        tags: ['statue', 'bronze', 'chef'],
        minted: true,
        mock: true
      }
    ];
  }
}

module.exports = new HederaNFTService();

