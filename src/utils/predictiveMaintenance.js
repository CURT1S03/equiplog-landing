/**
 * Predictive Maintenance Heuristic Engine
 *
 * Simulates what a production AI/ML model would surface by running rule-based
 * analysis over an equipment's log history. In a real backend this logic runs
 * as a scheduled job and stores results in a `predictions` table. Here it runs
 * client-side on the fly so the demo works without a backend.
 *
 * Rules
 * ──────────────────────────────────────────────────────────────────────────────
 * 1.  Recurring Component Failure  — same component in 3+ logs / 90 days
 * 2.  High Issue Frequency         — 2+ issues within 30 days
 * 3.  Aging Open Issue             — issue unresolved > 7 days
 * 4.  Overdue Maintenance          — last service > 45 days ago
 * 5.  Next Maintenance Prediction  — projected date from avg service interval
 * 6.  Downtime Cost Estimate       — est. productivity loss while status = Down
 * 7.  MTBF Reliability Score       — mean time between failures rating
 * 8.  Unresolved Issue Backlog     — open issues with no corresponding repair log
 * 9.  Activity Spike Detection     — recent log rate vs. historical baseline
 * 10. Repair Escalation Risk       — issue was repaired but re-opened within 14 days
 */

const NOW = new Date('2026-05-01T00:00:00');
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Estimated daily revenue loss per machine type (keyed by code prefix)
const DOWNTIME_COST_PER_DAY = {
  LATHE:  900,
  MILL:   1100,
  PRESS:  800,
  WELD:   600,
  DRILL:  500,
  SAW:    450,
  DEFAULT: 750,
};

// Recommended actions per component keyword
const COMPONENT_ACTIONS = {
  'drive belt':      'Inspect tensioner pulley alignment and replace full belt assembly — do not patch.',
  'ball screw':      'Check lubrication lines and backlash. Consider full ball screw replacement if backlash exceeds 0.02mm.',
  'hydraulic line':  'Pressure-test all fittings. Replace the full line set rather than patching — patch repairs fail under cyclic load.',
  'spindle bearing': 'Perform vibration analysis. Replace bearing pair together; mismatched bearings accelerate wear.',
  'hydraulic':       'Inspect all seals, O-rings, and fluid level. Flush and replace fluid if contaminated.',
  'bearing':         'Inspect for pitting and race damage. Lubricate or replace; check shaft runout.',
  'spindle':         'Run runout test. If > 0.005mm, spindle rebuild required.',
  'coolant':         'Flush and replace coolant. Inspect pump impeller and nozzle orifices for blockage.',
  'filter':          'Replace filter element. Check upstream for metal swarf indicating component wear.',
  'chuck':           'Inspect jaw serrations and scroll mechanism. Regrind or replace chuck body.',
  'blade':           'Check blade tension, tracking, and guide bearings. Replace blade if set is worn.',
  'guard':           'Replace immediately — damaged guards are an OSHA violation and must be resolved before operation.',
  'gauge':           'Recalibrate against a known reference. Replace if drift exceeds ±2%.',
  'seal':            'Replace seal kit. Inspect mating surfaces for scoring before reassembly.',
  'belt':            'Check tension, alignment, and pulley condition. Replace belt if cracking or glazing present.',
};

// Ordered longest-first so "drive belt" matches before "belt"
const COMPONENT_KEYWORDS = Object.keys(COMPONENT_ACTIONS).sort((a, b) => b.length - a.length);

function daysSince(isoTimestamp) {
  return (NOW - new Date(isoTimestamp)) / MS_PER_DAY;
}

