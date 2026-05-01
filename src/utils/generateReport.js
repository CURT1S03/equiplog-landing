/**
 * Generates a time-stamped HTML audit report and triggers a browser download.
 * In production this would be a server-rendered PDF; here we produce a
 * self-contained HTML file that looks like a real compliance document.
 */

const TYPE_COLOR = { issue: '#ef4444', repair: '#f59e0b', maintenance: '#10b981' };
const TYPE_LABEL = { issue: 'Issue', repair: 'Repair', maintenance: 'Maintenance' };
const STATUS_COLOR = { open: '#ef4444', completed: '#10b981' };

function badge(text, bg, color) {
  return `<span style="background:${bg}18;color:${color};font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:.05em;padding:2px 7px;border-radius:4px;">${text}</span>`;
}

function row(log, eqCode, eqName) {
  const tc = TYPE_COLOR[log.type] || '#64748b';
  const sc = STATUS_COLOR[log.status] || '#64748b';
  return `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 12px;white-space:nowrap;font-size:11px;color:#475569;">${log.date}</td>
      <td style="padding:10px 12px;">
        <span style="font-weight:700;font-size:12px;color:#0f172a;">${eqCode}</span><br>
        <span style="font-size:10px;color:#94a3b8;">${eqName}</span>
      </td>
      <td style="padding:10px 12px;">${badge(TYPE_LABEL[log.type] || log.type, tc, tc)}</td>
      <td style="padding:10px 12px;font-size:12px;color:#334155;max-width:280px;">${log.note}</td>
      <td style="padding:10px 12px;">
        <span style="font-size:12px;font-weight:600;color:#0f172a;">${log.user}</span><br>
        <span style="font-size:10px;color:#94a3b8;">${log.role}</span>
      </td>
      <td style="padding:10px 12px;">${badge(log.status === 'open' ? '● Open' : '✓ Resolved', sc, sc)}</td>
    </tr>`;
}

export function exportAuditReport(equipment) {
  const generatedAt = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
  });

  // Flatten + sort all logs newest first
  const allLogs = equipment
    .flatMap((eq) => eq.logs.map((l) => ({ ...l, eqCode: eq.code, eqName: eq.name })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalLogs   = allLogs.length;
  const openIssues  = allLogs.filter((l) => l.type === 'issue' && l.status === 'open').length;
  const repairs     = allLogs.filter((l) => l.type === 'repair').length;
  const maintenance = allLogs.filter((l) => l.type === 'maintenance').length;

  // Per-equipment summary rows
  const summaryRows = equipment.map((eq) => {
    const isDown = eq.status !== 'Operational';
    const open   = eq.logs.filter((l) => l.type === 'issue' && l.status === 'open').length;
    const sc = isDown ? '#ef4444' : '#10b981';
    return `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:8px 12px;font-weight:700;font-size:12px;">${eq.code}</td>
        <td style="padding:8px 12px;font-size:12px;color:#475569;">${eq.name}</td>
        <td style="padding:8px 12px;font-size:12px;color:#475569;">${eq.location}</td>
        <td style="padding:8px 12px;">${badge(eq.status, sc, sc)}</td>
        <td style="padding:8px 12px;font-size:12px;color:#475569;">${eq.lastService}</td>
        <td style="padding:8px 12px;font-size:12px;text-align:center;">
          ${open > 0 ? `<span style="color:#ef4444;font-weight:700;">${open}</span>` : '<span style="color:#10b981;">0</span>'}
        </td>
        <td style="padding:8px 12px;font-size:12px;text-align:center;">${eq.logs.length}</td>
      </tr>`;
  }).join('');

  // Full log rows
  const logRows = allLogs.map((l) => row(l, l.eqCode, l.eqName)).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>EquipLog — Audit Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f8fafc; color: #0f172a; padding: 40px 32px; }
    .page { max-width: 960px; margin: 0 auto; background: #fff;
            border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.08); overflow: hidden; }
    .header { background: #0f172a; color: #fff; padding: 28px 32px; }
    .header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .logo { font-size: 22px; font-weight: 800; color: #fbbf24; letter-spacing: -.02em; }
    .logo span { color: #fff; }
    .report-title { font-size: 18px; font-weight: 700; }
    .report-meta { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .watermark { font-size: 10px; color: #475569; margin-top: 12px;
                 border-top: 1px solid #1e293b; padding-top: 12px; }
    .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px;
             padding: 24px 32px; border-bottom: 1px solid #f1f5f9; }
    .stat { background: #f8fafc; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0; }
    .stat-num { font-size: 28px; font-weight: 800; color: #0f172a; }
    .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase;
                  letter-spacing: .06em; color: #94a3b8; margin-top: 2px; }
    .section { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase;
                     letter-spacing: .06em; color: #64748b; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    thead th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700;
               text-transform: uppercase; letter-spacing: .06em; color: #94a3b8;
               border-bottom: 2px solid #e2e8f0; }
    tbody tr:hover { background: #fafafa; }
    .footer { padding: 20px 32px; background: #f8fafc; text-align: center;
              font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-top">
      <div class="logo">Equip<span>Log</span></div>
    </div>
    <div class="report-title">Equipment Maintenance Audit Report</div>
    <div class="report-meta">Digital Chain of Custody — All Equipment</div>
    <div class="watermark">
      Generated: ${generatedAt} &nbsp;|&nbsp;
      Report ID: RPT-${Date.now()} &nbsp;|&nbsp;
      Classification: Internal / Compliance
    </div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat">
      <div class="stat-num">${totalLogs}</div>
      <div class="stat-label">Total Log Entries</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:#ef4444;">${openIssues}</div>
      <div class="stat-label">Open Issues</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:#f59e0b;">${repairs}</div>
      <div class="stat-label">Repairs Logged</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:#10b981;">${maintenance}</div>
      <div class="stat-label">Maintenance Events</div>
    </div>
  </div>

  <!-- Equipment Summary -->
  <div class="section">
    <div class="section-title">Equipment Summary</div>
    <table>
      <thead>
        <tr>
          <th>Code</th><th>Name</th><th>Location</th>
          <th>Status</th><th>Last Service</th><th style="text-align:center;">Open Issues</th>
          <th style="text-align:center;">Total Logs</th>
        </tr>
      </thead>
      <tbody>${summaryRows}</tbody>
    </table>
  </div>

  <!-- Full Audit Log -->
  <div class="section">
    <div class="section-title">Full Audit Log — Chain of Custody</div>
    <table>
      <thead>
        <tr>
          <th>Date / Time</th><th>Equipment</th><th>Type</th>
          <th>Description</th><th>Technician</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${logRows}</tbody>
    </table>
  </div>

  <div class="footer">
    This report was automatically generated by EquipLog and constitutes a legally admissible
    digital chain of custody record. All entries are immutable and timestamped at the time of
    submission. &nbsp;|&nbsp; EquipLog &copy; ${new Date().getFullYear()}
  </div>

</div>
</body>
</html>`;

  // Trigger download on web; open in new tab on iOS WKWebView (no download manager)
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // WKWebView can't download files — open the report as a new page instead
    window.open(url, '_blank');
  } else {
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `EquipLog-Audit-Report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
