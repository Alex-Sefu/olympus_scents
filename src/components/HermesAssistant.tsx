import { useState, useRef, useEffect } from 'react';
import { useHermes } from '../context/HermesContext';
import hermesMascota from '../assets/sticker_hermes.jpeg';
import './HermesAssistant.css';

interface Message {
  id: string;
  role: 'hermes' | 'user';
  text: string;
}

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'hermes',
  text: 'Salut, muritorule! Eu sunt Hermes, mesagerul zeilor și ghidul tău în lumea parfumurilor. Spune-mi ce cauți și îți voi arăta calea! ✨',
};

const QUICK_REPLIES = [
  { label: '🌿 Parfum fresh',    value: 'Caut un parfum fresh' },
  { label: '🌹 Note florale',    value: 'Caut ceva floral' },
  { label: '🪵 Lemnos/Oriental', value: 'Caut ceva lemnos sau oriental' },
  { label: '🎁 Idee de cadou',   value: 'Vreau un parfum cadou' },
  { label: '❄️ Parfum de iarnă', value: 'Caut un parfum potrivit pentru iarnă' },
  { label: '☀️ Parfum de vară',  value: 'Caut ceva fresh pentru vară' },
];

export default function HermesAssistant() {
  const { open, setOpen } = useHermes();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const messagesEndRef           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = generateReply(text);
      setMessages(prev => [...prev, { id: Date.now().toString() + 'h', role: 'hermes', text: reply }]);
    }, 1200);
  }

  function generateReply(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('fresh') || t.includes('vară') || t.includes('vara'))
      return 'Pentru vibe fresh de vară, îți recomand să explorezi Colecția Poseidon 🔱 — parfumuri acvatice și tropicale. Încearcă Erba Pura de Xerjoff sau Le Beau Paradise Garden!';
    if (t.includes('floral') || t.includes('primăvară') || t.includes('primavara'))
      return 'Notele florale sunt domeniul zeiței Artemis 🌙! Explorează Colecția Primăvară — YSL Myself este o alegere excelentă pentru eleganță modernă.';
    if (t.includes('lemnos') || t.includes('oriental') || t.includes('iarnă') || t.includes('iarna'))
      return 'Ah, cauți puterea lui Zeus ⚡! Colecția de Iarnă îți oferă parfumuri opulente și regale. Le Male Elixir sau Boss Bottled Absolu sunt alegeri de necontestat!';
    if (t.includes('cadou') || t.includes('gift'))
      return 'Pentru un cadou perfect, te-aș ghida spre Colecția Toamnă a lui Dionysos 🍇 — Phantom sau Stronger With You Intensely sunt clasice apreciate de oricine!';
    if (t.includes('toamnă') || t.includes('toamna') || t.includes('gurm'))
      return 'Dionysos 🍇 te cheamă! Parfumurile gurmande cu note de cafea, miere și scorțișoară sunt perfecte pentru anotimpul boem al toamnei.';
    return 'Interesant! Explorează colecțiile noastre tematice pentru a găsi esența potrivită. Fiecare zeu guvernează o familie de parfumuri — care te atrage mai mult? ⚡🔱🌙🍇';
  }

  return (
    <>
      {open && (
        <div className="hermes-chat">
          <div className="hermes-chat-header">
            <div className="hermes-chat-avatar">
              <HermesSVG size={40} />
            </div>
            <div className="hermes-chat-info">
              <span className="hermes-chat-name">Hermes</span>
              <span className="hermes-chat-status">
                <span className="hermes-dot" />
                Mesagerul Olimpului
              </span>
            </div>
            <button className="hermes-chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="hermes-chat-msgs">
            {messages.map(msg => (
              <div key={msg.id} className={`hermes-msg hermes-msg--${msg.role}`}>
                {msg.role === 'hermes' && (
                  <div className="hermes-msg-avatar">
                    <HermesSVG size={26} />
                  </div>
                )}
                <div className="hermes-msg-bubble">{msg.text}</div>
              </div>
            ))}
            {typing && (
              <div className="hermes-msg hermes-msg--hermes">
                <div className="hermes-msg-avatar">
                  <HermesSVG size={26} />
                </div>
                <div className="hermes-msg-bubble hermes-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="hermes-quick">
            {QUICK_REPLIES.map(qr => (
              <button key={qr.value} className="hermes-quick-btn" onClick={() => sendMessage(qr.value)}>
                {qr.label}
              </button>
            ))}
          </div>

          <div className="hermes-chat-input-row">
            <input
              className="hermes-chat-input"
              placeholder="Întreabă-l pe Hermes..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
            <button
              className="hermes-chat-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              ☿
            </button>
          </div>
        </div>
      )}

      <button
        className={`hermes-fab ${open ? 'hermes-fab--open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Deschide asistentul Hermes"
      >
        <HermesSVG size={36} />
        {!open && <span className="hermes-fab-badge">AI</span>}
      </button>
    </>
  );
}

/* ── SVG Avatar Hermes — versiune mare pentru hero ── */
export function HermesHeroSVG({ size = 320 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── PICIOARE ── */}
      <rect x="78" y="178" width="18" height="38" rx="9" fill="#E8C49A"/>
      <rect x="104" y="178" width="18" height="38" rx="9" fill="#E8C49A"/>
      {/* Sandale cu aripioare */}
      <ellipse cx="87" cy="216" rx="14" ry="5" fill="#D97706" opacity=".7"/>
      <ellipse cx="113" cy="216" rx="14" ry="5" fill="#D97706" opacity=".7"/>
      <path d="M74 212 Q68 206 72 202 Q76 208 74 212Z" fill="#FDE68A" opacity=".9"/>
      <path d="M100 212 Q94 206 98 202 Q102 208 100 212Z" fill="#FDE68A" opacity=".9"/>
      <path d="M126 212 Q132 206 128 202 Q124 208 126 212Z" fill="#FDE68A" opacity=".9"/>

      {/* ── TUNICĂ ── */}
      {/* Corp tunică albă */}
      <path d="M65 120 Q60 155 58 178 L142 178 Q140 155 135 120 Z" fill="white" opacity=".95"/>
      <path d="M65 120 Q60 155 58 178 L142 178 Q140 155 135 120 Z" stroke="#DBEAFE" strokeWidth="1"/>
      {/* Centură aurie */}
      <rect x="66" y="118" width="68" height="10" rx="5" fill="#D97706"/>
      <rect x="66" y="118" width="68" height="10" rx="5" fill="url(#goldGrad)" opacity=".8"/>
      {/* Pliuri tunică */}
      <line x1="80" y1="130" x2="76" y2="178" stroke="#DBEAFE" strokeWidth="1" opacity=".6"/>
      <line x1="100" y1="128" x2="100" y2="178" stroke="#DBEAFE" strokeWidth="1" opacity=".6"/>
      <line x1="120" y1="130" x2="124" y2="178" stroke="#DBEAFE" strokeWidth="1" opacity=".6"/>

      {/* ── CORP / UMERI ── */}
      {/* Tunică scurtă albastră pe umeri */}
      <path d="M68 90 Q60 100 58 120 L142 120 Q140 100 132 90 Q116 82 100 82 Q84 82 68 90Z"
        fill="#4B7BE5" opacity=".9"/>
      {/* Highlight tunică */}
      <path d="M72 92 Q66 102 64 116 L80 116 Q78 102 80 92Z" fill="white" opacity=".15"/>

      {/* ── BRAȚE ── */}
      {/* Braț stâng */}
      <path d="M68 90 Q50 100 44 118" stroke="#E8C49A" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Braț drept — ține caduceul */}
      <path d="M132 90 Q150 100 156 115" stroke="#E8C49A" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Mâna stângă */}
      <ellipse cx="44" cy="120" rx="8" ry="7" fill="#E8C49A"/>
      {/* Mâna dreaptă */}
      <ellipse cx="156" cy="117" rx="8" ry="7" fill="#E8C49A"/>

      {/* ── CADUCEU ── */}
      <line x1="162" y1="60" x2="158" y2="120" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
      {/* Glob auriu în vârf */}
      <circle cx="162" cy="57" r="5" fill="#F59E0B"/>
      {/* Șerpi */}
      <path d="M160 110 Q168 100 160 90 Q152 80 160 70 Q168 62 162 57"
        stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M162 110 Q154 100 162 90 Q170 80 162 70 Q154 62 160 57"
        stroke="#60A5FA" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Aripioare caduceu */}
      <path d="M158 68 Q150 60 148 65 Q153 70 158 68Z" fill="#FDE68A"/>
      <path d="M164 68 Q172 60 174 65 Q169 70 164 68Z" fill="#FDE68A"/>

      {/* ── GÂT ── */}
      <rect x="93" y="74" width="14" height="12" rx="6" fill="#E8C49A"/>

      {/* ── CAP ── */}
      <ellipse cx="100" cy="58" rx="26" ry="28" fill="#E8C49A"/>

      {/* ── PĂR ── */}
      <path d="M76 50 Q78 34 100 30 Q122 34 124 50" fill="#8B5E3C"/>
      <path d="M76 50 Q74 44 78 40" fill="#8B5E3C"/>
      <path d="M124 50 Q126 44 122 40" fill="#8B5E3C"/>

      {/* ── CASCĂ CU ARIPIOARE ── */}
      <ellipse cx="100" cy="36" rx="22" ry="7" fill="#D97706" opacity=".75"/>
      {/* Aripioare mari */}
      <path d="M80 34 Q68 20 62 26 Q68 34 80 34Z" fill="#F59E0B"/>
      <path d="M120 34 Q132 20 138 26 Q132 34 120 34Z" fill="#F59E0B"/>
      {/* Highlight aripioare */}
      <path d="M80 34 Q70 22 65 27 Q70 33 80 34Z" fill="#FDE68A" opacity=".7"/>
      <path d="M120 34 Q130 22 135 27 Q130 33 120 34Z" fill="#FDE68A" opacity=".7"/>

      {/* ── FAȚĂ ── */}
      {/* Ochi */}
      <ellipse cx="91" cy="60" rx="5" ry="5.5" fill="white"/>
      <ellipse cx="109" cy="60" rx="5" ry="5.5" fill="white"/>
      <circle cx="92" cy="61" r="3.5" fill="#1D4ED8"/>
      <circle cx="110" cy="61" r="3.5" fill="#1D4ED8"/>
      <circle cx="92.8" cy="60" r="1.5" fill="black"/>
      <circle cx="110.8" cy="60" r="1.5" fill="black"/>
      <circle cx="93.5" cy="59" r=".8" fill="white" opacity=".9"/>
      <circle cx="111.5" cy="59" r=".8" fill="white" opacity=".9"/>
      {/* Sprâncene */}
      <path d="M87 54 Q91 52 95 54" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M105 54 Q109 52 113 54" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Nas */}
      <path d="M99 63 Q100 67 101 63" stroke="#C49A6C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Zâmbet */}
      <path d="M93 72 Q100 78 107 72" stroke="#8B5E3C" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Obraji */}
      <ellipse cx="87" cy="68" rx="4" ry="3" fill="#F4A0A0" opacity=".3"/>
      <ellipse cx="113" cy="68" rx="4" ry="3" fill="#F4A0A0" opacity=".3"/>

      {/* ── GRADIENT DEF ── */}
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="50%" stopColor="#FDE68A"/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── SVG mic pentru FAB și chat ── */
export function HermesSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#1E3A6E"/>
      <path d="M28 52 Q26 62 26 70 L54 70 Q54 62 52 52 Z" fill="white" opacity=".9"/>
      <rect x="29" y="52" width="22" height="5" rx="2" fill="#D97706" opacity=".85"/>
      <line x1="34" y1="70" x2="32" y2="78" stroke="#E8C49A" strokeWidth="5" strokeLinecap="round"/>
      <line x1="46" y1="70" x2="48" y2="78" stroke="#E8C49A" strokeWidth="5" strokeLinecap="round"/>
      <path d="M28 52 Q18 48 16 56" stroke="#E8C49A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M52 52 Q62 48 64 54" stroke="#E8C49A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <line x1="64" y1="54" x2="66" y2="38" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <path d="M65 48 Q70 44 65 40 Q60 37 65 34" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="40" cy="42" rx="5" ry="4" fill="#E8C49A"/>
      <ellipse cx="40" cy="30" rx="12" ry="13" fill="#E8C49A"/>
      <path d="M29 26 Q31 18 40 17 Q49 18 51 26" fill="#8B5E3C"/>
      <ellipse cx="40" cy="20" rx="11" ry="4" fill="#D97706" opacity=".7"/>
      <path d="M31 19 Q27 13 24 16 Q27 20 31 19Z" fill="#F59E0B"/>
      <path d="M49 19 Q53 13 56 16 Q53 20 49 19Z" fill="#F59E0B"/>
      <path d="M30 18 Q25 12 22 15 Q26 19 30 18Z" fill="#FDE68A" opacity=".8"/>
      <path d="M50 18 Q55 12 58 15 Q54 19 50 18Z" fill="#FDE68A" opacity=".8"/>
      <ellipse cx="36" cy="31" rx="2.5" ry="2" fill="#1D4ED8"/>
      <ellipse cx="44" cy="31" rx="2.5" ry="2" fill="#1D4ED8"/>
      <circle cx="36.8" cy="30.5" r=".8" fill="black"/>
      <circle cx="44.8" cy="30.5" r=".8" fill="black"/>
      <circle cx="37.5" cy="30" r=".5" fill="white" opacity=".8"/>
      <circle cx="45.5" cy="30" r=".5" fill="white" opacity=".8"/>
      <path d="M37 37 Q40 40 43 37" stroke="#8B5E3C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
