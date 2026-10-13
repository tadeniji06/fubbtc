'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Send,
  User,
  CheckCheck,
  Smile,
  Sparkles,
  Circle,
  MessageSquare,
  Hand,
  Zap,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { ChatContact } from '@/types';

export const SocialChat: React.FC = () => {
  const {
    contacts,
    activeContact,
    setActiveContact,
    messages,
    sendChatMessage,
    searchUsers,
    user,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredContacts = searchUsers(searchQuery);
  const currentMessages = activeContact ? messages[activeContact.id] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;
    sendChatMessage(activeContact.id, inputText);
    setInputText('');
  };

  const handleQuickTip = (tipText: string) => {
    if (!activeContact) return;
    sendChatMessage(activeContact.id, tipText);
  };

  return (
    <Card
      variant="default"
      className="border-zinc-800 bg-[#101012] h-[640px] flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-xl"
    >
      {/* Sidebar: User Search & Contacts List */}
      <div
        className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800/80 flex flex-col bg-[#0c0c0e] ${
          activeContact ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#F7931A]" />
              <span>Social DMs</span>
            </h3>
            <Badge variant="orange" size="sm">
              Instant
            </Badge>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user by @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161618] text-xs text-white placeholder-zinc-500 rounded-xl pl-9 pr-3.5 py-2 border border-zinc-800 focus:border-[#F7931A] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60 p-2 space-y-1">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              No user found matching "@{searchQuery}"
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = activeContact?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181b] border border-zinc-700/60'
                      : 'hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                      {contact.avatarUrl ? (
                        <Image
                          src={contact.avatarUrl}
                          alt={contact.username}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-300">
                          {contact.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {contact.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {contact.name}
                      </span>
                      {contact.lastMessageTime && (
                        <span className="text-[10px] text-zinc-500">
                          {contact.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                      <span>@{contact.username}</span>
                    </div>
                    {contact.lastMessage && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {contact.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#111113] ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
        {activeContact ? (
          <>
            {/* Active contact header with Back button on mobile */}
            <div className="p-3.5 px-4 sm:px-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#131316]">
              <div className="flex items-center gap-2.5">
                {/* Mobile Back to Contacts */}
                <button
                  type="button"
                  onClick={() => setActiveContact(null)}
                  className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mr-1 cursor-pointer"
                  title="Back to contacts list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    <Image
                      src={activeContact.avatarUrl || '/mascot.png'}
                      alt={activeContact.username}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>
                  {activeContact.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-black" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{activeContact.name}</span>
                    <span className="text-[11px] text-zinc-500 font-normal">
                      (@{activeContact.username})
                    </span>
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Circle className={`w-1.5 h-1.5 ${activeContact.status === 'online' ? 'fill-emerald-400 text-emerald-400' : 'fill-zinc-600 text-zinc-600'}`} />
                    <span>{activeContact.status === 'online' ? 'Online on Funbtc' : 'Away'}</span>
                  </div>
                </div>
              </div>

              {/* Quick tip action */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickTip("LFG! Check out my referral link!")}
                  className="text-[11px] bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Hand className="w-3 h-3 text-[#F7931A]" />
                  <span>Say Hi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTip("Are you keeping up your 7-day streak?")}
                  className="text-[11px] bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-3 h-3 text-[#F7931A]" />
                  <span>Ask Streak</span>
                </button>
              </div>
            </div>

            {/* Messages stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0e0e10]/60">
              <div className="text-center py-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800">
                  End-to-End Web3 Messaging
                </span>
              </div>

              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${
                    msg.isSelf ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!msg.isSelf && (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                      <Image
                        src={activeContact.avatarUrl || '/mascot.png'}
                        alt={msg.senderUsername}
                        width={28}
                        height={28}
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs ${
                      msg.isSelf
                        ? 'bg-[#F7931A] text-black font-medium rounded-br-none shadow-sm'
                        : 'bg-[#1a1a1d] text-zinc-100 border border-zinc-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                        msg.isSelf ? 'text-black/70' : 'text-zinc-500'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.isSelf && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={handleSend}
              className="p-3.5 bg-[#131316] border-t border-zinc-800/80 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Message @${activeContact.username}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#18181b] text-xs text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 border border-zinc-800 focus:border-[#F7931A] focus:outline-none transition-colors"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="h-9 px-3.5"
                disabled={!inputText.trim()}
              >
                <Send className="w-4 h-4 text-black" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Select a contact</h4>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Search by username or select any community member to start chatting.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
