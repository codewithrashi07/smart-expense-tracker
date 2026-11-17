import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const { user, formatCurrency } = useAuth();
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generating, setGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setGenerating(true);
      const res = await api.getTransactions({ limit: 100 });
      const transactions = res.data || [];
      const ovRes = await api.getOverview().catch(() => ({ data: {} }));
      const kpis = ovRes.data?.kpis || {};

      const doc = new jsPDF();

      // Brand Header
      doc.setFillColor(11, 15, 25);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(56, 189, 248);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SmartTrack AI', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text('Personal Wealth Management Statement', 14, 26);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 18);
      doc.text(`Investor: ${user?.name || 'User'}`, 150, 24);
      doc.text(`Period: ${reportMonth}`, 150, 30);

      // Financial KPI Summary Table
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text('Executive Cashflow Summary', 14, 45);

      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value', 'Status']],
        body: [
          ['Total Inflow (Income)', `$${(kpis.totalIncome || 0).toFixed(2)}`, 'Recorded'],
          ['Total Outflow (Expense)', `$${(kpis.totalExpense || 0).toFixed(2)}`, 'Recorded'],
          ['Net Savings Surplus', `$${(kpis.monthlySavings || 0).toFixed(2)}`, 'Accumulated'],
          ['Savings Rate', `${kpis.savingsRate || 0}%`, 'Benchmark >= 20%'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
      });

      // Transactions Ledger Table
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Audit Ledger Log', 14, finalY);

      const tableRows = transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString(),
        tx.title,
        tx.category,
        tx.paymentMethod,
        tx.type.toUpperCase(),
        `$${tx.amount.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Date', 'Title', 'Category', 'Method', 'Type', 'Amount']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 },
      });

      doc.save(`SmartTrack-Report-${reportMonth}.pdf`);
    } catch (err) {
      alert(err.message || 'Error generating PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCSV = () => {
    window.open(api.exportCSVUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Statements & Financial Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal, audit-ready PDF statements and spreadsheet CSV exports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Generator Card */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Monthly PDF Statement</h3>
                <p className="text-xs text-slate-400">Branded report with cashflow metrics & ledger log</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Statement Period</label>
                <input
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{generating ? 'Generating PDF Document...' : 'Download Statement (PDF)'}</span>
          </button>
        </div>

        {/* CSV Export Card */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export Ledger Data (CSV)</h3>
                <p className="text-xs text-slate-400">Compatible with Microsoft Excel, Apple Numbers & Google Sheets</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-slate-300 space-y-1.5 mt-4">
              <p>✓ All historical income & expense entries</p>
              <p>✓ Categories, notes, timestamps, and receipt attachments</p>
              <p>✓ RFC 4180 compliant formatted columns</p>
            </div>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="w-full mt-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Ledger (.CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
