import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'zu', name: 'IsiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'IsiXhosa', flag: '🇿🇦' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ti', name: 'ትግርኛ', flag: '🇪🇹' },
  { code: 'so', name: 'Soomaali', flag: '🇸🇴' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'tn', name: 'Setswana', flag: '🇧🇼' }
];

// Détection automatique de la langue basée sur la géolocalisation
const detectLanguage = () => {
  const supportedCodes = new Set(SUPPORTED_LANGUAGES.map((lang) => lang.code));

  // D'abord, vérifier si l'utilisateur a une préférence stockée
  const savedLanguage = typeof window !== 'undefined'
    ? window.localStorage.getItem('nkwa-language')
    : null;
  if (savedLanguage && supportedCodes.has(savedLanguage)) {
    return savedLanguage;
  }

  // Détecter la langue du navigateur
  const browserLang = typeof navigator !== 'undefined'
    ? (navigator.language || navigator.languages?.[0] || 'en')
    : 'en';
  const langCode = browserLang.split('-')[0];

  // Mapper les codes de langue vers nos langues supportées
  const languageMap = {
    'fr': 'fr',
    'en': 'en',
    'es': 'es',
    'pt': 'pt',
    'ar': 'ar',
    'sw': 'sw', // Swahili
    'yo': 'yo', // Yoruba
    'ig': 'ig', // Igbo
    'ha': 'ha', // Hausa
    'zu': 'zu', // Zulu
    'xh': 'xh', // Xhosa
    'am': 'am', // Amharic
    'ti': 'ti', // Tigrinya
    'so': 'so', // Somali
    'rw': 'rw', // Kinyarwanda
    'lg': 'lg', // Luganda
    'ny': 'ny', // Chichewa
    'sn': 'sn', // Shona
    'st': 'st', // Sesotho
    'tn': 'tn' // Setswana
  };

  const resolvedLanguage = languageMap[langCode] || 'en';
  return supportedCodes.has(resolvedLanguage) ? resolvedLanguage : 'en';
};

