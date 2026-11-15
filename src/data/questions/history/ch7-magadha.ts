import type { ChapterBank } from '../types';

// History & Civics Grade 6, Chapter 7: Rise of Kingdoms and Republics; Magadha (textbook pp. 102–110).
// Written from the chapter's facts; page numbers point to where each answer is found.
export const ch7Magadha: ChapterBank = {
  id: 'hist-g6-ch7-magadha',
  subjectId: 'history',
  subject: 'History & Civics',
  grade: 6,
  chapter: 'Ch 7 · Rise of Kingdoms and Republics; Magadha',
  pages: '102–110',
  questions: [
    // ---------- Multiple choice ----------
    { id: 'm1', topic: 'migration', type: 'mcq', page: 103, q: 'In the Later Vedic Age, the Indo-Aryans migrated to the', options: ['Gangetic Plains', 'Sindh', 'Caspian Sea', 'Deccan Plateau'], correct: 0 },
    { id: 'm2', topic: 'rulers', type: 'mcq', page: [104, 105], q: 'Which of these was NOT a ruler of Magadha?', options: ['Bimbisara', 'Ajatashatru', 'Alexander', 'Dhana Nanda'], correct: 2 },
    { id: 'm3', topic: 'hydaspes', type: 'mcq', page: 105, q: 'The Battle of the Hydaspes was fought between Alexander and', options: ['Bimbisara', 'Porus', 'Chandragupta Maurya', 'Ambhi'], correct: 1 },
    { id: 'm4', topic: 'vrijji', type: 'mcq', page: 103, q: 'The structure of government followed by the people of Vrijji can most appropriately be termed as', options: ['monarchical', 'democratic', 'republican', 'imperial'], correct: 2 },
    { id: 'm5', topic: 'death', type: 'mcq', page: [106, 108], q: 'Alexander died in Babylonia in the year', options: ['326 BCE', '323 BCE', '330 BCE', '341 BCE'], correct: 1 },
    { id: 'm6', topic: 'count', type: 'mcq', page: 103, q: 'The Buddhist and Jaina texts mention the existence of', options: ['four mahajanapadas', 'ten mahajanapadas', 'sixteen mahajanapadas', 'twenty mahajanapadas'], correct: 2 },
    { id: 'm7', topic: 'rajagriha', type: 'mcq', page: 104, q: 'The earlier capital of Magadha, Rajagriha, was naturally protected because it was', options: ['built on an island', 'surrounded by five hills', 'surrounded by a desert', 'built inside a forest'], correct: 1 },
    { id: 'm8', topic: 'anga', type: 'mcq', page: 104, q: 'Bimbisara annexed the mahajanapada of', options: ['Avanti', 'Kosala', 'Anga', 'Vatsa'], correct: 2 },
    { id: 'm9', topic: 'pataliputra', type: 'mcq', page: 104, q: 'The ancient city of Pataliputra was founded by', options: ['Bimbisara', 'Ajatashatru', 'Mahapadma Nanda', 'Chandragupta Maurya'], correct: 1 },
    { id: 'm10', topic: 'nandafounder', type: 'mcq', page: 105, q: 'The founder of the Nanda dynasty was', options: ['Dhana Nanda', 'Mahapadma Nanda', 'Ajatashatru', 'Pradyota'], correct: 1 },
    { id: 'm11', topic: 'taxila', type: 'mcq', page: 105, q: 'The ruler of Taxila who easily submitted to Alexander was', options: ['Porus', 'Ambhi', 'Dhana Nanda', 'Pradyota'], correct: 1 },
    { id: 'm12', topic: 'macedonia', type: 'mcq', page: 105, q: 'Alexander was the king of', options: ['Persia', 'Egypt', 'Macedonia', 'Babylonia'], correct: 2 },
    { id: 'm13', topic: 'gandhara', type: 'mcq', page: [106, 108], q: 'The Gandhara School of Art was influenced by the', options: ['Persian and Chinese cultures', 'Greek and Roman cultures', 'Egyptian culture', 'Mesopotamian culture'], correct: 1 },
    { id: 'm14', topic: 'mauryan', type: 'mcq', page: 105, q: 'The last Nanda king was defeated and dethroned by', options: ['Alexander', 'Ambhi', 'Chandragupta Maurya', 'Porus'], correct: 2 },
    { id: 'm15', topic: 'achaemenian', type: 'mcq', page: 108, q: 'The first Persian empire was established by the', options: ['Nanda dynasty', 'Achaemenian Dynasty', 'Mauryan dynasty', 'Byzantine Empire'], correct: 1 },
    { id: 'm16', topic: 'beas', type: 'mcq', page: 106, q: "Alexander's army refused to march beyond the river", options: ['Ganga', 'Indus', 'Beas', 'Narmada'], correct: 2 },
    { id: 'ar1', topic: 'growthreason', type: 'mcq', page: [103, 104], q: 'Assertion (A): Magadha grew into a powerful mahajanapada.\nReason (R): It had fertile soil, iron ore deposits and the river Ganga flowing through it.', options: ['Both A and R are true, and R is the correct explanation of A.', 'Both A and R are true, but R is not the correct explanation of A.', 'A is true, but R is false.', 'A is false, but R is true.'], correct: 0 },
    { id: 'ar2', topic: 'porusfree', type: 'mcq', page: 105, q: 'Assertion (A): Alexander returned his territory to Porus.\nReason (R): Porus defeated Alexander in the Battle of the Hydaspes.', options: ['Both A and R are true, and R is the correct explanation of A.', 'Both A and R are true, but R is not the correct explanation of A.', 'A is true, but R is false.', 'A is false, but R is true.'], correct: 2 },
    { id: 'ar3', topic: 'champa', type: 'mcq', page: 104, q: 'Assertion (A): Magadha developed a flourishing maritime trade under Bimbisara.\nReason (R): Control of Champa on the river Ganga gave Magadha access to ports.', options: ['Both A and R are true, and R is the correct explanation of A.', 'Both A and R are true, but R is not the correct explanation of A.', 'A is true, but R is false.', 'A is false, but R is true.'], correct: 0 },

    // ---------- Fill in the blanks ----------
    { id: 'f1', topic: 'janapada', type: 'fill', page: 103, q: "The word janapada literally means '_____'.", answer: 'areas where the tribe puts its foot down' },
    { id: 'f2', topic: 'mjrise', type: 'fill', page: 103, q: 'Around _____ BCE, many of the janapadas became larger and came to be known as mahajanapadas.', answer: '600' },
    { id: 'f3', topic: 'republics', type: 'fill', page: 103, q: 'The _____ and the _____ were gana-sanghas or republics governed by councils.', answer: 'Mallas; Vrijjis' },
    { id: 'f4', topic: 'location', type: 'fill', page: 103, q: 'Magadha corresponds roughly to the present-day _____ and _____ districts.', answer: 'Patna; Gaya' },
    { id: 'f5', topic: 'religions', type: 'fill', page: 103, q: 'Magadha played a central role in the rise of two great religions: _____ and _____.', answer: 'Buddhism; Jainism' },
    { id: 'f6', topic: 'rajagriha', type: 'fill', page: 104, q: 'Rajagriha, the earlier capital of Magadha, is the present-day _____.', answer: 'Rajgir' },
    { id: 'f7', topic: 'champa', type: 'fill', page: 104, q: 'Anga had a famous city called _____ on the banks of the river Ganga.', answer: 'Champa' },
    { id: 'f8', topic: 'physician', type: 'fill', page: 104, q: 'Bimbisara sent his royal physician to _____, the king of Avanti.', answer: 'Pradyota' },
    { id: 'f9', topic: 'invasionyear', type: 'fill', page: 105, q: 'Alexander invaded north-west India in _____ BCE.', answer: '326' },
    { id: 'f10', topic: 'nandaking', type: 'fill', page: 105, q: "At the time of Alexander's invasion, Magadha was ruled by _____.", answer: 'Dhana Nanda' },
    { id: 'f11', topic: 'jhelum', type: 'fill', page: 105, q: 'Porus ruled the kingdom lying in the _____ region.', answer: 'Jhelum' },
    { id: 'f12', topic: 'governors', type: 'fill', page: 106, q: 'After the retreat, the Indian territories under Alexander were placed under _____ governors.', answer: 'Greek' },

    // ---------- Name the following ----------
    { id: 'n1', type: 'name', page: 103, q: 'The tribes of the early society before settled communities', answer: 'Janas' },
    { id: 'n2', topic: 'mjrise', type: 'name', page: 103, q: 'The janapadas that grew into large and powerful kingdoms', answer: 'Mahajanapadas' },
    { id: 'n3', topic: 'firstruler', type: 'name', page: 104, q: 'The first important ruler of Magadha', answer: 'Bimbisara' },
    { id: 'n4', topic: 'pataliputra', type: 'name', page: 104, q: 'The ruler who founded the ancient city of Pataliputra', answer: 'Ajatashatru' },
    { id: 'n5', topic: 'nandafounder', type: 'name', page: 105, q: 'The founder of the Nanda dynasty', answer: 'Mahapadma Nanda' },
    { id: 'n6', topic: 'mauryan', type: 'name', page: 105, q: 'The ruler who defeated the last Nanda king and established the Mauryan Empire', answer: 'Chandragupta Maurya' },
    { id: 'n7', topic: 'taxila', type: 'name', page: 105, q: 'The ruler of Taxila who submitted to Alexander', answer: 'Ambhi' },
    { id: 'n8', topic: 'hydaspes', type: 'name', page: 105, q: 'The famous battle between Porus and Alexander', answer: 'The Battle of the Hydaspes' },
    { id: 'n9', topic: 'gandhara', type: 'name', page: [106, 108], q: 'The school of art that developed in north-west India after contact with the Greeks', answer: 'The Gandhara School of Art (Graeco-Buddhist School of Art)' },
    { id: 'n10', topic: 'achaemenian', type: 'name', page: 108, q: 'The dynasty that established the first Persian empire', answer: 'The Achaemenian Dynasty' },
    { id: 'n11', topic: 'death', type: 'name', page: 106, q: 'The place where Alexander fell ill and died', answer: 'Babylonia' },
    { id: 'n12', topic: 'anga', type: 'name', page: 104, q: 'The mahajanapada annexed by Bimbisara', answer: 'Anga' },
    { id: 'n13', topic: 'macedonia', type: 'name', page: 105, q: 'The kingdom ruled by Alexander', answer: 'Macedonia (in Greece)' },
    { id: 'n14', topic: 'beas', type: 'name', page: 106, q: "The river beyond which Alexander's army refused to march", answer: 'The Beas' },

    // ---------- Give reasons ----------
    { id: 'r1', topic: 'growthreason', type: 'reason', page: [103, 104], q: 'Magadha grew into a powerful mahajanapada.', answer: 'It had fertile soil for surplus crops, iron ore for weapons and tools, a capital (Rajagriha) protected by five hills, the Ganga for communication and transport, and ambitious kings.' },
    { id: 'r2', topic: 'rajagriha', type: 'reason', page: 104, q: 'Rajagriha enjoyed natural protection from invaders.', answer: 'It was surrounded by five hills.' },
    { id: 'r3', topic: 'champa', type: 'reason', page: 104, q: 'The annexation of Anga was an economic advantage for Magadha.', answer: 'Control of Anga\'s city of Champa on the Ganga gave access to ports, so Magadha developed a flourishing maritime trade and became rich.' },
    { id: 'r4', topic: 'iron', type: 'reason', page: [103, 104], q: 'Iron ore was important for the growth of Magadha.', answer: 'Iron ore from the plateau region could be used to make weapons and tools (for war and for cultivating land).' },
    { id: 'r5', topic: 'ganga', type: 'reason', page: 104, q: 'The river Ganga helped Magadha grow.', answer: 'It made communication and the carrying of goods from one place to another easy.' },
    { id: 'r6', topic: 'porusfree', type: 'reason', page: 105, q: 'Alexander set Porus free and returned his territory.', answer: "He was impressed by Porus's valour and by his reply, 'Treat me, O Alexander, like a king'." },
    { id: 'r7', topic: 'retreat', type: 'reason', page: 106, q: 'Alexander had to retreat without conquering Magadha.', answer: 'His army, tired after fighting too many wars and unwilling to face the mighty Magadhan army, refused to march beyond the Beas.' },
    { id: 'r8', topic: 'eve', type: 'reason', page: 105, q: 'Alexander could easily conquer many states in north-west India.', answer: 'North-west India was divided into many kingdoms with constant rivalry and warfare, and he took full advantage of this.' },
    { id: 'r9', topic: 'chronology', type: 'reason', page: 106, q: "Alexander's invasion helped historians reconstruct ancient Indian history.", answer: "The date of his invasion was recorded by his historians, which helped in the chronological reconstruction of India's ancient history." },
    { id: 'r10', topic: 'surplus', type: 'reason', page: 103, q: 'Some people in the Later Vedic period could turn to occupations other than farming.', answer: 'Iron implements were used to cultivate land, producing surplus food.' },

    // ---------- Define ----------
    { id: 'd1', topic: 'janapada', type: 'define', page: 103, term: 'Janapadas', answer: "Territories where tribes settled down; literally 'areas where the tribe puts its foot down'." },
    { id: 'd2', topic: 'republics', type: 'define', page: [103, 108], term: 'Gana-sanghas', answer: 'Republics governed by councils of elected representatives, e.g. the Mallas and the Vrijjis.' },
    { id: 'd3', type: 'define', page: 108, term: 'Byzantine', answer: 'The Byzantine Empire flourished in south-eastern Europe and Asia Minor after the fall of the western part of the Roman Empire.' },

    // ---------- Match ----------
    { id: 'x1', type: 'match', page: [104, 105], q: 'Match the rulers with what they are known for.', left: 'Ruler', right: 'Known for',
      pairs: [['Bimbisara', 'annexed Anga'], ['Ajatashatru', 'founded Pataliputra'], ['Mahapadma Nanda', 'founded the Nanda dynasty'], ['Dhana Nanda', 'ruled Magadha when Alexander invaded'], ['Chandragupta Maurya', 'established the Mauryan Empire'], ['Ambhi', 'ruler of Taxila who submitted to Alexander'], ['Porus', 'fought the Battle of the Hydaspes']] },
    { id: 'x2', type: 'match', page: [103, 104], q: 'Match the mahajanapadas with their type of government.', left: 'Mahajanapada', right: 'Government',
      pairs: [['Vrijji', 'republic (gana-sangha)'], ['Malla', 'republic (gana-sangha)'], ['Magadha', 'monarchy'], ['Avanti', 'monarchy'], ['Kosala', 'monarchy']] },

    // ---------- Differences ----------
    { id: 'df1', topic: 'republics', type: 'difference', page: 103, a: 'gana-sanghas', b: 'monarchies', rows: [['Governed by councils (elected representatives)', 'Ruled by kings'], ['e.g. Mallas, Vrijjis', 'e.g. Vatsa, Avanti, Magadha, Kosala']] },
    { id: 'df2', type: 'difference', page: 103, a: 'janapadas', b: 'mahajanapadas', rows: [['Territories where tribes settled', 'Janapadas that grew larger by capturing territories'], ['Smaller areas', 'Large and powerful kingdoms (about 600 BCE), sixteen of them']] },

    // ---------- Short answers (2 marks) ----------
    { id: 's1', topic: 'mjrise', type: 'short', marks: 2, page: 103, q: 'What were mahajanapadas? How many were there?', answer: 'Janapadas that grew larger by capturing territories (around 600 BCE) became powerful kingdoms called mahajanapadas. Buddhist and Jaina texts mention sixteen.' },
    { id: 's2', topic: 'location', type: 'short', marks: 2, page: 103, q: 'Where is Magadha situated? Why is it important in Indian history?', answer: 'It corresponds roughly to the present-day Patna and Gaya districts (Bihar). It played a central role in the rise of Buddhism and Jainism.' },
    { id: 's3', topic: 'bimbisara', type: 'short', marks: 2, page: 104, q: 'Describe Magadha under the rule of Bimbisara.', answer: 'Bimbisara annexed Anga (with Champa), gaining access to ports and maritime trade; Magadha became rich; art and education flourished; he set up an efficient administration and was a patron of Buddhism.' },
    { id: 's4', topic: 'diplomat', type: 'short', marks: 2, page: 104, q: 'Why was Bimbisara known as a diplomatic ruler?', answer: 'He neutralised the threat of the mahajanapada of Avanti by sending his royal physician to its king, Pradyota.' },
    { id: 's5', topic: 'ajatashatru', type: 'short', marks: 2, page: 104, q: 'What was the contribution of Ajatashatru to Magadha?', answer: 'He conquered neighbouring states and helped Magadha grow as an imperial power; he founded the city of Pataliputra.' },
    { id: 's6', topic: 'nandaarmy', type: 'short', marks: 2, page: 105, q: 'What do Greek sources say about the army of Dhana Nanda?', answer: 'He had a vast army consisting of infantry, cavalry, chariots and war elephants.' },
    { id: 's7', topic: 'eve', type: 'short', marks: 2, page: 105, q: "What was the condition of India on the eve of Alexander's invasion?", answer: 'North-west India was divided into many kingdoms; there was constant rivalry and warfare among them, which Alexander took advantage of.' },
    { id: 's8', topic: 'porusfree', type: 'short', marks: 2, page: 105, q: 'Why did Alexander set Porus free? Describe this incident.', answer: "After the Battle of the Hydaspes, Alexander asked Porus how he wished to be treated. Porus replied, 'Treat me, O Alexander, like a king'. Impressed by his bravery, Alexander returned his territory and gave him some conquered states." },
    { id: 's9', topic: 'political', type: 'short', marks: 2, page: 106, q: "What was the most significant political impact of Alexander's invasion?", answer: 'The small states in north-west India lost their power, which paved the way for the rise of the Mauryan Empire; Chandragupta Maurya expanded into this region.' },
    { id: 's10', topic: 'effects', type: 'short', marks: 2, page: 106, q: "State any two other effects of Alexander's invasion.", answer: 'Any two: close contact between Europe and India; new trade routes with European countries; the recorded date helped reconstruct ancient Indian chronology; the Gandhara (Graeco-Buddhist) School of Art developed.' },
    { id: 's11', topic: 'achaemenian', type: 'short', marks: 2, page: 108, q: 'Write a short note on the Achaemenian Dynasty.', answer: 'It established the first Persian empire in ancient Iran (c. 559–330 BCE). Cyrus II founded it; Darius I and Xerxes I followed; Darius III was defeated by Alexander in c. 330 BCE, ending the dynasty.' },
    { id: 's12', topic: 'compareforms', type: 'short', marks: 2, page: 103, q: 'Compare and contrast the gana-sanghas and the monarchies of the mahajanapada period.', answer: 'Both were mahajanapadas. Gana-sanghas (Mallas, Vrijjis) were republics governed by councils of elected representatives; monarchies (Vatsa, Avanti, Magadha, Kosala) were ruled by kings.' },

    // ---------- Long answers (4 marks) ----------
    { id: 'l1', topic: 'growthreason', type: 'long', marks: 4, page: [103, 104], q: 'Explain the reasons for the growth of Magadha into a powerful mahajanapada.', answer: 'Fertile soil of the plains gave surplus crops; iron ore from the plateau made weapons and tools; the capital Rajagriha was protected by five hills; the Ganga helped communication and transport of goods; and ambitious kings fought wars to expand and strengthen the kingdom.' },
    { id: 'l2', topic: 'bimbisara', type: 'long', marks: 4, page: 104, q: 'Describe the achievements of Bimbisara.', answer: 'First important ruler of Magadha, capital Rajagriha. Annexed Anga with Champa, giving access to ports and maritime trade, so Magadha became rich. Art and education flourished; he set up an efficient administration and patronised Buddhism. A diplomat, he neutralised Avanti by sending his physician to King Pradyota.' },
    { id: 'l3', topic: 'invasion', type: 'long', marks: 4, page: [105, 106], q: "Describe Alexander's invasion of India.", answer: 'In 326 BCE Alexander of Macedonia, having conquered Egypt, Asia Minor and Persia, invaded north-west India, taking advantage of its rival kingdoms. Ambhi of Taxila submitted. He defeated Porus in the Battle of the Hydaspes but, impressed by his valour, returned his kingdom. His tired army refused to cross the Beas to face Magadha, so he retreated, leaving Greek governors, and died in Babylonia in 323 BCE.' },
    { id: 'l4', topic: 'effects', type: 'long', marks: 4, page: 106, q: "What were the effects of Alexander's invasion of India?", answer: 'Small states in north-west India lost power, paving the way for the Mauryan Empire; close contact between Europe and India; new trade routes with Europe; the recorded date helped reconstruct ancient Indian chronology; contact with the Greeks led to the Gandhara (Graeco-Buddhist) School of Art.' },
    { id: 'l5', topic: 'nandas', type: 'long', marks: 4, page: 105, q: 'Write a note on the Nanda dynasty.', answer: 'The Nandas ruled Magadha in the fourth century BCE. Mahapadma Nanda seized the throne and founded the dynasty. Dhana Nanda ruled at the time of Alexander\'s invasion and had a vast army of infantry, cavalry, chariots and war elephants. The last Nanda king was defeated by Chandragupta Maurya, who founded the Mauryan Empire.' },

    // ---------- Picture study ----------
    { id: 'p1', topic: 'coins', type: 'picture', page: [108, 109], scene: 'Two silver coins: one shows the head of a young king wearing a lion-skin headdress; the other shows a seated god holding a staff.',
      imagePrompt: 'Two ancient silver Greek coins side by side on a plain background: one shows a young king wearing a lion-skin headdress, the other a seated figure holding a staff, museum photograph style, no text',
      parts: [{ q: 'The images on the coins are of the king of Macedonia who invaded India. Name him.', answer: 'Alexander (the Great)', marks: 1 }, { q: 'When did he invade India?', answer: '326 BCE', marks: 1 }] },
    { id: 'p2', topic: 'buddhameet', type: 'picture', page: [102, 104], scene: 'A king in royal robes kneels with folded hands before the Buddha, who sits meditating under a tree.',
      imagePrompt: 'Painterly illustration of an ancient Indian king in royal robes kneeling with folded hands before the Buddha meditating under a large tree, attendants behind, warm colours, no text',
      parts: [{ q: 'This painting shows the meeting between the Buddha and a famous ruler of Magadha. Identify the ruler.', answer: 'Bimbisara', marks: 1 }, { q: 'Which religion did this ruler patronise?', answer: 'Buddhism', marks: 1 }] },
    { id: 'p3', topic: 'gandhara', type: 'picture', page: [106, 108], scene: 'A grey stone carving of a couple and two Buddhist monks walking around a stupa.',
      imagePrompt: 'Grey stone relief sculpture in Graeco-Buddhist style showing a couple and two Buddhist monks circumambulating a small stupa, museum photograph, no text',
      parts: [{ q: 'Name the school of art this sculpture belongs to.', answer: 'The Gandhara School of Art (Graeco-Buddhist School of Art)', marks: 1 }, { q: 'Which cultures influenced this school of art?', answer: 'Greek and Roman cultures', marks: 1 }] },
    { id: 'p4', topic: 'hydaspes', type: 'picture', page: 105, scene: 'A battle by a river: soldiers on war elephants face Greek soldiers on horseback.',
      imagePrompt: 'Painterly illustration of an ancient battle beside a river, Indian soldiers on war elephants facing Greek cavalry with helmets and spears, dramatic sky, no text',
      parts: [{ q: 'Name the famous battle shown in the picture.', answer: 'The Battle of the Hydaspes', marks: 1 }, { q: 'Between which two kings was it fought?', answer: 'Alexander and Porus', marks: 1 }] },
    { id: 'p5', topic: 'rajagrihapic', type: 'picture', page: 104, scene: 'An ancient walled city in a valley, ringed on all sides by five green hills.',
      imagePrompt: 'Painterly landscape of an ancient Indian walled city in a valley completely ringed by five green hills, morning light, no text',
      parts: [{ q: 'Name the earlier capital of Magadha shown here and its present-day name.', answer: 'Rajagriha; present-day Rajgir', marks: 1 }, { q: 'How did the hills help this capital?', answer: 'They gave natural protection from invaders.', marks: 1 }] },
  ],
  mapFeatures: [],
};
