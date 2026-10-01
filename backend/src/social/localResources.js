/**
 * Contes et devinettes dans la langue de la localité.
 * Le texte original est celui de la localité. `translations` est la glose
 * affichée selon la langue choisie dans l'application.
 * Les formulations longues sont des restitutions courtes, pas des copies d'ouvrages.
 */

const UI = ['fr', 'en', 'es', 'pt', 'sw', 'ar'];

function pack(entries) {
  const out = {};
  UI.forEach((code) => {
    out[code] = entries[code];
  });
  return out;
}

const wisdomGames = [
  {
    id: 'game-wolof-peigne',
    key: 'wolof-peigne',
    kind: 'riddle',
    language: 'Wolof',
    prompt: 'Lan la am bëñ, waaye du màtt ?',
    answer: 'Peñ|pen|peñ|Un peigne|un peigne|peigne',
    choices: ['Peñ', 'Un crocodile', 'Le mil', 'La lune'],
    translations: pack({
      fr: {
        prompt: 'Qu\'est-ce qui a des dents mais ne mord pas ?',
        answer: 'Un peigne.',
        hint: 'On le passe dans les cheveux, le matin.',
        explanation: 'Dans les devinettes wolof, les dents qui ne mordent pas désignent le peigne. La formule se dit au marché comme à la maison.'
      },
      en: {
        prompt: 'What has teeth but does not bite?',
        answer: 'A comb.',
        hint: 'You draw it through the hair in the morning.',
        explanation: 'In Wolof riddles, teeth that do not bite mean the comb. The formula is told at the market and at home.'
      },
      es: {
        prompt: '¿Qué tiene dientes pero no muerde?',
        answer: 'Un peine.',
        hint: 'Se pasa por el cabello por la mañana.',
        explanation: 'En las adivinanzas wolof, los dientes que no muerden designan el peine.'
      },
      pt: {
        prompt: 'O que tem dentes mas não morde?',
        answer: 'Um pente.',
        hint: 'Passa-se no cabelo de manhã.',
        explanation: 'Nas adivinhas wolof, os dentes que não mordem designam o pente.'
      },
      sw: {
        prompt: 'Nini kilicho na meno lakini hakiumi?',
        answer: 'Kichana.',
        hint: 'Kinapitia nywele asubuhi.',
        explanation: 'Katika mafumbo ya Kiwolof, meno yasiyouma ni kichana.'
      },
      ar: {
        prompt: 'ما الذي له أسنان ولا يعض؟',
        answer: 'مشط.',
        hint: 'يُمرَّر في الشعر صباحًا.',
        explanation: 'في الألغاز الولوفية، الأسنان التي لا تعض تدل على المشط.'
      }
    }),
    post: {
      id: 'wisdom-wolof-peigne',
      author: 'admin',
      category: 'devinette',
      origin: 'Sénégal · Wolof',
      language: 'Wolof',
      hours: 1.25,
      sourceUrl: 'https://www.ifan.ucad.sn/',
      sourceTitle: 'IFAN · Université Cheikh Anta Diop',
      body: 'Lan la am bëñ, waaye du màtt ?',
      translations: pack({
        fr: 'Qu\'est-ce qui a des dents mais ne mord pas ?',
        en: 'What has teeth but does not bite?',
        es: '¿Qué tiene dientes pero no muerde?',
        pt: 'O que tem dentes mas não morde?',
        sw: 'Nini kilicho na meno lakini hakiumi?',
        ar: 'ما الذي له أسنان ولا يعض؟'
      })
    }
  },
  {
    id: 'game-akan-table',
    key: 'akan-table',
    kind: 'riddle',
    language: 'Twi',
    prompt: 'Mewɔ nan anan, nanso mintumi nnante.',
    answer: 'Ɛpono|epono|pono|Une table|une table|table',
    choices: ['Ɛpono', 'Un cheval', 'Ananse', 'Le pagne'],
    translations: pack({
      fr: {
        prompt: 'J\'ai quatre jambes, et pourtant je ne marche pas.',
        answer: 'Une table.',
        hint: 'Elle reste à la maison et porte ce qu\'on pose dessus.',
        explanation: 'Devinette akan : les jambes ne suffisent pas à faire un marcheur. La réponse est la table, ɛpono.'
      },
      en: {
        prompt: 'I have four legs, and yet I cannot walk.',
        answer: 'A table.',
        hint: 'It stays at home and holds what you set on it.',
        explanation: 'An Akan riddle: legs are not enough to make a walker. The answer is the table, ɛpono.'
      },
      es: {
        prompt: 'Tengo cuatro patas y, sin embargo, no camino.',
        answer: 'Una mesa.',
        hint: 'Se queda en casa y sostiene lo que se pone encima.',
        explanation: 'Adivinanza akan: las patas no bastan para caminar. La respuesta es la mesa.'
      },
      pt: {
        prompt: 'Tenho quatro pernas e, no entanto, não ando.',
        answer: 'Uma mesa.',
        hint: 'Fica em casa e sustenta o que se pousa em cima.',
        explanation: 'Adivinha akan: pernas não bastam para andar. A resposta é a mesa.'
      },
      sw: {
        prompt: 'Nina miguu minne, lakini siwezi kutembea.',
        answer: 'Meza.',
        hint: 'Inakaa nyumbani na kubeba kinachowekwa juu yake.',
        explanation: 'Fumbo la Kiakan: miguu haitoshi kutembea. Jibu ni meza.'
      },
      ar: {
        prompt: 'لي أربع أرجل ومع ذلك لا أمشي.',
        answer: 'طاولة.',
        hint: 'تبقى في البيت وتحمل ما يوضع عليها.',
        explanation: 'لغز أكان: الأرجل لا تكفي للمشي. الجواب هو الطاولة.'
      }
    }),
    post: {
      id: 'wisdom-akan-table',
      author: 'admin',
      category: 'devinette',
      origin: 'Ghana · Akan',
      language: 'Twi',
      hours: 1.4,
      sourceUrl: 'https://www.ghanamuseums.org/',
      sourceTitle: 'Ghana Museums and Monuments Board',
      body: 'Mewɔ nan anan, nanso mintumi nnante.',
      translations: pack({
        fr: 'J\'ai quatre jambes, et pourtant je ne marche pas.',
        en: 'I have four legs, and yet I cannot walk.',
        es: 'Tengo cuatro patas y, sin embargo, no camino.',
        pt: 'Tenho quatro pernas e, no entanto, não ando.',
        sw: 'Nina miguu minne, lakini siwezi kutembea.',
        ar: 'لي أربع أرجل ومع ذلك لا أمشي.'
      })
    }
  },
  {
    id: 'game-bambara-tambour',
    key: 'bambara-tambour',
    kind: 'riddle',
    language: 'Bambara',
    prompt: 'A bɛ kuma, nka tulo tɛ a la.',
    answer: 'Jɛnbɛ|jenbe|djembe|djembé|Le djembé|le djembé|tambour',
    choices: ['Jɛnbɛ', 'Le vent', 'Le baobab', 'La calebasse'],
    translations: pack({
      fr: {
        prompt: 'Qu\'est-ce qui parle sans avoir d\'oreilles ?',
        answer: 'Le djembé.',
        hint: 'On le frappe pour appeler la danse.',
        explanation: 'Dans les devinettes bambara, le djembé parle : il appelle, répond et raconte, sans oreilles pour entendre.'
      },
      en: {
        prompt: 'What speaks without having ears?',
        answer: 'The djembe.',
        hint: 'It is struck to call the dance.',
        explanation: 'In Bambara riddles the djembe speaks: it calls, answers and tells, with no ears to hear.'
      },
      es: {
        prompt: '¿Qué habla sin tener orejas?',
        answer: 'El djembé.',
        hint: 'Se golpea para llamar a la danza.',
        explanation: 'En las adivinanzas bambara, el djembé habla: llama, responde y cuenta, sin orejas.'
      },
      pt: {
        prompt: 'O que fala sem ter orelhas?',
        answer: 'O djembé.',
        hint: 'É batido para chamar a dança.',
        explanation: 'Nas adivinhas bambara, o djembé fala: chama, responde e conta, sem orelhas.'
      },
      sw: {
        prompt: 'Nini kinachoongea bila kuwa na masikio?',
        answer: 'Djembe.',
        hint: 'Kinapigwa ili kuita densi.',
        explanation: 'Katika mafumbo ya Kibambara, djembe huongea bila masikio.'
      },
      ar: {
        prompt: 'ما الذي يتكلم وليس له أذنان؟',
        answer: 'الدجيمبي.',
        hint: 'يُضرب لدعوة الرقص.',
        explanation: 'في ألغاز البامبارا، الدجيمبي يتكلم: ينادي ويجيب ويروي، بلا أذنين.'
      }
    }),
    post: {
      id: 'wisdom-bambara-tambour',
      author: 'admin',
      category: 'devinette',
      origin: 'Mali · Bambara',
      language: 'Bambara',
      hours: 1.55,
      sourceUrl: 'https://www.musees-mali.org/',
      sourceTitle: 'Musée national du Mali',
      body: 'A bɛ kuma, nka tulo tɛ a la.',
      translations: pack({
        fr: 'Qu\'est-ce qui parle sans avoir d\'oreilles ?',
        en: 'What speaks without having ears?',
        es: '¿Qué habla sin tener orejas?',
        pt: 'O que fala sem ter orelhas?',
        sw: 'Nini kinachoongea bila kuwa na masikio?',
        ar: 'ما الذي يتكلم وليس له أذنان؟'
      })
    }
  },
  {
    id: 'game-wolof-souplesse',
    key: 'wolof-souplesse',
    kind: 'proverb',
    language: 'Wolof',
    prompt: 'Garab guy lem du damm.',
    answer: 'Qui sait plier ne se brise pas',
    choices: [
      'Qui sait plier ne se brise pas',
      'L\'arbre trop droit tombe toujours le premier jour',
      'Le vent ne casse que les jeunes pousses',
      'Il faut couper avant la saison des pluies'
    ],
    translations: pack({
      fr: {
        prompt: 'L\'arbre qui plie ne se casse pas.',
        answer: 'Qui sait plier ne se brise pas.',
        hint: 'On le dit à quelqu\'un qui refuse de céder un peu.',
        explanation: 'Proverbe wolof : la souplesse évite la rupture. Il circule au marché autant que dans les conseils de famille.'
      },
      en: {
        prompt: 'The tree that bends does not break.',
        answer: 'Whoever can bend does not break.',
        hint: 'It is said to someone who refuses to yield a little.',
        explanation: 'A Wolof proverb: flexibility avoids the break. It circulates at the market and in family counsel.'
      },
      es: {
        prompt: 'El árbol que se dobla no se rompe.',
        answer: 'Quien sabe doblarse no se quiebra.',
        hint: 'Se dice a quien se niega a ceder un poco.',
        explanation: 'Proverbio wolof: la flexibilidad evita la ruptura.'
      },
      pt: {
        prompt: 'A árvore que verga não quebra.',
        answer: 'Quem sabe vergar não se parte.',
        hint: 'Diz-se a quem recusa ceder um pouco.',
        explanation: 'Provérbio wolof: a flexibilidade evita a rutura.'
      },
      sw: {
        prompt: 'Mti unaopinda hauvunjiki.',
        answer: 'Ajuaye kupinda havunjiki.',
        hint: 'Husemwa kwa mtu akataaye kukubali kidogo.',
        explanation: 'Methali ya Kiwolof: upole huepusha kuvunjika.'
      },
      ar: {
        prompt: 'الشجرة التي تنحني لا تنكسر.',
        answer: 'من يحسن الانحناء لا ينكسر.',
        hint: 'تُقال لمن يرفض أن يلين قليلًا.',
        explanation: 'مثل ولوفي: اللين يمنع الانكسار.'
      }
    }),
    post: {
      id: 'wisdom-wolof-souplesse',
      author: 'admin',
      category: 'proverbe',
      origin: 'Sénégal · Wolof',
      language: 'Wolof',
      hours: 1.7,
      sourceUrl: 'https://www.ucad.sn/',
      sourceTitle: 'Université Cheikh Anta Diop · IFAN',
      body: 'Garab guy lem du damm.',
      translations: pack({
        fr: 'L\'arbre qui plie ne se casse pas.',
        en: 'The tree that bends does not break.',
        es: 'El árbol que se dobla no se rompe.',
        pt: 'A árvore que verga não quebra.',
        sw: 'Mti unaopinda hauvunjiki.',
        ar: 'الشجرة التي تنحني لا تنكسر.'
      })
    }
  },
  {
    id: 'game-akan-enseigner',
    key: 'akan-enseigner',
    kind: 'proverb',
    language: 'Twi',
    prompt: 'Obi nnim a, ɔbi kyerɛ.',
    answer: 'Si l\'un ignore, un autre enseigne',
    choices: [
      'Si l\'un ignore, un autre enseigne',
      'Chacun garde son secret',
      'Le silence vaut mieux que la parole',
      'Le chef décide seul'
    ],
    translations: pack({
      fr: {
        prompt: 'Si l\'un ignore, un autre enseigne.',
        answer: 'Si l\'un ignore, un autre enseigne.',
        hint: 'Deux personnes, un savoir qui doit circuler.',
        explanation: 'Proverbe akan : personne n\'est tenu de tout savoir si la communauté peut enseigner.'
      },
      en: {
        prompt: 'If one does not know, another teaches.',
        answer: 'If one does not know, another teaches.',
        hint: 'Two people, and knowledge that must circulate.',
        explanation: 'An Akan proverb: no one must know everything if the community can teach.'
      },
      es: {
        prompt: 'Si uno ignora, otro enseña.',
        answer: 'Si uno ignora, otro enseña.',
        hint: 'Dos personas, un saber que debe circular.',
        explanation: 'Proverbio akan: nadie está obligado a saberlo todo si la comunidad puede enseñar.'
      },
      pt: {
        prompt: 'Se um ignora, outro ensina.',
        answer: 'Se um ignora, outro ensina.',
        hint: 'Duas pessoas, um saber que deve circular.',
        explanation: 'Provérbio akan: ninguém tem de saber tudo se a comunidade pode ensinar.'
      },
      sw: {
        prompt: 'Mmoja asipojua, mwingine hufundisha.',
        answer: 'Mmoja asipojua, mwingine hufundisha.',
        hint: 'Watu wawili, na maarifa yanayopaswa kuzunguka.',
        explanation: 'Methali ya Kiakan: hakuna lazima ya kujua yote ikiwa jamii inaweza kufundisha.'
      },
      ar: {
        prompt: 'إن جهل واحد، علّم آخر.',
        answer: 'إن جهل واحد، علّم آخر.',
        hint: 'شخصان، ومعرفة يجب أن تدور.',
        explanation: 'مثل أكان: لا يُلزم أحد بأن يعرف كل شيء إذا كان المجتمع يقدر أن يعلّم.'
      }
    }),
    post: {
      id: 'wisdom-akan-enseigner',
      author: 'admin',
      category: 'proverbe',
      origin: 'Ghana · Akan',
      language: 'Twi',
      hours: 1.85,
      sourceUrl: 'https://www.ghanamuseums.org/anansesem',
      sourceTitle: 'Ghana Museums and Monuments Board',
      body: 'Obi nnim a, ɔbi kyerɛ.',
      translations: pack({
        fr: 'Si l\'un ignore, un autre enseigne.',
        en: 'If one does not know, another teaches.',
        es: 'Si uno ignora, otro enseña.',
        pt: 'Se um ignora, outro ensina.',
        sw: 'Mmoja asipojua, mwingine hufundisha.',
        ar: 'إن جهل واحد، علّم آخر.'
      })
    }
  },
  {
    id: 'game-yoruba-caractere',
    key: 'yoruba-caractere',
    kind: 'proverb',
    language: 'Yoruba',
    prompt: 'Ìwà l\'ẹwà.',
    answer: 'Ìwà|Iwa|Le caractère|le caractère|caractère|caractere',
    choices: ['Le caractère', 'L\'or', 'La vitesse', 'Le pagne'],
    translations: pack({
      fr: {
        prompt: 'Le caractère est la beauté.',
        answer: 'Le caractère.',
        hint: 'Ce n\'est ni l\'or ni l\'apparence.',
        explanation: '« Ìwà l\'ẹwà » place la conduite au-dessus du reste. Le proverbe yoruba juge une personne à son caractère.'
      },
      en: {
        prompt: 'Character is beauty.',
        answer: 'Character.',
        hint: 'It is neither gold nor appearance.',
        explanation: '“Ìwà l\'ẹwà” places conduct above the rest. The Yoruba proverb judges a person by character.'
      },
      es: {
        prompt: 'El carácter es la belleza.',
        answer: 'El carácter.',
        hint: 'No es ni el oro ni la apariencia.',
        explanation: '« Ìwà l\'ẹwà » pone la conducta por encima del resto.'
      },
      pt: {
        prompt: 'O carácter é a beleza.',
        answer: 'O carácter.',
        hint: 'Não é o ouro nem a aparência.',
        explanation: '« Ìwà l\'ẹwà » coloca a conduta acima do resto.'
      },
      sw: {
        prompt: 'Tabia ndiyo uzuri.',
        answer: 'Tabia.',
        hint: 'Si dhahabu wala sura.',
        explanation: '« Ìwà l\'ẹwà » huweka mwenendo juu ya mengine. Methali ya Kiyoruba humhukumu mtu kwa tabia.'
      },
      ar: {
        prompt: 'الخلق هو الجمال.',
        answer: 'الخلق.',
        hint: 'ليس الذهب ولا المظهر.',
        explanation: '« Ìwà l\'ẹwà » يضع السلوك فوق الباقي. المثل اليوروبا يحكم على الشخص بخلقه.'
      }
    }),
    post: {
      id: 'wisdom-yoruba-caractere',
      author: 'admin',
      category: 'proverbe',
      origin: 'Nigeria · Yoruba',
      language: 'Yoruba',
      hours: 2.05,
      sourceUrl: 'https://ias.ui.edu.ng/',
      sourceTitle: 'Institute of African Studies · University of Ibadan',
      body: 'Ìwà l\'ẹwà.',
      translations: pack({
        fr: 'Le caractère est la beauté.',
        en: 'Character is beauty.',
        es: 'El carácter es la belleza.',
        pt: 'O carácter é a beleza.',
        sw: 'Tabia ndiyo uzuri.',
        ar: 'الخلق هو الجمال.'
      })
    }
  }
];

