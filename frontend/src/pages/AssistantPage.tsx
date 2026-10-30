import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { AIConversation, AIMessage } from '../types';
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Bot,
  User,
  Clock,
  Layers,
  DollarSign,
  Target,
  ArrowRight,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'What should I explore today based on my goals?',
  'Recommend something high-value within my budget',
  'Suggest beginner-friendly resources for my interests',
  'Why did you recommend web development bootcamp to me?',
  'Find budget alternatives for home workouts',
  'How do I update my active goals or categories?',
];

export const AssistantPage: React.FC = () => {
  const { profile, preferences } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<AIMessage[]>([]);

  // Query conversations
  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => api.listConversations(),
  });

  const conversations = convData?.conversations || [];

  // When conversations load and none selected, select the first
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Query messages for active conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['ai-messages', activeConversationId],
    queryFn: () => (activeConversationId ? api.getConversationMessages(activeConversationId) : Promise.resolve({ messages: [] })),
    enabled: Boolean(activeConversationId),
  });

  useEffect(() => {
    if (messagesData?.messages) {
      setLocalMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (msg: string) => api.sendChatMessage(msg, activeConversationId),
    onSuccess: (data) => {
      setActiveConversationId(data.conversation_id);
      setLocalMessages((prev) => [...prev, data.assistant_message]);
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sendMutation.isPending) return;

    // Optimistically add user message
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || 'pending',
      user_id: profile?.id || 'user',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    sendMutation.mutate(text);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    setLocalMessages([]);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Conversations Sidebar (Left) */}
      <div className="w-full md:w-72 bg-slate-50/80 dark:bg-slate-950/60 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={handleNewConversation}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Exploration
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            History
          </span>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeConversationId === conv.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{conv.title || 'Exploration Chat'}</span>
            </button>
          ))}

          {conversations.length === 0 && (
            <p className="text-xs text-slate-400 italic px-2 py-4">
              No conversations yet. Ask your first question!
            </p>
          )}
        </div>

        {/* User Context Capsule */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
            <Target className="w-3 h-3 text-indigo-500" />
            Active Goal:
          </div>
          <p className="truncate font-medium text-slate-800 dark:text-slate-200">
            {preferences?.goals[0] || 'Learning & Growth'}
          </p>
        </div>
      </div>

      {/* Main Chat Area (Right) */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 min-w-0">
        {/* Chat Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                PersonaAI Concierge
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Context-Aware Assistant Active
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-500 space-x-3">
            <span>Budget: {preferences?.budget_max ? `≤ ₹${preferences.budget_max}` : 'Any'}</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {localMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  How can I help you explore today?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  I have full context of your interests in {preferences?.interests.join(', ') || 'personal growth'} and your budget constraints.
                </p>
              </div>

              {/* Prompt Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg pt-2 text-left">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate mr-2">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {localMessages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                        isAssistant
                          ? 'bg-gradient-to-tr from-indigo-600 to-violet-500'
                          : 'bg-slate-800 dark:bg-slate-700'
                      }`}
                    >
                      {isAssistant ? <Sparkles className="w-4 h-4" /> : 'You'}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isAssistant
                          ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {sendMutation.isPending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/70 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    Thinking with personalized context...
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for recommendations, alternatives, budget options..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sendMutation.isPending}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
