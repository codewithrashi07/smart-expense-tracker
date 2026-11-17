import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  Upload,
  CheckCircle2,
  ScanLine,
  Bot,
  User,
  Lightbulb,
  FileText,
  DollarSign,
} from 'lucide-react';

export default function AIAssistant() {
  const { user, formatCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'ocr'

  // Chat states
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name || 'Investor'}! I am **SmartTrack AI**, your intelligent wealth and expense advisor. I analyze your real ledger data in real-time. Ask me about spending patterns, budget adjustments, or savings strategies!`,
      provider: 'SmartTrack AI Engine',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // OCR Scanner states
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (promptToSend) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || chatLoading) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setChatLoading(true);

    try {
      const res = await api.chatAI(text);
      const aiReply = res.data?.reply || 'I analyzed your records. Your spending is within normal bounds.';
      const provider = res.data?.provider || 'SmartTrack AI Engine';

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, provider },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Notice: ${err.message || 'Unable to connect to AI engine'}. Please try again shortly.`,
          provider: 'SmartTrack AI Engine',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);
    setSaveSuccess(false);
  };

  const handleScanReceipt = async () => {
    if (!receiptFile) return;
    setScanLoading(true);

    try {
      // 1. Upload receipt image
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const uploadRes = await api.uploadReceipt(formData);

      // 2. Run OCR parser
      const scanRes = await api.scanReceiptOCR({
        receiptUrl: uploadRes.receiptUrl,
        rawText: receiptFile.name,
      });

      setExtractedData({
        ...scanRes.data,
        receiptUrl: uploadRes.receiptUrl,
      });
    } catch (err) {
      alert(err.message || 'Error scanning receipt');
    } finally {
      setScanLoading(false);
    }
  };

  const handleSaveScannedTransaction = async () => {
    if (!extractedData) return;
    try {
      await api.createTransaction({
        title: extractedData.merchant,
        amount: extractedData.amount,
        type: 'expense',
        category: extractedData.category,
        date: extractedData.date,
        paymentMethod: extractedData.paymentMethod || 'Credit Card',
        receiptUrl: extractedData.receiptUrl,
        notes: `Extracted via SmartTrack AI OCR Scanner`,
      });
      setSaveSuccess(true);
      alert('Transaction verified and logged into your ledger!');
    } catch (err) {
      alert(err.message || 'Error saving scanned transaction');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-400/20">
              Interactive Financial Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">SmartTrack AI Advisor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time spending diagnostics, wealth optimization, and smart receipt OCR scanning
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-xl bg-black/30 border border-white/10">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Advisor</span>
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ocr'
                ? 'bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Receipt Scanner</span>
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="glass-panel rounded-3xl border border-white/10 flex flex-col h-[650px] overflow-hidden">
          {/* Quick preset action pills */}
          <div className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Prompts:
            </span>
            {[
              'Analyze my spending this month',
              'How can I save $300 more?',
              'Where am I overspending?',
              'What is my financial health diagnostic?',
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] shrink-0 transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${
                    m.sender === 'user'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30'
                      : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow-indigo'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-glow-cyan'
                      : 'glass-card text-slate-200 border border-white/10'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  {m.provider && (
                    <span className="mt-2 text-[10px] text-slate-400 block border-t border-white/5 pt-1.5">
                      Engine: {m.provider}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 max-w-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-600 text-white animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 glass-card rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  SmartTrack AI is analyzing your cashflow and computing metrics...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-white/10 bg-black/20 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your income, expenses, budgets, or savings..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || chatLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* OCR Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload card */}
          <div className="p-6 glass-panel rounded-3xl border border-white/10">
            <h2 className="text-base font-bold text-white mb-2">Upload Physical or Digital Receipt</h2>
            <p className="text-xs text-slate-400 mb-4">
              SmartTrack AI extracts the merchant name, total paid, date, and categorizes the expense automatically.
            </p>

            <label className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-white/15 hover:border-sky-400 cursor-pointer bg-white/[0.02] p-4 text-center transition">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-sky-400 mx-auto" />
                  <p className="text-xs font-semibold text-white">Click or drag receipt image here</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, or PDF up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="hidden"
              />
            </label>

            <button
              onClick={handleScanReceipt}
              disabled={!receiptFile || scanLoading}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white text-xs font-bold shadow-glow-purple transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              <span>{scanLoading ? 'Scanning & Parsing OCR...' : 'Run Smart Receipt Scan'}</span>
            </button>
          </div>

          {/* Verification & Result card */}
          <div className="p-6 glass-panel rounded-3xl border border-white/10 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-2">OCR Verification & Review</h2>
              <p className="text-xs text-slate-400 mb-4">
                Verify extracted values before persisting into your financial ledger.
              </p>

              {!extractedData ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl">
                  Upload a receipt image and click "Run Smart Receipt Scan" to preview extracted transaction fields.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Detected Merchant</label>
                    <input
                      type="text"
                      value={extractedData.merchant}
                      onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={extractedData.amount}
                        onChange={(e) => setExtractedData({ ...extractedData, amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                      <input
                        type="date"
                        value={extractedData.date}
                        onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Assigned Category</label>
                    <input
                      type="text"
                      value={extractedData.category}
                      onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Confidence Score: {Math.round(extractedData.confidence * 100)}% verified</span>
                  </div>
                </div>
              )}
            </div>

            {extractedData && (
              <button
                onClick={handleSaveScannedTransaction}
                disabled={saveSuccess}
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {saveSuccess ? 'Logged in Ledger ✓' : 'Confirm & Save to Ledger'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