const tales = [
  {
    id: 'tale-ananse-twi',
    author: 'admin',
    category: 'conte',
    origin: 'Ghana · Akan',
    language: 'Twi',
    hours: 2.2,
    sourceUrl: 'https://www.ghanamuseums.org/ananse-nyansa',
    sourceTitle: 'Ghana Museums and Monuments Board · tradition akan',
    body: 'Ananse ne nyansa\n\nAnanse boaboaa nyansa nyinaa ano de guu kuruwa mu. Ɔde kuruwa no bɔɔ n\'anim na ɔforo dua. Ne ba kaa sɛ ɔmfa kuruwa no mmɔ n\'akyi. Ananse yɛɛ saa. Ɔduu atifi no, ohui sɛ nyansa a wɔnkyɛ mu no nyɛ nyansa. Ɔtoo kuruwa no, na nyansa no petee.',
    translations: pack({
      fr: 'Ananse et la sagesse\n\nAnanse rassembla toute la sagesse dans une cruche. Il la plaça devant lui et grimpa à un arbre. Son enfant lui dit de la porter dans le dos. Il le fit. Arrivé en haut, il comprit que la sagesse qui ne se partage pas n\'est plus de la sagesse. Il jeta la cruche, et la sagesse se répandit.',
      en: 'Ananse and wisdom\n\nAnanse gathered all wisdom into a pot. He set it in front of him and climbed a tree. His child told him to carry it on his back. He did. At the top he understood that wisdom which is not shared is no longer wisdom. He threw the pot, and wisdom spread.',
      es: 'Ananse y la sabiduría\n\nAnanse reunió toda la sabiduría en un cántaro. Lo puso delante de sí y trepó a un árbol. Su hijo le dijo que lo llevara a la espalda. Lo hizo. Arriba comprendió que la sabiduría que no se comparte deja de ser sabiduría. Tiró el cántaro y la sabiduría se esparció.',
      pt: 'Ananse e a sabedoria\n\nAnanse reuniu toda a sabedoria num cântaro. Pô-lo à frente e trepou a uma árvore. O filho disse-lhe para o levar às costas. Ele fê-lo. No alto compreendeu que a sabedoria que não se partilha deixa de ser sabedoria. Atirou o cântaro e a sabedoria espalhou-se.',
      sw: 'Ananse na hekima\n\nAnanse alikusanya hekima yote katika chungu. Aliiweka mbele yake akapanda mti. Mtoto wake alimwambia aibebe mgongoni. Akafanya hivyo. Juu alielewa kuwa hekima isiyogawanywa si hekima tena. Alitupa chungu, na hekima ikaenea.',
      ar: 'أنانسي والحكمة\n\nجمع أنانسي الحكمة كلها في جرّة. وضعها أمامه وتسلّق شجرة. قال له ابنه أن يحملها على ظهره. فعل ذلك. في الأعلى فهم أن الحكمة التي لا تُتقاسم لم تعد حكمة. رمى الجرّة، فانتشرت الحكمة.'
    })
  },
  {
    id: 'tale-tortue-ghomala',
    author: 'admin',
    category: 'conte',
    origin: 'Cameroun · Bamiléké',
    language: 'Ghɔmálá\'',
    hours: 2.35,
    sourceUrl: 'https://en.wiktionary.org/wiki/cw%C9%99%CC%81',
    sourceTitle: 'Dictionnaire ghomala\' · Eichholzer et al., 2002',
    body: 'Cwə́ ne sǒ\n\nCwə̂ giŋ gaə̂ zhyə̀.',
    translations: pack({
      fr: 'La tortue et l\'éléphant\n\n« La tortue marche lentement. » Elle a pourtant défié l\'éléphant à la course et placé ses sœurs le long du chemin. À chaque cri, une tortue répondait déjà : « je suis devant ». Celui qui court seul contre une communauté a déjà perdu.',
      en: 'The turtle and the elephant\n\n“The turtle walks slowly.” She still challenged the elephant to a race and placed her sisters along the path. At each call, a turtle answered: “I am already ahead.” Whoever runs alone against a community has already lost.',
      es: 'La tortuga y el elefante\n\n« La tortuga camina despacio. » Aun así desafió al elefante a una carrera y colocó a sus hermanas a lo largo del camino. A cada grito, una tortuga respondía: « ya voy delante ». Quien corre solo contra una comunidad ya ha perdido.',
      pt: 'A tartaruga e o elefante\n\n« A tartaruga anda devagar. » Mesmo assim desafiou o elefante para uma corrida e colocou as irmãs ao longo do caminho. A cada grito, uma tartaruga respondia: « já vou à frente ». Quem corre sozinho contra uma comunidade já perdeu.',
      sw: 'Kobe na tembo\n\n« Kobe hutembea polepole. » Hata hivyo alimpa changamoto tembo katika mbio na kuweka dada zake njiani. Kila kilio, kobe alijibu: « niko mbele tayari ». Anayekimbia peke yake dhidi ya jamii ameshapoteza.',
      ar: 'السلحفاة والفيل\n\n« السلحفاة تمشي ببطء. » ومع ذلك تحدّت الفيل في السباق ووضعت أخواتها على طول الطريق. عند كل نداء، كانت سلحفاة تجيب: « أنا أمامك ». من يركض وحده ضد جماعة فقد خسر سلفًا.'
    })
  }
];

