import { useTranslation } from '../contexts/TranslationContext';

export function glossFor(translations, language) {
  if (!translations || typeof translations !== 'object') return '';
  const direct = translations[language] || translations.fr || translations.en || '';
  if (typeof direct === 'string') return direct;
  return direct.prompt || direct.text || '';
}

export default function LocalPassage({ text, translations, languageName }) {
  const { language } = useTranslation();
  const gloss = glossFor(translations, language);
  if (!text && !gloss) return null;
  return (
    <div className="local-passage">
      {text ? <p className="local-original">{text}</p> : null}
      {languageName ? <p className="local-lang">{languageName}</p> : null}
      {gloss ? <p className="local-gloss">{gloss}</p> : null}
    </div>
  );
}
