import XLSX from 'xlsx-js-style';
import { Audit, FinanceRecord } from '../types';

/**
 * Common Cell Styles & Palettes
 */
const BORDER_THIN = {
  top: { style: 'thin', color: { rgb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } }
};

interface FormattedSheetOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  data: any[][];
  colWidths: number[];
  rowCustomStyles?: Record<number, Record<number, { fill?: { fgColor: { rgb: string } }; font?: any; align?: string }>>;
}

/**
 * Helper to build a polished, styled worksheet with header, subtitle, table header, freeze pane, and formatting
 */
function buildFormattedSheet({
  title,
  subtitle,
  headers,
  data,
  colWidths,
  rowCustomStyles
}: FormattedSheetOptions): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const maxCol = headers.length - 1;
  const totalRows = 3 + data.length;

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(totalRows - 1, 2), c: maxCol } });
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: maxCol } }
  ];
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  ws['!freeze'] = { xSplit: 0, ySplit: 3, topLeftCell: 'A4', activePane: 'bottomLeft', state: 'frozen' };
  ws['!views'] = [{ state: 'frozen', ySplit: 3 }];

  // Row 0: Title - Dark Blue background, bold white text
  ws['A1'] = {
    v: title,
    t: 's',
    s: {
      fill: { fgColor: { rgb: '1E3A8A' } },
      font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };

  // Row 1: Subtitle - Gray italic text
  ws['A2'] = {
    v: subtitle || (`Дата выгрузки: ${new Date().toLocaleString('ru-RU')}`),
    t: 's',
    s: {
      font: { name: 'Calibri', sz: 9, italic: true, color: { rgb: '64748B' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  };

  // Row 2: Table Headers - Light Gray background, bold dark text, borders
  headers.forEach((h, c) => {
    const ref = XLSX.utils.encode_cell({ r: 2, c });
    ws[ref] = {
      v: h,
      t: 's',
      s: {
        fill: { fgColor: { rgb: 'E2E8F0' } },
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
        border: BORDER_THIN,
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      }
    };
  });

  // Data Rows with alternating backgrounds & custom styles
  data.forEach((row, rIdx) => {
    const rowNum = 3 + rIdx;
    const isOdd = rIdx % 2 === 1;
    const defaultFill = isOdd ? { fgColor: { rgb: 'F8FAFC' } } : { fgColor: { rgb: 'FFFFFF' } };

    row.forEach((cellVal, cIdx) => {
      const ref = XLSX.utils.encode_cell({ r: rowNum, c: cIdx });
      let v = cellVal;
      let t: XLSX.ExcelDataType = 's';
      let numFmt: string | undefined = undefined;
      let align = 'left';

      if (typeof cellVal === 'number') {
        t = 'n';
        align = 'right';
      } else if (cellVal && typeof cellVal === 'object' && 'v' in cellVal) {
        v = cellVal.v;
        t = (cellVal.t as XLSX.ExcelDataType) || (typeof v === 'number' ? 'n' : 's');
        numFmt = cellVal.numFmt;
        align = cellVal.align || (t === 'n' ? 'right' : 'left');
      }

      let cellFill = defaultFill;
      let cellFont = { name: 'Calibri', sz: 10, color: { rgb: '1E293B' }, bold: false, italic: false };

      if (rowCustomStyles && rowCustomStyles[rIdx] && rowCustomStyles[rIdx][cIdx]) {
        const custom = rowCustomStyles[rIdx][cIdx];
        if (custom.fill) cellFill = custom.fill;
        if (custom.font) cellFont = { ...cellFont, ...custom.font };
        if (custom.align) align = custom.align;
      }

      ws[ref] = {
        v,
        t,
        s: {
          fill: cellFill,
          font: cellFont,
          border: BORDER_THIN,
          alignment: { horizontal: align, vertical: 'center' },
          numFmt
        }
      };
    });
  });

  return ws;
}

/**
 * Triggers native browser download of XLSX Workbook
 */
function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
 * 1. Export Audits Registry as Formatted XLSX
 */
export function exportAuditsRegistryXlsx(audits: Audit[]) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Номер',
    'Название проекта',
    'Формат',
    'Статус',
    'Балл AI-зрелости',
    'Сумма договора',
    'Дата создания',
    'Исполнитель'
  ];

  const colWidths = [14, 42, 16, 16, 18, 20, 16, 26];

  const statusColorMap: Record<string, { bg: string; text: string }> = {
    'черновик': { bg: 'F1F5F9', text: '475569' },
    'в работе': { bg: 'DBEAFE', text: '1D4ED8' },
    'завершён': { bg: 'DCFCE7', text: '15803D' },
    'согласован': { bg: 'FFEDD5', text: 'C2410C' },
    'оплачен': { bg: 'F3E8FF', text: '7E22CE' }
  };

  const rowCustomStyles: Record<number, Record<number, any>> = {};

  const tableData = audits.map((a, idx) => {
    const isExpress = a.companyData?.format === 'express';
    const formatLabel = isExpress ? 'Экспресс' : 'Платный';
    const statusLabel = a.status || 'черновик';

    // Format badge styling (Col 2)
    const formatStyle = isExpress
      ? { fill: { fgColor: { rgb: 'E0F2FE' } }, font: { bold: true, color: { rgb: '0369A1' } }, align: 'center' }
      : { fill: { fgColor: { rgb: 'EDE9FE' } }, font: { bold: true, color: { rgb: '6D28D9' } }, align: 'center' };

    // Status badge styling (Col 3)
    const statColors = statusColorMap[statusLabel] || { bg: 'F1F5F9', text: '475569' };
    const statusStyle = {
      fill: { fgColor: { rgb: statColors.bg } },
      font: { bold: true, color: { rgb: statColors.text } },
      align: 'center'
    };

    rowCustomStyles[idx] = {
      0: { align: 'center', font: { bold: true } },
      2: formatStyle,
      3: statusStyle,
      4: { align: 'center' },
      6: { align: 'center' }
    };

    return [
      a.number,
      a.projectName,
      formatLabel,
      statusLabel,
      { v: a.totalScore, t: 'n', numFmt: '0.0', align: 'center' },
      { v: a.amount, t: 'n', numFmt: '#,##0 "₽"', align: 'right' },
      new Date(a.createdAt).toLocaleDateString('ru-RU'),
      a.analyst || '—'
    ];
  });

  const ws = buildFormattedSheet({
    title: 'РЕЕСТР АУДИТОВ AI-ТРАНСФОРМАЦИИ',
    subtitle: `Дата выгрузки: ${new Date().toLocaleString('ru-RU')} • Всего аудитов: ${audits.length}`,
    headers,
    data: tableData,
    colWidths,
    rowCustomStyles
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Реестр аудитов');
  downloadWorkbook(wb, `audits_registry_${Date.now()}.xlsx`);
}

/**
 * 2. Export Reports and Analytics as Formatted Multi-Sheet XLSX (4 Sheets)
 */
export function exportReportsAnalyticsXlsx(stats: {
  statusDistribution?: { label: string; count: number; share: number }[];
  wizardStepsDistribution?: { id: number; title: string; shortTitle: string; count: number; share: number }[];
  topSolutions?: { code: string; name: string; description?: string; auditsCount: number }[];
  maturityDistribution?: { level: number; name: string; desc?: string; count: number; share: number }[];
}) {
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // ЛИСТ 1: Статусы аудитов
  // -------------------------------------------------------------
  const statusColorMap: Record<string, { bg: string; text: string }> = {
    'черновик': { bg: 'F1F5F9', text: '475569' },
    'в работе': { bg: 'DBEAFE', text: '1D4ED8' },
    'завершён': { bg: 'DCFCE7', text: '15803D' },
    'согласован': { bg: 'FFEDD5', text: 'C2410C' },
    'оплачен': { bg: 'F3E8FF', text: '7E22CE' }
  };

  const statusCustomStyles: Record<number, Record<number, any>> = {};
  const statusRows = (stats.statusDistribution || []).map((s, idx) => {
    const sc = statusColorMap[s.label];
    if (sc) {
      statusCustomStyles[idx] = {
        0: { fill: { fgColor: { rgb: sc.bg } }, font: { bold: true, color: { rgb: sc.text } }, align: 'center' }
      };
    }
    return [
      s.label,
      { v: s.count, t: 'n', numFmt: '#,##0', align: 'right' },
      { v: s.share / 100, t: 'n', numFmt: '0.0%', align: 'right' }
    ];
  });

  const wsStatus = buildFormattedSheet({
    title: 'РАСПРЕДЕЛЕНИЕ АУДИТОВ ПО СТАТУСАМ',
    headers: ['Статус', 'Количество аудитов', 'Доля'],
    data: statusRows,
    colWidths: [22, 24, 18],
    rowCustomStyles: statusCustomStyles
  });
  XLSX.utils.book_append_sheet(wb, wsStatus, 'Статусы аудитов');

  // -------------------------------------------------------------
  // ЛИСТ 2: Воронка шагов (Где останавливаются клиенты)
  // -------------------------------------------------------------
  const stepRows = (stats.wizardStepsDistribution || [
    { id: 1, title: 'Выбор формата', shortTitle: 'Формат', count: 0, share: 0 },
    { id: 2, title: 'Профиль компании', shortTitle: 'Профиль', count: 0, share: 0 },
    { id: 3, title: 'Периметр аудита', shortTitle: 'Периметр', count: 0, share: 0 },
    { id: 4, title: 'Сбор данных', shortTitle: 'Сбор данных', count: 0, share: 0 },
    { id: 5, title: 'Сводка и запуск', shortTitle: 'Сводка', count: 0, share: 0 }
  ]).map(step => [
    { v: step.id, t: 'n', align: 'center' },
    step.title,
    { v: step.count, t: 'n', numFmt: '#,##0', align: 'right' },
    { v: step.share / 100, t: 'n', numFmt: '0.0%', align: 'right' }
  ]);

  const wsSteps = buildFormattedSheet({
    title: 'ВОРОНКА НЕЗАВЕРШЁННЫХ АУДИТОВ ПО ЭТАПАМ ВИЗАРДА',
    headers: ['Шаг', 'Название этапа', 'Незавершённых аудитов', 'Доля от незавершённых'],
    data: stepRows,
    colWidths: [10, 32, 24, 24]
  });
  XLSX.utils.book_append_sheet(wb, wsSteps, 'Воронка шагов');

  // -------------------------------------------------------------
  // ЛИСТ 3: Востребованные решения (S01–S16)
  // -------------------------------------------------------------
  const solutionCustomStyles: Record<number, Record<number, any>> = {};
  const solRows = (stats.topSolutions || []).map((sol, idx) => {
    solutionCustomStyles[idx] = {
      0: { align: 'center', font: { bold: true, color: { rgb: '2563EB' } } }
    };
    return [
      sol.code,
      sol.name,
      sol.description || '—',
      { v: sol.auditsCount, t: 'n', numFmt: '#,##0', align: 'right' }
    ];
  });

  const wsSolutions = buildFormattedSheet({
    title: 'РЕЙТИНГ ВОСТРЕБОВАННОСТИ AI-РЕШЕНИЙ (S01–S16)',
    headers: ['Код', 'Название AI-решения', 'Описание технологии', 'Встречается в отчётах (аудитов)'],
    data: solRows,
    colWidths: [10, 38, 55, 32],
    rowCustomStyles: solutionCustomStyles
  });
  XLSX.utils.book_append_sheet(wb, wsSolutions, 'Востребованные решения');

  // -------------------------------------------------------------
  // ЛИСТ 4: Уровни зрелости (с красной заливкой для уровня 1 «Теневой»)
  // -------------------------------------------------------------
  const maturityCustomStyles: Record<number, Record<number, any>> = {};
  const maturityRows = (stats.maturityDistribution || []).map((m, idx) => {
    // Check if level 1 "Теневой"
    if (m.level === 1 || m.name.toLowerCase().includes('теневой')) {
      const redStyle = {
        fill: { fgColor: { rgb: 'FEE2E2' } },
        font: { bold: true, color: { rgb: '991B1B' } }
      };
      maturityCustomStyles[idx] = {
        0: { ...redStyle, align: 'center' },
        1: redStyle,
        2: redStyle,
        3: { ...redStyle, align: 'right' },
        4: { ...redStyle, align: 'right' }
      };
    } else {
      maturityCustomStyles[idx] = {
        0: { align: 'center', font: { bold: true } }
      };
    }

    return [
      { v: m.level, t: 'n', align: 'center' },
      m.name,
      m.desc || '—',
      { v: m.count, t: 'n', numFmt: '#,##0', align: 'right' },
      { v: m.share / 100, t: 'n', numFmt: '0.0%', align: 'right' }
    ];
  });

  const wsMaturity = buildFormattedSheet({
    title: 'РАСПРЕДЕЛЕНИЕ ПО УРОВНЯМ AI-ЗРЕЛОСТИ',
    headers: ['Уровень', 'Наименование уровня', 'Характеристика уровня', 'Количество подразделений', 'Доля'],
    data: maturityRows,
    colWidths: [12, 26, 45, 26, 18],
    rowCustomStyles: maturityCustomStyles
  });
  XLSX.utils.book_append_sheet(wb, wsMaturity, 'Уровни зрелости');

  downloadWorkbook(wb, `ai_reports_analytics_${Date.now()}.xlsx`);
}

/**
 * 3. Export Finances Registry Table as Formatted XLSX
 */
export function exportFinancesRegistryXlsx(finances: FinanceRecord[], clients?: any[]) {
  const wb = XLSX.utils.book_new();

  const headers = ['Дата', 'Клиент', 'Сумма (₽)', 'Тип операции', 'Статус оплаты', 'Услуга / Назначение'];
  const colWidths = [16, 32, 20, 18, 18, 36];

  const payStatusColors: Record<string, { bg: string; text: string }> = {
    'оплачен': { bg: 'DCFCE7', text: '15803D' },
    'выставлен': { bg: 'DBEAFE', text: '1D4ED8' },
    'просрочен': { bg: 'FEE2E2', text: '991B1B' },
    'отменён': { bg: 'F1F5F9', text: '475569' }
  };

  const rowCustomStyles: Record<number, Record<number, any>> = {};

  const tableData = finances.map((f, idx) => {
    const clientName = clients?.find(c => c.id === f.clientId)?.name || f.clientId || '—';
    const statusCol = payStatusColors[f.payStatus] || { bg: 'F1F5F9', text: '475569' };

    rowCustomStyles[idx] = {
      0: { align: 'center' },
      3: { align: 'center' },
      4: {
        fill: { fgColor: { rgb: statusCol.bg } },
        font: { bold: true, color: { rgb: statusCol.text } },
        align: 'center'
      }
    };

    return [
      new Date(f.date).toLocaleDateString('ru-RU'),
      clientName,
      { v: f.amount, t: 'n', numFmt: '#,##0 "₽"', align: 'right' },
      f.type,
      f.payStatus,
      f.service
    ];
  });

  const ws = buildFormattedSheet({
    title: 'РЕЕСТР ФИНАНСОВ И ПЛАТЕЖЕЙ',
    subtitle: `Дата выгрузки: ${new Date().toLocaleString('ru-RU')} • Записей: ${finances.length}`,
    headers,
    data: tableData,
    colWidths,
    rowCustomStyles
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Реестр финансов');
  downloadWorkbook(wb, `finances_registry_${Date.now()}.xlsx`);
}