const localizedArticles = {
  'article-kankurang': {
    language: 'Mandinka',
    body: 'Kankurango',
    translations: pack({
      fr: 'Le Kankurang, rite des fibres et de la parole\n\nEn Casamance et en Gambie, le Kankurang accompagne l\'initiation mandingue. Le masque de feuilles et d\'écorces sort avec les circoncis, rappelle l\'ordre du village et écarte ce qui menace la transmission. Danse, fouet et chant font partie du même récit. L\'UNESCO inscrit ce rite au patrimoine culturel immatériel.',
      en: 'The Kankurang, a rite of fibre and speech\n\nIn Casamance and The Gambia, the Kankurang accompanies Mandinka initiation. The mask of leaves and bark comes out with the initiates, recalls the order of the village and turns away what threatens transmission. Dance, whip and song belong to the same story. UNESCO lists this rite as intangible cultural heritage.',
      es: 'El Kankurang, rito de fibras y de palabra\n\nEn Casamance y en Gambia, el Kankurang acompaña la iniciación mandinga. La máscara de hojas y cortezas sale con los iniciados, recuerda el orden de la aldea y aparta lo que amenaza la transmisión. Danza, látigo y canto forman el mismo relato. La UNESCO inscribe este rito como patrimonio cultural inmaterial.',
      pt: 'O Kankurang, rito de fibras e de palavra\n\nNa Casamansa e na Gâmbia, o Kankurang acompanha a iniciação mandinga. A máscara de folhas e cascas sai com os iniciados, lembra a ordem da aldeia e afasta o que ameaça a transmissão. Dança, chicote e canto fazem parte do mesmo relato. A UNESCO inscreve este rito no património cultural imaterial.',
      sw: 'Kankurang, ibada ya nyuzi na ya neno\n\nKatika Casamance na Gambia, Kankurang huandamana na uanzishwaji wa Kimandinka. Barakoa ya majani na magome hutoka na waanzishwa, hukumbusha mpangilio wa kijiji na huondoa kinachotishia urithishaji. Ngoma, mjeledi na wimbo ni hadithi moja. UNESCO imeandikisha ibada hii kama urithi usiogusika.',
      ar: 'الكانكوران، طقس الألياف والكلام\n\nفي كازامانس وغامبيا، يرافق الكانكوران التلقين الماندينغي. يخرج القناع من الأوراق واللحاء مع المختونين، ويذكّر بنظام القرية ويبعد ما يهدد النقل. الرقص والسوط والغناء جزء من الرواية نفسها. تدرج اليونسكو هذا الطقس في التراث الثقافي غير المادي.'
    })
  },
  'article-ifa': {
    language: 'Yoruba',
    body: 'Ifá ń sọ̀rọ̀.',
    translations: pack({
      fr: 'Ifa, une bibliothèque dite à voix haute\n\nIfa est un système de divination yoruba porté par les babalawo. Les signes, les odu, organisent un vaste corpus de poèmes qui conseillent, soignent et racontent l\'origine des choses. On n\'y cherche pas une réponse unique : on relie une personne à une mémoire commune. Le système est reconnu par l\'UNESCO.',
      en: 'Ifa, a library spoken aloud\n\nIfa is a Yoruba divination system carried by the babalawo. The signs, the odu, organize a vast body of poems that advise, heal and tell the origin of things. One does not look for a single answer: a person is tied to a shared memory. UNESCO recognizes the system.',
      es: 'Ifa, una biblioteca dicha en voz alta\n\nIfa es un sistema de adivinación yoruba llevado por los babalawo. Los signos, los odu, organizan un vasto corpus de poemas que aconsejan, curan y cuentan el origen de las cosas. No se busca una sola respuesta: se une a una persona con una memoria común. La UNESCO reconoce el sistema.',
      pt: 'Ifa, uma biblioteca dita em voz alta\n\nIfa é um sistema de adivinhação iorubá levado pelos babalawo. Os sinais, os odu, organizam um vasto corpus de poemas que aconselham, curam e contam a origem das coisas. Não se procura uma resposta única: liga-se uma pessoa a uma memória comum. A UNESCO reconhece o sistema.',
      sw: 'Ifa, maktaba inayosomwa kwa sauti\n\nIfa ni mfumo wa ramli wa Kiyoruba unaobebwa na babalawo. Ishara, odu, hupanga mashairi mengi yanayoshauri, kuponya na kusimulia asili ya vitu. Hakuna jibu moja: mtu huunganishwa na kumbukumbu ya pamoja. UNESCO inautambua mfumo huu.',
      ar: 'إيفا، مكتبة تُقال بصوت عال\n\nإيفا نظام عرافة يوروبا يحمله البابالاوو. العلامات، الأودو، تنظّم متنًا واسعًا من القصائد التي تنصح وتشفي وتروي أصل الأشياء. لا يُطلب جواب واحد: يُربط الشخص بذاكرة مشتركة. اليونسكو تعترف بالنظام.'
    })
  }
};

const reelLocales = {
  'reel-kumpo': {
    language: 'Diola',
    body: 'Kumpo',
    translations: pack({
      fr: 'Le Kumpo sort à Bagaya. Le masque danse, le village répond.',
      en: 'The Kumpo comes out at Bagaya. The mask dances, the village answers.',
      es: 'El Kumpo sale en Bagaya. La máscara danza, el pueblo responde.',
      pt: 'O Kumpo sai em Bagaya. A máscara dança, a aldeia responde.',
      sw: 'Kumpo hutoka Bagaya. Barakoa hucheza, kijiji hujibu.',
      ar: 'يخرج الكومبو في باغاي. القناع يرقص، والقرية تجيب.'
    })
  }
};

module.exports = {
  wisdomGames,
  tales,
  localizedArticles,
  reelLocales
};
