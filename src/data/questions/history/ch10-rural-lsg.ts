import type { ChapterBank } from '../types';

// History & Civics Grade 6, Chapter 10: Local Self-Government: Rural (textbook pp. 138–145).
// Written from the chapter's facts; page numbers point to where each answer is found.
export const ch10RuralLsg: ChapterBank = {
  id: 'hist-g6-ch10-rural-lsg',
  subjectId: 'history',
  subject: 'History & Civics',
  grade: 6,
  chapter: 'Ch 10 · Local Self-Government: Rural',
  pages: '138–145',
  questions: [
    // ---------- Multiple choice ----------
    { id: 'm1', topic: 'delhi', type: 'mcq', page: 139, q: 'The central government of India is based in', options: ['New Delhi', 'Kolkata', 'Mumbai', 'Chennai'], correct: 0 },
    { id: 'm2', topic: 'governor', type: 'mcq', page: 139, q: 'The executive power of the government of a state is vested in the', options: ['Chief Minister', 'Governor', 'Chief Justice', 'Mayor'], correct: 1 },
    { id: 'm3', topic: 'pradhan', type: 'mcq', page: 141, q: 'The head of the Gram Panchayat is called the', options: ['Pradhan', 'Senapati', 'Up-Pradhan', 'Chairperson'], correct: 0 },
    { id: 'm4', topic: 'toptier', type: 'mcq', page: 142, q: 'The top tier of the Panchayati Raj System is the', options: ['Gram Sabha', 'Gram Panchayat', 'Panchayat Samiti', 'Zila Parishad'], correct: 3 },
    { id: 'm5', topic: 'women', type: 'mcq', page: [141, 142], q: 'In the Panchayat Samiti, one-third of the total seats are reserved for', options: ['Scheduled Castes', 'Scheduled Tribes', 'women', 'senior citizens'], correct: 2 },
    { id: 'm6', topic: 'president', type: 'mcq', page: 139, q: 'The executive power of the central government is vested in the', options: ['Prime Minister', 'President', 'Governor', 'Chief Minister'], correct: 1 },
    { id: 'm7', topic: 'samitihead', type: 'mcq', page: 140, q: 'The head of the Panchayat Samiti is the', options: ['Sarpanch', 'Chairperson', 'President', 'Collector'], correct: 1 },
    { id: 'm8', topic: 'zphead', type: 'mcq', page: 140, q: 'The Zila Parishad is headed by the', options: ['President of the Parishad', 'Sarpanch', 'Block Development Officer', 'Governor'], correct: 0 },
    { id: 'm9', topic: 'meetings', type: 'mcq', page: [140, 141], q: 'The Gram Sabha holds at least', options: ['one meeting a year', 'two meetings a year', 'four meetings a year', 'one meeting a month'], correct: 1 },
    { id: 'm10', topic: 'mehta', type: 'mcq', page: 140, q: 'The Panchayati Raj Institutions were launched on the recommendation of the', options: ['Balwant Rai Mehta Committee', 'Planning Commission', 'Election Commission', 'Nyaya Panchayat'], correct: 0 },
    { id: 'm11', topic: 'bdo', type: 'mcq', page: 142, q: 'The plans of the Panchayat Samiti are carried out by the', options: ['Sarpanch', 'Block Development Officer', 'Governor', 'Member of Parliament'], correct: 1 },
    { id: 'm12', topic: 'zpterm', type: 'mcq', page: 142, q: 'The Zila Parishad generally functions for a period of', options: ['two years', 'three years', 'five years', 'six years'], correct: 2 },
    { id: 'm13', topic: 'schedule', type: 'mcq', page: 143, q: 'The Eleventh Schedule of the Constitution lists subjects to be transferred to the Panchayati Raj institutions. How many?', options: ['sixteen', 'twenty-nine', 'thirty-three', 'seventy-three'], correct: 1 },
    { id: 'm14', topic: 'uppradhan', type: 'mcq', page: 141, q: 'Who takes on the responsibilities of the village in the absence of the Sarpanch?', options: ['The Up-Pradhan', 'The Chairperson', 'The Governor', 'The Nyaya Panch'], correct: 0 },
    { id: 'ar1', topic: 'lsgwhy', type: 'mcq', page: [139, 140], q: 'Assertion (A): Local self-government helps manage local problems efficiently.\nReason (R): The elected representatives are residents of the locality and best aware of its problems.', options: ['Both A and R are true, and R is the correct explanation of A.', 'Both A and R are true, but R is not the correct explanation of A.', 'A is true, but R is false.', 'A is false, but R is true.'], correct: 0 },
    { id: 'ar2', topic: 'zpbottom', type: 'mcq', page: 142, q: 'Assertion (A): The Zila Parishad occupies the bottom tier of the Panchayati Raj System.\nReason (R): The Zila Parishad functions at the district level.', options: ['Both A and R are true, and R is the correct explanation of A.', 'Both A and R are true, but R is not the correct explanation of A.', 'A is true, but R is false.', 'A is false, but R is true.'], correct: 3 },
    { id: 'ar3', topic: 'britishpancha', type: 'mcq', page: 140, q: 'Assertion (A): The ancient pancha system lost its value under British rule.\nReason (R): The British sent their own officers to deal with village issues.', options: ['Both A and R are true, and R is the correct explanation of A.', 'Both A and R are true, but R is not the correct explanation of A.', 'A is true, but R is false.', 'A is false, but R is true.'], correct: 0 },

    // ---------- Fill in the blanks ----------
    { id: 'f1', topic: 'levels', type: 'fill', page: 139, q: 'The government in India functions at three levels: central, _____ and _____.', answer: 'state; local' },
    { id: 'f2', topic: 'pm', type: 'fill', page: 139, q: 'A Council of Ministers headed by the _____ assists the President to run the central government.', answer: 'Prime Minister' },
    { id: 'f3', topic: 'cm', type: 'fill', page: 139, q: 'A Council of Ministers headed by the _____ aids and advises the Governor.', answer: 'Chief Minister' },
    { id: 'f4', topic: 'threetier', type: 'fill', page: 140, q: 'At the rural level, local self-government functions as a three-tier _____ System.', answer: 'Panchayati Raj' },
    { id: 'f5', topic: 'mehta', type: 'fill', page: 140, q: 'The Panchayati Raj system was an outcome of the recommendations of the _____ Committee, appointed in January 1957.', answer: 'Balwant Rai Mehta' },
    { id: 'f6', topic: 'nyaya', type: 'fill', page: 141, q: '_____ are proposed to provide fair and speedy justice outside the formal judicial system.', answer: 'Nyaya Panchayats' },
    { id: 'f7', topic: 'women', type: 'fill', page: 141, q: 'In the Gram Panchayat, _____ of the total seats are reserved for women.', answer: 'one-third' },
    { id: 'f8', topic: 'pancha', type: 'fill', page: 140, q: 'In ancient times, villagers elected a group of five elders called the _____.', answer: 'pancha' },
    { id: 'f9', topic: 'bdo', type: 'fill', page: 142, q: 'The _____ is responsible for carrying out the plans of the Panchayat Samiti.', answer: 'Block Development Officer' },
    { id: 'f10', topic: 'amendment', type: 'fill', page: 143, q: 'According to the _____ Amendment, twenty-nine subjects are to be transferred to the Panchayati Raj institutions.', answer: '73rd' },
    { id: 'f11', topic: 'nyayadate', type: 'fill', page: 141, q: 'The press release proposing Nyaya Panchayats was issued by the Government of India on 26 August _____.', answer: '2011' },
    { id: 'f12', topic: 'conciliation', type: 'fill', page: 141, q: 'In the Draft Nyaya Panchayat Bill, _____ is proposed as the primary means of dispute resolution.', answer: 'conciliation' },

    // ---------- Name the following ----------
    { id: 'n1', topic: 'gramsabha', type: 'name', page: 140, q: 'All the adults in a village who are registered as voters are members of this group', answer: 'The Gram Sabha' },
    { id: 'n2', topic: 'pradhan', type: 'name', page: 141, q: 'The head of the Gram Panchayat', answer: 'The Pradhan or Sarpanch' },
    { id: 'n3', topic: 'toptier', type: 'name', page: 142, q: 'The top tier of the Panchayati Raj System', answer: 'The Zila Parishad' },
    { id: 'n4', topic: 'electsgp', type: 'name', page: 141, q: 'The body that elects the members of the Gram Panchayat', answer: 'The Gram Sabha' },
    { id: 'n5', topic: 'samiti', type: 'name', page: [141, 142], q: 'The governing body of a block formed by grouping several villages', answer: 'The Panchayat (Block) Samiti' },
    { id: 'n6', topic: 'nyaya', type: 'name', page: 141, q: 'A system of speedy and fair justice outside the judicial system of India', answer: 'The Nyaya Panchayat' },
    { id: 'n7', topic: 'nyayasahayak', type: 'name', page: 141, q: 'The people proposed to assist the Nyaya Panchayat in resolving disputes', answer: 'Nyaya Sahayaks' },
    { id: 'n8', topic: 'president', type: 'name', page: 139, q: 'The person in whom the executive power of the central government is vested', answer: 'The President' },
    { id: 'n9', topic: 'governor', type: 'name', page: 139, q: 'The person in whom the executive power of a state government is vested', answer: 'The Governor' },
    { id: 'n10', topic: 'uppradhan', type: 'name', page: 141, q: 'The person who takes on the responsibilities of the village in the absence of the Sarpanch', answer: 'The Up-Pradhan' },
    { id: 'n11', topic: 'mehta', type: 'name', page: 140, q: 'The committee appointed in January 1957 whose recommendations set the stage for Panchayati Raj', answer: 'The Balwant Rai Mehta Committee' },
    { id: 'n12', topic: 'bdo', type: 'name', page: 142, q: 'The officer responsible for carrying out the plans of the Panchayat Samiti', answer: 'The Block Development Officer' },
    { id: 'n13', topic: 'delhi', type: 'name', page: 139, q: 'The city where the central government of India is based', answer: 'New Delhi' },

    // ---------- Give reasons ----------
    { id: 'r1', topic: 'success', type: 'reason', page: 142, q: 'The Panchayati Raj system has been functioning well in India.', answer: 'Villages under it have progressed; it has created a sense of community development, self-reliance and initiative, and gives weaker sections a chance to take part in governing their own areas.' },
    { id: 'r2', topic: 'levelsreason', type: 'reason', page: 139, q: 'The government in India functions at different levels.', answer: 'India is a vast, democratic country; a central government alone cannot manage all its regions, so power and responsibilities are distributed at central, state and local levels for efficient administration.' },
    { id: 'r3', topic: 'lsgwhy', type: 'reason', page: [139, 140], q: 'Local self-government can solve local problems efficiently.', answer: 'Its representatives are elected from among the residents, so they are best aware of the problems of their area.' },
    { id: 'r4', topic: 'samitiwhy', type: 'reason', page: 141, q: 'Panchayat (Block) Samitis have been constituted.', answer: 'Some problems cannot be solved by a Gram Panchayat alone, so several villages are grouped into a block with a Panchayat Samiti.' },
    { id: 'r5', topic: 'reservation', type: 'reason', page: [141, 142], q: 'Seats are reserved for Scheduled Castes, Scheduled Tribes and women in the Panchayats.', answer: 'To give weaker sections of society an opportunity to participate in governing their own areas (and ensure their representation).' },
    { id: 'r6', topic: 'britishpancha', type: 'reason', page: 140, q: 'The ancient pancha system lost its value during British rule.', answer: 'The British sent their own officers to deal with village problems and disputes.' },
    { id: 'r7', topic: 'coordination', type: 'reason', page: 142, q: 'Coordination among the three levels of the Panchayati Raj System is necessary.', answer: 'Proper coordination is needed for the development of villages, as funds, plans and supervision move between the levels.' },
    { id: 'r8', topic: 'funds', type: 'reason', page: 142, q: 'Rural local governments need sources of income.', answer: 'They need funds to look after their responsibilities such as roads, water, sanitation, hospitals and schools.' },

    // ---------- Define ----------
    { id: 'd1', topic: 'gramsabha', type: 'define', page: 140, term: 'Gram Sabha', answer: 'The village assembly of all adults registered in the electoral rolls; it discusses village problems and elects the Gram Panchayat.' },
    { id: 'd2', topic: 'lsgdef', type: 'define', page: 139, term: 'Local self-government', answer: 'The third level of government, in which the residents of a locality elect their own representatives to manage local affairs.' },
    { id: 'd3', type: 'define', page: 144, term: 'Pradhan', answer: 'The Sarpanch, or head of the Gram Panchayat.' },

    // ---------- Match ----------
    { id: 'x1', type: 'match', page: 140, q: 'Match the bodies with their heads.', left: 'Body', right: 'Head',
      pairs: [['Gram Panchayat', 'Sarpanch or Pradhan'], ['Panchayat Samiti', 'Chairperson'], ['Zila Parishad', 'President of the Parishad'], ['State government', 'Governor (executive head)'], ['Central government', 'President (executive head)']] },
    { id: 'x2', type: 'match', page: 140, q: 'Match the level with the body.', left: 'Level', right: 'Body',
      pairs: [['Village level', 'Gram Panchayat'], ['Intermediate (block) level', 'Panchayat Samiti'], ['District level', 'Zila Parishad'], ['Village assembly', 'Gram Sabha']] },

    // ---------- Differences ----------
    { id: 'df1', topic: 'sabhavspanch', type: 'difference', page: [140, 141], a: 'the Gram Sabha', b: 'the Gram Panchayat', rows: [['All adult registered voters of the village', 'Members elected by the Gram Sabha'], ['Discusses village problems and elects the Panchayat', 'Carries out work: water, roads, sanitation, schools; headed by the Sarpanch']] },
    { id: 'df2', type: 'difference', page: [139, 140], a: 'the central government', b: 'local self-government', rows: [['Looks after national matters (defence, finance, railways)', 'Looks after local matters of a village or town'], ['Executive power with the President, based in New Delhi', 'Run by representatives elected by local residents']] },

    // ---------- Short answers (2 marks) ----------
    { id: 's1', topic: 'income', type: 'short', marks: 2, page: 142, q: 'Mention any two sources of income for the Panchayati Raj institutions.', answer: 'Any two: taxes on property, fairs and film shows; a fixed portion of the land revenue; grants from the state government; charges for supplying water.' },
    { id: 's2', topic: 'samiticomp', type: 'short', marks: 2, page: 142, q: 'Explain the composition of the Panchayat Samiti.', answer: 'It is formed by the Sarpanches of all Gram Panchayats in the block and the MP and MLA representing the block; seats are reserved for SCs and STs, and one-third for women. The chairperson and vice-chairperson are elected by its members.' },
    { id: 's3', topic: 'sabhavspanch', type: 'short', marks: 2, page: [140, 141], q: 'Mention one difference between the Gram Sabha and the Gram Panchayat.', answer: 'The Gram Sabha is made up of all adult registered voters of the village; the Gram Panchayat is a smaller body of members elected by the Gram Sabha to carry out village work.' },
    { id: 's4', topic: 'nyaya', type: 'short', marks: 2, page: 141, q: 'What is the Nyaya Panchayat?', answer: 'A proposed body to give fair and speedy justice, civil and criminal, at people\'s doorsteps outside the formal judicial system; its Nyaya Panchas are elected by local residents, and it is separate from the Gram Panchayat.' },
    { id: 's5', topic: 'functions', type: 'short', marks: 2, page: 142, q: 'State two functions of the Panchayati Raj Institutions.', answer: 'Any two: construction and repair of village roads, tanks and wells; providing clean drinking water; lighting roads; sanitation and public health; managing hospitals, fairs and markets; organising recreation programmes.' },
    { id: 's6', topic: 'levels', type: 'short', marks: 2, page: 139, q: 'What are the different levels of government in India?', answer: 'Three levels: the central government (in New Delhi), the state governments, and local self-government (urban and rural).' },
    { id: 's7', topic: 'lsgwhy', type: 'short', marks: 2, page: [139, 140], q: 'Why are local self-governments important?', answer: 'Residents elect their own representatives, who know the local problems best and can solve them efficiently; it brings government closer to the people.' },
    { id: 's8', topic: 'gpwork', type: 'short', marks: 2, page: 140, q: 'What are the functions of the Gram Panchayat?', answer: 'It ensures clean drinking water; builds roads, tanks, wells, drains and public buildings; provides healthcare and sanitation; supervises village schools.' },
    { id: 's9', topic: 'ruralurban', type: 'short', marks: 2, page: [139, 140], q: 'Why are there different governing bodies for local self-governance in rural and urban areas?', answer: 'Villages and towns have different needs and problems, so local self-government works separately at the rural level (Panchayati Raj) and the urban level.' },
    { id: 's10', topic: 'thennow', type: 'short', marks: 2, page: 140, q: 'Compare and contrast the ancient pancha with the modern Panchayat system.', answer: 'In ancient times villagers chose five elders (pancha) whose decisions all obeyed; it lost value under the British. Independent India revived it as an elected Panchayati Raj system (after the Balwant Rai Mehta Committee, 1957) so villagers manage their own affairs.' },
    { id: 's11', topic: 'zpcomp', type: 'short', marks: 2, page: 142, q: 'What is the composition of a Zila Parishad?', answer: 'Chairpersons of the Panchayat Samitis; Members of Parliament and State Legislatures; members representing SCs, STs and women. Its president and vice-president are elected by the members.' },
    { id: 's12', topic: 'gramsabha', type: 'short', marks: 2, page: [140, 141], q: 'Who are the members of the Gram Sabha and what does it do?', answer: 'All adult villagers registered in the electoral rolls. It meets at least twice a year, discusses important village problems and elects the members of the Gram Panchayat.' },

    // ---------- Long answers (4 marks) ----------
    { id: 'l1', topic: 'threetier', type: 'long', marks: 4, page: 140, q: 'Explain the three-tier structure of the Panchayati Raj System.', answer: 'Village level: Gram Panchayat (head Sarpanch/Pradhan), elected by the Gram Sabha, providing water, roads, sanitation and schools. Intermediate level: Panchayat Samiti (head Chairperson), supervising village panchayats, arranging funds, irrigation, seeds and fertilisers. District level: Zila Parishad (head President), approving Samiti budgets, supervising development, building schools and hospitals, and coordinating with the state government.' },
    { id: 'l2', topic: 'functions', type: 'long', marks: 4, page: 142, q: 'Describe the functions of the Panchayati Raj Institutions.', answer: 'Construction and repair of village roads, tanks and wells; providing clean drinking water and road lighting; sanitation and public health; managing hospitals, fairs and markets; organising recreation and entertainment programmes.' },
    { id: 'l3', topic: 'zilla', type: 'long', marks: 4, page: [140, 142], q: 'Write a note on the Zila Parishad: its term, composition and functions.', answer: 'Top tier, district level, generally for 5 years; elected body with a president and vice-president. Members: chairpersons of Panchayat Samitis, MPs and state legislators, members representing SCs, STs and women. Functions: approves Samiti budgets and distributes funds, supervises development programmes, builds schools, hospitals and health centres, coordinates between the state government and the panchayats.' },
    { id: 'l4', topic: 'govlevels', type: 'long', marks: 4, page: 139, q: 'Describe the central and state governments of India.', answer: 'Central government (New Delhi): national matters like defence, finance, home and railways; executive power in the President, assisted by a Council of Ministers headed by the Prime Minister. State governments: law and order, transport, health; executive power in the Governor, aided by a Council of Ministers headed by the Chief Minister; they also follow some central decisions.' },
    { id: 'l5', topic: 'samitifull', type: 'long', marks: 4, page: [140, 141, 142], q: 'Describe the Panchayat Samiti: why it exists, its composition and functions.', answer: 'Some problems are beyond a Gram Panchayat, so villages are grouped into a block with a Panchayat Samiti. Composition: Sarpanches of all GPs, the block\'s MP and MLA, reserved seats (one-third for women); chairperson and vice-chairperson elected by members; the BDO carries out its plans. Functions: supervises village panchayats, arranges government funds for development, organises irrigation, seeds and fertilisers.' },

    // ---------- Picture study ----------
    { id: 'p1', topic: 'streetlights', type: 'picture', page: [140, 142], scene: 'A quiet village lane at dusk lined with houses and lit by streetlights.',
      imagePrompt: 'Painterly illustration of a quiet Indian village lane at dusk with thatched houses, trees and glowing streetlights along the path, no people, no text',
      parts: [{ q: 'Name the body responsible for the installation and maintenance of streetlights in a village.', answer: 'The Gram Panchayat', marks: 1 }, { q: 'Identify the head of this body.', answer: 'The Sarpanch or Pradhan', marks: 1 }] },
    { id: 'p2', topic: 'sabhameet', type: 'picture', page: [140, 141], scene: 'Many village women and men sitting together under a big tree, discussing village matters.',
      imagePrompt: 'Painterly illustration of village women and men sitting together under a large banyan tree in an open-air village meeting, warm afternoon light, no text',
      parts: [{ q: 'Identify the village assembly shown in the picture.', answer: 'The Gram Sabha', marks: 1 }, { q: 'How many times a year must it meet, at least?', answer: 'At least twice a year', marks: 1 }] },
    { id: 'p3', topic: 'reservoir', type: 'picture', page: [141, 142], scene: 'Villagers digging and building a stone reservoir to store water.',
      imagePrompt: 'Painterly illustration of Indian villagers building a stone-stepped water reservoir with spades and baskets, fields around, no text',
      parts: [{ q: 'Which body usually builds tanks, wells and reservoirs in a village?', answer: 'The Gram Panchayat', marks: 1 }, { q: 'Name any one source of income that pays for such work.', answer: 'Any one: taxes on property, fairs or film shows; a portion of land revenue; state government grants; charges for supplying water', marks: 1 }] },
    { id: 'p4', topic: 'pyramid', type: 'picture', page: 139, scene: 'A pyramid divided into three layers, smallest at the top and largest at the bottom, showing the levels of government.',
      imagePrompt: 'Simple flat illustration of a three-layer pyramid in orange, blue and green, smallest layer at top, on a plain background, no text',
      parts: [{ q: 'The pyramid shows the levels of government in India. Name the three levels from top to bottom.', answer: 'Central government, state government, local self-government', marks: 2 }] },
    { id: 'p5', topic: 'pancha', type: 'picture', page: 140, scene: 'Five village elders seated on a raised platform under a tree, listening to two villagers with a dispute.',
      imagePrompt: 'Painterly illustration of five elderly village elders seated on a raised platform under a tree, listening to two villagers presenting a dispute, ancient Indian village, no text',
      parts: [{ q: 'What was this group of five elders called in ancient times?', answer: 'The pancha', marks: 1 }, { q: 'Name the committee whose recommendations led to the modern Panchayati Raj system.', answer: 'The Balwant Rai Mehta Committee (1957)', marks: 1 }] },
  ],
  mapFeatures: [],
};
