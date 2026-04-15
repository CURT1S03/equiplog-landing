import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const KNOWLEDGE_BASE = [
  {
    keywords: ['qr', 'scan', 'qr code', 'identify', 'story 1'],
    title: 'Story 1: QR Code Scanning',
    answer:
      'As a mechanic with dirty hands, you can scan a QR code on any piece of equipment to instantly identify it and pull up its records — no typing or navigating complex menus. Just open the app, tap "Scan QR," point your camera at the tag, and the equipment profile loads immediately. Designed for gloves and shop floor conditions.',
  },
  {
    keywords: ['manual', 'search', 'alphanumeric', 'code', 'floor manager', 'remote', 'story 2'],
    title: 'Story 2: Manual Search',
    answer:
      'As a floor manager, you can search for any equipment using its alphanumeric code (e.g., "LATHE-04") from anywhere — your office, at home, or on the move. The search bar is large-text, mobile-friendly, and accessible right from the home screen. Enter a valid code and instantly retrieve the equipment profile with full status and history.',
  },
  {
    keywords: ['report', 'issue', 'quick', '30 second', 'fast', 'gloves', 'story 3', 'three taps', '3 taps'],
    title: 'Story 3: Quick Issue Reporting (<30 seconds)',
    answer:
      'As a machine operator, you can report an equipment issue in under 30 seconds. The flow requires no more than 3 taps: (1) tap "Report Issue" on the equipment profile, (2) toggle the status to "Down/Needs Repair," (3) tap "Submit." All buttons are large and glove-friendly — designed for fast-paced workflows where stopping to fill out paperwork is not an option.',
  },
  {
    keywords: ['photo', 'camera', 'attach', 'picture', 'image', 'story 4'],
    title: 'Story 4: Photo Attachment',
    answer:
      'As a technician, you can attach a photo when reporting an issue so the next mechanic knows exactly what part is broken before they start working. During the issue reporting flow, tap "Add Photo" to capture an image with your device camera. The photo is automatically saved and displayed alongside the repair note in the equipment\'s history log.',
  },
  {
    keywords: ['history', 'repair', 'maintenance', 'log', 'past', 'timeline', 'story 5'],
    title: 'Story 5: Maintenance & Repair History',
    answer:
      'As a mechanic, you can view a clean, chronological history of all past repairs, maintenance logs, and status changes for any machine. The format is mobile-friendly with large, readable text — not a cluttered spreadsheet. Open/unresolved issues are clearly distinguished from completed work, so you never go in blind or repeat unnecessary repairs.',
  },
  {
    keywords: ['audit', 'compliance', 'chain of custody', 'osha', 'regulatory', 'who', 'when', 'timestamp', 'pdf'],
    title: 'Automated Audit Trail & Chain of Custody',
    answer:
      'Every action in EquipLog is automatically stamped with the user\'s identity and a timestamp — creating an immutable digital chain of custody. When an auditor requests records, the system generates a time-stamped view showing the full history of "Who did What and When." This reduces the time to retrieve history from hours to seconds, ensuring OSHA audit readiness at all times.',
  },
  {
    keywords: ['metric', 'success', 'kpi', 'adoption', 'efficiency', 'conversion'],
    title: 'Success Metrics',
    answer:
      'Our three key success metrics are:\n\n• **Task Efficiency:** 100% of tested users can "Report a broken safety guard" in under 30 seconds with zero training.\n\n• **User Adoption:** A conversion rate of >5% from landing page visits to "Start Trial" for the $49/month utility model.\n\n• **Audit Readiness:** 100% of maintenance logs contain an automated, time-stamped digital chain of custody, reducing retrieval time from hours to seconds.',
  },
  {
    keywords: ['mvp', 'scope', 'included', 'excluded', 'feature', 'phase'],
    title: 'MVP Scope',
    answer:
      '**Included in MVP:** QR code scanning, manual code search, mobile-optimized repair history logs, automated user logging (digital chain of custody), and photo-attachment for issue reports.\n\n**Excluded (deferred to later phases):** Direct requests to managers, integrations with other shop systems, and complex data analytics.',
  },
  {
    keywords: ['price', 'cost', '$49', 'pricing', 'utility', 'affordable'],
    title: 'Pricing Model',
    answer:
      'EquipLog follows a utility model at $49/month — designed to be affordable for small shops and independent mechanics. No enterprise pricing, no per-seat fees. It\'s built as a practical tool that pays for itself by reducing downtime and ensuring compliance.',
  },
  {
    keywords: ['user', 'target', 'who', 'persona', 'operator', 'mechanic', 'manager', 'owner'],
    title: 'Target Users',
    answer:
      'EquipLog is built for three key personas:\n\n• **Operators & Field Workers:** Need to report issues fast (<30 seconds) without stopping work.\n\n• **Floor Managers:** Need real-time visibility into equipment status across the shop floor.\n\n• **Shop Owners:** Need accurate, immutable digital records for OSHA audits, liability reduction, and preventing costly downtime.\n\nAll users work in physical environments with grease and gloves, so the UI uses large buttons, simple layouts, and requires minimal typing.',
  },
  {
    keywords: ['flow', 'workflow', 'how', 'process', 'step'],
    title: 'Core Workflows',
    answer:
      '**Flow 1 — Quick Issue Reporting:** Open App → Scan QR → Equipment Profile loads → Tap "Report Issue" → Optionally add a photo → Toggle status to "Down" → Submit. Entire flow completes in under 30 seconds.\n\n**Flow 2 — Remote Equipment Search:** Open App → Tap Manual Search → Type equipment code (e.g., "LATHE-04") → View Equipment Profile → Scroll to Maintenance History → Review chronological repair logs.\n\n**Flow 3 — Authentication & Audit:** Login via PIN → Perform any update → System automatically appends user signature with timestamp → Auditors can retrieve full time-stamped history instantly.',
  },
];

function findBestAnswer(query) {
  const lower = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best && bestScore > 0) {
    return best.answer;
  }

  return "I can answer questions about EquipLog's features, user stories, workflows, success metrics, MVP scope, and pricing. Try asking about QR scanning, issue reporting, maintenance history, audit compliance, or our target users!";
}

export default function ProductChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm the EquipLog product assistant. Ask me anything about our features, user stories, workflows, or success metrics.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const answer = findBestAnswer(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const suggestions = [
    'How does QR scanning work?',
    'Tell me about quick issue reporting',
    'What are the success metrics?',
    'Who are the target users?',
    'What\'s in the MVP scope?',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col" style={{ height: '520px' }}>
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-3">
        <div className="bg-amber-500 rounded-full p-1.5">
          <Sparkles className="w-4 h-4 text-slate-900" />
        </div>
        <div>
          <h3 className="font-bold text-sm">EquipLog Product Assistant</h3>
          <p className="text-slate-400 text-xs">Ask about features, user stories & metrics</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-amber-700" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-md'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm'
              }`}
            >
              {msg.text.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-amber-700" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion chips (only show when no user messages yet) */}
        {messages.length === 1 && !isTyping && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  setTimeout(() => {
                    setMessages((prev) => [...prev, { role: 'user', text: s }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      const answer = findBestAnswer(s);
                      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
                      setIsTyping(false);
                    }, 600 + Math.random() * 800);
                    setInput('');
                  }, 50);
                }}
                className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about features, user stories..."
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 rounded-xl p-2.5 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
