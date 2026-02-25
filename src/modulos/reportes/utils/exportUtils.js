// src/modulos/reportes/utils/exportUtils.js

export function toCSV(rows, headers = null) {
  if (!rows || rows.length === 0) return '';

  const headerKeys = headers || Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const head = headerKeys.map(esc).join(',');
  const body = rows.map((row) => headerKeys.map((k) => esc(row[k])).join(',')).join('\n');
  return `${head}\n${body}`;
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportXLSX(filename, sheets) {
  // sheets: { name: string, rows: array<object> }[]
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  (sheets || []).forEach(({ name, rows }) => {
    const ws = XLSX.utils.json_to_sheet(rows || []);
    XLSX.utils.book_append_sheet(wb, ws, (name || 'Hoja').slice(0, 31));
  });
  XLSX.writeFile(wb, filename);
}


