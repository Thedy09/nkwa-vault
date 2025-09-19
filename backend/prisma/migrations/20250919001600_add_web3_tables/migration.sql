-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('PROVERB', 'TALE', 'RIDDLE', 'MUSIC', 'ART', 'DANCE', 'RECIPE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DRAFT', 'VERIFIED');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('CONTENT_UPLOAD', 'CONTENT_VERIFICATION', 'TRANSLATION', 'REVIEW', 'SHARE', 'LIKE', 'COMMENT', 'QUALITY_CONTRIBUTION', 'COMMUNITY_MODERATION', 'CULTURAL_EXPERT', 'CHALLENGE_COMPLETION');

-- CreateEnum
CREATE TYPE "public"."RewardStatus" AS ENUM ('PENDING', 'DISTRIBUTED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ChallengeType" AS ENUM ('UPLOAD_CONTENT', 'VERIFY_CONTENT', 'TRANSLATE_CONTENT', 'SOCIAL_INTERACTION', 'QUALITY_CONTRIBUTION', 'COMMUNITY_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "public"."ChallengeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CertificateStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "public"."likes" ADD COLUMN     "contentId" TEXT,
ALTER COLUMN "riddleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."reviews" ADD COLUMN     "contentId" TEXT,
ALTER COLUMN "riddleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_stats" ADD COLUMN     "totalRewards" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."cultural_content" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."ContentType" NOT NULL,
    "language" VARCHAR(10) NOT NULL DEFAULT 'fr',
    "origin" VARCHAR(100),
    "region" VARCHAR(100),
    "country" VARCHAR(100),
    "userId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "mediaFiles" JSONB,
    "ipfsCid" VARCHAR(100),
    "ipfsUrl" VARCHAR(500),
    "certificationHash" VARCHAR(64),
    "hederaTransactionId" VARCHAR(100),
    "hederaSequenceNumber" VARCHAR(50),
    "nftMetadata" JSONB,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PENDING',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cultural_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT,
    "type" "public"."RewardType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."RewardStatus" NOT NULL DEFAULT 'PENDING',
    "hederaTransactionId" VARCHAR(100),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."ChallengeType" NOT NULL,
    "target" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "status" "public"."ChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ip_certificates" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "certificateId" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "author" VARCHAR(100) NOT NULL,
    "origin" VARCHAR(100),
    "type" "public"."ContentType" NOT NULL,
    "contentHash" VARCHAR(64) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuer" VARCHAR(100) NOT NULL DEFAULT 'Nkwa Vault',
    "status" "public"."CertificateStatus" NOT NULL DEFAULT 'ACTIVE',
    "rights" JSONB NOT NULL,
    "ipfsCid" VARCHAR(100),
    "hederaTransactionId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_certificates_contentId_key" ON "public"."ip_certificates"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ip_certificates_certificateId_key" ON "public"."ip_certificates"("certificateId");

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."cultural_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."cultural_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cultural_content" ADD CONSTRAINT "cultural_content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rewards" ADD CONSTRAINT "rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rewards" ADD CONSTRAINT "rewards_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."cultural_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ip_certificates" ADD CONSTRAINT "ip_certificates_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."cultural_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
