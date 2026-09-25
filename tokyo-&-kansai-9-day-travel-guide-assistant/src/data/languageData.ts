import { LanguageHack } from '../types';

export const JAPANESE_LANGUAGE_HACKS: LanguageHack[] = [
  // Courtesy & Essentials
  {
    id: 'c1',
    japanese: 'こんにちは',
    romaji: 'Konnichiwa',
    meaning: 'Hello / Good afternoon',
    context: 'Standard greeting used from 10:30 AM to late afternoon.',
    category: 'courtesy',
  },
  {
    id: 'c2',
    japanese: 'ありがとうございます',
    romaji: 'Arigatou gozaimasu',
    meaning: 'Thank you very much (polite)',
    context: 'Use when receiving food, train tickets, or help.',
    category: 'courtesy',
  },
  {
    id: 'c3',
    japanese: 'すみません',
    romaji: 'Sumimasen',
    meaning: 'Excuse me / Sorry / Pardon me',
    context: 'The most versatile word in Japan: getting a waiter’s attention, passing through crowds, or apologizing.',
    category: 'courtesy',
  },
  {
    id: 'c4',
    japanese: 'お願いします',
    romaji: 'Onegaishimasu',
    meaning: 'Please (when requesting an item or action)',
    context: 'Say after pointing to a menu item or giving an address to a taxi driver.',
    category: 'courtesy',
  },
  {
    id: 'c5',
    japanese: '大丈夫です',
    romaji: 'Daijoubu desu',
    meaning: 'It’s okay / No thank you (polite refusal)',
    context: 'Perfect when a cashier asks if you want a plastic bag and you have your own tote.',
    category: 'courtesy',
  },
  {
    id: 'c6',
    japanese: 'いただきます',
    romaji: 'Itadakimasu',
    meaning: 'I humbly receive (Before eating)',
    context: 'Said before starting every meal in Japan with hands clasped.',
    category: 'courtesy',
  },
  {
    id: 'c7',
    japanese: 'ごちそうさまでした',
    romaji: 'Gochisousama deshita',
    meaning: 'Thank you for the wonderful meal (After eating)',
    context: 'Say to the chef/staff when leaving a ramen shop or izakaya.',
    category: 'courtesy',
  },

  // Transit & Navigation
  {
    id: 't1',
    japanese: '…はどこですか？',
    romaji: '... wa doko desu ka?',
    meaning: 'Where is [...]?',
    context: 'Example: "Toire wa doko desu ka?" (Where is the restroom?) or "Eki wa doko desu ka?" (Where is the station?)',
    category: 'transit',
  },
  {
    id: 't2',
    japanese: 'ここへ行きたいです',
    romaji: 'Koko e ikitai desu',
    meaning: 'I want to go here (while pointing at smartphone map)',
    context: 'Show your Google Maps or hotel card to station staff or taxi drivers.',
    category: 'transit',
  },
  {
    id: 't3',
    japanese: 'これは東京駅に行きますか？',
    romaji: 'Kore wa Toukyou-eki ni ikimasu ka?',
    meaning: 'Does this train go to Tokyo Station?',
    context: 'Verify before boarding a rapid train or confusing platform.',
    category: 'transit',
  },
  {
    id: 't4',
    japanese: 'Suica/ICOCA は使えますか？',
    romaji: 'Suica / ICOCA wa tsukaemasu ka?',
    meaning: 'Can I use Suica / ICOCA card here?',
    context: 'Use at regional bus lines, ropeways, and convenience stores.',
    category: 'transit',
  },
  {
    id: 't5',
    japanese: '新大阪駅までお願いします',
    romaji: 'Shin-Oosaka eki made onegaishimasu',
    meaning: 'To Shin-Osaka station, please',
    context: 'Standard phrase when getting into a taxi in Osaka.',
    category: 'transit',
  },

  // Dining
  {
    id: 'd1',
    japanese: 'これをお願いします',
    romaji: 'Kore o onegaishimasu',
    meaning: 'This one please (pointing at photo/menu)',
    context: 'Foolproof ordering phrase at any restaurant or street stall.',
    category: 'dining',
  },
  {
    id: 'd2',
    japanese: 'おすすめは何ですか？',
    romaji: 'Osusume wa nan desu ka?',
    meaning: 'What is your recommendation?',
    context: 'Great way to get the signature dish at Dotonbori food stalls or ramen counters.',
    category: 'dining',
  },
  {
    id: 'd3',
    japanese: 'お会計をお願いします',
    romaji: 'Okaikei o onegaishimasu',
    meaning: 'The bill/check, please',
    context: 'You can also make an "X" sign with your index fingers for quick non-verbal check request.',
    category: 'dining',
  },
  {
    id: 'd4',
    japanese: '英語のメニューはありますか？',
    romaji: 'Eigo no menyuu wa arimasu ka?',
    meaning: 'Do you have an English menu?',
    context: 'Many spots in Akihabara, Dotonbori, and Disney have English or pictorial menus.',
    category: 'dining',
  },
  {
    id: 'd5',
    japanese: 'お水をお願いします',
    romaji: 'Omizu o onegaishimasu',
    meaning: 'Water, please (free in virtually all Japanese diners)',
    context: 'Ice water ("Ohiya") is routinely refilled for free.',
    category: 'dining',
  },

  // Shopping & Tax-Free
  {
    id: 's1',
    japanese: 'いくらですか？',
    romaji: 'Ikura desu ka?',
    meaning: 'How much does this cost?',
    context: 'Use at flea markets, souvenir shops in Kyoto, or Akihabara figure shops.',
    category: 'shopping',
  },
  {
    id: 's2',
    japanese: '免税できますか？',
    romaji: 'Menzei dekimasu ka?',
    meaning: 'Is tax-free shopping available?',
    context: 'Applicable over ¥5,000 at electronics mega-stores (Yodobashi/Bic Camera) with foreign passport.',
    category: 'shopping',
  },
  {
    id: 's3',
    japanese: 'カードで払えますか？',
    romaji: 'Kaado de haraemasu ka?',
    meaning: 'Can I pay by credit card?',
    context: 'While widespread in Tokyo, small Kansai shrines and street stalls are cash-only.',
    category: 'shopping',
  },
  {
    id: 's4',
    japanese: '袋はいりません',
    romaji: 'Fukuro wa irimasen',
    meaning: 'I don’t need a shopping bag',
    context: 'Plastic bags cost ¥3-5; say this if you have a backpack.',
    category: 'shopping',
  },

  // Emergency & Essential
  {
    id: 'e1',
    japanese: '助けてください',
    romaji: 'Tasukete kudasai',
    meaning: 'Please help me!',
    context: 'Emergency distress call if lost or feeling unwell.',
    category: 'emergency',
  },
  {
    id: 'e2',
    japanese: '英語が話せますか？',
    romaji: 'Eigo ga hanasemasu ka?',
    meaning: 'Can you speak English?',
    context: 'Polite inquiry before asking complex questions.',
    category: 'emergency',
  },
  {
    id: 'e3',
    japanese: '交番はどこですか？',
    romaji: 'Kouban wa doko desu ka?',
    meaning: 'Where is the police box (Koban)?',
    context: 'Japanese police boxes are stationed at every train exit and help with lost items or directions.',
    category: 'emergency',
  }
];

export function speakJapanese(text: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.9; // Slightly slower for clear learner pronunciation
  
  // Try to find Japanese voice
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith('ja'));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }
  window.speechSynthesis.speak(utterance);
}
