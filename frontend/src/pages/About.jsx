import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  Globe, 
  Shield, 
  Users, 
  Zap, 
  Heart,
  Award,
  Target,
  ArrowRight,
  CheckCircle,
  Star,
  BookOpen,
  Music,
  Camera,
  Users as CommunityIcon
} from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { number: '20+', label: t('languagesSupported'), icon: Globe },
    { number: '1000+', label: t('culturalItems'), icon: BookOpen },
    { number: '50+', label: t('communityContributors'), icon: Users },
    { number: '99.9%', label: t('uptime'), icon: Shield }
  ];

  const features = [
    {
      icon: Globe,
      title: t('multilingualSupport'),
      description: t('multilingualSupportDesc'),
      color: 'var(--african-yellow)'
    },
    {
      icon: Shield,
      title: t('blockchainSecurity'),
      description: t('blockchainSecurityDesc'),
      color: 'var(--african-green)'
    },
    {
      icon: Users,
      title: t('communityDriven'),
      description: t('communityDrivenDesc'),
      color: 'var(--african-red)'
    },
    {
      icon: Zap,
      title: t('aiPowered'),
      description: t('aiPoweredDesc'),
      color: 'var(--african-gold)'
    }
  ];

  const team = [
    {
      name: 'Tech Team',
      role: t('development'),
      description: t('techTeamDesc'),
      icon: Zap
    },
    {
      name: 'Cultural Advisors',
      role: t('culturalExperts'),
      description: t('culturalAdvisorsDesc'),
      icon: BookOpen
    },
    {
      name: 'Community',
      role: t('contributors'),
      description: t('communityDesc'),
      icon: CommunityIcon
    }
  ];


  return (
    <div className="about">
      {/* Hero Section */}
      <motion.section 
        className="about-hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="hero-content">
            <motion.div 
              className="logo-section"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="logo-container">
                <div className="logo-tree">
                  <div className="tree-trunk"></div>
                  <div className="tree-canopy"></div>
                  <div className="tree-roots">
                    <div className="circuit-root"></div>
                    <div className="circuit-root"></div>
                    <div className="circuit-root"></div>
                    <div className="circuit-root"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="hero-text"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="hero-title">
                {t('aboutTitle')}
              </h1>
              <p className="hero-subtitle">
                {t('aboutSubtitle')}
              </p>
              <p className="hero-description">
                {t('aboutDescription')}
              </p>
              
              <motion.div 
                className="hero-actions"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <motion.button 
                  className="btn btn-primary btn-large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/museum'}
                >
                  {t('explorePlatform')}
                  <ArrowRight size={20} />
                </motion.button>
                
                <motion.button 
                  className="btn btn-secondary btn-large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/upload'}
                >
                  {t('joinCommunity')}
                  <Users size={20} />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="stats-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="stat-icon">
                  <stat.icon size={32} />
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="mission-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="mission-content">
            <motion.div 
              className="mission-text"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">{t('ourMission')}</h2>
              <p className="mission-description">
                {t('missionDescription')}
              </p>
              
              <div className="mission-points">
                <div className="mission-point">
                  <CheckCircle size={20} />
                  <span>{t('preserveHeritage')}</span>
                </div>
                <div className="mission-point">
                  <CheckCircle size={20} />
                  <span>{t('bridgeLanguages')}</span>
                </div>
                <div className="mission-point">
                  <CheckCircle size={20} />
                  <span>{t('empowerCommunities')}</span>
                </div>
                <div className="mission-point">
                  <CheckCircle size={20} />
                  <span>{t('fosterUnderstanding')}</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="mission-visual"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="visual-container">
                <div className="cultural-elements">
                  <div className="element element-1">🎭</div>
                  <div className="element element-2">🎵</div>
                  <div className="element element-3">📚</div>
                  <div className="element element-4">🎨</div>
                  <div className="element element-5">💬</div>
                  <div className="element element-6">🌍</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">{t('keyFeatures')}</h2>
            <p className="section-description">
              {t('keyFeaturesDesc')}
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div 
                  className="feature-icon"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="team-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">{t('ourTeam')}</h2>
            <p className="section-description">
              {t('teamDescription')}
            </p>
          </motion.div>

          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                className="team-card"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="team-icon">
                  <member.icon size={40} />
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>


      {/* CTA Section */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              {t('joinOurMission')}
            </h2>
            <p className="cta-description">
              {t('ctaDescription')}
            </p>
            <motion.div 
              className="cta-actions"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.button 
                className="btn btn-primary btn-large"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/upload'}
              >
                {t('getStarted')}
                <ArrowRight size={20} />
              </motion.button>
              
              <motion.button 
                className="btn btn-secondary btn-large"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/museum'}
              >
                {t('learnMore')}
                <BookOpen size={20} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <style jsx>{`
        .about {
          min-height: 100vh;
        }

        .about-hero {
          padding: var(--spacing-xl) 0;
          background: var(--gradient-dark);
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
          align-items: center;
          min-height: 80vh;
        }

        .logo-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-container {
          width: 300px;
          height: 300px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-tree {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .tree-trunk {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 80px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 20px 20px 0 0;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .tree-canopy {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 120px;
          background: radial-gradient(ellipse at center, #FFD700, #FFA500);
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        }

        .tree-roots {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 40px;
        }

        .circuit-root {
          position: absolute;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #00D4AA, #00B8A3);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
        }

        .circuit-root:nth-child(1) {
          top: 0;
          left: 0;
          transform: rotate(-15deg);
        }

        .circuit-root:nth-child(2) {
          top: 10px;
          left: 20px;
          transform: rotate(15deg);
        }

        .circuit-root:nth-child(3) {
          top: 20px;
          left: 40px;
          transform: rotate(-10deg);
        }

        .circuit-root:nth-child(4) {
          top: 5px;
          left: 60px;
          transform: rotate(20deg);
        }

        .hero-text {
          color: white;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: var(--spacing-md);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          color: var(--african-yellow);
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .stats-section {
          padding: var(--spacing-xl) 0;
          background: rgba(255, 255, 255, 0.02);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-md);
          color: var(--african-black);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--african-yellow);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.8;
        }

        .mission-section {
          padding: var(--spacing-xl) 0;
        }

        .mission-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
          align-items: center;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          color: var(--african-yellow);
        }

        .section-description {
          font-size: 1.1rem;
          opacity: 0.8;
          margin-bottom: var(--spacing-lg);
        }

        .mission-description {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: var(--spacing-lg);
        }

        .mission-points {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .mission-point {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--african-green);
        }

        .visual-container {
          position: relative;
          width: 300px;
          height: 300px;
          margin: 0 auto;
        }

        .cultural-elements {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .element {
          position: absolute;
          font-size: 2rem;
          animation: float 3s ease-in-out infinite;
        }

        .element-1 { top: 10%; left: 20%; animation-delay: 0s; }
        .element-2 { top: 20%; right: 20%; animation-delay: 0.5s; }
        .element-3 { top: 50%; left: 10%; animation-delay: 1s; }
        .element-4 { top: 60%; right: 10%; animation-delay: 1.5s; }
        .element-5 { bottom: 20%; left: 30%; animation-delay: 2s; }
        .element-6 { bottom: 10%; right: 30%; animation-delay: 2.5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .features-section {
          padding: var(--spacing-xl) 0;
          background: rgba(255, 255, 255, 0.02);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .feature-card {
          padding: var(--spacing-xl);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          box-shadow: var(--shadow-xl);
          border-color: var(--african-yellow);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-md);
          color: white;
        }

        .feature-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--african-yellow);
        }

        .feature-description {
          opacity: 0.8;
          line-height: 1.6;
        }

        .team-section {
          padding: var(--spacing-xl) 0;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .team-card {
          padding: var(--spacing-xl);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          transition: all 0.3s ease;
        }

        .team-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .team-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-md);
          color: var(--african-black);
        }

        .team-name {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
          color: var(--african-yellow);
        }

        .team-role {
          font-size: 1rem;
          opacity: 0.7;
          margin-bottom: var(--spacing-sm);
        }

        .team-description {
          opacity: 0.8;
          line-height: 1.6;
        }


        .cta-section {
          padding: var(--spacing-xl) 0;
          background: var(--gradient-primary);
          color: var(--african-black);
          text-align: center;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
        }

        .cta-description {
          font-size: 1.2rem;
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
        }

        .cta-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .mission-content {
            grid-template-columns: 1fr;
          }


          .hero-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