function extractComponents(note) {
  const lower = note.toLowerCase();
  const matched = [];
  for (const kw of COMPONENT_KEYWORDS) {
    if (lower.includes(kw)) {
      const alreadyCovered = matched.some((m) => m.includes(kw));
      if (!alreadyCovered) matched.push(kw);
    }
  }
  return matched;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmt(n) {
  return n.toLocaleString('en-US');
}

function costPerDay(equipmentCode) {
  const prefix = (equipmentCode || '').split('-')[0].toUpperCase();
  return DOWNTIME_COST_PER_DAY[prefix] ?? DOWNTIME_COST_PER_DAY.DEFAULT;
}

/**
 * @param {object} equipment  A single equipment object from the data store
 * @returns {Array<{level:'warning'|'info'|'critical', rule:string, title:string, message:string, action?:string}>}
 */
export function getAlerts(equipment) {
  if (!equipment?.logs?.length) return [];

  const alerts = [];
  const logs   = equipment.logs;

  // ── Rule 1: Recurring component failure ─────────────────────────────────────
  const recent90 = logs.filter((l) => daysSince(l.timestamp) <= 90);
  const kwCounts = {};
  for (const log of recent90) {
    for (const kw of extractComponents(log.note)) {
      kwCounts[kw] = (kwCounts[kw] || 0) + 1;
    }
  }
  const sortedEntries = Object.entries(kwCounts).sort(([a], [b]) => b.length - a.length);
  const reported = new Set();
  for (const [kw, count] of sortedEntries) {
    if (count < 3) continue;
    const alreadyCovered = [...reported].some((r) => r.includes(kw));
    if (!alreadyCovered) {
      reported.add(kw);
      alerts.push({
        level: 'warning',
        rule: 'recurring',
        title: 'Recurring Component Failure',
        message: `"${capitalize(kw)}" has failed ${count} times in 90 days — this is a pattern, not a one-off.`,
        action: COMPONENT_ACTIONS[kw] ?? 'Schedule a root-cause inspection before the next failure.',
      });
    }
  }

  // ── Rule 2: High issue frequency ─────────────────────────────────────────────
  const recentIssues = logs.filter((l) => l.type === 'issue' && daysSince(l.timestamp) <= 30);
  if (recentIssues.length >= 2) {
    alerts.push({
      level: 'warning',
      rule: 'frequency',
      title: 'High Issue Frequency',
      message: `${recentIssues.length} issues logged in the last 30 days — above the normal threshold of 1.`,
      action: 'Schedule a full inspection to identify the root cause rather than patching individual symptoms.',
    });
  }

  // ── Rule 3: Aging open issue ──────────────────────────────────────────────────
  const agingIssues = logs.filter(
    (l) => l.type === 'issue' && l.status === 'open' && daysSince(l.timestamp) > 7,
  );
  if (agingIssues.length > 0) {
    const oldest = Math.round(Math.max(...agingIssues.map((l) => daysSince(l.timestamp))));
    alerts.push({
      level: 'warning',
      rule: 'aging',
      title: 'Unresolved Issue — Aging',
      message: `Oldest open issue is ${oldest} day${oldest !== 1 ? 's' : ''} old with no repair logged.`,
      action: 'Assign to a technician today. Issues open >7 days create OSHA documentation gaps.',
    });
  }

  // ── Rule 4: Overdue maintenance ───────────────────────────────────────────────
  if (equipment.lastService) {
    const lastServiceDate = new Date(equipment.lastService);
    if (!isNaN(lastServiceDate)) {
      const daysAgo = Math.round((NOW - lastServiceDate) / MS_PER_DAY);
      if (daysAgo > 45) {
        alerts.push({
          level: 'info',
          rule: 'overdue',
          title: 'Routine Maintenance Overdue',
          message: `Last service was ${daysAgo} days ago. Standard interval is 30–45 days.`,
          action: 'Book a maintenance window within the next 7 days to avoid warranty or safety compliance issues.',
        });
      }
    }
  }

  // ── Rule 5: Next maintenance prediction ──────────────────────────────────────
  const maintenanceLogs = logs
    .filter((l) => l.type === 'maintenance' && l.status === 'completed' && l.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (maintenanceLogs.length >= 2) {
    const intervals = [];
    for (let i = 1; i < maintenanceLogs.length; i++) {
      intervals.push(
        (new Date(maintenanceLogs[i].timestamp) - new Date(maintenanceLogs[i - 1].timestamp)) / MS_PER_DAY,
      );
    }
    const avgInterval  = Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length);
    const lastMaintDate = new Date(maintenanceLogs[maintenanceLogs.length - 1].timestamp);
    const nextDate      = new Date(lastMaintDate.getTime() + avgInterval * MS_PER_DAY);
    const daysUntil     = Math.round((nextDate - NOW) / MS_PER_DAY);

    let level, message, action;
    if (daysUntil < 0) {
      level   = 'warning';
      message = `Predicted maintenance was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago (${formatDate(nextDate)}) based on a ${avgInterval}-day avg interval.`;
      action  = 'Schedule immediately. Overdue maintenance increases failure risk exponentially.';
    } else if (daysUntil <= 7) {
      level   = 'warning';
      message = `Next maintenance predicted in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} — ${formatDate(nextDate)} (${avgInterval}-day avg interval).`;
      action  = 'Plan the maintenance window now to avoid an unplanned stoppage.';
    } else {
      level   = 'info';
      message = `Next maintenance projected for ${formatDate(nextDate)} — in ${daysUntil} days (${avgInterval}-day avg interval).`;
      action  = 'No action needed. Reassess if new issues are logged before this date.';
    }
    alerts.push({ level, rule: 'next-service', title: 'Next Maintenance Predicted', message, action });
  }

  // ── Rule 6: Downtime cost estimate ────────────────────────────────────────────
  const isDown = equipment.status !== 'Operational';
  if (isDown) {
    // Find when the machine first went down (earliest open issue)
    const openIssues = logs
      .filter((l) => l.type === 'issue' && l.status === 'open')
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (openIssues.length > 0) {
      const downSince  = daysSince(openIssues[0].timestamp);
      const daysDown   = Math.max(1, Math.round(downSince));
      const daily      = costPerDay(equipment.code);
      const totalCost  = daysDown * daily;
      alerts.push({
        level: 'critical',
        rule: 'downtime-cost',
        title: 'Estimated Downtime Cost',
        message: `Machine down ~${daysDown} day${daysDown !== 1 ? 's' : ''}. Est. productivity loss: $${fmt(totalCost)} at $${fmt(daily)}/day.`,
        action: 'Prioritize repair scheduling. Every additional day costs the shop another $' + fmt(daily) + '.',
      });
    }
  }

  // ── Rule 7: MTBF reliability score ───────────────────────────────────────────
  const allIssues = logs
    .filter((l) => l.type === 'issue' && l.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (allIssues.length >= 2) {
    const issueIntervals = [];
    for (let i = 1; i < allIssues.length; i++) {
      issueIntervals.push(
        (new Date(allIssues[i].timestamp) - new Date(allIssues[i - 1].timestamp)) / MS_PER_DAY,
      );
    }
    const mtbf = Math.round(issueIntervals.reduce((s, v) => s + v, 0) / issueIntervals.length);
    let rating, ratingColor, action;
    if (mtbf >= 60)      { rating = 'Excellent'; ratingColor = '🟢'; action = 'Keep current maintenance schedule.'; }
    else if (mtbf >= 30) { rating = 'Good';      ratingColor = '🟡'; action = 'Monitor closely. Tighten service intervals if issues increase.'; }
    else if (mtbf >= 14) { rating = 'Fair';      ratingColor = '🟠'; action = 'Increase inspection frequency. Review recent repair quality.'; }
    else                 { rating = 'Poor';       ratingColor = '🔴'; action = 'Escalate to management. Consider overhaul or equipment replacement evaluation.'; }
    alerts.push({
      level: mtbf < 30 ? 'warning' : 'info',
      rule: 'mtbf',
      title: 'Reliability Score (MTBF)',
      message: `${ratingColor} ${rating} — avg ${mtbf} days between failures across ${allIssues.length} recorded incidents.`,
      action,
    });
  }

  // ── Rule 8: Unresolved issue backlog ─────────────────────────────────────────
  // Open issues that have no repair log filed after them
  const openWithNoRepair = logs.filter((l) => {
    if (l.type !== 'issue' || l.status !== 'open') return false;
    const issueTime = new Date(l.timestamp);
    return !logs.some(
      (r) => r.type === 'repair' && new Date(r.timestamp) > issueTime,
    );
  });
  if (openWithNoRepair.length >= 2) {
    alerts.push({
      level: 'warning',
      rule: 'backlog',
      title: 'Repair Backlog Detected',
      message: `${openWithNoRepair.length} open issues have no repair work logged against them.`,
      action: 'Create repair assignments for each open issue. Unmatched issue/repair pairs fail OSHA audit checks.',
    });
  }

  // ── Rule 9: Activity spike detection ─────────────────────────────────────────
  const last7  = logs.filter((l) => daysSince(l.timestamp) <= 7).length;
  const prev21 = logs.filter((l) => {
    const d = daysSince(l.timestamp);
    return d > 7 && d <= 28;
  }).length;
  // Normalise prev21 to a 7-day rate
  const baselineRate = prev21 / 3;
  if (baselineRate > 0 && last7 >= 3 && last7 >= baselineRate * 2.5) {
    const multiple = (last7 / baselineRate).toFixed(1);
    alerts.push({
      level: 'warning',
      rule: 'spike',
      title: 'Unusual Activity Spike',
      message: `${last7} log entries in the last 7 days — ${multiple}× above the recent baseline of ${baselineRate.toFixed(1)}/week.`,
      action: 'Investigate whether a single underlying failure is generating multiple symptoms.',
    });
  }

  // ── Rule 10: Repair escalation risk ──────────────────────────────────────────
  // A repair was logged but a new issue appeared within 14 days — repair may have been ineffective
  const repairs = logs.filter((l) => l.type === 'repair' && l.timestamp);
  for (const repair of repairs) {
    const repairTime = new Date(repair.timestamp);
    const reOpenedIssue = logs.find(
      (l) =>
        l.type === 'issue' &&
        new Date(l.timestamp) > repairTime &&
        (new Date(l.timestamp) - repairTime) / MS_PER_DAY <= 14,
    );
    if (reOpenedIssue) {
      alerts.push({
        level: 'warning',
        rule: 'escalation',
        title: 'Repair May Be Ineffective',
        message: `A new issue was reported just ${Math.round((new Date(reOpenedIssue.timestamp) - repairTime) / MS_PER_DAY)} day(s) after a repair was logged — possible incomplete fix.`,
        action: 'Review the repair log for "${repair.note}". A root-cause fix rather than a patch may be required.',
      });
      break; // one alert per equipment is enough
    }
  }

  return alerts;
}