// Traductions disponibles
const translations = {
  en: {
    // Navigation
    home: 'Home',
    museum: 'Museum',
    virtualMuseum: 'Virtual Museum',
    web3Dashboard: 'Web3',
    share: 'Share',
    about: 'About',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    guestUser: 'User',
    
    // Home Page
    heroTitle: 'Nkwa V',
    heroSubtitle: 'Preserve. Share. Celebrate.',
    heroDescription: 'A revolutionary platform to preserve and share the rich African cultural heritage. Tales, proverbs, music, dance and crafts - all of Africa\'s heritage in one place.',
    exploreCollection: 'Explore Collection',
    contribute: 'Contribute',
    discoverHeritage: 'Discover Our Heritage',
    exploreFacets: 'Explore the different facets of African culture',
    
    // Categories
    talesCategory: 'Tales & Legends',
    talesDesc: 'Discover the millennial stories that shaped Africa',
    musicCategory: 'Music & Songs',
    musicDesc: 'Listen to traditional and modern melodies',
    artCategory: 'Art & Crafts',
    artDesc: 'Admire exceptional artistic creations',
    traditions: 'Traditions',
    traditionsDesc: 'Explore ancestral customs and practices',
    
    // Features
    digitalPreservation: 'Digital Preservation',
    digitalPreservationDesc: 'Permanent backup on an EVM-compatible blockchain',
    community: 'Community',
    communityDesc: 'Share and discover with other enthusiasts',
    authenticity: 'Authenticity',
    authenticityDesc: 'Verified and authentic content',
    
    // Why Choose
    whyChoose: 'Why Choose Nkwa V?',
    whyChooseDesc: 'Cutting-edge technology at the service of culture',
    
    // CTA
    joinRevolution: 'Join the Cultural Revolution',
    joinRevolutionDesc: 'Contribute to preserving and sharing African heritage for future generations',
    startNow: 'Start Now',
    discover: 'Discover',
    
    // Museum
    museumTitle: 'African Cultural Museum',
    museumSubtitle: 'Explore our collection of African cultural treasures',
    searchPlaceholder: 'Search in the collection...',
    all: 'All',
    talesFilter: 'Tales',
    proverbs: 'Proverbs',
    songs: 'Songs',
    dances: 'Dances',
    artFilter: 'Art',
    noResults: 'No results found',
    tryModifying: 'Try modifying your search criteria',
    audioAvailable: 'Audio available',
    
    // Upload Form
    shareContent: 'Share Cultural Content',
    shareDesc: 'Contribute to preserving African heritage by sharing your cultural content',
    title: 'Title',
    titlePlaceholder: 'Enter the title of your content',
    description: 'Description',
    descriptionPlaceholder: 'Describe your cultural content',
    categoryLabel: 'Category',
    selectCategory: 'Select a category',
    country: 'Country',
    countryPlaceholder: 'Enter the country of origin',
    region: 'Region',
    regionPlaceholder: 'Enter the region or city',
    languages: 'Languages',
    languagesPlaceholder: 'Enter the languages used',
    tags: 'Tags',
    tagsPlaceholder: 'Enter relevant tags (separated by commas)',
    source: 'Source',
    sourcePlaceholder: 'Enter the source or origin of the content',
    culturalSignificance: 'Cultural Significance',
    culturalSignificancePlaceholder: 'Explain the cultural importance',
    difficulty: 'Difficulty Level',
    ageGroup: 'Age Group',
    uploadMedia: 'Upload Media',
    dragDrop: 'Drag and drop files here, or click to select',
    supportedFormats: 'Supported formats: Images, Audio, Video, Documents',
    submit: 'Submit Content',
    
    // Footer
    footerDesc: 'Preserve and share the rich African cultural heritage',
    allRightsReserved: 'All rights reserved',
    
    // Feedback
    giveFeedback: 'Give your feedback',
    feedbackTitle: 'Share Your Feedback',
    feedbackDesc: 'Help us improve Nkwa V by sharing your thoughts',
    rating: 'Rating',
    category: 'Category',
    message: 'Message',
    messagePlaceholder: 'Tell us what you think...',
    submitFeedback: 'Submit Feedback',
    thankYou: 'Thank you for your feedback!',
    
    // About Page
    aboutTitle: 'About Nkwa V',
    aboutSubtitle: 'Preserving African Heritage Through Technology',
    aboutDescription: 'A revolutionary platform that combines blockchain technology, AI-powered translation, and community-driven verification to preserve and share the rich cultural heritage of Africa.',
    explorePlatform: 'Explore Platform',
    joinCommunity: 'Join Community',
    languagesSupported: 'Languages Supported',
    culturalItems: 'Cultural Items',
    communityContributors: 'Community Contributors',
    uptime: 'Uptime',
    multilingualSupport: 'Multilingual Support',
    multilingualSupportDesc: 'Real-time translation into 20+ African languages with cultural context understanding',
    blockchainSecurity: 'Blockchain Security',
    blockchainSecurityDesc: 'Permanent preservation on blockchain with IPFS decentralized storage',
    communityDriven: 'Community Driven',
    communityDrivenDesc: 'Peer verification and token rewards for authentic cultural contributions',
    aiPowered: 'AI Powered',
    aiPoweredDesc: 'Intelligent content analysis and automatic translation with cultural sensitivity',
    ourMission: 'Our Mission',
    missionDescription: 'To create a decentralized platform that preserves, shares, and celebrates African cultural heritage while making it accessible to the world through cutting-edge technology.',
    preserveHeritage: 'Preserve endangered cultural knowledge',
    bridgeLanguages: 'Bridge language barriers globally',
    empowerCommunities: 'Empower communities to share their heritage',
    fosterUnderstanding: 'Foster cross-cultural understanding',
    keyFeatures: 'Key Features',
    keyFeaturesDesc: 'Discover the innovative technologies powering Nkwa V',
    ourTeam: 'Our Team',
    teamDescription: 'A diverse team of technologists, cultural experts, and community advocates working together to preserve African heritage.',
    development: 'Development',
    techTeamDesc: 'Full-stack developers and blockchain engineers building the future of cultural preservation',
    culturalExperts: 'Cultural Experts',
    culturalAdvisorsDesc: 'Anthropologists, linguists, and cultural preservation specialists ensuring authenticity',
    contributors: 'Contributors',
    communityDesc: 'Community members, educators, and cultural enthusiasts contributing to the platform',
    roadmap: 'Roadmap',
    roadmapDescription: 'Our journey towards creating a comprehensive platform for African cultural preservation',
    platformLaunch: 'Platform Launch',
    platformLaunchDesc: 'Core platform development with multilingual support and basic blockchain integration',
    communityExpansion: 'Community Expansion',
    communityExpansionDesc: 'DAO governance, token economy, and community verification system',
    aiIntegration: 'AI Integration',
    aiIntegrationDesc: 'Advanced AI features, content generation, and cultural trend analysis',
    globalPartnerships: 'Global Partnerships',
    globalPartnershipsDesc: 'Museum integrations, educational partnerships, and worldwide expansion',
    mobileApp: 'Mobile Application',
    mobileAppDesc: 'Launch native mobile apps for iOS and Android to make African culture accessible on-the-go with offline capabilities.',
    joinOurMission: 'Join Our Mission',
    ctaDescription: 'Be part of the movement to preserve African cultural heritage for future generations',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Riddles Page
    riddlesTitle: 'African Cultural Riddles',
    riddlesSubtitle: 'Test Your Knowledge of African Wisdom',
    riddlesDescription: 'Discover the rich tradition of African riddles and proverbs while testing your cultural knowledge. Each riddle carries deep cultural meaning and wisdom.',
    riddles: 'Riddles',
    perRiddle: 'per riddle',
    pointsSystem: 'Points System',
    startRiddles: 'Start Riddles',
    points: 'Points',
    streak: 'Streak',
    enterAnswer: 'Enter your answer...',
    useHint: 'Use Hint (-10s)',
    hintUsed: 'Hint Used',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    correctAnswer: 'Correct Answer',
    explanation: 'Explanation',
    culturalContext: 'Cultural Context',
    nextRiddle: 'Next Riddle',
    finishGame: 'Finish Game',
    congratulations: 'Congratulations!',
    excellentScore: 'Excellent! You\'re a true African culture expert!',
    goodScore: 'Great job! You have good knowledge of African culture.',
    averageScore: 'Not bad! Keep learning about African culture.',
    keepTrying: 'Keep trying! African culture is rich and fascinating.',
    totalPoints: 'Total Points',
    bestStreak: 'Best Streak',
    accuracy: 'Accuracy',
    playAgain: 'Play Again',
    backToMenu: 'Back to Menu',
    
    // Riddle Questions and Answers
    riddle1Question: 'I am tall when I am young, and short when I am old. What am I?',
    riddle1Answer: 'A candle',
    riddle1Hint: 'Think about something that burns and gets shorter over time.',
    riddle1Explanation: 'A candle starts tall and becomes shorter as it burns, representing the passage of time and the wisdom that comes with age.',
    riddle1CulturalContext: 'This riddle teaches about the value of time and the importance of using our youth wisely, a common theme in African wisdom traditions.',
    riddle2Question: 'I have a head and a tail, but no body. What am I?',
    riddle2Answer: 'A coin',
    riddle2Hint: 'Think about something you use to buy things.',
    riddle2Explanation: 'A coin has a head (front) and a tail (back) but no body, representing the duality of life and the importance of balance.',
    riddle2CulturalContext: 'In many African cultures, coins represent prosperity and are often used in traditional ceremonies and blessings.',
    riddle3Question: 'The more you take, the more you leave behind. What am I?',
    riddle3Answer: 'Footsteps',
    riddle3Hint: 'Think about what you leave behind when you walk.',
    riddle3Explanation: 'When you take steps, you leave behind footsteps, representing the impact we have on the world around us.',
    riddle3CulturalContext: 'This riddle emphasizes the importance of our actions and the legacy we leave behind, a core value in African communities.',
    riddle4Question: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
    riddle4Answer: 'An echo',
    riddle4Hint: 'Think about what happens when you shout in a valley.',
    riddle4Explanation: 'An echo repeats sounds without having physical form, representing the power of words and their lasting impact.',
    riddle4CulturalContext: 'In African oral traditions, the echo represents the way stories and wisdom are passed down through generations.',
    riddle5Question: 'I am always in front of you, but you can never see me. What am I?',
    riddle5Answer: 'The future',
    riddle5Hint: 'Think about what is always ahead but never visible.',
    riddle5Explanation: 'The future is always ahead of us but remains unseen, representing hope and the unknown possibilities of life.',
    riddle5CulturalContext: 'This riddle reflects the African philosophy of looking forward with hope while respecting the past and present.',
    
    // Categories
    nature: 'Nature',
    animals: 'Animals',
    family: 'Family',
    wisdom: 'Wisdom',
    community: 'Community',
    
    // Riddles Showcase
    riddlesShowcaseTitle: 'Test Your Cultural Knowledge',
    riddlesShowcaseDesc: 'Challenge yourself with traditional African riddles and discover the wisdom embedded in our cultural heritage. Each riddle carries deep meaning and teaches valuable life lessons.',
    riddlesFeature1: 'Interactive Learning Experience',
    riddlesFeature2: 'Multilingual Support',
    riddlesFeature3: 'Cultural Context & Explanations',
    playRiddles: 'Play Riddles',
    riddleSample1: 'Challenge your mind with traditional wisdom',
    riddleSample2: 'Learn through interactive cultural games',
    riddleSample3: 'Earn points and unlock achievements',
    
    // Riddle Contribution
    contributeRiddles: 'Contribute Riddles',
    contributeRiddlesSubtitle: 'Share your African riddles with the community',
    contributeRiddlesDescription: 'Help preserve African cultural heritage by sharing traditional riddles from your community. Your contributions will be reviewed before publication.',
    addRiddle: 'Add a Riddle',
    history: 'History',
    traditions: 'Traditions',
    other: 'Other',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    museum: 'Musée',
    virtualMuseum: 'Musée Virtuel',
    web3Dashboard: 'Web3',
    share: 'Partager',
    about: 'À Propos',
    admin: 'Admin',
    login: 'Connexion',
    logout: 'Déconnexion',
    profile: 'Profil',
    guestUser: 'Utilisateur',
    
    // Home Page
    heroTitle: 'Nkwa V',
    heroSubtitle: 'Préserver. Partager. Célébrer.',
    heroDescription: 'Une plateforme révolutionnaire pour préserver et partager le riche patrimoine culturel africain. Contes, proverbes, musiques, danses et artisanat - tout l\'héritage de l\'Afrique en un seul endroit.',
    exploreCollection: 'Explorer la Collection',
    contribute: 'Contribuer',
    discoverHeritage: 'Découvrez Notre Patrimoine',
    exploreFacets: 'Explorez les différentes facettes de la culture africaine',
    
    // Categories
    talesCategory: 'Contes & Légendes',
    talesDesc: 'Découvrez les histoires millénaires qui ont façonné l\'Afrique',
    musicCategory: 'Musique & Chants',
    musicDesc: 'Écoutez les mélodies traditionnelles et modernes',
    artCategory: 'Art & Artisanat',
    artDesc: 'Admirez les créations artistiques exceptionnelles',
    traditions: 'Traditions',
    traditionsDesc: 'Explorez les coutumes et pratiques ancestrales',
    
    // Features
    digitalPreservation: 'Préservation Digitale',
    digitalPreservationDesc: 'Sauvegarde permanente sur une blockchain compatible EVM',
    community: 'Communauté',
    communityDesc: 'Partagez et découvrez avec d\'autres passionnés',
    authenticity: 'Authenticité',
    authenticityDesc: 'Contenu vérifié et authentique',
    
    // Why Choose
    whyChoose: 'Pourquoi Choisir Nkwa V ?',
    whyChooseDesc: 'Une technologie de pointe au service de la culture',
    
    // CTA
    joinRevolution: 'Rejoignez la Révolution Culturelle',
    joinRevolutionDesc: 'Contribuez à préserver et partager le patrimoine africain pour les générations futures',
    startNow: 'Commencer Maintenant',
    discover: 'Découvrir',
    
    // Museum
    museumTitle: 'Musée Culturel Africain',
    museumSubtitle: 'Explorez notre collection de trésors culturels africains',
    searchPlaceholder: 'Rechercher dans la collection...',
    all: 'Toutes',
    tales: 'Contes',
    proverbs: 'Proverbes',
    songs: 'Chants',
    dances: 'Danses',
    art: 'Art',
    noResults: 'Aucun résultat trouvé',
    tryModifying: 'Essayez de modifier vos critères de recherche',
    audioAvailable: 'Audio disponible',
    
    // Upload Form
    shareContent: 'Partager du Contenu Culturel',
    shareDesc: 'Contribuez à préserver le patrimoine africain en partageant votre contenu culturel',
    title: 'Titre',
    titlePlaceholder: 'Entrez le titre de votre contenu',
    description: 'Description',
    descriptionPlaceholder: 'Décrivez votre contenu culturel',
    categoryLabel: 'Catégorie',
    selectCategory: 'Sélectionnez une catégorie',
    country: 'Pays',
    countryPlaceholder: 'Entrez le pays d\'origine',
    region: 'Région',
    regionPlaceholder: 'Entrez la région ou la ville',
    languages: 'Langues',
    languagesPlaceholder: 'Entrez les langues utilisées',
    tags: 'Tags',
    tagsPlaceholder: 'Entrez des tags pertinents (séparés par des virgules)',
    source: 'Source',
    sourcePlaceholder: 'Entrez la source ou l\'origine du contenu',
    culturalSignificance: 'Signification Culturelle',
    culturalSignificancePlaceholder: 'Expliquez l\'importance culturelle',
    difficulty: 'Niveau de Difficulté',
    ageGroup: 'Groupe d\'Âge',
    uploadMedia: 'Télécharger des Médias',
    dragDrop: 'Glissez-déposez les fichiers ici, ou cliquez pour sélectionner',
    supportedFormats: 'Formats supportés : Images, Audio, Vidéo, Documents',
    submit: 'Soumettre le Contenu',
    
    // Footer
    footerDesc: 'Préserver et partager le riche patrimoine culturel africain',
    allRightsReserved: 'Tous droits réservés',
    
    // Feedback
    giveFeedback: 'Donner votre avis',
    feedbackTitle: 'Partagez Votre Avis',
    feedbackDesc: 'Aidez-nous à améliorer Nkwa V en partageant vos pensées',
    rating: 'Note',
    category: 'Catégorie',
    message: 'Message',
    messagePlaceholder: 'Dites-nous ce que vous pensez...',
    submitFeedback: 'Soumettre l\'Avis',
    thankYou: 'Merci pour votre avis !',
    
    // About Page
    aboutTitle: 'À Propos de Nkwa V',
    aboutSubtitle: 'Préserver le Patrimoine Africain par la Technologie',
    aboutDescription: 'Une plateforme révolutionnaire qui combine la technologie blockchain, la traduction IA et la vérification communautaire pour préserver et partager le riche patrimoine culturel de l\'Afrique.',
    explorePlatform: 'Explorer la Plateforme',
    joinCommunity: 'Rejoindre la Communauté',
    languagesSupported: 'Langues Supportées',
    culturalItems: 'Éléments Culturels',
    communityContributors: 'Contributeurs Communautaires',
    uptime: 'Disponibilité',
    multilingualSupport: 'Support Multilingue',
    multilingualSupportDesc: 'Traduction en temps réel dans 20+ langues africaines avec compréhension du contexte culturel',
    blockchainSecurity: 'Sécurité Blockchain',
    blockchainSecurityDesc: 'Préservation permanente sur blockchain avec stockage décentralisé IPFS',
    communityDriven: 'Communautaire',
    communityDrivenDesc: 'Vérification par les pairs et récompenses token pour les contributions culturelles authentiques',
    aiPowered: 'Alimenté par l\'IA',
    aiPoweredDesc: 'Analyse intelligente du contenu et traduction automatique avec sensibilité culturelle',
    ourMission: 'Notre Mission',
    missionDescription: 'Créer une plateforme décentralisée qui préserve, partage et célèbre le patrimoine culturel africain tout en le rendant accessible au monde grâce à une technologie de pointe.',
    preserveHeritage: 'Préserver les connaissances culturelles en danger',
    bridgeLanguages: 'Combler les barrières linguistiques mondiales',
    empowerCommunities: 'Autonomiser les communautés à partager leur patrimoine',
    fosterUnderstanding: 'Favoriser la compréhension interculturelle',
    keyFeatures: 'Fonctionnalités Clés',
    keyFeaturesDesc: 'Découvrez les technologies innovantes qui alimentent Nkwa V',
    ourTeam: 'Notre Équipe',
    teamDescription: 'Une équipe diversifiée de technologues, d\'experts culturels et d\'avocats communautaires travaillant ensemble pour préserver le patrimoine africain.',
    development: 'Développement',
    techTeamDesc: 'Développeurs full-stack et ingénieurs blockchain construisant l\'avenir de la préservation culturelle',
    culturalExperts: 'Experts Culturels',
    culturalAdvisorsDesc: 'Anthropologues, linguistes et spécialistes de la préservation culturelle assurant l\'authenticité',
    contributors: 'Contributeurs',
    communityDesc: 'Membres de la communauté, éducateurs et passionnés de culture contribuant à la plateforme',
    roadmap: 'Feuille de Route',
    roadmapDescription: 'Notre voyage vers la création d\'une plateforme complète pour la préservation culturelle africaine',
    platformLaunch: 'Lancement de la Plateforme',
    platformLaunchDesc: 'Développement de la plateforme principale avec support multilingue et intégration blockchain de base',
    communityExpansion: 'Expansion Communautaire',
    communityExpansionDesc: 'Gouvernance DAO, économie token et système de vérification communautaire',
    aiIntegration: 'Intégration IA',
    aiIntegrationDesc: 'Fonctionnalités IA avancées, génération de contenu et analyse des tendances culturelles',
    globalPartnerships: 'Partenariats Mondiaux',
    globalPartnershipsDesc: 'Intégrations muséales, partenariats éducatifs et expansion mondiale',
    mobileApp: 'Application Mobile',
    mobileAppDesc: 'Lancement d\'applications mobiles natives pour iOS et Android pour rendre la culture africaine accessible en déplacement avec des capacités hors ligne.',
    joinOurMission: 'Rejoignez Notre Mission',
    ctaDescription: 'Soyez partie du mouvement pour préserver le patrimoine culturel africain pour les générations futures',
    getStarted: 'Commencer',
    learnMore: 'En Savoir Plus',
    
    // Riddles Page
    riddlesTitle: 'Devinettes Culturelles Africaines',
    riddlesSubtitle: 'Testez Votre Connaissance de la Sagesse Africaine',
    riddlesDescription: 'Découvrez la riche tradition des devinettes et proverbes africains tout en testant vos connaissances culturelles. Chaque devinette porte une signification culturelle profonde et de la sagesse.',
    riddles: 'Devinettes',
    perRiddle: 'par devinette',
    pointsSystem: 'Système de Points',
    startRiddles: 'Commencer les Devinettes',
    points: 'Points',
    streak: 'Série',
    enterAnswer: 'Entrez votre réponse...',
    useHint: 'Utiliser l\'Indice (-10s)',
    hintUsed: 'Indice Utilisé',
    correct: 'Correct !',
    incorrect: 'Incorrect',
    correctAnswer: 'Bonne Réponse',
    explanation: 'Explication',
    culturalContext: 'Contexte Culturel',
    nextRiddle: 'Devinette Suivante',
    finishGame: 'Terminer le Jeu',
    congratulations: 'Félicitations !',
    excellentScore: 'Excellent ! Vous êtes un vrai expert de la culture africaine !',
    goodScore: 'Très bien ! Vous avez de bonnes connaissances de la culture africaine.',
    averageScore: 'Pas mal ! Continuez à apprendre sur la culture africaine.',
    keepTrying: 'Continuez ! La culture africaine est riche et fascinante.',
    totalPoints: 'Points Totaux',
    bestStreak: 'Meilleure Série',
    accuracy: 'Précision',
    playAgain: 'Rejouer',
    backToMenu: 'Retour au Menu',
    
    // Riddle Questions and Answers
    riddle1Question: 'Je suis grand quand je suis jeune, et petit quand je suis vieux. Que suis-je ?',
    riddle1Answer: 'Une bougie',
    riddle1Hint: 'Pensez à quelque chose qui brûle et devient plus court avec le temps.',
    riddle1Explanation: 'Une bougie commence grande et devient plus courte en brûlant, représentant le passage du temps et la sagesse qui vient avec l\'âge.',
    riddle1CulturalContext: 'Cette devinette enseigne la valeur du temps et l\'importance d\'utiliser notre jeunesse sagement, un thème commun dans les traditions de sagesse africaines.',
    riddle2Question: 'J\'ai une tête et une queue, mais pas de corps. Que suis-je ?',
    riddle2Answer: 'Une pièce de monnaie',
    riddle2Hint: 'Pensez à quelque chose que vous utilisez pour acheter des choses.',
    riddle2Explanation: 'Une pièce a une face (devant) et un revers (derrière) mais pas de corps, représentant la dualité de la vie et l\'importance de l\'équilibre.',
    riddle2CulturalContext: 'Dans de nombreuses cultures africaines, les pièces représentent la prospérité et sont souvent utilisées dans les cérémonies traditionnelles et les bénédictions.',
    riddle3Question: 'Plus vous en prenez, plus vous en laissez derrière. Que suis-je ?',
    riddle3Answer: 'Des pas',
    riddle3Hint: 'Pensez à ce que vous laissez derrière quand vous marchez.',
    riddle3Explanation: 'Quand vous faites des pas, vous laissez derrière des traces de pas, représentant l\'impact que nous avons sur le monde qui nous entoure.',
    riddle3CulturalContext: 'Cette devinette souligne l\'importance de nos actions et de l\'héritage que nous laissons, une valeur centrale dans les communautés africaines.',
    riddle4Question: 'Je parle sans bouche et j\'entends sans oreilles. Je n\'ai pas de corps, mais je prends vie avec le vent. Que suis-je ?',
    riddle4Answer: 'Un écho',
    riddle4Hint: 'Pensez à ce qui se passe quand vous criez dans une vallée.',
    riddle4Explanation: 'Un écho répète les sons sans avoir de forme physique, représentant le pouvoir des mots et leur impact durable.',
    riddle4CulturalContext: 'Dans les traditions orales africaines, l\'écho représente la façon dont les histoires et la sagesse sont transmises de génération en génération.',
    riddle5Question: 'Je suis toujours devant vous, mais vous ne pouvez jamais me voir. Que suis-je ?',
    riddle5Answer: 'L\'avenir',
    riddle5Hint: 'Pensez à ce qui est toujours devant mais jamais visible.',
    riddle5Explanation: 'L\'avenir est toujours devant nous mais reste invisible, représentant l\'espoir et les possibilités inconnues de la vie.',
    riddle5CulturalContext: 'Cette devinette reflète la philosophie africaine de regarder vers l\'avant avec espoir tout en respectant le passé et le présent.',
    
    // Categories
    nature: 'Nature',
    animals: 'Animaux',
    family: 'Famille',
    wisdom: 'Sagesse',
    community: 'Communauté',
    
    // Riddles Showcase
    riddlesShowcaseTitle: 'Testez Vos Connaissances Culturelles',
    riddlesShowcaseDesc: 'Défiez-vous avec des devinettes africaines traditionnelles et découvrez la sagesse intégrée dans notre patrimoine culturel. Chaque devinette porte une signification profonde et enseigne des leçons de vie précieuses.',
    riddlesFeature1: 'Expérience d\'Apprentissage Interactive',
    riddlesFeature2: 'Support Multilingue',
    riddlesFeature3: 'Contexte Culturel & Explications',
    playRiddles: 'Jouer aux Devinettes',
    riddleSample1: 'Défiez votre esprit avec la sagesse traditionnelle',
    riddleSample2: 'Apprenez grâce aux jeux culturels interactifs',
    riddleSample3: 'Gagnez des points et débloquez des succès',
    
    // Contribution aux Devinettes
    contributeRiddles: 'Contribuer aux Devinettes',
    contributeRiddlesSubtitle: 'Partagez vos devinettes africaines avec la communauté',
    contributeRiddlesDescription: 'Aidez à préserver le patrimoine culturel africain en partageant des devinettes traditionnelles de votre communauté. Vos contributions seront examinées avant publication.',
    addRiddle: 'Ajouter une Devinette',
    history: 'Histoire',
    traditions: 'Traditions',
    other: 'Autre',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile'
  }
};

