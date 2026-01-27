// Test Protocols for Speech Sound Disorder Assessment
// TAAPU (Urdu) and GFTA/KLPA (English) Tests

export interface Word {
  id: number;
  word: string;
  urdu?: string;
  transliteration?: string;
  pronunciation: string;
  phoneme?: string;
  imageUrl?: string;
}

export interface Protocol {
  id: string;
  name: string;
  checkNotes: string;
  words: Word[];
}

export interface TestProtocol {
  id: string;
  name: string;
  fullName: string;
  version: string;
  language: string;
  targetAgeYears: string;
  administrationTimeMinutes: number;
  description: string;
  instructions: string[];
  protocols: Protocol[];
}

// ============================================
// TAAPU TEST - Urdu Speech Assessment
// ============================================
export const TAAPU_TEST: TestProtocol = {
  id: 'taapu',
  name: 'TAAPU',
  fullName: 'Test of Articulation in Urdu for Pakistani Children',
  version: '1.0',
  language: 'Urdu',
  targetAgeYears: '4-8',
  administrationTimeMinutes: 30,
  description: 'Standardized speech sound assessment for Urdu-speaking children',
  instructions: [
    'Present each word with its image',
    'Ask the child to name the picture',
    'Record the child\'s production',
    'Note any sound substitutions or deletions'
  ],
  protocols: [
    {
      id: 'fronting',
      name: 'FRONTING',
      checkNotes: 'Check all back sounds - velar sounds replaced with alveolar',
      words: [
        { id: 1, word: 'Bikri', urdu: 'بکری', transliteration: 'Bikri', pronunciation: 'bik-ree', phoneme: '/k/' },
        { id: 2, word: 'Kitaab', urdu: 'کتاب', transliteration: 'Kitaab', pronunciation: 'ki-taab', phoneme: '/k/, /t/' },
        { id: 3, word: 'Patang', urdu: 'پتنگ', transliteration: 'Patang', pronunciation: 'pa-tang', phoneme: '/t/, /ŋ/' },
        { id: 4, word: 'Makkhi', urdu: 'مکھی', transliteration: 'Makkhi', pronunciation: 'mak-khee', phoneme: '/k/' },
        { id: 5, word: 'Ghubbara', urdu: 'غبارہ', transliteration: 'Ghubbara', pronunciation: 'ghub-baa-ra', phoneme: '/gh/' },
        { id: 6, word: 'Batakh', urdu: 'بطخ', transliteration: 'Batakh', pronunciation: 'ba-takh', phoneme: '/kh/' },
        { id: 7, word: 'Kharbooza', urdu: 'خربوزہ', transliteration: 'Kharbooza', pronunciation: 'khar-boo-za', phoneme: '/kh/' },
        { id: 8, word: 'Naak', urdu: 'ناک', transliteration: 'Naak', pronunciation: 'naak', phoneme: '/k/' },
      ]
    },
    {
      id: 'stopping',
      name: 'STOPPING',
      checkNotes: 'Check all fricatives - replaced with stops',
      words: [
        { id: 1, word: 'Sher', urdu: 'شیر', transliteration: 'Sher', pronunciation: 'share', phoneme: '/ʃ/' },
        { id: 2, word: 'Baadshah', urdu: 'بادشاہ', transliteration: 'Baadshah', pronunciation: 'baad-shah', phoneme: '/ʃ/' },
        { id: 3, word: 'Baarish', urdu: 'بارش', transliteration: 'Baarish', pronunciation: 'baa-rish', phoneme: '/ʃ/' },
        { id: 4, word: 'Sooraj', urdu: 'سورج', transliteration: 'Sooraj', pronunciation: 'soo-raj', phoneme: '/s/' },
        { id: 5, word: 'Rassi', urdu: 'رسی', transliteration: 'Rassi', pronunciation: 'ras-see', phoneme: '/s/' },
        { id: 6, word: 'Glass', urdu: 'گلاس', transliteration: 'Glass', pronunciation: 'glass', phoneme: '/s/' },
        { id: 7, word: 'Kharbooza', urdu: 'خربوزہ', transliteration: 'Kharbooza', pronunciation: 'khar-boo-za', phoneme: '/kh/' },
        { id: 8, word: 'Zabaan', urdu: 'زبان', transliteration: 'Zabaan', pronunciation: 'za-baan', phoneme: '/z/' },
        { id: 9, word: 'Mez', urdu: 'میز', transliteration: 'Mez', pronunciation: 'mez', phoneme: '/z/' },
        { id: 10, word: 'Saanp', urdu: 'سانپ', transliteration: 'Saanp', pronunciation: 'saanp', phoneme: '/s/' },
      ]
    },
    {
      id: 'r_disorder',
      name: '/r/ ERROR',
      checkNotes: 'Check all /r/ sounds in different positions',
      words: [
        { id: 1, word: 'Rassi', urdu: 'رسی', transliteration: 'Rassi', pronunciation: 'ras-see', phoneme: '/r/' },
        { id: 2, word: 'Baarish', urdu: 'بارش', transliteration: 'Baarish', pronunciation: 'baa-rish', phoneme: '/r/' },
        { id: 3, word: 'Juraab', urdu: 'جراب', transliteration: 'Juraab', pronunciation: 'ju-raab', phoneme: '/r/' },
        { id: 4, word: 'Bikri', urdu: 'بکری', transliteration: 'Bikri', pronunciation: 'bik-ree', phoneme: '/r/' },
        { id: 5, word: 'Sher', urdu: 'شیر', transliteration: 'Sher', pronunciation: 'share', phoneme: '/r/' },
        { id: 6, word: 'Magarmachh', urdu: 'مگر مچھ', transliteration: 'Magarmachh', pronunciation: 'ma-gar-machh', phoneme: '/r/' },
        { id: 7, word: 'Murghi', urdu: 'مرغی', transliteration: 'Murghi', pronunciation: 'mur-ghee', phoneme: '/r/' },
        { id: 8, word: 'Machhar', urdu: 'مچھر', transliteration: 'Machhar', pronunciation: 'mach-har', phoneme: '/r/' },
        { id: 9, word: 'Chhatri', urdu: 'چھتری', transliteration: 'Chhatri', pronunciation: 'chhat-ree', phoneme: '/r/' },
      ]
    },
    {
      id: 'final_consonant_deletion',
      name: 'FINAL CONSONANT DELETION',
      checkNotes: 'Check final consonants - omission of final sounds',
      words: [
        { id: 1, word: 'Sher', urdu: 'شیر', transliteration: 'Sher', pronunciation: 'share', phoneme: '/r/' },
        { id: 2, word: 'Gate', urdu: 'گیٹ', transliteration: 'Gate', pronunciation: 'gate', phoneme: '/t/' },
        { id: 3, word: 'Juraab', urdu: 'جراب', transliteration: 'Juraab', pronunciation: 'ju-raab', phoneme: '/b/' },
        { id: 4, word: 'Barf', urdu: 'برف', transliteration: 'Barf', pronunciation: 'barf', phoneme: '/f/' },
        { id: 5, word: 'Saanp', urdu: 'سانپ', transliteration: 'Saanp', pronunciation: 'saanp', phoneme: '/p/' },
        { id: 6, word: 'Wagon', urdu: 'ویگن', transliteration: 'Wagon', pronunciation: 'wa-gon', phoneme: '/n/' },
        { id: 7, word: 'Kitaab', urdu: 'کتاب', transliteration: 'Kitaab', pronunciation: 'ki-taab', phoneme: '/b/' },
        { id: 8, word: 'Baarish', urdu: 'بارش', transliteration: 'Baarish', pronunciation: 'baa-rish', phoneme: '/ʃ/' },
        { id: 9, word: 'Mez', urdu: 'میز', transliteration: 'Mez', pronunciation: 'mez', phoneme: '/z/' },
        { id: 10, word: 'Daant', urdu: 'دانت', transliteration: 'Daant', pronunciation: 'daant', phoneme: '/t/' },
      ]
    },
    {
      id: 'nasal_assimilation',
      name: 'NASAL ASSIMILATION',
      checkNotes: 'Check non-nasal sounds in words with nasal sounds',
      words: [
        { id: 1, word: 'Mez', urdu: 'میز', transliteration: 'Mez', pronunciation: 'mez', phoneme: '/m/' },
        { id: 2, word: 'Bandar', urdu: 'بندر', transliteration: 'Bandar', pronunciation: 'ban-dar', phoneme: '/n/' },
        { id: 3, word: 'Naak', urdu: 'ناک', transliteration: 'Naak', pronunciation: 'naak', phoneme: '/n/' },
        { id: 4, word: 'Angoor', urdu: 'انگور', transliteration: 'Angoor', pronunciation: 'an-goor', phoneme: '/ŋ/' },
        { id: 5, word: 'Paani', urdu: 'پانی', transliteration: 'Paani', pronunciation: 'paa-nee', phoneme: '/n/' },
        { id: 6, word: 'Chaand', urdu: 'چاند', transliteration: 'Chaand', pronunciation: 'chaand', phoneme: '/n/' },
        { id: 7, word: 'Uniform', urdu: 'یونیفارم', transliteration: 'Uniform', pronunciation: 'yoo-ni-form', phoneme: '/n/, /m/' },
        { id: 8, word: 'Saanp', urdu: 'سانپ', transliteration: 'Saanp', pronunciation: 'saanp', phoneme: '/n/' },
        { id: 9, word: 'Zabaan', urdu: 'زبان', transliteration: 'Zabaan', pronunciation: 'za-baan', phoneme: '/n/' },
        { id: 10, word: 'Patang', urdu: 'پتنگ', transliteration: 'Patang', pronunciation: 'pa-tang', phoneme: '/ŋ/' },
      ]
    },
    {
      id: 'depalatalization',
      name: 'DEPALATALIZATION',
      checkNotes: 'Check palatal sounds - replaced with alveolar',
      words: [
        { id: 1, word: 'Tamasur', urdu: 'تماثر', transliteration: 'Tamasur', pronunciation: 'ta-ma-sur', phoneme: '/t/' },
        { id: 2, word: 'Gate', urdu: 'گیٹ', transliteration: 'Gate', pronunciation: 'gate', phoneme: '/g/' },
        { id: 3, word: 'Tabaah', urdu: 'تبہ', transliteration: 'Tabaah', pronunciation: 'ta-baah', phoneme: '/t/' },
        { id: 4, word: 'Ganda', urdu: 'گندہ', transliteration: 'Ganda', pronunciation: 'gan-da', phoneme: '/g/' },
        { id: 5, word: 'Chidiya', urdu: 'چڑیا', transliteration: 'Chidiya', pronunciation: 'chi-di-ya', phoneme: '/tʃ/' },
        { id: 6, word: 'Pahaar', urdu: 'پہاڑ', transliteration: 'Pahaar', pronunciation: 'pa-haar', phoneme: '/ɽ/' },
        { id: 7, word: 'Sher', urdu: 'شیر', transliteration: 'Sher', pronunciation: 'share', phoneme: '/ʃ/' },
        { id: 8, word: 'Baarish', urdu: 'بارش', transliteration: 'Baarish', pronunciation: 'baa-rish', phoneme: '/ʃ/' },
        { id: 9, word: 'Baadshah', urdu: 'بادشاہ', transliteration: 'Baadshah', pronunciation: 'baad-shah', phoneme: '/ʃ/' },
        { id: 10, word: 'Card', urdu: 'کارڈ', transliteration: 'Card', pronunciation: 'card', phoneme: '/k/' },
      ]
    }
  ]
};

