import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, Copy } from 'lucide-react';
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
      text: 'Olá! Sou seu assistente jurídico. Posso ajudar a redigir e-mails, resumir teses, sugerir estratégias ou tirar dúvidas processuais. Como posso ajudar hoje?',
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
    if (!input.trim()) return;

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
      // Format history for Gemini SDK
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
      console.error(err);
      setError('Ocorreu um erro ao comunicar com a IA. Verifique sua chave de API.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
        id: 'welcome',
        role: 'model',
        text: 'Histórico limpo. Como posso ajudar agora?',
        timestamp: new Date()
    }]);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center text-white">
          <div className="p-2 bg-white/20 rounded-lg mr-3">
             <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Assistente Jurídico IA</h2>
            <p className="text-xs text-blue-100 opacity-80">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <button 
            onClick={clearChat}
            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
            title="Limpar Conversa"
        >
            <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm relative group
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}
            `}>
              {msg.role === 'model' && (
                 <button 
                    onClick={() => copyToClipboard(msg.text)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copiar texto"
                 >
                     <Copy className="w-3 h-3" />
                 </button>
              )}
              
              <div className="flex gap-3">
                 <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-700' : 'bg-indigo-100'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                 </div>
                 <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                 </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                 </div>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 </div>
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
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
         <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida ou solicitação..."
              className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
         </form>
         <p className="text-center text-xs text-gray-400 mt-2">
            A IA pode cometer erros. Verifique informações importantes.
         </p>
      </div>
    </div>
  );
};

export default AiAssistant;