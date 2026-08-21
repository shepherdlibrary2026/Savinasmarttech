import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  MessageSquareText,
  Send,
  Radio,
  CheckCheck,
  Clock,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export const SMSGatewayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { smsLogs, sendSMSBroadcast, currentSchool } = useApp();
  const [recipientPhone, setRecipientPhone] = useState('+231 77 654 3210');
  const [recipientName, setRecipientName] = useState('Hon. Thomas B. Sherman');
  const [category, setCategory] = useState<'attendance_absence' | 'fee_reminder' | 'emergency_broadcast' | 'grade_report'>('emergency_broadcast');
  const [messageText, setMessageText] = useState(
    `${currentSchool.name.toUpperCase()} NOTICE: PTA General Meeting is scheduled for Saturday 10:00 AM in the School Auditorium. Your presence is highly valued.`
  );
  const [sentNotice, setSentNotice] = useState(false);

  const handleSendTestSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !recipientPhone.trim()) return;

    sendSMSBroadcast(recipientPhone, recipientName, category, messageText);
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Liberia Telecom SMS Gateway
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-medium">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Lonestar MTN & Orange Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guaranteed SMS delivery to parents with basic feature phones (non-smartphones) across all 15 Liberian counties.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Send SMS Panel */}
          <div className="lg:col-span-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Dispatch Instant Parent SMS
            </h3>

            <form onSubmit={handleSendTestSMS} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Recipient Phone (Liberia +231)
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="+231 77..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="emergency_broadcast">Emergency / School Notice</option>
                  <option value="attendance_absence">Attendance Absence Alert</option>
                  <option value="fee_reminder">Tuition / Fee Payment Reminder</option>
                  <option value="grade_report">Midterm / WASSCE Grade Alert</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-medium text-slate-400">
                    SMS Message Body
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {messageText.length}/160 chars (1 SMS)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              {sentNotice && (
                <div className="p-2 bg-emerald-950 border border-emerald-500/50 rounded text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-emerald-400" /> SMS Dispatched to Gateway!
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch SMS via GSM Gateway
              </button>
            </form>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auto-Routing Protocol:
              </div>
              <p>• 077... & 076... routes via Orange Liberia Shortcode 4410</p>
              <p>• 088... & 055... routes via Lonestar Cell MTN Shortcode 9820</p>
            </div>
          </div>

          {/* SMS Outbox Feed */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Live Outbound Logs ({smsLogs.length} messages)
              </h3>
              <span className="text-[11px] text-slate-400">Real-time carrier delivery</span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {smsLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2 hover:border-slate-600 transition"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{log.recipientName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {log.recipientPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.network === 'Lonestar MTN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {log.network}
                      </span>
                      {log.status === 'delivered' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                          <CheckCheck className="w-3.5 h-3.5" /> Delivered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" /> Queued (Offline)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 font-mono bg-slate-900/90 p-2 rounded border border-slate-800">
                    "{log.messageText}"
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="capitalize">{log.category.replace('_', ' ')}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Carrier Link: Lonestar MTN 99.8% uptime | Orange Liberia 99.4% uptime</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close Gateway
          </button>
        </div>
      </div>
    </div>
  );
};
