import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Send, User, Sparkles, X, CornerDownLeft, Copy, Check } from 'lucide-react';
import { ItineraryDay } from '../types';
import { Eyebrow, IconButton } from './ui/primitives';

interface AIAssistantChatProps {
  currentDay: ItineraryDay;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ currentDay, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Konnichiwa! I am your personal Japan Travel Assistant and explorer guide. I have your complete 9-day itinerary loaded from your flight CX 632 to Tokyo all the way to your departure from Osaka.\n\nYou are currently viewing Day ${currentDay.dayNumber}: ${currentDay.title}.\n\nAsk me anything: local restaurants, exact train transfers, station exit shortcuts, or cultural advice!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/guide-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          activeDay: currentDay.dayNumber,
          userLocation: null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      console.warn('Using local travel assistant guidance:', err);
      // Helpful fallback response tailored to query
      const fallbackText = getLocalFallback(query, currentDay);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    `Best ramen within 5 minutes of Hamamatsucho?`,
    `How to feed Nara deer safely without getting clothes bitten?`,
    `Dress code & rules for teamLab Borderless mirrored floors?`,
    `Which seat on Shinkansen Nozomi for Mount Fuji view?`,
    `How to order food in Japanese when there's no English menu?`,
  ];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl h-[90vh] sm:h-[85vh] sm:max-h-[720px] flex flex-col rounded-t-[32px] sm:rounded-[32px] bg-paper-50 border border-white/40 shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="AI travel assistant"
          >
            {/* Header */}
            <div className="relative px-5 sm:px-6 py-4 bg-ink-900 text-white grain overflow-hidden">
              <div className="absolute -right-10 -top-14 w-48 h-48 rounded-full bg-vermilion-500/25 blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 -bottom-16 w-48 h-48 rounded-full bg-jade-500/20 blur-3xl pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-vermilion-500 to-vermilion-700 flex items-center justify-center shadow-[var(--shadow-glow-vermilion)]">
                    <Bot className="w-5 h-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ink-900" />
                  </div>
                  <div>
                    <Eyebrow className="text-white/50">Omotenashi concierge</Eyebrow>
                    <h3 className="font-display text-base font-bold tracking-tight leading-tight">Japan Explorer AI</h3>
                    <p className="text-[11px] text-white/55 font-medium">
                      Context · Day {currentDay.dayNumber} · {currentDay.locationArea.split('➔')[0].trim()}
                    </p>
                  </div>
                </div>
                <IconButton dark id="close-ai-assistant-modal" onClick={onClose} aria-label="Close">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-vermilion-500" /> Try
              </span>
              {promptSuggestions.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-50 hover:bg-ink-900 hover:text-white text-slate-700 border border-slate-200/80 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 dot-grid">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-ink-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'user' ? 'bg-gradient-to-br from-vermilion-500 to-vermilion-600 text-white rounded-br-md' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                      <div className={`flex items-center justify-between gap-2 mt-2 pt-2 border-t text-[10px] font-medium ${msg.sender === 'user' ? 'border-white/20 text-white/60' : 'border-slate-100 text-slate-400'}`}>
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'assistant' && (
                          <button onClick={() => copyToClipboard(msg.id, msg.text)} className="hover:text-slate-700 inline-flex items-center gap-1 transition-colors cursor-pointer">
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex items-center gap-3 pl-1">
                  <div className="w-8 h-8 rounded-xl bg-ink-900 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-vermilion-500"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                    <span className="ml-2 text-[11px] text-slate-500 font-medium">Checking transit lines, maps & etiquette…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 sm:p-4 bg-white border-t border-slate-100"
            >
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-vermilion-400 focus-within:ring-4 focus-within:ring-vermilion-100 transition">
                <input
                  type="text"
                  placeholder="Ask about trains, food, directions, or any day’s plan…"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-ink-900 hover:bg-vermilion-600 disabled:opacity-30 text-white transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <CornerDownLeft className="w-3 h-3" /> Enter to send · Falls back to offline tips when the AI is unreachable
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function getLocalFallback(query: string, day: ItineraryDay): string {
  const lower = query.toLowerCase();
  if (lower.includes('ramen') || lower.includes('hamamatsucho') || lower.includes('food')) {
    return `🍜 Top Food recommendations near Sotetsu Fresa Inn Hamamatsucho:\n\n1. Menya Musashi Torabito (4 mins walk): Famous for rich, thick tsukemen dipping noodles.\n2. Ippudo Daimon (5 mins walk): World-renowned Hakata tonkotsu pork bone ramen.\n3. Shiba Daimon Street: Excellent casual izakayas with yakitori skewers and draft beer.\n\nPhrase to use: "Osusume wa nan desu ka?" (What is your recommendation?)`;
  }
  if (lower.includes('deer') || lower.includes('nara')) {
    return `🦌 Nara Deer Feeding Guide:\n\n1. Buy official Shika-senbei crackers (¥200 per bundle).\n2. Bow gently with your head—the deer will bow back 2-3 times!\n3. Feed them quickly without teasing or withholding.\n4. When out of crackers: Hold your hands open with palms facing upward. The deer understand this signal and will politely walk away.\n5. Keep your paper maps and train tickets safely zipped up, as deer love to chew paper!`;
  }
  if (lower.includes('borderless') || lower.includes('teamlab') || lower.includes('skirt') || lower.includes('wear')) {
    return `✨ teamLab Borderless Dress Code & Insider Advice:\n\n1. Attire: Wear PANTS, shorts, or dark leggings! Many rooms have full mirror floors.\n2. Shoes: Flat, comfortable walking shoes. High heels are strictly prohibited.\n3. Luggage: Large backpacks must be placed in the free coin lockers at the entrance.\n4. App: Download the teamLab app beforehand to launch virtual butterflies and control the Crystal World colors!\n5. Tea: Don't miss EN TEA HOUSE inside (virtual flowers blossom in your cup).`;
  }
  if (lower.includes('shinkansen') || lower.includes('seat') || lower.includes('fuji') || lower.includes('osaka')) {
    return `🚄 10:00 AM Shinkansen to Osaka Advice:\n\n1. Mt. Fuji View: Sit on SEAT E (window seat on the right-hand side from Tokyo to Shin-Osaka). Fuji will appear between 10:40 and 10:50 AM.\n2. Station Ekiben: Buy your lunch bento at Shinagawa or Tokyo Station before boarding.\n3. Luggage: Overhead racks fit standard carry-ons easily. Generous legroom fits backpacks at your feet.`;
  }
  return `🗾 Explorer Tip for Day ${day.dayNumber} (${day.title}):\n\n- Route: ${day.routeGuide.recommendedTransit}\n- Estimated Time: ${day.routeGuide.estimatedTime}\n- Top Etiquette: ${day.culturalTips[0] || 'Keep train rides quiet and stand on left of escalators in Tokyo, right in Osaka.'}\n\nYou can also tap the Japanese phrases tab to hear native voice pronunciations!`;
}
