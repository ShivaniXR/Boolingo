// VocabularyData.ts
// No @inputs. No Inspector connections needed.

export interface WordEntry {
  id: string;
  hindi: string;
  romanized: string;
  english: string;
  distractors: string[];
}

export const LEVEL_1_GREETINGS: WordEntry[] = [
  {
    id: 'namaste',
    hindi: 'नमस्ते',
    romanized: 'Namaste',
    english: 'Hello',
    distractors: ['Goodbye', 'Thank You', 'Good Morning']
  },
  {
    id: 'dhanyavaad',
    hindi: 'धन्यवाद',
    romanized: 'Dhanyavaad',
    english: 'Thank You',
    distractors: ['Hello', 'Please', 'Goodbye']
  },
  {
    id: 'alvida',
    hindi: 'अलविदा',
    romanized: 'Alvida',
    english: 'Goodbye',
    distractors: ['Hello', 'Thank You', 'Sorry']
  },
  {
    id: 'kripaya',
    hindi: 'कृपया',
    romanized: 'Kripaya',
    english: 'Please',
    distractors: ['Sorry', 'Goodbye', 'Yes']
  },
  {
    id: 'maaf',
    hindi: 'माफ करना',
    romanized: 'Maaf Karna',
    english: 'Sorry',
    distractors: ['Please', 'Thank You', 'No']
  },
  {
    id: 'haan',
    hindi: 'हाँ',
    romanized: 'Haan',
    english: 'Yes',
    distractors: ['No', 'Please', 'Sorry']
  },
  {
    id: 'nahin',
    hindi: 'नहीं',
    romanized: 'Nahin',
    english: 'No',
    distractors: ['Yes', 'Maybe', 'Sorry']
  },
  {
    id: 'suprabhat',
    hindi: 'सुप्रभात',
    romanized: 'Suprabhat',
    english: 'Good Morning',
    distractors: ['Good Night', 'Goodbye', 'Hello']
  }
];