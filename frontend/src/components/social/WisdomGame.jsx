import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { attemptWisdom, errorMessage } from '../../social/api';

const KIND_LABEL = {
  riddle: 'Devinette',
  proverb: 'Proverbe'
};

export default function WisdomGame({ game, onRequireAuth, onScore }) {
  const { isAuthenticated } = useAuth();
  const { language } = useTranslation();
  const [current, setCurrent] = useState(game);
  const [hintOn, setHintOn] = useState(false);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(null);

  const unlocked = Boolean(current.answer);
  const kindLabel = KIND_LABEL[current.kind] || 'Jeu de sagesse';
  const pack = current.translations?.[language] || current.translations?.fr || {};
  const promptGloss = pack.prompt || current.gloss || '';
  const hintText = pack.hint || current.hint || '';
  const answerGloss = pack.answer || '';
  const explanationText = pack.explanation || current.explanation || '';

  const apply = (data, notice) => {
    if (data?.game) setCurrent(data.game);
    if (data?.score) {
      setScore(data.score);
      onScore?.(data.score);
    }
    if (notice) setMessage(notice);
  };

  const submit = async (answer, reveal = false) => {
    if (!isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await attemptWisdom(current.postId, reveal ? { reveal: true } : { answer });
      apply(data, data.correct ? 'Bonne réponse.' : 'Réponse révélée.');
    } catch (err) {
      const data = err?.response?.data?.data;
      if (data) apply(data);
      setError(err?.response?.data?.message || errorMessage(err, 'Réponse refusée'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="wisdom-card" data-testid="wisdom-game" data-game-key={current.key}>
      <div className="chip-row">
        <span className="chip">Jeu de sagesse</span>
        <span className="chip">{kindLabel}</span>
        {current.language ? <span className="chip">{current.language}</span> : null}
        {score ? <span className="chip">Sagesse {score.correct} · série {score.streak}</span> : null}
      </div>
      <p className="wisdom-prompt" lang={current.language || undefined}>{current.prompt}</p>
      {promptGloss ? <p className="wisdom-gloss">{promptGloss}</p> : null}
      {current.choices?.length ? (
        <div className="wisdom-choices">
          {current.choices.map((choice) => (
            <button
              key={choice}
              className="wisdom-choice"
              type="button"
              data-testid="wisdom-choice"
              disabled={busy || unlocked}
              onClick={() => submit(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : null}
      {!unlocked ? (
        <form
          className="wisdom-guess"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim()) submit(draft.trim());
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ou écris ta réponse"
            aria-label="Ta réponse"
            maxLength={200}
          />
          <button className="primary-btn" type="submit" disabled={busy || !draft.trim()}>
            Proposer
          </button>
        </form>
      ) : null}
      <div className="wisdom-actions">
        <button className="ghost-btn" type="button" onClick={() => setHintOn((value) => !value)}>
          {hintOn ? 'Cacher l\'indice' : 'Indice'}
        </button>
        {!unlocked ? (
          <button className="ghost-btn" type="button" data-testid="wisdom-reveal" disabled={busy} onClick={() => submit('', true)}>
            Révéler
          </button>
        ) : null}
      </div>
      {hintOn && hintText ? <p className="wisdom-hint">{hintText}</p> : null}
      {error ? <p className="error-text" data-testid="wisdom-error">{error}</p> : null}
      {message ? <p className="wisdom-message" data-testid="wisdom-message">{message}</p> : null}
      {unlocked ? (
        <div className="wisdom-reveal" data-testid="wisdom-solved">
          <strong>{current.correct ? 'Tu as trouvé.' : 'Réponse révélée.'}</strong>
          <p>{current.answer}</p>
          {answerGloss ? <p className="wisdom-gloss">{answerGloss}</p> : null}
          {explanationText ? <p className="muted">{explanationText}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
