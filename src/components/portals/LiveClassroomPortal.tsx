import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Video,
  Mic,
  MicOff,
  Hand,
  MessageSquare,
  Users,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Send,
  Zap,
  CheckCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';

export const LiveClassroomPortal: React.FC = () => {
  const { liveClasses, updateLiveClassSlide, currentUser } = useApp();
  const activeClass = liveClasses[0];

  const [bandwidthMode, setBandwidthMode] = useState<'audio_slides' | 'video'>('audio_slides');
  const [micActive, setMicActive] = useState(true);
  const [activeSlide, setActiveSlide] = useState(activeClass?.activeSlideIndex || 0);
  const [raisedHandsCount, setRaisedHandsCount] = useState(3);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    {
      id: 'c1',
      sender: 'Master Emmanuel Gbotoe',
      text: 'Good afternoon class! Welcome to the WASSCE Trig & Vectors review session. Please turn on low-data audio if on 3G.',
      time: '4:01 PM',
    },
    {
      id: 'c2',
      sender: 'Alvin Sherman',
      text: 'Present sir! The slide on SOH-CAH-TOA is showing clearly.',
      time: '4:02 PM',
    },
    {
      id: 'c3',
      sender: 'Precious Fahnbulleh',
      text: 'Sir, for question 1, will WAEC deduct marks if we do not rationalize the denominator?',
      time: '4:03 PM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `chat_${Date.now()}`,
        sender: currentUser.name,
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleSlideChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < activeClass.slides.length) {
      setActiveSlide(newIndex);
      updateLiveClassSlide(activeClass.id, newIndex);
    }
  };

  const toggleRaiseHand = () => {
    setHasRaisedHand(!hasRaisedHand);
    setRaisedHandsCount((cnt) => (hasRaisedHand ? cnt - 1 : cnt + 1));
  };

  return (
    <div className="space-y-6">
      {/* Live Room Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                LIVE BROADCAST
              </span>
              <h2 className="text-lg font-bold text-white">{activeClass.title}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Host: <strong className="text-slate-200">{activeClass.teacherName}</strong> • {activeClass.gradeLevel}
            </p>
          </div>
        </div>

        {/* Low-Bandwidth Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setBandwidthMode('audio_slides')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              bandwidthMode === 'audio_slides'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Ultra Low Data (12 kbps)
          </button>
          <button
            onClick={() => setBandwidthMode('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              bandwidthMode === 'video'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> High Video (380 kbps)
          </button>
        </div>
      </div>

      {/* Main Classroom Screen & Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage / Slides / Video Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[420px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Top Bar of Stage */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300 font-mono">
                  Audio Stream: <strong>Active & Clear</strong>
                </span>
              </div>
              <div className="text-slate-400">
                Slide {activeSlide + 1} of {activeClass.slides.length}
              </div>
            </div>

            {/* Slide / Stage Presentation */}
            {bandwidthMode === 'audio_slides' ? (
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <span className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700 font-bold uppercase">
                    Synchronized Lecture Notes
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {activeClass.slides[activeSlide]?.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {activeClass.slides[activeSlide]?.content}
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Teacher Board Notes & Working Steps:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {activeClass.slides[activeSlide]?.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Video className="w-16 h-16 text-blue-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-white">
                  Teacher Master Emmanuel Live Video
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Broadcasting live from Science Lab 2 at Monrovia Demonstration Academy.
                </p>
              </div>
            )}

            {/* Controls Bar at bottom of screen */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  disabled={activeSlide === 0}
                  onClick={() => handleSlideChange(activeSlide - 1)}
                  className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={activeSlide >= activeClass.slides.length - 1}
                  onClick={() => handleSlideChange(activeSlide + 1)}
                  className="px-3 py-1.5 bg-emerald-600 disabled:opacity-40 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Student interaction buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    micActive ? 'bg-slate-800 text-white' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {micActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                  <span>{micActive ? 'Mute' : 'Unmuted'}</span>
                </button>

                <button
                  onClick={toggleRaiseHand}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    hasRaisedHand
                      ? 'bg-amber-500 text-slate-950 shadow-lg animate-bounce'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  <span>{hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat & Attendee Roster */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Live Class Chat
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" /> 19 Students Present
              </span>
            </div>

            {/* Chat message bubbles */}
            <div className="space-y-3 py-3 overflow-y-auto max-h-[330px] pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-emerald-400">{msg.sender}</span>
                    <span className="text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask teacher a question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