// Traductions rapides (couverture des écrans principaux)
const quickTranslations = {
  es: {
    home: 'Inicio',
    museum: 'Museo',
    virtualMuseum: 'Museo Virtual',
    web3Dashboard: 'Web3',
    riddles: 'Adivinanzas',
    share: 'Compartir',
    about: 'Acerca de',
    admin: 'Admin',
    login: 'Conexión',
    logout: 'Cerrar sesión',
    profile: 'Perfil',
    guestUser: 'Usuario',
    heroSubtitle: 'Preservar. Compartir. Celebrar.',
    exploreCollection: 'Explorar colección',
    contribute: 'Contribuir',
    museumTitle: 'Museo Cultural Africano',
    museumSubtitle: 'Explora nuestra colección de tesoros culturales africanos',
    searchPlaceholder: 'Buscar en la colección...',
    all: 'Todas',
    talesFilter: 'Cuentos',
    proverbs: 'Proverbios',
    songs: 'Cantos',
    dances: 'Danzas',
    artFilter: 'Arte',
    noResults: 'No se encontraron resultados',
    tryModifying: 'Intenta modificar tu búsqueda',
    audioAvailable: 'Audio disponible',
    footerDesc: 'Preservar y compartir el rico patrimonio cultural africano',
    allRightsReserved: 'Todos los derechos reservados',
    languages: 'Idiomas'
  },
  pt: {
    home: 'Início',
    museum: 'Museu',
    virtualMuseum: 'Museu Virtual',
    web3Dashboard: 'Web3',
    riddles: 'Adivinhas',
    share: 'Partilhar',
    about: 'Sobre',
    admin: 'Admin',
    login: 'Entrar',
    logout: 'Sair',
    profile: 'Perfil',
    guestUser: 'Utilizador',
    heroSubtitle: 'Preservar. Partilhar. Celebrar.',
    exploreCollection: 'Explorar coleção',
    contribute: 'Contribuir',
    museumTitle: 'Museu Cultural Africano',
    museumSubtitle: 'Explore a nossa coleção de tesouros culturais africanos',
    searchPlaceholder: 'Pesquisar na coleção...',
    all: 'Todas',
    talesFilter: 'Contos',
    proverbs: 'Provérbios',
    songs: 'Canções',
    dances: 'Danças',
    artFilter: 'Arte',
    noResults: 'Nenhum resultado encontrado',
    tryModifying: 'Tente alterar os critérios de pesquisa',
    audioAvailable: 'Áudio disponível',
    footerDesc: 'Preservar e partilhar o rico património cultural africano',
    allRightsReserved: 'Todos os direitos reservados',
    languages: 'Idiomas'
  },
  sw: {
    home: 'Nyumbani',
    museum: 'Makumbusho',
    virtualMuseum: 'Makumbusho Pepe',
    web3Dashboard: 'Web3',
    riddles: 'Vitendawili',
    share: 'Shiriki',
    about: 'Kuhusu',
    admin: 'Admin',
    login: 'Ingia',
    logout: 'Toka',
    profile: 'Wasifu',
    guestUser: 'Mtumiaji',
    heroSubtitle: 'Hifadhi. Shiriki. Sherehekea.',
    exploreCollection: 'Chunguza mkusanyo',
    contribute: 'Changia',
    museumTitle: 'Makumbusho ya Utamaduni wa Afrika',
    museumSubtitle: 'Chunguza mkusanyo wetu wa hazina za utamaduni wa Afrika',
    searchPlaceholder: 'Tafuta kwenye mkusanyo...',
    all: 'Vyote',
    talesFilter: 'Hadithi',
    proverbs: 'Methali',
    songs: 'Nyimbo',
    dances: 'Ngoma',
    artFilter: 'Sanaa',
    noResults: 'Hakuna matokeo yaliyopatikana',
    tryModifying: 'Jaribu kubadilisha vigezo vya utafutaji',
    audioAvailable: 'Sauti inapatikana',
    footerDesc: 'Kuhifadhi na kushiriki urithi tajiri wa utamaduni wa Afrika',
    allRightsReserved: 'Haki zote zimehifadhiwa',
    languages: 'Lugha'
  },
  ar: {
    home: 'الرئيسية',
    museum: 'المتحف',
    virtualMuseum: 'المتحف الافتراضي',
    web3Dashboard: 'ويب3',
    riddles: 'الألغاز',
    share: 'مشاركة',
    about: 'حول',
    admin: 'مشرف',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    guestUser: 'مستخدم',
    heroSubtitle: 'احفظ. شارك. احتفل.',
    exploreCollection: 'استكشف المجموعة',
    contribute: 'ساهم',
    museumTitle: 'المتحف الثقافي الأفريقي',
    museumSubtitle: 'استكشف مجموعتنا من الكنوز الثقافية الأفريقية',
    searchPlaceholder: 'ابحث في المجموعة...',
    all: 'الكل',
    talesFilter: 'حكايات',
    proverbs: 'أمثال',
    songs: 'أناشيد',
    dances: 'رقصات',
    artFilter: 'فن',
    noResults: 'لا توجد نتائج',
    tryModifying: 'حاول تعديل معايير البحث',
    audioAvailable: 'الصوت متاح',
    footerDesc: 'حفظ ومشاركة التراث الثقافي الأفريقي الغني',
    allRightsReserved: 'جميع الحقوق محفوظة',
    languages: 'اللغات'
  }
};