// ============================================
// GFTA-3 / KLPA-3 TEST - English Speech Assessment
// Goldman-Fristoe Test of Articulation
// Khan-Lewis Phonological Analysis
// ============================================
export const GFTA_KLPA_TEST: TestProtocol = {
  id: 'gfta_klpa',
  name: 'GFTA-3 / KLPA-3',
  fullName: 'Goldman-Fristoe Test of Articulation / Khan-Lewis Phonological Analysis',
  version: '3.0',
  language: 'English',
  targetAgeYears: '2-21',
  administrationTimeMinutes: 15,
  description: 'Comprehensive articulation and phonological assessment for English speakers',
  instructions: [
    'Show each picture card to the child',
    'Say "Tell me what you see"',
    'Record the spontaneous response',
    'If needed, provide a model for imitation'
  ],
  protocols: [
    {
      id: 'initial_consonants',
      name: 'INITIAL CONSONANTS',
      checkNotes: 'Word-initial consonant production',
      words: [
        { id: 1, word: 'House', pronunciation: 'hows', phoneme: '/h/' },
        { id: 2, word: 'Ball', pronunciation: 'bawl', phoneme: '/b/' },
        { id: 3, word: 'Dog', pronunciation: 'dawg', phoneme: '/d/' },
        { id: 4, word: 'Cat', pronunciation: 'kat', phoneme: '/k/' },
        { id: 5, word: 'Sun', pronunciation: 'suhn', phoneme: '/s/' },
        { id: 6, word: 'Fish', pronunciation: 'fish', phoneme: '/f/' },
        { id: 7, word: 'Goat', pronunciation: 'goht', phoneme: '/g/' },
        { id: 8, word: 'Table', pronunciation: 'tay-buhl', phoneme: '/t/' },
        { id: 9, word: 'Monkey', pronunciation: 'muhng-kee', phoneme: '/m/' },
        { id: 10, word: 'Nose', pronunciation: 'nohz', phoneme: '/n/' },
        { id: 11, word: 'Pig', pronunciation: 'pig', phoneme: '/p/' },
        { id: 12, word: 'Window', pronunciation: 'win-doh', phoneme: '/w/' },
      ]
    },
    {
      id: 'medial_consonants',
      name: 'MEDIAL CONSONANTS',
      checkNotes: 'Word-medial consonant production',
      words: [
        { id: 1, word: 'Spider', pronunciation: 'spy-der', phoneme: '/d/' },
        { id: 2, word: 'Rabbit', pronunciation: 'rab-it', phoneme: '/b/' },
        { id: 3, word: 'Ladder', pronunciation: 'lad-er', phoneme: '/d/' },
        { id: 4, word: 'Wagon', pronunciation: 'wag-un', phoneme: '/g/' },
        { id: 5, word: 'Carrot', pronunciation: 'kar-ut', phoneme: '/r/' },
        { id: 6, word: 'Butter', pronunciation: 'buht-er', phoneme: '/t/' },
        { id: 7, word: 'Finger', pronunciation: 'fing-ger', phoneme: '/ŋ/' },
        { id: 8, word: 'Hammer', pronunciation: 'ham-er', phoneme: '/m/' },
      ]
    },
    {
      id: 'final_consonants',
      name: 'FINAL CONSONANTS',
      checkNotes: 'Word-final consonant production',
      words: [
        { id: 1, word: 'Cup', pronunciation: 'kuhp', phoneme: '/p/' },
        { id: 2, word: 'Bed', pronunciation: 'bed', phoneme: '/d/' },
        { id: 3, word: 'Book', pronunciation: 'buk', phoneme: '/k/' },
        { id: 4, word: 'Bus', pronunciation: 'buhs', phoneme: '/s/' },
        { id: 5, word: 'Leaf', pronunciation: 'leef', phoneme: '/f/' },
        { id: 6, word: 'Drum', pronunciation: 'druhm', phoneme: '/m/' },
        { id: 7, word: 'Pen', pronunciation: 'pen', phoneme: '/n/' },
        { id: 8, word: 'Dog', pronunciation: 'dawg', phoneme: '/g/' },
      ]
    },
    {
      id: 'consonant_blends',
      name: 'CONSONANT BLENDS',
      checkNotes: 'Consonant cluster production',
      words: [
        { id: 1, word: 'Star', pronunciation: 'star', phoneme: '/st/' },
        { id: 2, word: 'Blue', pronunciation: 'bloo', phoneme: '/bl/' },
        { id: 3, word: 'Frog', pronunciation: 'frawg', phoneme: '/fr/' },
        { id: 4, word: 'Spoon', pronunciation: 'spoon', phoneme: '/sp/' },
        { id: 5, word: 'Truck', pronunciation: 'truhk', phoneme: '/tr/' },
        { id: 6, word: 'Snake', pronunciation: 'snayk', phoneme: '/sn/' },
        { id: 7, word: 'Clown', pronunciation: 'klown', phoneme: '/kl/' },
        { id: 8, word: 'Plane', pronunciation: 'playn', phoneme: '/pl/' },
        { id: 9, word: 'Green', pronunciation: 'green', phoneme: '/gr/' },
        { id: 10, word: 'Slide', pronunciation: 'slyd', phoneme: '/sl/' },
      ]
    },
    {
      id: 'fricatives_affricates',
      name: 'FRICATIVES & AFFRICATES',
      checkNotes: 'Fricative and affricate production',
      words: [
        { id: 1, word: 'Shoe', pronunciation: 'shoo', phoneme: '/ʃ/' },
        { id: 2, word: 'Chair', pronunciation: 'chair', phoneme: '/tʃ/' },
        { id: 3, word: 'Thumb', pronunciation: 'thuhm', phoneme: '/θ/' },
        { id: 4, word: 'This', pronunciation: 'this', phoneme: '/ð/' },
        { id: 5, word: 'Jump', pronunciation: 'juhmp', phoneme: '/dʒ/' },
        { id: 6, word: 'Feather', pronunciation: 'feth-er', phoneme: '/ð/' },
        { id: 7, word: 'Zipper', pronunciation: 'zip-er', phoneme: '/z/' },
        { id: 8, word: 'Fishing', pronunciation: 'fish-ing', phoneme: '/ʃ/' },
      ]
    },
    {
      id: 'liquids_glides',
      name: 'LIQUIDS & GLIDES',
      checkNotes: '/r/, /l/, /w/, /j/ production',
      words: [
        { id: 1, word: 'Red', pronunciation: 'red', phoneme: '/r/' },
        { id: 2, word: 'Lamp', pronunciation: 'lamp', phoneme: '/l/' },
        { id: 3, word: 'Yellow', pronunciation: 'yel-oh', phoneme: '/j/' },
        { id: 4, word: 'Watch', pronunciation: 'wach', phoneme: '/w/' },
        { id: 5, word: 'Orange', pronunciation: 'or-inj', phoneme: '/r/' },
        { id: 6, word: 'Balloon', pronunciation: 'buh-loon', phoneme: '/l/' },
        { id: 7, word: 'Rocket', pronunciation: 'rok-it', phoneme: '/r/' },
        { id: 8, word: 'Umbrella', pronunciation: 'uhm-brel-uh', phoneme: '/l/' },
      ]
    }
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAllTests = (): TestProtocol[] => {
  return [TAAPU_TEST, GFTA_KLPA_TEST];
};

export const getTestById = (id: string): TestProtocol | undefined => {
  return getAllTests().find(test => test.id === id);
};

export const getAllWordsFromTest = (test: TestProtocol): Word[] => {
  return test.protocols.flatMap(protocol => protocol.words);
};

export const getTotalWordCount = (test: TestProtocol): number => {
  return getAllWordsFromTest(test).length;
};

export const getProtocolById = (test: TestProtocol, protocolId: string): Protocol | undefined => {
  return test.protocols.find(p => p.id === protocolId);
};
