
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, Copy, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const AiAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Bem-vindo ao canal de inteligência jurídica da LegalFlow. Como posso auxiliar em sua prática hoje?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setError('Falha na comunicação com o cérebro IA. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
        id: 'welcome',
        role: 'model',
        text: 'Histórico redefinido. Aguardo suas instruções.',
        timestamp: new Date()
    }]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in">
      {/* Header - Black & Gold Theme */}
      <div className="bg-[#131313] px-6 py-5 flex justify-between items-center shrink-0 border-b border-[#D4AF37]/30">
        <div className="flex items-center">
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg mr-3 border border-[#D4AF37]/20">
             <Bot className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] tracking-tight">Sistema Jurídico</h2>
            <p className="text-[10px] text-[#D4AF37]/60 uppercase font-semibold tracking-widest">Sistemas de Alta Performance</p>
          </div>
        </div>
        <button 
            onClick={clearChat}
            className="p-2 text-[#D4AF37]/60 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-all" 
            title="Limpar Conversa"
        >
            <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f9f9f9]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm relative group
              ${msg.role === 'user' 
                ? 'bg-[#131313] text-white rounded-tr-none border border-[#333]' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}
            `}>
              <div className="flex gap-4">
                 <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                   msg.role === 'user' ? 'bg-[#D4AF37] border-white/20' : 'bg-gray-100 border-gray-200'
                 }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-[#131313]" /> : <Bot className="w-4 h-4 text-[#D4AF37]" />}
                 </div>
                 <div className="text-sm leading-relaxed whitespace-pre-wrap py-1">
                    {msg.text}
                 </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                 <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                 <span className="text-xs text-gray-500 font-medium italic">Analisando jurisprudência e redigindo resposta...</span>
              </div>
           </div>
        )}
        {error && (
            <div className="flex justify-center my-4">
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center border border-red-100">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-gray-200 shrink-0">
         <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva a tarefa jurídica ou dúvida..."
              className="flex-1 pl-5 pr-5 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:bg-white transition-all shadow-inner text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 bg-[#131313] text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
         </form>
         <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
            Inteligência Jurídica Exclusiva • LegalFlow
         </p>
      </div>
    </div>
  );
};

export default AiAssistant;
