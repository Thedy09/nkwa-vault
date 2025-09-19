const hederaService = require('./hederaService');
const { prisma } = require('../config/database');

class TokenRewardsService {
  constructor() {
    this.isInitialized = false;
    this.rewardRates = {
      // Récompenses par type de contribution
      CONTENT_UPLOAD: 10,        // 10 tokens pour upload de contenu
      CONTENT_VERIFICATION: 5,    // 5 tokens pour vérification
      TRANSLATION: 15,           // 15 tokens pour traduction
      REVIEW: 8,                 // 8 tokens pour review
      SHARE: 3,                  // 3 tokens pour partage
      LIKE: 1,                   // 1 token pour like
      COMMENT: 2,                // 2 tokens pour commentaire
      QUALITY_CONTRIBUTION: 25,  // 25 tokens pour contribution de qualité
      COMMUNITY_MODERATION: 20,  // 20 tokens pour modération
      CULTURAL_EXPERT: 50        // 50 tokens pour expertise culturelle
    };
  }

  async initialize() {
    try {
      const hederaInit = await hederaService.initialize();
      this.isInitialized = hederaInit;
      
      if (this.isInitialized) {
        console.log('✅ Service de récompenses tokenisées initialisé');
      } else {
        console.log('⚠️ Service de récompenses en mode démo');
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation récompenses:', error);
      return false;
    }
  }

  // Calculer les récompenses basées sur le type de contribution
  calculateReward(contributionType, quality = 1, multiplier = 1) {
    const baseReward = this.rewardRates[contributionType] || 0;
    const qualityMultiplier = Math.min(quality, 3); // Max 3x pour la qualité
    return Math.floor(baseReward * qualityMultiplier * multiplier);
  }

  // Distribuer des récompenses à un utilisateur
  async distributeReward(userId, contributionType, metadata = {}) {
    try {
      console.log(`🎁 Distribution de récompense: ${contributionType} pour utilisateur ${userId}`);

      // Calculer la récompense
      const rewardAmount = this.calculateReward(
        contributionType,
        metadata.quality || 1,
        metadata.multiplier || 1
      );

      if (rewardAmount <= 0) {
        return {
          success: false,
          error: 'Type de contribution non reconnu ou récompense nulle'
        };
      }

      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { stats: true }
      });

      if (!user) {
        return {
          success: false,
          error: 'Utilisateur non trouvé'
        };
      }

      // Distribuer les tokens sur Hedera (si disponible)
      let hederaResult = null;
      if (this.isInitialized && hederaService.isInitialized) {
        hederaResult = await hederaService.rewardContributor(
          userId,
          contributionType,
          rewardAmount
        );
      }

      // Enregistrer la récompense en base de données
      const rewardRecord = await prisma.reward.create({
        data: {
          userId,
          type: contributionType,
          amount: rewardAmount,
          metadata: metadata,
          hederaTransactionId: hederaResult?.transactionId || null,
          status: hederaResult?.success ? 'DISTRIBUTED' : 'PENDING'
        }
      });

      // Mettre à jour les statistiques utilisateur
      await prisma.userStats.update({
        where: { userId },
        data: {
          totalRewards: {
            increment: rewardAmount
          },
          contributions: {
            increment: 1
          }
        }
      });

      console.log(`✅ Récompense distribuée: ${rewardAmount} tokens à ${user.name}`);

      return {
        success: true,
        reward: {
          id: rewardRecord.id,
          userId,
          type: contributionType,
          amount: rewardAmount,
          hederaTransactionId: hederaResult?.transactionId,
          status: rewardRecord.status,
          createdAt: rewardRecord.createdAt
        },
        hederaResult
      };
    } catch (error) {
      console.error('❌ Erreur distribution récompense:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir le solde de tokens d'un utilisateur
  async getUserTokenBalance(userId) {
    try {
      // Récupérer depuis la base de données
      const userStats = await prisma.userStats.findUnique({
        where: { userId }
      });

      let hederaBalance = null;
      if (this.isInitialized && hederaService.isInitialized) {
        // Dans un vrai système, on récupérerait le solde depuis Hedera
        hederaBalance = {
          tokens: userStats?.totalRewards || 0,
          demo: true
        };
      }

      return {
        success: true,
        balance: {
          totalRewards: userStats?.totalRewards || 0,
          hederaBalance,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération solde:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir l'historique des récompenses d'un utilisateur
  async getUserRewardHistory(userId, limit = 50) {
    try {
      const rewards = await prisma.reward.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return {
        success: true,
        rewards: rewards.map(reward => ({
          id: reward.id,
          type: reward.type,
          amount: reward.amount,
          status: reward.status,
          hederaTransactionId: reward.hederaTransactionId,
          createdAt: reward.createdAt,
          metadata: reward.metadata
        }))
      };
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Créer un système de niveaux basé sur les récompenses
  async getUserLevel(userId) {
    try {
      const userStats = await prisma.userStats.findUnique({
        where: { userId }
      });

      const totalRewards = userStats?.totalRewards || 0;
      
      // Système de niveaux
      const levels = [
        { name: 'Débutant', minRewards: 0, maxRewards: 99, color: '#6B7280' },
        { name: 'Contributeur', minRewards: 100, maxRewards: 499, color: '#10B981' },
        { name: 'Expert', minRewards: 500, maxRewards: 999, color: '#3B82F6' },
        { name: 'Maître', minRewards: 1000, maxRewards: 2499, color: '#8B5CF6' },
        { name: 'Légende', minRewards: 2500, maxRewards: Infinity, color: '#F59E0B' }
      ];

      const currentLevel = levels.find(level => 
        totalRewards >= level.minRewards && totalRewards <= level.maxRewards
      ) || levels[0];

      const nextLevel = levels.find(level => level.minRewards > totalRewards);
      const progressToNext = nextLevel ? 
        ((totalRewards - currentLevel.minRewards) / (nextLevel.minRewards - currentLevel.minRewards)) * 100 : 100;

      return {
        success: true,
        level: {
          current: currentLevel,
          next: nextLevel,
          progress: Math.min(progressToNext, 100),
          totalRewards,
          contributions: userStats?.contributions || 0
        }
      };
    } catch (error) {
      console.error('❌ Erreur calcul niveau:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Créer des défis et objectifs pour encourager la participation
  async createChallenge(userId, challengeType, target, reward) {
    try {
      const challenge = await prisma.challenge.create({
        data: {
          userId,
          type: challengeType,
          target,
          reward,
          status: 'ACTIVE',
          startDate: new Date(),
          metadata: {
            createdBy: 'system',
            description: this.getChallengeDescription(challengeType, target)
          }
        }
      });

      return {
        success: true,
        challenge: {
          id: challenge.id,
          type: challengeType,
          target,
          reward,
          status: challenge.status,
          description: challenge.metadata.description
        }
      };
    } catch (error) {
      console.error('❌ Erreur création défi:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Vérifier et valider les défis
  async checkChallengeProgress(userId, challengeId) {
    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge || challenge.status !== 'ACTIVE') {
        return {
          success: false,
          error: 'Défi non trouvé ou inactif'
        };
      }

      // Vérifier le progrès selon le type de défi
      let progress = 0;
      switch (challenge.type) {
        case 'UPLOAD_CONTENT':
          const uploads = await prisma.culturalContent.count({
            where: { 
              userId,
              createdAt: { gte: challenge.startDate }
            }
          });
          progress = uploads;
          break;
        case 'VERIFY_CONTENT':
          const verifications = await prisma.review.count({
            where: { 
              userId,
              createdAt: { gte: challenge.startDate }
            }
          });
          progress = verifications;
          break;
        // Ajouter d'autres types de défis...
      }

      const isCompleted = progress >= challenge.target;

      if (isCompleted && challenge.status === 'ACTIVE') {
        // Distribuer la récompense
        const rewardResult = await this.distributeReward(
          userId,
          'CHALLENGE_COMPLETION',
          { challengeId, challengeType: challenge.type }
        );

        // Marquer le défi comme complété
        await prisma.challenge.update({
          where: { id: challengeId },
          data: { 
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        return {
          success: true,
          completed: true,
          progress,
          target: challenge.target,
          reward: rewardResult.reward
        };
      }

      return {
        success: true,
        completed: false,
        progress,
        target: challenge.target,
        remaining: challenge.target - progress
      };
    } catch (error) {
      console.error('❌ Erreur vérification défi:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir la description d'un défi
  getChallengeDescription(type, target) {
    const descriptions = {
      'UPLOAD_CONTENT': `Partagez ${target} contenus culturels`,
      'VERIFY_CONTENT': `Vérifiez ${target} contenus de la communauté`,
      'TRANSLATE_CONTENT': `Traduisez ${target} contenus`,
      'SOCIAL_INTERACTION': `Interagissez ${target} fois avec la communauté`
    };
    return descriptions[type] || `Défi: ${type} (${target})`;
  }

  // Obtenir le classement des contributeurs
  async getLeaderboard(limit = 10) {
    try {
      const topContributors = await prisma.userStats.findMany({
        orderBy: { totalRewards: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        leaderboard: topContributors.map((stats, index) => ({
          rank: index + 1,
          userId: stats.userId,
          name: stats.user.name,
          totalRewards: stats.totalRewards,
          contributions: stats.contributions
        }))
      };
    } catch (error) {
      console.error('❌ Erreur récupération classement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instance singleton
const tokenRewardsService = new TokenRewardsService();

module.exports = tokenRewardsService;


