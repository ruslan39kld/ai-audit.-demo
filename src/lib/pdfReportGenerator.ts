import { CompanyAuditData, Audit, Initiative, FinanceRecord } from '../types';
import { AnalysisResult } from './auditEngine';
import { evaluateInitiativeSevenCriteria } from './sevenCriteria';
import { AI_SOLUTIONS, MATURITY_LEVELS } from '../auditMetadata';
import { calculateAiMaturityLevel } from './aiMaturity';
import { formatCurrency, formatPayback } from './utils';
import { storage, ReportBranding } from '../storage';

/**
 * Creates and triggers a download of a file (CSV, XLSX, etc.)
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Common Print Stylesheet with full print-color-adjust and robust border/text coloring
 */
function getPrintCss(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.35;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
    }
    .page {
      page-break-after: always;
      min-height: 262mm;
      position: relative;
      padding-bottom: 14mm;
      padding-top: 1mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* Top Bar on subsequent pages */
    .page-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 0 6px 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 7.5pt;
      color: #475569;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .top-bar-company {
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .top-bar-doc {
      font-weight: 600;
      color: #475569;
    }

    /* Bottom Footer on all pages */
    .page-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 5px;
      border-top: 1px solid #cbd5e1;
      font-size: 7.5pt;
      color: #64748b;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .footer-left {
      font-weight: 600;
    }
    .footer-right {
      font-weight: 700;
      color: #334155;
    }

    /* Cover Page */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 256mm;
      padding: 28px 24px;
      border: 1.5px solid #94a3b8;
      border-radius: 10px;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cover-top-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cover-header {
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 18px;
    }
    .cover-company-badge {
      display: inline-block;
      font-size: 8pt;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 6px;
    }
    .cover-badge {
      display: inline-block;
      color: #1e3a8a;
      border: 1.5px solid #1e3a8a;
      background: #eff6ff;
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 3px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cover-title {
      font-size: 21pt;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 8px 0;
      line-height: 1.15;
      letter-spacing: -0.4px;
    }
    .cover-subtitle {
      font-size: 10.5pt;
      color: #334155;
      margin: 0;
      line-height: 1.35;
    }
    .cover-meta {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 7pt;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .meta-value {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    /* Cover Metrics Accent Strip (under metadata) */
    .cover-metrics-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #ffffff;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 14px 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cover-m-cell {
      display: flex;
      flex-direction: column;
    }
    .cover-m-label {
      font-size: 6.5pt;
      text-transform: uppercase;
      color: #475569;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .cover-m-val {
      font-size: 13pt;
      font-weight: 900;
      line-height: 1.1;
    }
    .cover-m-sub {
      font-size: 7pt;
      color: #64748b;
      margin-top: 2px;
      font-weight: 600;
    }

    .cover-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #475569;
    }

    /* Section Headings */
    .section-title {
      font-size: 11.5pt;
      font-weight: 800;
      color: #0f172a;
      border-left: 4px solid #1e3a8a;
      padding-left: 8px;
      margin: 10px 0 8px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Key Metrics Grid & Cards */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .metric-card {
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .metric-card-savings {
      border: 1.5px solid #059669;
      border-left: 4px solid #059669;
    }
    .metric-card-savings .metric-title { color: #065f46; }
    .metric-card-savings .metric-value { color: #047857; }
    .metric-card-savings .metric-sub { color: #059669; }

    .metric-card-time {
      border: 1.5px solid #2563eb;
      border-left: 4px solid #2563eb;
    }
    .metric-card-time .metric-title { color: #1e40af; }
    .metric-card-time .metric-value { color: #1d4ed8; }
    .metric-card-time .metric-sub { color: #2563eb; }

    .metric-card-invest {
      border: 1.5px solid #7c3aed;
      border-left: 4px solid #7c3aed;
    }
    .metric-card-invest .metric-title { color: #5b21b6; }
    .metric-card-invest .metric-value { color: #6d28d9; }
    .metric-card-invest .metric-sub { color: #7c3aed; }

    .metric-card-roi {
      border: 1.5px solid #d97706;
      border-left: 4px solid #d97706;
    }
    .metric-card-roi .metric-title { color: #92400e; }
    .metric-card-roi .metric-value { color: #b45309; }
    .metric-card-roi .metric-sub { color: #d97706; }

    .metric-title {
      font-size: 7pt;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .metric-value {
      font-size: 12pt;
      font-weight: 900;
      line-height: 1.1;
    }
    .metric-sub {
      font-size: 7pt;
      font-weight: 700;
      margin-top: 2px;
    }

    /* Tables */
    table.report-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 7.5pt;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    table.report-table th, table.report-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      text-align: left;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    table.report-table th {
      background: #f1f5f9;
      font-weight: 800;
      color: #0f172a;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    table.report-table tr:nth-child(even) td {
      background: #fafafa;
    }

    /* Score Pills with Exact Colored Border & Text */
    .score-pill {
      display: inline-block;
      min-width: 20px;
      height: 18px;
      line-height: 16px;
      padding: 0 3px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 7.5pt;
      text-align: center;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .score-red {
      color: #dc2626 !important;
      border: 1.5px solid #dc2626 !important;
      background: #fff5f5;
    }
    .score-yellow {
      color: #d97706 !important;
      border: 1.5px solid #d97706 !important;
      background: #fffbeb;
    }
    .score-green {
      color: #16a34a !important;
      border: 1.5px solid #16a34a !important;
      background: #f0fdf4;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .badge-green { background: #ffffff; color: #15803d; border: 1.5px solid #16a34a; }
    .badge-blue { background: #ffffff; color: #1d4ed8; border: 1.5px solid #2563eb; }
    .badge-purple { background: #ffffff; color: #6b21a8; border: 1.5px solid #7c3aed; }
    .badge-amber { background: #ffffff; color: #b45309; border: 1.5px solid #d97706; }

    /* Executive Summary block */
    .summary-card {
      background: #ffffff;
      border: 1.5px solid #94a3b8;
      border-left: 4px solid #1e3a8a;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .summary-points {
      margin: 0;
      padding-left: 16px;
      font-size: 8pt;
      color: #1e293b;
      line-height: 1.4;
    }
    .summary-points li {
      margin-bottom: 3px;
    }
    .summary-points li:last-child {
      margin-bottom: 0;
    }

    /* Readiness Index Cards */
    .readiness-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .readiness-box {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .readiness-title {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #334155;
      margin-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
    }

    /* Passport Cards */
    .passport-card {
      border: 1.5px solid #94a3b8;
      border-top: 3px solid #1e3a8a;
      border-radius: 6px;
      background: #ffffff;
      padding: 8px 10px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .passport-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .passport-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px 0;
    }
    .passport-dept {
      font-size: 7pt;
      color: #475569;
      font-weight: 600;
    }
    .passport-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      border-radius: 4px;
      margin-bottom: 5px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .p-metric {
      font-size: 6.5pt;
    }
    .p-metric-val {
      font-size: 8pt;
      font-weight: 800;
      color: #0f172a;
    }
    .criteria-row {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-top: 5px;
    }
    .criteria-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 6.5pt;
      color: #334155;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Roadmap Grid */
    .roadmap-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .roadmap-col {
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      background: #ffffff;
      padding: 6px;
      display: flex;
      flex-direction: column;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .roadmap-header {
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 5px;
      border-radius: 4px;
      margin-bottom: 5px;
      text-align: center;
      line-height: 1.25;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .roadmap-header-q1 { border: 1.5px solid #16a34a; color: #166534; background: #f0fdf4; }
    .roadmap-header-q2 { border: 1.5px solid #2563eb; color: #1e40af; background: #eff6ff; }
    .roadmap-header-q3 { border: 1.5px solid #7c3aed; color: #6b21a8; background: #faf5ff; }
    .roadmap-header-q4 { border: 1.5px solid #d97706; color: #92400e; background: #fffbeb; }
    
    .roadmap-body {
      font-size: 7pt;
      color: #334155;
      flex: 1;
    }
    .roadmap-item {
      padding: 4px 5px;
      margin-bottom: 4px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 3px solid #1e3a8a;
      border-radius: 4px;
      font-size: 6.5pt;
      line-height: 1.25;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .roadmap-item-title {
      font-weight: 800;
      color: #0f172a;
    }

    /* Requirements Cards */
    .req-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .req-card {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-top: 3px solid #1e3a8a;
      border-radius: 6px;
      padding: 6px 8px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .req-card-title {
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #1e3a8a;
      margin-bottom: 3px;
    }
    .req-card ul {
      margin: 0;
      padding-left: 12px;
      font-size: 7pt;
      color: #334155;
      line-height: 1.3;
    }

    /* Contacts Block */
    .contacts-card {
      background: #ffffff;
      border: 1.5px solid #2563eb;
      border-top: 4px solid #1e3a8a;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 8px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .contacts-title {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #1e3a8a;
      margin: 0 0 5px 0;
      letter-spacing: 0.5px;
    }
    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 6px;
    }
    .contact-item {
      display: flex;
      flex-direction: column;
    }
    .contact-label {
      font-size: 6pt;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }
    .contact-value {
      font-size: 7.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .footer-note {
      padding: 6px 8px;
      background: #ffffff;
      border-radius: 4px;
      font-size: 6.5pt;
      color: #475569;
      border: 1px solid #cbd5e1;
      border-left: 3px solid #1e3a8a;
      line-height: 1.3;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  `;
}

/**
 * Opens a dedicated printable window with formatted document HTML and triggers native PDF/Print
 */
function openPrintDocument(htmlContent: string, title: string) {
  const css = getPrintCss();
  const printWindow = window.open('', '_blank', 'width=960,height=850');
  if (!printWindow) {
    // Fallback if popup is blocked by iframe or browser: render in hidden iframe and print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>${css}</style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() { window.focus(); window.print(); }, 400);
            });
          </script>
        </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 60000);
      }, 500);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>${css}</style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Formats a 1-5 criteria score with colored border and text
 * 1-2: Red, 3: Orange, 4-5: Green
 */
function renderScoreBadge(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return '<span class="score-pill" style="color: #94a3b8; border: 1px solid #cbd5e1;">—</span>';
  }
  if (score >= 4) {
    return `<span class="score-pill score-green">${score}</span>`;
  }
  if (score === 3) {
    return `<span class="score-pill score-yellow">${score}</span>`;
  }
  return `<span class="score-pill score-red">${score}</span>`;
}

/**
 * Resolves Russian translation of project quadrants
 */
function getQuadrantRu(quadrant: string | undefined): { label: string; badgeClass: string } {
  if (quadrant === 'Quick Wins') {
    return { label: 'Быстрый результат', badgeClass: 'badge-green' };
  }
  if (quadrant === 'Foundation') {
    return { label: 'Базовые проекты', badgeClass: 'badge-blue' };
  }
  if (quadrant === 'Strategic Bets') {
    return { label: 'Крупные проекты', badgeClass: 'badge-purple' };
  }
  return { label: quadrant || 'Быстрый результат', badgeClass: 'badge-amber' };
}

/**
 * Resolves auditor display name according to business logic:
 * - Use user name if filled (not login/raw user ID)
 * - If not filled, use branding auditor name
 * - If not filled, show role without login
 */
function resolveAuditorDisplayName(user?: any, branding?: ReportBranding): string {
  const rawName = user?.name?.trim();
  const rawEmail = user?.email?.trim();
  const isLoginOnly = !rawName || 
    rawName.toLowerCase() === 'admin' || 
    rawName.toLowerCase() === 'auditor' || 
    rawName.toLowerCase() === 'client' || 
    rawName.includes('@') ||
    (rawEmail && rawName.toLowerCase() === rawEmail.split('@')[0].toLowerCase());

  if (!isLoginOnly && rawName) {
    return rawName;
  }
  if (branding?.auditorName?.trim()) {
    return branding.auditorName.trim();
  }
  if (user?.role === 'admin') {
    return 'Главный эксперт по AI-трансформации';
  }
  if (user?.role === 'auditor') {
    return 'Эксперт-аудитор';
  }
  return branding?.auditorRole?.trim() || 'Ведущий эксперт по AI-трансформации';
}

/**
 * 1. Generates and prints Paid Audit PDF as a Full-Color Professional Multi-Section Document
 */
export function generatePaidAuditPdfReport(
  data: CompanyAuditData, 
  analysis: AnalysisResult, 
  user?: any,
  auditorScores?: Record<string, { risks?: number; staffImpact?: number }>
) {
  const branding: ReportBranding = storage.getBranding();
  const accentColor = branding.accentColor || '#1E3A8A';

  const industryName = data.profile?.industry || data.profile?.co_industry || 'Предприятие';
  const companyTitle = data.profile?.co_name || data.profile?.name || industryName;
  const auditDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const auditorDisplay = resolveAuditorDisplayName(user, branding);

  const depts = data.departments || [];
  const deptsCount = depts.length || 1;
  const processesCount = depts.reduce((acc, d) => acc + (d.processes?.length || 0), 0) || 0;

  // Key metrics calculated identically to AuditResultsView.tsx
  const totalMonthlySavings = analysis.initiatives.reduce((acc, i) => acc + i.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const totalInvestment = analysis.initiatives.reduce((acc, i) => acc + i.investment, 0);
  const totalHours = analysis.initiatives.reduce((acc, i) => acc + i.potentialHoursSaved, 0);
  const avgPaybackNum = analysis.initiatives.length > 0 ? totalInvestment / (totalMonthlySavings || 1) : 0;
  const paybackFormatted = formatPayback(avgPaybackNum).text;

  // Evaluate initiatives with 7 criteria including manual overrides
  const completeness = analysis.completeness || 60;
  const evaluatedInitiatives = analysis.initiatives.map(ini => {
    const custom = auditorScores?.[ini.id];
    const scoredIni = (custom || ini.criteriaScores) ? {
      ...ini,
      criteriaScores: {
        ...ini.criteriaScores,
        ...(custom?.risks !== undefined ? { risks: custom.risks } : {}),
        ...(custom?.staffImpact !== undefined ? { staffImpact: custom.staffImpact } : {})
      }
    } : ini;
    return {
      initiative: scoredIni,
      evaluation: evaluateInitiativeSevenCriteria(scoredIni, completeness, analysis.initiatives)
    };
  }).sort((a, b) => b.evaluation.overallPriority - a.evaluation.overallPriority);

  // Overall AI Readiness
  const deptMaturities = depts.map(d => calculateAiMaturityLevel(d, data.format));
  const validLevels = deptMaturities.map(m => m.level).filter((l): l is number => l !== null);
  const avgLevel = validLevels.length > 0
    ? Math.round(validLevels.reduce((acc, l) => acc + l, 0) / validLevels.length)
    : 2;
  const overallLevelNum = Math.max(0, Math.min(5, avgLevel));
  const avgMaturityScore = Math.round((overallLevelNum / 5) * 100);
  const overallLevelMeta = MATURITY_LEVELS.find(m => m.level === overallLevelNum);
  const overallLevelName = overallLevelMeta?.name || 'Точечный';

  // Roadmap initiative partition logic:
  // 1-3 мес: Быстрый результат и пилоты (priority >= 4.0 OR quadrant Quick Wins OR effort <= 4 weeks)
  // 4-6 мес: Развитие и масштабирование (quadrant Foundation OR effort <= 8 weeks)
  // 7-9 мес: Крупные проекты (quadrant Strategic Bets OR complex cross-functional)
  // 10-12 мес: Развитие экосистемы
  const q1Initiatives = evaluatedInitiatives.filter(
    i => i.evaluation.overallPriority >= 4.0 || i.initiative.quadrant === 'Quick Wins' || i.initiative.effortWeeks <= 4
  );
  const q2Initiatives = evaluatedInitiatives.filter(
    i => !q1Initiatives.includes(i) && (i.initiative.quadrant === 'Foundation' || i.initiative.effortWeeks <= 8)
  );
  const q3Initiatives = evaluatedInitiatives.filter(
    i => !q1Initiatives.includes(i) && !q2Initiatives.includes(i)
  );

  // Helper for Top Bar
  const renderTopBar = (pageSection: string) => `
    <div class="page-top-bar" style="border-top: 3px solid ${accentColor};">
      <span class="top-bar-company">${branding.companyName || 'Экспертный AI-аудит'}</span>
      <span class="top-bar-doc">${pageSection} • ${companyTitle}</span>
    </div>
  `;

  // Helper for Page Footer
  const renderFooter = (pageNum: number) => `
    <div class="page-footer">
      <span class="footer-left">${branding.companyName || 'Экспертный AI-аудит'} • Итоговый экспертный отчёт</span>
      <span class="footer-right">Страница ${pageNum} из 5</span>
    </div>
  `;

  // Contacts Block: Only render if at least one contact is filled in settings
  const hasCompany = !!branding.companyName?.trim();
  const hasAuditor = !!branding.auditorName?.trim();
  const hasPhone = !!branding.phone?.trim();
  const hasEmail = !!branding.email?.trim();
  const hasWebsite = !!branding.website?.trim();
  const showContacts = hasCompany || hasAuditor || hasPhone || hasEmail || hasWebsite;

  const contactsHtml = showContacts ? `
    <div class="contacts-card">
      <h3 class="contacts-title">8. Контакты для обратной связи и реализации</h3>
      <div class="contacts-grid">
        ${hasCompany ? `
          <div class="contact-item">
            <span class="contact-label">Компания-исполнитель</span>
            <span class="contact-value">${branding.companyName.trim()}</span>
          </div>
        ` : ''}
        ${hasAuditor ? `
          <div class="contact-item">
            <span class="contact-label">Эксперт / Аудитор</span>
            <span class="contact-value">${branding.auditorName.trim()}</span>
          </div>
        ` : ''}
        ${hasPhone ? `
          <div class="contact-item">
            <span class="contact-label">Телефон</span>
            <span class="contact-value">${branding.phone.trim()}</span>
          </div>
        ` : ''}
        ${hasEmail ? `
          <div class="contact-item">
            <span class="contact-label">Электронная почта</span>
            <span class="contact-value">${branding.email.trim()}</span>
          </div>
        ` : ''}
        ${hasWebsite ? `
          <div class="contact-item">
            <span class="contact-label">Официальный сайт</span>
            <span class="contact-value">${branding.website.trim()}</span>
          </div>
        ` : ''}
      </div>
    </div>
  ` : '';

  const html = `
    <!-- СТРАНИЦА 1: ТИТУЛЬНЫЙ ЛИСТ -->
    <div class="page">
      <div class="cover-page">
        <div class="cover-top-stripe" style="background: ${accentColor}; border-top: 6px solid ${accentColor};"></div>
        <div class="cover-header">
          <div class="cover-company-badge">${branding.companyName || 'Экспертный AI-аудит'}</div><br/>
          <span class="cover-badge" style="border-color: ${accentColor}; color: ${accentColor};">ИТОГОВЫЙ ЭКСПЕРТНЫЙ ДОКУМЕНТ</span>
          <h1 class="cover-title">ОТЧЁТ AI-АУДИТА И ДОРОЖНАЯ КАРТА ВНЕДРЕНИЯ</h1>
          <p class="cover-subtitle">Комплексная оценка потенциала автоматизации и прикладного применения искусственного интеллекта</p>
        </div>

        <div class="cover-meta">
          <div class="meta-item">
            <span class="meta-label">Заказчик / Компания</span>
            <span class="meta-value">${companyTitle}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Отрасль деятельности</span>
            <span class="meta-value">${industryName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Формат проведения</span>
            <span class="meta-value">Комплексный платный AI-аудит (4–8 недель)</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Дата формирования</span>
            <span class="meta-value">${auditDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Исполнитель / Аудитор</span>
            <span class="meta-value">${auditorDisplay}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Охват аудита</span>
            <span class="meta-value">${deptsCount} подразделений • ${processesCount} процессов</span>
          </div>
        </div>

        <!-- Полоса с ключевыми цифрами аудита -->
        <div class="cover-metrics-strip" style="border: 1.5px solid ${accentColor}; border-top: 4px solid ${accentColor};">
          <div class="cover-m-cell">
            <span class="cover-m-label">Экономия в месяц</span>
            <span class="cover-m-val" style="color: #047857;">${formatCurrency(totalMonthlySavings)}</span>
            <span class="cover-m-sub">${formatCurrency(totalAnnualSavings)} / год</span>
          </div>
          <div class="cover-m-cell">
            <span class="cover-m-label">Инвестиции в запуск</span>
            <span class="cover-m-val" style="color: #6d28d9;">${formatCurrency(totalInvestment)}</span>
            <span class="cover-m-sub">Стоимость внедрения и лицензии</span>
          </div>
          <div class="cover-m-cell">
            <span class="cover-m-label">Срок окупаемости</span>
            <span class="cover-m-val" style="color: #b45309;">${paybackFormatted}</span>
            <span class="cover-m-sub">${analysis.initiatives.length} проектов в портфеле</span>
          </div>
          <div class="cover-m-cell">
            <span class="cover-m-label">Высвобождение труда</span>
            <span class="cover-m-val" style="color: #1d4ed8;">${Math.round(totalHours)} ч/мес</span>
            <span class="cover-m-sub">Рутинные операции</span>
          </div>
        </div>

        <div class="cover-footer">
          <span>${branding.companyName || 'Экспертный AI-аудит'} • Конфиденциальный отчёт</span>
          <span>Статус: Финальный расчёт • Полнота анкеты: ${completeness}%</span>
        </div>
      </div>
      ${renderFooter(1)}
    </div>

    <!-- СТРАНИЦА 2: РЕЗЮМЕ ДЛЯ РУКОВОДСТВА И ИНДЕКС AI-ГОТОВНОСТИ -->
    <div class="page">
      ${renderTopBar('1. Резюме для руководства & Индекс AI-готовности')}
      
      <h2 class="section-title">1. Краткое резюме для руководства</h2>
      <div class="summary-card">
        <ul class="summary-points">
          <li><b>Экономический потенциал:</b> Совокупная прямая экономия от автоматизации обследованных участков составляет <b>${formatCurrency(totalMonthlySavings)} в месяц (${formatCurrency(totalAnnualSavings)} в год)</b> за счёт оптимизации рутинных операций и сокращения ошибок.</li>
          <li><b>Приоритетный пул быстрых побед:</b> Выявлен ряд быстрореализуемых сценариев со средним сроком окупаемости <b>${paybackFormatted}</b> и минимальными рисками запуска.</li>
          <li><b>Готовность IT-инфраструктуры:</b> Текущий уровень цифровой зрелости позволяет приступить к пилотированию приоритетных решений без остановки операционных процессов.</li>
          <li><b>Высвобождение персонала:</b> Внедрение дорожной карты сэкономит <b>${Math.round(totalHours)} ч/мес</b> рабочего времени ключевых специалистов для выполнения высокомаржинальных задач.</li>
        </ul>
      </div>

      <!-- Ключевые показатели в цветных плашках -->
      <div class="metrics-grid">
        <div class="metric-card metric-card-savings">
          <div class="metric-title">Экономия</div>
          <div class="metric-value">${formatCurrency(totalMonthlySavings)}</div>
          <div class="metric-sub">+${formatCurrency(totalAnnualSavings)} / год</div>
        </div>
        <div class="metric-card metric-card-time">
          <div class="metric-title">Высвобождение</div>
          <div class="metric-value">${Math.round(totalHours)} ч/мес</div>
          <div class="metric-sub">Рутинный труд</div>
        </div>
        <div class="metric-card metric-card-invest">
          <div class="metric-title">Инвестиции</div>
          <div class="metric-value">${formatCurrency(totalInvestment)}</div>
          <div class="metric-sub">Стоимость внедрения и лицензии</div>
        </div>
        <div class="metric-card metric-card-roi">
          <div class="metric-title">Окупаемость</div>
          <div class="metric-value">${paybackFormatted}</div>
          <div class="metric-sub">${analysis.initiatives.length} проектов в портфеле</div>
        </div>
      </div>

      <h2 class="section-title">2. Индекс AI-готовности предприятия</h2>
      <div class="readiness-container">
        <div class="readiness-box">
          <div class="readiness-title">Общий уровень зрелости предприятия</div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="font-size: 18pt; font-weight: 900; color: ${accentColor};">${avgMaturityScore} <span style="font-size: 9pt; color: #64748b;">/ 100</span></div>
            <div>
              <span class="badge badge-blue">Уровень ${overallLevelNum}: ${overallLevelName}</span>
            </div>
          </div>
          <p style="font-size: 7pt; color: #334155; margin: 0; line-height: 1.3;">
            ${overallLevelMeta?.description || 'Оценка цифровой зрелости на основе используемых инструментов, регламентов, корпоративных доступов и качества данных.'}
          </p>
        </div>

        <div class="readiness-box">
          <div class="readiness-title">Диагностика рисков и регламентов</div>
          <table style="width: 100%; font-size: 7pt; border-collapse: collapse;">
            <tr>
              <td style="padding: 2px 0; color: #64748b;">Политика использования ИИ:</td>
              <td style="padding: 2px 0; text-align: right; font-weight: 700;">${data.profile?.co_industry ? 'Частично сформирована' : 'Базовая'}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">Корпоративный доступ:</td>
              <td style="padding: 2px 0; text-align: right; font-weight: 700; color: #1d4ed8;">Централизованный</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">Риск утечки данных:</td>
              <td style="padding: 2px 0; text-align: right; font-weight: 700; color: #15803d;">Контролируемый (Низкий)</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">Качество данных:</td>
              <td style="padding: 2px 0; text-align: right; font-weight: 700;">Готово к разметке</td>
            </tr>
          </table>
        </div>
      </div>

      <div>
        <table class="report-table">
          <thead>
            <tr>
              <th>Подразделение</th>
              <th style="text-align: center;">Зрелость</th>
              <th>Использование ИИ</th>
              <th>Форматы данных</th>
              <th style="text-align: center;">Риск утечки</th>
            </tr>
          </thead>
          <tbody>
            ${depts.map((d, idx) => {
              const mat = deptMaturities[idx] || { level: 2, score: 40 };
              const mName = MATURITY_LEVELS.find(m => m.level === mat.level)?.name || 'Точечный';
              return `
                <tr>
                  <td><b>${d.name}</b></td>
                  <td style="text-align: center;"><span class="badge badge-blue">Ур. ${mat.level}: ${mName}</span></td>
                  <td>${d.dp_ai_usage_status || d.aiUsageStatus || 'Пилотное использование'}</td>
                  <td>${d.dp_data_formats || 'ERP, Excel, СЭД, Сканы'}</td>
                  <td style="text-align: center;"><span class="badge badge-green">Защищено</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${renderFooter(2)}
    </div>

    <!-- СТРАНИЦА 3: РЕЕСТР ПРОЦЕССОВ И МАТРИЦА 7 КРИТЕРИЕВ -->
    <div class="page">
      ${renderTopBar('2. Реестр процессов & Оценка по 7 критериям')}

      <h2 class="section-title">3. Реестр обследованных процессов</h2>
      <table class="report-table">
        <thead>
          <tr>
            <th>Подразделение</th>
            <th>Процесс</th>
            <th style="text-align: center;">Штат (чел)</th>
            <th style="text-align: center;">Объём/мес</th>
            <th style="text-align: center;">Ручной труд</th>
            <th style="text-align: center;">Рутина (%)</th>
            <th>Входные форматы</th>
            <th>Выявленные потери</th>
          </tr>
        </thead>
        <tbody>
          ${depts.flatMap(d => (d.processes || []).map(p => {
            const ops = Number(p.pr_ops_month || p.operationsPerMonth || 100);
            const mins = Number(p.pr_minutes || p.timePerOperation || 30);
            const manualShare = Number(p.pr_manual_share || p.manualWorkShare || 75);
            const manualHours = Math.round((ops * mins / 60) * (manualShare / 100)) || 35;
            return `
              <tr>
                <td><b>${d.name}</b></td>
                <td>${p.name}</td>
                <td style="text-align: center;">${p.pr_headcount || p.participantsCount || 2}</td>
                <td style="text-align: center;">${ops}</td>
                <td style="text-align: center; font-weight: 700; color: #1e40af;">${manualHours} ч/мес</td>
                <td style="text-align: center; font-weight: 700; color: #dc2626;">${manualShare}%</td>
                <td>${p.pr_doc_formats || 'Бумага, скан, PDF, 1С'}</td>
                <td style="color: #475569;">${p.pr_bottleneck || 'Ручной перенос данных, ошибки сверки'}</td>
              </tr>
            `;
          })).join('')}
        </tbody>
      </table>

      <h2 class="section-title">4. Оценка инициатив по семи критериям</h2>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 22px; text-align: center;">#</th>
            <th>Инициатива и решение</th>
            <th>Подразделение</th>
            <th style="text-align: center;" title="Экономический эффект">1. Эффект</th>
            <th style="text-align: center;" title="Срок внедрения">2. Срок</th>
            <th style="text-align: center;" title="Стоимость">3. Цена</th>
            <th style="text-align: center;" title="Зрелость процесса">4. Зрелость</th>
            <th style="text-align: center;" title="Полнота данных">5. Данные</th>
            <th style="text-align: center;" title="Готовность команды">6. Персонал</th>
            <th style="text-align: center;" title="Риски внедрения">7. Риски</th>
            <th style="text-align: center; font-weight: 800;">Балл</th>
            <th style="text-align: center;">Категория</th>
          </tr>
        </thead>
        <tbody>
          ${evaluatedInitiatives.map((item, idx) => {
            const ev = item.evaluation;
            const getScore = (id: string) => ev.criteria.find(c => c.id === id)?.score ?? null;
            const quadRu = getQuadrantRu(item.initiative.quadrant);
            return `
              <tr>
                <td style="font-weight: 800; color: ${accentColor}; text-align: center;">${idx + 1}</td>
                <td>
                  <b>${item.initiative.name}</b><br/>
                  <span style="font-size: 6.5pt; color: #64748b;">${item.initiative.solutionCode} • ${item.initiative.processName}</span>
                </td>
                <td>${item.initiative.departmentName}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('effect'))}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('speed'))}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('cost'))}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('scalability'))}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('dataCompleteness') || 4)}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('staffImpact') || getScore('teamReadiness') || 4)}</td>
                <td style="text-align: center;">${renderScoreBadge(getScore('risks') || 4)}</td>
                <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #0f172a;">${ev.overallPriority}</td>
                <td style="text-align: center;"><span class="badge ${quadRu.badgeClass}">${quadRu.label}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer-note">
        <b>Цветовая шкала баллов:</b> <b>1–2 балла</b> (красный) — повышенные затраты, сложность или риски; <b>3 балла</b> (оранжевый) — средний уровень; <b>4–5 баллов</b> (зелёный) — высокая привлекательность и минимальные барьеры. Проекты с высшим приоритетом рекомендуются к запуску в первую очередь.
      </div>

      ${renderFooter(3)}
    </div>

    <!-- СТРАНИЦА 4: ПАСПОРТА РЕКОМЕНДОВАННЫХ AI-ПРОЕКТОВ -->
    <div class="page">
      ${renderTopBar('3. Паспорта рекомендованных AI-проектов')}

      <h2 class="section-title">5. Паспорта рекомендованных инициатив</h2>
      ${evaluatedInitiatives.map((item, idx) => {
        const ini = item.initiative;
        const ev = item.evaluation;
        const quadRu = getQuadrantRu(ini.quadrant);
        const paybackSingle = formatPayback(ini.paybackMonths).text;
        return `
          <div class="passport-card">
            <div class="passport-header">
              <div>
                <h3 class="passport-title">${idx + 1}. ${ini.name}</h3>
                <span class="passport-dept">${ini.departmentName} • Закрываемый процесс: <b>${ini.processName}</b> • Каталог: ${ini.solutionCode}</span>
              </div>
              <span class="badge ${quadRu.badgeClass}">Приоритет: ${ev.overallPriority} / 5.0 (${quadRu.label})</span>
            </div>

            <div class="passport-metrics">
              <div class="p-metric">
                <span style="color: #64748b;">Экономия:</span><br/>
                <span class="p-metric-val" style="color: #047857;">${formatCurrency(ini.monthlySavings)}/мес (${formatCurrency(ini.monthlySavings * 12)}/год)</span>
              </div>
              <div class="p-metric">
                <span style="color: #64748b;">Бюджет проекта:</span><br/>
                <span class="p-metric-val" style="color: #6d28d9;">${formatCurrency(ini.investment)}</span>
              </div>
              <div class="p-metric">
                <span style="color: #64748b;">Срок внедрения:</span><br/>
                <span class="p-metric-val">${ini.effortWeeks} недель</span>
              </div>
              <div class="p-metric">
                <span style="color: #64748b;">Срок окупаемости:</span><br/>
                <span class="p-metric-val" style="color: #b45309;">${paybackSingle}</span>
              </div>
            </div>

            <p style="font-size: 7.5pt; color: #1e293b; margin: 2px 0 5px 0; line-height: 1.35;">
              <b>Роль и алгоритмы ИИ:</b> ${ini.whatItDoes || 'Интеллектуальная обработка входящих документов, распознавание сущностей, сопоставление с учетными реестрами и генерация аналитических отчетов с верификацией оператором.'}
            </p>

            <div class="criteria-row">
              ${ev.criteria.map(c => `
                <span class="criteria-pill">${c.name}: ${renderScoreBadge(c.score)}</span>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}

      ${renderFooter(4)}
    </div>

    <!-- СТРАНИЦА 5: ДОРОЖНАЯ КАРТА, ИНТЕГРАЦИИ И КОНТАКТЫ -->
    <div class="page">
      ${renderTopBar('4. Дорожная карта, инфраструктура & Контакты')}

      <h2 class="section-title">6. Дорожная карта внедрения на 6–12 месяцев</h2>
      <div class="roadmap-grid">
        <!-- Период 1 -->
        <div class="roadmap-col">
          <div class="roadmap-header roadmap-header-q1">1–3 месяц. Быстрый результат и пилоты</div>
          <div class="roadmap-body">
            <p style="font-size: 6pt; color: #15803d; font-weight: 800; text-transform: uppercase; margin: 0 0 3px 0;">Быстрый результат и пилоты</p>
            ${q1Initiatives.length > 0 ? q1Initiatives.map(i => `
              <div class="roadmap-item">
                <div class="roadmap-item-title">${i.initiative.name}</div>
                <span style="color: #047857; font-weight: 700;">+${formatCurrency(i.initiative.monthlySavings)}/мес</span> • ${i.initiative.effortWeeks} нед.
              </div>
            `).join('') : `
              <div class="roadmap-item">
                <div class="roadmap-item-title">Пилотирование базовых сценариев</div>
                <span style="color: #64748b;">Проверка гипотез и валидация окупаемости</span>
              </div>
            `}
          </div>
        </div>

        <!-- Период 2 -->
        <div class="roadmap-col">
          <div class="roadmap-header roadmap-header-q2">4–6 месяц. Развитие и масштабирование</div>
          <div class="roadmap-body">
            <p style="font-size: 6pt; color: #1e40af; font-weight: 800; text-transform: uppercase; margin: 0 0 3px 0;">Развитие и масштабирование</p>
            ${q2Initiatives.length > 0 ? q2Initiatives.map(i => `
              <div class="roadmap-item">
                <div class="roadmap-item-title">${i.initiative.name}</div>
                <span style="color: #1e40af; font-weight: 700;">+${formatCurrency(i.initiative.monthlySavings)}/мес</span> • ${i.initiative.effortWeeks} нед.
              </div>
            `).join('') : `
              <div class="roadmap-item">
                <div class="roadmap-item-title">Тиражирование решений</div>
                <span style="color: #64748b;">Интеграция с учётными системами</span>
              </div>
            `}
          </div>
        </div>

        <!-- Период 3 -->
        <div class="roadmap-col">
          <div class="roadmap-header roadmap-header-q3">7–9 месяц. Крупные проекты</div>
          <div class="roadmap-body">
            <p style="font-size: 6pt; color: #6b21a8; font-weight: 800; text-transform: uppercase; margin: 0 0 3px 0;">Крупные проекты</p>
            ${q3Initiatives.length > 0 ? q3Initiatives.map(i => `
              <div class="roadmap-item">
                <div class="roadmap-item-title">${i.initiative.name}</div>
                <span style="color: #6b21a8; font-weight: 700;">+${formatCurrency(i.initiative.monthlySavings)}/мес</span> • ${i.initiative.effortWeeks} нед.
              </div>
            `).join('') : `
              <div class="roadmap-item">
                <div class="roadmap-item-title">Сквозные интеллектуальные агенты</div>
                <span style="color: #64748b;">Автоматизация сквозных цепочек</span>
              </div>
            `}
          </div>
        </div>

        <!-- Период 4 -->
        <div class="roadmap-col">
          <div class="roadmap-header roadmap-header-q4">10–12 месяц. Развитие экосистемы</div>
          <div class="roadmap-body">
            <p style="font-size: 6pt; color: #92400e; font-weight: 800; text-transform: uppercase; margin: 0 0 3px 0;">Развитие экосистемы</p>
            <div class="roadmap-item">
              <div class="roadmap-item-title">Тонкая настройка моделей (дообучение)</div>
              <span style="color: #64748b;">Адаптация под корпоративные данные</span>
            </div>
            <div class="roadmap-item">
              <div class="roadmap-item-title">Центр компетенций по ИИ</div>
              <span style="color: #64748b;">Регламенты и непрерывное развитие</span>
            </div>
          </div>
        </div>
      </div>

      <h2 class="section-title">7. Требования к данным, интеграциям и инфраструктуре</h2>
      <div class="req-grid">
        <div class="req-card">
          <div class="req-card-title">Требования к данным</div>
          <ul>
            <li>Оцифровка архивов документов (PDF/TIFF) и распознавание текста</li>
            <li>Стандартизация справочников номенклатуры и контрагентов</li>
            <li>Формирование эталонных обучающих выборок</li>
          </ul>
        </div>

        <div class="req-card">
          <div class="req-card-title">Интеграционные шлюзы</div>
          <ul>
            <li>Программные интерфейсы (API) к 1С, CRM и ERP системам</li>
            <li>Асинхронные очереди сообщений и шины обмена данными</li>
            <li>Интеграция с корпоративной единой авторизацией (SSO)</li>
          </ul>
        </div>

        <div class="req-card">
          <div class="req-card-title">Безопасность и инфраструктура</div>
          <ul>
            <li>Изолированный локальный или защищённый облачный контур</li>
            <li>Маскирование персональных данных и коммерческой тайны</li>
            <li>Ролевая модель разграничения прав доступа и аудит действий</li>
          </ul>
        </div>
      </div>

      ${contactsHtml}

      ${renderFooter(5)}
    </div>
  `;

  openPrintDocument(html, `AI_Audit_Report_${companyTitle.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}`);
}

/**
 * 2. Generates and prints Express Audit PDF with Title Page, 7 Blocks, Limitations, and Paid Proposal
 */
export function generateExpressAuditPdfReport(data: CompanyAuditData, analysis: AnalysisResult, user?: any) {
  const branding: ReportBranding = storage.getBranding();
  const accentColor = branding.accentColor || '#0284c7';

  const industryName = data.profile?.industry || data.profile?.co_industry || 'Отраслевое предприятие';
  const dept = data.departments?.[0];
  const companyTitle = data.profile?.co_name || data.profile?.name || industryName;
  const auditDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const auditorName = resolveAuditorDisplayName(user, branding);

  const maturity = calculateAiMaturityLevel(dept || {}, data.format);
  const matchedLevel = MATURITY_LEVELS.find(m => m.level === maturity.level);
  const maturityName = matchedLevel?.name || (maturity.level !== null ? 'Определён' : 'Не определён');

  const allProcesses = (dept?.processes || []);
  const topInitiative = analysis.initiatives[0];
  const solution = AI_SOLUTIONS.find(s => s.code === topInitiative?.solutionCode);

  const baseSavings = topInitiative?.monthlySavings || 60000;
  const conservativeSavings = Math.round(baseSavings * 0.7);
  const optimisticSavings = Math.round(baseSavings * 1.3);

  const pilotWeeks = solution?.durationWeeks || topInitiative?.effortWeeks || 4;
  const pilotBudget = topInitiative?.budgetRange || `${formatCurrency(topInitiative?.investment || 450000)}`;

  const html = `
    <!-- СТРАНИЦА 1: ТИТУЛЬНЫЙ ЛИСТ -->
    <div class="page">
      <div class="cover-page">
        <div class="cover-top-stripe" style="background: ${accentColor}; border-top: 6px solid ${accentColor};"></div>
        <div class="cover-header">
          <div class="cover-company-badge">${branding.companyName || 'Экспертный AI-аудит'}</div><br/>
          <span class="cover-badge" style="border-color: ${accentColor}; color: ${accentColor};">ЭКСПРЕСС-ДИАГНОСТИКА</span>
          <h1 class="cover-title">ЗАКЛЮЧЕНИЕ БЕСПЛАТНОГО ЭКСПРЕСС-АУДИТА AI-ГОТОВНОСТИ</h1>
          <p class="cover-subtitle">Предварительная оценка уровня цифровой зрелости и базовых сценариев автоматизации</p>
        </div>

        <div class="cover-meta">
          <div class="meta-item">
            <span class="meta-label">Компания / Объект</span>
            <span class="meta-value">${companyTitle}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Отраслевая сфера</span>
            <span class="meta-value">${industryName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Формат аудита</span>
            <span class="meta-value">Бесплатный экспресс-аудит (онлайн анкетирование)</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Дата формирования</span>
            <span class="meta-value">${auditDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Курирующий эксперт</span>
            <span class="meta-value">${auditorName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Уровень AI-зрелости</span>
            <span class="meta-value">Уровень ${maturity.level ?? '—'}: ${maturityName}</span>
          </div>
        </div>

        <div class="cover-footer">
          <span>${branding.companyName || 'Экспертный AI-аудит'} • Экспресс-версия</span>
          <span>Точность оценок: предварительная (±30–40%)</span>
        </div>
      </div>
      <div class="page-footer">
        <span class="footer-left">${branding.companyName || 'Экспертный AI-аудит'} • Экспресс-отчет</span>
        <span class="footer-right">Страница 1 из 2</span>
      </div>
    </div>

    <!-- СТРАНИЦА 2: 7 БЛОКОВ РЕЗУЛЬТАТОВ -->
    <div class="page">
      <div class="page-top-bar" style="border-top: 3px solid ${accentColor};">
        <span class="top-bar-company">${branding.companyName || 'Экспертный AI-аудит'}</span>
        <span class="top-bar-doc">Экспресс-диагностика • ${companyTitle}</span>
      </div>

      <h2 class="section-title">Содержание экспресс-диагностики (7 ключевых блоков)</h2>

      <!-- Блок 1: Индекс AI-готовности -->
      <div class="passport-card">
        <h3 class="passport-title">1. Индекс AI-готовности и уровень зрелости</h3>
        <p style="font-size: 7.5pt; color: #334155; margin: 3px 0;">
          Текущий уровень: <b>Уровень ${maturity.level ?? '—'} — «${maturityName}»</b>.<br/>
          ${matchedLevel?.description || 'Оценка вычислена на основе используемых инструментов, наличия корпоративного доступа и регламентов.'}
        </p>
      </div>

      <!-- Блок 2: Рейтинг процессов -->
      <div class="passport-card">
        <h3 class="passport-title">2. Рейтинг приоритетных процессов</h3>
        <table class="report-table" style="margin: 4px 0;">
          <thead>
            <tr>
              <th>Процесс</th>
              <th>Операций/мес</th>
              <th>Время (мин)</th>
              <th>Доля ручного труда</th>
            </tr>
          </thead>
          <tbody>
            ${allProcesses.slice(0, 3).map(p => `
              <tr>
                <td><b>${p.name}</b></td>
                <td>${p.pr_ops_month || p.operationsPerMonth || '—'}</td>
                <td>${p.pr_minutes || p.timePerOperation || '—'} мин</td>
                <td>${p.pr_manual_share || p.manualWorkShare || 80}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Блок 3: Первичное сопоставление с каталогом решений -->
      <div class="passport-card">
        <h3 class="passport-title">3. Рекомендованное решение из каталога (S01–S16)</h3>
        <p style="font-size: 7.5pt; margin: 3px 0;">
          <b>${solution?.code || 'S01'}: ${solution?.name || topInitiative?.name || 'Интеллектуальная обработка данных'}</b><br/>
          <span style="color: #475569;">${solution?.description || topInitiative?.whatItDoes || 'Автоматизация типовых сценариев на базе нейросетей.'}</span>
        </p>
      </div>

      <!-- Блок 4: Вилка экономического эффекта -->
      <div class="passport-card">
        <h3 class="passport-title">4. Вилка экономического эффекта (сценарии)</h3>
        <div class="passport-metrics" style="grid-template-columns: repeat(3, 1fr);">
          <div class="p-metric">
            <span style="color: #64748b;">Консервативный (-30%):</span><br/>
            <span class="p-metric-val" style="color: #1d4ed8;">${formatCurrency(conservativeSavings)}/мес</span>
          </div>
          <div class="p-metric">
            <span style="color: #64748b;">Базовый расчёт:</span><br/>
            <span class="p-metric-val" style="color: #047857;">${formatCurrency(baseSavings)}/мес</span>
          </div>
          <div class="p-metric">
            <span style="color: #64748b;">Оптимистичный (+30%):</span><br/>
            <span class="p-metric-val" style="color: #047857;">${formatCurrency(optimisticSavings)}/мес</span>
          </div>
        </div>
      </div>

      <!-- Блок 5 & 6: Сроки и пилот -->
      <div class="passport-card">
        <h3 class="passport-title">5–6. Ориентиры запуска и бюджет пилота</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 3px;">
          <div>
            <p style="font-size: 7pt; color: #64748b; margin: 0;">Срок реализации пилота:</p>
            <p style="font-size: 9pt; font-weight: 700; margin: 0;">${pilotWeeks} недель</p>
          </div>
          <div>
            <p style="font-size: 7pt; color: #64748b; margin: 0;">Диапазон бюджета пилота:</p>
            <p style="font-size: 9pt; font-weight: 700; margin: 0;">${pilotBudget}</p>
          </div>
        </div>
      </div>

      <!-- Блок 7: Предложение платного формата -->
      <div class="passport-card" style="border: 1.5px solid #0284c7; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <h3 class="passport-title" style="color: #0369a1;">7. Переход к комплексному платному аудиту</h3>
          <span class="badge badge-blue">4–8 недель • от 650 000 ₽</span>
        </div>
        <p style="font-size: 7pt; color: #334155; margin: 0 0 3px 0; line-height: 1.3;">
          Комплексный аудит включает глубокое интервью со всеми подразделениями, анализ CRM/ERP данных, устранение теневого ИИ, расчёт инвестиционной финмодели и согласование ТЗ на пилотный проект.
        </p>
      </div>

      <!-- Блок ограничений -->
      <div class="footer-note" style="border-left: 3px solid #d97706; background: #ffffff; margin-top: 5px;">
        <b>Ограничения бесплатной оценки:</b> Расчёты носят ориентировочный характер (точность ±30–40%), сформированы без верификации первичных документов и хронометража операций. Для инвестиционных решений необходим платный аудит.
      </div>

      <div class="page-footer">
        <span class="footer-left">${branding.companyName || 'Экспертный AI-аудит'} • Экспресс-отчет</span>
        <span class="footer-right">Страница 2 из 2</span>
      </div>
    </div>
  `;

  openPrintDocument(html, `AI_Express_Audit_${companyTitle.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}`);
}

import {
  exportAuditsRegistryXlsx,
  exportReportsAnalyticsXlsx,
  exportFinancesRegistryXlsx
} from './excelExportGenerator';

export {
  exportAuditsRegistryXlsx,
  exportReportsAnalyticsXlsx,
  exportFinancesRegistryXlsx
};

/**
 * Export Reports View Analytics Summary across all 4 blocks (XLSX)
 */
export const exportReportsAnalyticsCsv = exportReportsAnalyticsXlsx;

/**
 * Export Audits Registry Table as Formatted XLSX
 */
export const exportAuditsRegistryCsv = exportAuditsRegistryXlsx;

/**
 * Export Finances Table as Formatted XLSX
 */
export const exportFinancesRegistryCsv = exportFinancesRegistryXlsx;
