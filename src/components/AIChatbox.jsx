import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { askConcierge } from '../lib/gemini';

export default function AIChatbox({ context }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your ArenaFlow AI Concierge. Ask me about wait times, restrooms, or directions!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const reply = await askConcierge(userMsg.text, context);
    
    setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'bot' }]);
    setIsTyping(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-[400px] overflow-hidden shadow-2xl">
      <div className="bg-slate-900 border-b border-slate-700 p-4 flex items-center gap-3">
        <div className="bg-accent p-2 rounded-lg text-white">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white">Fan AI Concierge</h3>
          <p className="text-xs text-slate-400">Powered by Gemini AI</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 flex items-start gap-3 ${
              msg.sender === 'user' 
                ? 'bg-accent text-white rounded-tr-none' 
                : 'bg-slate-700 text-slate-200 rounded-tl-none'
            }`}>
              {msg.sender === 'bot' && <Bot size={16} className="mt-1 flex-shrink-0" />}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              {msg.sender === 'user' && <User size={16} className="mt-1 flex-shrink-0" />}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="bg-accent hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