// Fonction de traduction automatique avec Google Translate (simulée)
const translateText = async (text, targetLang) => {
  // Simulation de l'API Google Translate
  // En production, vous utiliseriez l'API réelle
  return new Promise((resolve) => {
    setTimeout(() => {
      // Pour la démo, on retourne le texte original
      // En production, ceci ferait un appel à l'API Google Translate
      resolve(text);
    }, 500);
  });
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState({});

  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);

    if (typeof window !== 'undefined') {
      const cachedTranslations = window.localStorage.getItem('nkwa-translations');
      if (cachedTranslations) {
        try {
          setTranslatedContent(JSON.parse(cachedTranslations));
        } catch (_) {
          // ignore invalid cache
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key, params = {}) => {
    const textValue = translations[language]?.[key]
      || quickTranslations[language]?.[key]
      || translatedContent[language]?.[key]
      || translations.en[key]
      || key;

    let text = String(textValue);
    
    // Remplacer les paramètres
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  const changeLanguage = async (newLang) => {
    if (newLang === language) return;
    
    setIsTranslating(true);
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nkwa-language', newLang);
    }
    
    // Si la langue n'est pas dans nos traductions, utiliser la traduction automatique
    const hasInlineTranslations = Boolean(translations[newLang] || quickTranslations[newLang]);
    const hasCachedTranslations = Boolean(translatedContent[newLang]);

    if (!hasInlineTranslations && !hasCachedTranslations) {
      const keys = Object.keys(translations.en);
      const translated = {};
      
      for (const key of keys) {
        translated[key] = await translateText(translations.en[key], newLang);
      }
      
      setTranslatedContent((previousContent) => {
        const nextContent = {
          ...previousContent,
          [newLang]: translated
        };

        if (typeof window !== 'undefined') {
          window.localStorage.setItem('nkwa-translations', JSON.stringify(nextContent));
        }

        return nextContent;
      });
    }
    
    setIsTranslating(false);
  };

  const getSupportedLanguages = () => {
    return SUPPORTED_LANGUAGES;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isTranslating,
    getSupportedLanguages,
    translatedContent
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
