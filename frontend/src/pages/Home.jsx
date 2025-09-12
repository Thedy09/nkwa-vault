import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  BookOpen, 
  Music, 
  Camera, 
  Users, 
  Globe, 
  Heart,
  ArrowRight,
  Play,
  Star,
  Brain,
  Trophy
} from 'lucide-react';
import Logo from '../components/Logo';

const Home = ({ onNavigate }) => {
  const { t } = useTranslation();
  
  const categories = [
    {
      icon: BookOpen,
      title: t('talesCategory'),
      description: t('talesDesc'),
      color: 'var(--african-yellow)'
    },
    {
      icon: Music,
      title: t('musicCategory'),
      description: t('musicDesc'),
      color: 'var(--african-green)'
    },
    {
      icon: Camera,
      title: t('artCategory'),
      description: t('artDesc'),
      color: 'var(--african-red)'
    },
    {
      icon: Users,
      title: t('traditions'),
      description: t('traditionsDesc'),
      color: 'var(--african-gold)'
    }
  ];

  const features = [
    {
      icon: Globe,
      title: t('digitalPreservation'),
      description: t('digitalPreservationDesc')
    },
    {
      icon: Heart,
      title: t('community'),
      description: t('communityDesc')
    },
    {
      icon: Star,
      title: t('authenticity'),
      description: t('authenticityDesc')
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1.2,
          ease: [0.6, -0.05, 0.01, 0.99]
        }}
      >
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="particles">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Logo Section */}
            <motion.div 
              className="hero-logo"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2, 
                duration: 1.2,
                type: "spring",
                stiffness: 100
              }}
            >
              <Logo size={120} animated={true} />
            </motion.div>
            
            <motion.h1 
              className="hero-title"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.5, 
                duration: 1,
                ease: [0.6, -0.05, 0.01, 0.99]
              }}
            >
              <motion.span 
                className="text-gradient"
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.8, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {t('heroTitle')}
              </motion.span>
              <br />
              <motion.span 
                className="hero-subtitle"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 1.2, 
                  duration: 0.8,
                  ease: "easeOut"
                }}
              >
                {t('heroSubtitle')}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="hero-description"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 1.5, 
                duration: 0.8,
                ease: "easeOut"
              }}
            >
              {t('heroDescription')}
            </motion.p>
            
            <motion.div 
              className="hero-actions"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 1.8, 
                duration: 0.8,
                ease: "easeOut"
              }}
            >
              <motion.button 
                className="btn btn-primary btn-large btn-shimmer"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 2.0, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(255, 215, 0, 0.3)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate && onNavigate('museum')}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Play size={20} />
                </motion.div>
{t('exploreCollection')}
              </motion.button>
              
              <motion.button 
                className="btn btn-secondary btn-large btn-shimmer"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 2.2, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(34, 139, 34, 0.3)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate && onNavigate('upload')}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Users size={20} />
                </motion.div>
{t('contribute')}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">{t('discoverHeritage')}</h2>
            <p className="section-description">
              {t('exploreFacets')}
            </p>
          </motion.div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                className="category-card card-glow"
                initial={{ y: 100, opacity: 0, rotateX: -15 }}
                whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ 
                  delay: index * 0.2, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="category-icon"
                  style={{ backgroundColor: category.color }}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360,
                    boxShadow: `0 10px 30px ${category.color}40`
                  }}
                  transition={{ 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                  >
                    <category.icon size={32} />
                  </motion.div>
                </motion.div>
                <h3 className="category-title">{category.title}</h3>
                <p className="category-description">{category.description}</p>
                <button 
                  className="category-btn"
                  onClick={() => onNavigate && onNavigate('museum')}
                >
                  {t('discover')}
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Riddles Section - Mise en valeur */}
      <motion.section 
        className="riddles-showcase"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div 
            className="riddles-content"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="riddles-text">
              <motion.div 
                className="riddles-icon"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                viewport={{ once: true }}
              >
                <Brain size={60} />
              </motion.div>
              
              <h2 className="riddles-title">{t('riddlesShowcaseTitle')}</h2>
              <p className="riddles-description">{t('riddlesShowcaseDesc')}</p>
              
              <div className="riddles-features">
                <div className="riddle-feature">
                  <Star size={20} />
                  <span>{t('riddlesFeature1')}</span>
                </div>
                <div className="riddle-feature">
                  <Globe size={20} />
                  <span>{t('riddlesFeature2')}</span>
                </div>
                <div className="riddle-feature">
                  <Trophy size={20} />
                  <span>{t('riddlesFeature3')}</span>
                </div>
              </div>
              
              <motion.button 
                className="btn btn-accent btn-large"
                onClick={() => onNavigate && onNavigate('riddles')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Brain size={20} />
                {t('playRiddles')}
              </motion.button>
            </div>
            
            <div className="riddles-visual">
              <motion.div 
                className="riddle-cards"
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="riddle-card riddle-card-1">
                  <div className="card-icon">🧠</div>
                  <div className="card-text">{t('riddleSample1')}</div>
                </div>
                <div className="riddle-card riddle-card-2">
                  <div className="card-icon">💡</div>
                  <div className="card-text">{t('riddleSample2')}</div>
                </div>
                <div className="riddle-card riddle-card-3">
                  <div className="card-icon">🏆</div>
                  <div className="card-text">{t('riddleSample3')}</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">{t('whyChoose')}</h2>
            <p className="section-description">
              {t('whyChooseDesc')}
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
              >
                <div className="feature-icon">
                  <feature.icon size={40} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              {t('joinRevolution')}
            </h2>
            <p className="cta-description">
              {t('joinRevolutionDesc')}
            </p>
            <motion.button 
              className="btn btn-accent btn-large"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate && onNavigate('upload')}
            >
              {t('startNow')}
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </div>
      </motion.section>

      <style jsx>{`
        .home {
          min-height: 100vh;
        }

        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--african-black) 0%, #2c2c2c 50%, var(--african-black) 100%);
        }

        .hero-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, var(--african-yellow) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, var(--african-green) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, var(--african-red) 0%, transparent 50%);
          opacity: 0.1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-logo {
          margin-bottom: var(--spacing-lg);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-logo .logo-container {
          filter: drop-shadow(0 10px 30px rgba(255, 215, 0, 0.3));
          transition: all 0.3s ease;
        }

        .hero-logo:hover .logo-container {
          filter: drop-shadow(0 15px 40px rgba(255, 215, 0, 0.5));
          transform: scale(1.05);
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--spacing-lg);
        }

        .hero-subtitle {
          font-size: 2rem;
          font-weight: 300;
          color: white;
        }

        .hero-description {
          font-size: 1.2rem;
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: 1.1rem;
        }

        .categories-section,
        .features-section {
          padding: var(--spacing-xl) 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .section-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
        }

        .section-description {
          font-size: 1.2rem;
          opacity: 0.8;
          max-width: 600px;
          margin: 0 auto;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-lg);
        }

        .category-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-xl);
          border-color: var(--african-yellow);
        }

        .category-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-md);
          color: white;
        }

        .category-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--african-yellow);
        }

        .category-description {
          margin-bottom: var(--spacing-md);
          opacity: 0.8;
          line-height: 1.6;
        }

        .category-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: transparent;
          border: 2px solid var(--african-yellow);
          color: var(--african-yellow);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-btn:hover {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .feature-card {
          text-align: center;
          padding: var(--spacing-lg);
        }

        .feature-icon {
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

        .cta-section {
          background: var(--gradient-primary);
          color: var(--african-black);
          padding: var(--spacing-xl) 0;
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

        .riddles-showcase {
          padding: var(--spacing-xl) 0;
          background: linear-gradient(135deg, var(--african-black) 0%, #1a1a1a 50%, var(--african-black) 100%);
          position: relative;
          overflow: hidden;
        }

        .riddles-showcase::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, var(--african-yellow) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, var(--african-green) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, var(--african-red) 0%, transparent 50%);
          opacity: 0.1;
        }

        .riddles-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .riddles-text {
          color: white;
        }

        .riddles-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-lg);
          color: var(--african-black);
        }

        .riddles-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: var(--spacing-md);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .riddles-description {
          font-size: 1.2rem;
          line-height: 1.8;
          margin-bottom: var(--spacing-lg);
          opacity: 0.9;
        }

        .riddles-features {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
        }

        .riddle-feature {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          color: var(--african-yellow);
        }

        .riddles-visual {
          position: relative;
        }

        .riddle-cards {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .riddle-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .riddle-card:hover {
          transform: translateX(10px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
          border-color: var(--african-yellow);
        }

        .riddle-card-1 {
          animation: float 3s ease-in-out infinite;
        }

        .riddle-card-2 {
          animation: float 3s ease-in-out infinite 0.5s;
        }

        .riddle-card-3 {
          animation: float 3s ease-in-out infinite 1s;
        }

        .card-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-text {
          font-size: 1rem;
          font-weight: 500;
          color: white;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.5rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .categories-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
