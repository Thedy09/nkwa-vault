import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import RiddleForm from '../components/RiddleForm';
import { 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Star,
  Trophy,
  RotateCcw,
  ArrowRight,
  Clock,
  Sparkles,
  Target,
  Award,
  Plus,
  Upload
} from 'lucide-react';

const Riddles = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [currentRiddle, setCurrentRiddle] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showRiddleForm, setShowRiddleForm] = useState(false);
  const [viewMode, setViewMode] = useState('play'); // 'play' ou 'contribute'

  // Base de données de devinettes africaines
  const riddles = [
    {
      id: 1,
      question: t('riddle1Question'),
      answer: t('riddle1Answer'),
      hint: t('riddle1Hint'),
      category: t('nature'),
      difficulty: 'easy',
      explanation: t('riddle1Explanation'),
      culturalContext: t('riddle1CulturalContext')
    },
    {
      id: 2,
      question: t('riddle2Question'),
      answer: t('riddle2Answer'),
      hint: t('riddle2Hint'),
      category: t('animals'),
      difficulty: 'medium',
      explanation: t('riddle2Explanation'),
      culturalContext: t('riddle2CulturalContext')
    },
    {
      id: 3,
      question: t('riddle3Question'),
      answer: t('riddle3Answer'),
      hint: t('riddle3Hint'),
      category: t('family'),
      difficulty: 'hard',
      explanation: t('riddle3Explanation'),
      culturalContext: t('riddle3CulturalContext')
    },
    {
      id: 4,
      question: t('riddle4Question'),
      answer: t('riddle4Answer'),
      hint: t('riddle4Hint'),
      category: t('wisdom'),
      difficulty: 'medium',
      explanation: t('riddle4Explanation'),
      culturalContext: t('riddle4CulturalContext')
    },
    {
      id: 5,
      question: t('riddle5Question'),
      answer: t('riddle5Answer'),
      hint: t('riddle5Hint'),
      category: t('community'),
      difficulty: 'easy',
      explanation: t('riddle5Explanation'),
      culturalContext: t('riddle5CulturalContext')
    }
  ];

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit();
    }
  }, [timeLeft, gameStarted, showResult]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentRiddle(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setUserAnswer('');
    setShowResult(false);
    setGameCompleted(false);
    setHintUsed(false);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    const correctAnswer = riddles[currentRiddle].answer.toLowerCase();
    const userAnswerLower = userAnswer.toLowerCase().trim();
    
    const isAnswerCorrect = correctAnswer === userAnswerLower || 
                           correctAnswer.includes(userAnswerLower) ||
                           userAnswerLower.includes(correctAnswer);
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      const points = hintUsed ? 5 : 10;
      setScore(score + points);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const nextRiddle = () => {
    if (currentRiddle < riddles.length - 1) {
      setCurrentRiddle(currentRiddle + 1);
      setUserAnswer('');
      setShowResult(false);
      setTimeLeft(30);
      setHintUsed(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentRiddle(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setUserAnswer('');
    setShowResult(false);
    setGameCompleted(false);
    setHintUsed(false);
  };

  const useHint = () => {
    setHintUsed(true);
    setTimeLeft(Math.max(timeLeft - 10, 5));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'var(--african-green)';
      case 'medium': return 'var(--african-yellow)';
      case 'hard': return 'var(--african-red)';
      default: return 'var(--african-gold)';
    }
  };

  const getScoreMessage = () => {
    if (score >= 40) return t('excellentScore');
    if (score >= 30) return t('goodScore');
    if (score >= 20) return t('averageScore');
    return t('keepTrying');
  };

  // Vue de contribution
  if (viewMode === 'contribute') {
    return (
      <div className="riddles">
        <motion.div 
          className="riddles-hero"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container">
            <div className="hero-content">
              <motion.div 
                className="hero-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              >
                <Upload size={80} />
              </motion.div>
              
              <h1 className="hero-title">{t('contributeRiddles')}</h1>
              <p className="hero-subtitle">{t('contributeRiddlesSubtitle')}</p>
              <p className="hero-description">{t('contributeRiddlesDescription')}</p>
              
              <motion.div 
                className="hero-actions"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.button 
                  className="btn btn-primary btn-large"
                  onClick={() => setShowRiddleForm(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                  {t('addRiddle')}
                </motion.button>

                <motion.button 
                  className="btn btn-secondary btn-large"
                  onClick={() => setViewMode('play')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain size={20} />
                  {t('playRiddles')}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Formulaire de devinette */}
        <AnimatePresence>
          {showRiddleForm && (
            <motion.div 
              className="riddle-form-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RiddleForm 
                onClose={() => setShowRiddleForm(false)}
                onSuccess={() => {
                  setShowRiddleForm(false);
                  // Optionnel: recharger les devinettes
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="riddles">
        <motion.div 
          className="riddles-hero"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container">
            <div className="hero-content">
              <motion.div 
                className="hero-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              >
                <Brain size={80} />
              </motion.div>
              
              <h1 className="hero-title">{t('riddlesTitle')}</h1>
              <p className="hero-subtitle">{t('riddlesSubtitle')}</p>
              <p className="hero-description">{t('riddlesDescription')}</p>
              
              <motion.div 
                className="hero-stats"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="stat">
                  <Trophy size={24} />
                  <span>{riddles.length} {t('riddles')}</span>
                </div>
                <div className="stat">
                  <Clock size={24} />
                  <span>30s {t('perRiddle')}</span>
                </div>
                <div className="stat">
                  <Star size={24} />
                  <span>{t('pointsSystem')}</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="hero-actions"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <motion.button 
                  className="btn btn-primary btn-large"
                  onClick={startGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles size={20} />
                  {t('startRiddles')}
                </motion.button>

                <motion.button 
                  className="btn btn-secondary btn-large"
                  onClick={() => setViewMode('contribute')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                  {t('contributeRiddles')}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="riddles">
        <motion.div 
          className="game-completed"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container">
            <div className="completion-content">
              <motion.div 
                className="completion-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              >
                <Trophy size={100} />
              </motion.div>
              
              <h1 className="completion-title">{t('congratulations')}</h1>
              <p className="completion-subtitle">{getScoreMessage()}</p>
              
              <div className="final-stats">
                <div className="final-stat">
                  <Target size={32} />
                  <div className="stat-content">
                    <div className="stat-value">{score}</div>
                    <div className="stat-label">{t('totalPoints')}</div>
                  </div>
                </div>
                <div className="final-stat">
                  <Award size={32} />
                  <div className="stat-content">
                    <div className="stat-value">{streak}</div>
                    <div className="stat-label">{t('bestStreak')}</div>
                  </div>
                </div>
                <div className="final-stat">
                  <Star size={32} />
                  <div className="stat-content">
                    <div className="stat-value">{Math.round((score / (riddles.length * 10)) * 100)}%</div>
                    <div className="stat-label">{t('accuracy')}</div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="completion-actions"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.button 
                  className="btn btn-primary btn-large"
                  onClick={startGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={20} />
                  {t('playAgain')}
                </motion.button>
                
                <motion.button 
                  className="btn btn-secondary btn-large"
                  onClick={resetGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight size={20} />
                  {t('backToMenu')}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="riddles">
      <motion.div 
        className="riddles-game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          {/* Game Header */}
          <motion.div 
            className="game-header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="game-stats">
              <div className="stat">
                <Star size={20} />
                <span>{score} {t('points')}</span>
              </div>
              <div className="stat">
                <Target size={20} />
                <span>{streak} {t('streak')}</span>
              </div>
              <div className="stat">
                <Clock size={20} />
                <span>{timeLeft}s</span>
              </div>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentRiddle + 1) / riddles.length) * 100}%` }}
              />
            </div>
            
            <div className="riddle-counter">
              {currentRiddle + 1} / {riddles.length}
            </div>
          </motion.div>

          {/* Riddle Content */}
          <motion.div 
            className="riddle-content"
            key={currentRiddle}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="riddle-card">
              <div className="riddle-header">
                <div className="riddle-category">
                  {riddles[currentRiddle].category}
                </div>
                <div 
                  className="riddle-difficulty"
                  style={{ backgroundColor: getDifficultyColor(riddles[currentRiddle].difficulty) }}
                >
                  {riddles[currentRiddle].difficulty}
                </div>
              </div>
              
              <h2 className="riddle-question">
                {riddles[currentRiddle].question}
              </h2>
              
              {!showResult && (
                <div className="riddle-input-section">
                  <div className="input-group">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={t('enterAnswer')}
                      className="riddle-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      autoFocus
                    />
                    <motion.button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    className="hint-button"
                    onClick={useHint}
                    disabled={hintUsed}
                    whileHover={{ scale: hintUsed ? 1 : 1.05 }}
                    whileTap={{ scale: hintUsed ? 1 : 0.95 }}
                  >
                    <Lightbulb size={16} />
                    {hintUsed ? t('hintUsed') : t('useHint')}
                  </motion.button>
                </div>
              )}

              <AnimatePresence>
                {showResult && (
                  <motion.div 
                    className="riddle-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? <CheckCircle size={40} /> : <XCircle size={40} />}
                    </div>
                    
                    <h3 className={`result-title ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? t('correct') : t('incorrect')}
                    </h3>
                    
                    {!isCorrect && (
                      <p className="correct-answer">
                        {t('correctAnswer')}: <strong>{riddles[currentRiddle].answer}</strong>
                      </p>
                    )}
                    
                    <div className="result-explanation">
                      <h4>{t('explanation')}</h4>
                      <p>{riddles[currentRiddle].explanation}</p>
                    </div>
                    
                    <div className="cultural-context">
                      <h4>{t('culturalContext')}</h4>
                      <p>{riddles[currentRiddle].culturalContext}</p>
                    </div>
                    
                    <motion.button
                      className="btn btn-primary btn-large"
                      onClick={nextRiddle}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentRiddle < riddles.length - 1 ? t('nextRiddle') : t('finishGame')}
                      <ArrowRight size={20} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        .riddles {
          min-height: 100vh;
          padding: var(--spacing-lg) 0;
        }

        .riddles-hero {
          background: var(--gradient-dark);
          padding: var(--spacing-xl) 0;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-icon {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-lg);
          color: var(--african-black);
        }

        .hero-title {
          font-size: 3rem;
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

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          color: white;
        }

        .riddles-game {
          padding: var(--spacing-lg) 0;
        }

        .game-header {
          margin-bottom: var(--spacing-xl);
        }

        .game-stats {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          transition: width 0.3s ease;
        }

        .riddle-counter {
          text-align: center;
          font-weight: 600;
          color: var(--african-yellow);
        }

        .riddle-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .riddle-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          backdrop-filter: blur(10px);
        }

        .riddle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .riddle-category {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--african-green);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .riddle-difficulty {
          padding: var(--spacing-xs) var(--spacing-sm);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .riddle-question {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.6;
          margin-bottom: var(--spacing-xl);
          color: white;
          text-align: center;
        }

        .riddle-input-section {
          margin-bottom: var(--spacing-lg);
        }

        .input-group {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .riddle-input {
          flex: 1;
          padding: var(--spacing-md);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 1rem;
          font-family: inherit;
        }

        .riddle-input:focus {
          outline: none;
          border-color: var(--african-yellow);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }

        .hint-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid var(--african-yellow);
          border-radius: var(--radius-sm);
          color: var(--african-yellow);
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .riddle-result {
          text-align: center;
        }

        .result-icon {
          margin-bottom: var(--spacing-md);
        }

        .result-icon.correct {
          color: var(--african-green);
        }

        .result-icon.incorrect {
          color: var(--african-red);
        }

        .result-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
        }

        .result-title.correct {
          color: var(--african-green);
        }

        .result-title.incorrect {
          color: var(--african-red);
        }

        .correct-answer {
          font-size: 1.1rem;
          margin-bottom: var(--spacing-lg);
          color: var(--african-yellow);
        }

        .result-explanation,
        .cultural-context {
          text-align: left;
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
        }

        .result-explanation h4,
        .cultural-context h4 {
          color: var(--african-yellow);
          margin-bottom: var(--spacing-sm);
        }

        .result-explanation p,
        .cultural-context p {
          line-height: 1.6;
          opacity: 0.9;
        }

        .game-completed {
          padding: var(--spacing-xl) 0;
          text-align: center;
        }

        .completion-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .completion-icon {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-lg);
          color: var(--african-black);
        }

        .completion-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: var(--spacing-md);
          color: var(--african-yellow);
        }

        .completion-subtitle {
          font-size: 1.2rem;
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
        }

        .final-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .final-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-content {
          text-align: center;
          margin-top: var(--spacing-sm);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--african-yellow);
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .completion-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .riddle-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-stats {
            flex-direction: column;
            align-items: center;
          }
          
          .input-group {
            flex-direction: column;
          }
          
          .completion-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .riddle-form-modal {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default Riddles;

