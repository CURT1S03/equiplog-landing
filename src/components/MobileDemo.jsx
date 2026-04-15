import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  QrCode,
  History,
  UserCheck,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Camera,
  Search,
  ChevronLeft,
  Clock,
  Shield,
  FileText,
  X,
  LogOut,
  MapPin,
  ChevronRight,
  Download,
  Image,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Html5Qrcode } from 'html5-qrcode';
import { USERS, createInitialEquipment } from '../data/mockData';
import { usePersistedState } from '../hooks/usePersistedState';

const isNative = Capacitor.isNativePlatform();

const MobileDemo = ({ native = false }) => {
  const fullscreen = native || isNative;

  // ── Auth ──
  const [currentUser, setCurrentUser] = usePersistedState('equiplog-user', null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // ── Navigation ──
  const [screen, setScreen] = useState(() => (currentUser ? 'home' : 'login'));
  const [navStack, setNavStack] = useState([]);

  // ── Data ──
  const [equipment, setEquipment] = usePersistedState('equiplog-equipment', createInitialEquipment);
  const [selectedId, setSelectedId] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');

  // ── QR scanner ref ──
  const qrScannerRef = useRef(null);
  const qrContainerRef = useRef(null);

  // ── Report state ──
  const [issueNote, setIssueNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [markDown, setMarkDown] = useState(true);
  const photoRef = useRef(null);

  // ── History filter ──
  const [historyFilter, setHistoryFilter] = useState('all');

  // ── Toast ──
  const [toast, setToast] = useState('');

  const selected = equipment.find((e) => e.id === selectedId);

  // Role helpers
  const isOperator = currentUser?.role === 'Operator';
  const isTechnician = currentUser?.role === 'Technician';
  const isManager = currentUser?.role === 'Floor Manager';
  const canResolve = isTechnician || isManager;
  const canAudit = isManager;

  // Count open issues across all equipment
  const openIssueCount = equipment.reduce(
    (n, eq) => n + eq.logs.filter((l) => l.type === 'issue' && l.status === 'open').length,
    0,
  );

  /* ───────── helpers ───────── */

  const navigate = (to) => {
    setNavStack((s) => [...s, screen]);
    setScreen(to);
  };

  const goBack = () => {
    const prev = navStack[navStack.length - 1] || 'home';
    setNavStack((s) => s.slice(0, -1));
    setScreen(prev);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const logTypeColor = (type) => {
    if (type === 'issue') return '#ef4444';
    if (type === 'repair') return '#f59e0b';
    return '#10b981';
  };

  const logTypeLabel = (type) => {
    if (type === 'issue') return 'Issue';
    if (type === 'repair') return 'Repair';
    return 'Maintenance';
  };

  /* ───────── handlers ───────── */

  const handlePinDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setPinError(false);
    if (next.length === 4) {
      const user = USERS[next];
      if (user) {
        setCurrentUser(user);
        setScreen('home');
        setNavStack([]);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 600);
      }
    }
  };

  const handlePinDelete = () => {
    setPin((p) => p.slice(0, -1));
    setPinError(false);
  };

  const stopQrScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch(() => {});
      qrScannerRef.current = null;
    }
  }, []);

  const handleQrResult = useCallback((decodedText) => {
    stopQrScanner();
    const code = decodedText.trim().toUpperCase();
    const eq = equipment.find((e) => e.code.toUpperCase() === code);
    if (eq) {
      setSelectedId(eq.id);
      setScreen('profile');
    } else {
      // If QR text doesn't match an equipment code, pick a random one as fallback
      const fallback = equipment[Math.floor(Math.random() * equipment.length)];
      setSelectedId(fallback.id);
      setScreen('profile');
      showToast(`QR: "${code}" — showing closest match`);
    }
  }, [equipment, stopQrScanner]);

  const startQrScanner = useCallback(() => {
    if (!qrContainerRef.current) return;
    const html5Qr = new Html5Qrcode('qr-reader');
    qrScannerRef.current = html5Qr;
    html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      handleQrResult,
      () => {},
    ).catch(() => {
      // Camera not available — fall back to simulated scan
      setTimeout(() => {
        const eq = equipment[Math.floor(Math.random() * equipment.length)];
        setSelectedId(eq.id);
        setScreen('profile');
      }, 1800);
    });
  }, [handleQrResult, equipment]);

  const handleScan = () => {
    navigate('scan');
    if (fullscreen) {
      // Real QR scanning — startQrScanner called via useEffect when scan screen mounts
    } else {
      // Web demo mode — simulated scan
      setTimeout(() => {
        const eq = equipment[Math.floor(Math.random() * equipment.length)];
        setSelectedId(eq.id);
        setScreen('profile');
      }, 1800);
    }
  };

  // Start/stop QR scanner when scan screen is shown (native only)
  useEffect(() => {
    if (screen === 'scan' && fullscreen) {
      // Small delay to let the DOM render the container
      const timer = setTimeout(startQrScanner, 300);
      return () => {
        clearTimeout(timer);
        stopQrScanner();
      };
    }
    return stopQrScanner;
  }, [screen, fullscreen, startQrScanner, stopQrScanner]);

  const handleSearch = () => {
    const code = searchCode.trim().toUpperCase();
    if (!code) return;
    const eq = equipment.find((e) => e.code.toUpperCase() === code);
    if (eq) {
      setSelectedId(eq.id);
      setSearchError('');
      navigate('profile');
    } else {
      setSearchError(`"${code}" not found`);
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleNativePhoto = async () => {
    try {
      const photo = await CapCamera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 800,
        promptLabelHeader: 'Add Photo',
        promptLabelPhoto: 'Choose from Library',
        promptLabelPicture: 'Take Photo',
      });
      setPhotoPreview(photo.dataUrl);
    } catch {
      // Native camera failed or user cancelled — fall back to file input
      photoRef.current?.click();
    }
  };

  const handleSubmitIssue = () => {
    if (!currentUser || !selectedId) return;
    const newLog = {
      id: `log-${Date.now()}`,
      type: 'issue',
      status: 'open',
      note: issueNote.trim() || 'Equipment issue reported.',
      user: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      date: 'Just now',
      timestamp: new Date().toISOString(),
      photo: photoPreview,
    };
    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === selectedId
          ? {
              ...eq,
              status: markDown ? 'Down / Needs Repair' : eq.status,
              logs: [newLog, ...eq.logs],
            }
          : eq,
      ),
    );
    setIssueNote('');
    setPhotoPreview(null);
    setMarkDown(true);
    navigate('success');
    setTimeout(() => {
      setScreen('profile');
      setNavStack((s) => s.filter((sc) => sc !== 'success'));
    }, 1400);
  };

  const handleResolve = (logId) => {
    if (!currentUser || !selectedId) return;
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== selectedId) return eq;
        const updated = eq.logs.map((l) => (l.id === logId ? { ...l, status: 'completed' } : l));
        const resolveLog = {
          id: `log-${Date.now()}`,
          type: 'repair',
          status: 'completed',
          note: `Resolved: ${eq.logs.find((l) => l.id === logId)?.note || 'issue'}`,
          user: currentUser.name,
          userId: currentUser.id,
          role: currentUser.role,
          date: 'Just now',
          timestamp: new Date().toISOString(),
          photo: null,
        };
        const hasOpen = updated.some((l) => l.type === 'issue' && l.status === 'open');
        return {
          ...eq,
          status: hasOpen ? eq.status : 'Operational',
          logs: [resolveLog, ...updated],
        };
      }),
    );
    showToast('Issue resolved');
  };

  const handleMarkOperational = () => {
    if (!currentUser || !selectedId) return;
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== selectedId) return eq;
        return {
          ...eq,
          status: 'Operational',
          logs: [
            {
              id: `log-${Date.now()}`,
              type: 'maintenance',
              status: 'completed',
              note: 'Equipment restored to operational status.',
              user: currentUser.name,
              userId: currentUser.id,
              role: currentUser.role,
              date: 'Just now',
              timestamp: new Date().toISOString(),
              photo: null,
            },
            ...eq.logs.map((l) =>
              l.type === 'issue' && l.status === 'open' ? { ...l, status: 'completed' } : l,
            ),
          ],
        };
      }),
    );
    showToast('Status updated');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('login');
    setNavStack([]);
    setSelectedId(null);
    setSearchCode('');
    setSearchError('');
  };

  /* ───────── SCREENS ───────── */

  const renderLogin = () => (
    <div className="flex flex-col h-full bg-slate-900 items-center justify-center px-6">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-7 h-7 text-amber-500" />
        <span className="text-2xl font-bold text-white tracking-tight">EquipLog</span>
      </div>
      <p className="text-slate-400 text-sm mb-8">Enter your 4-digit PIN</p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-150 ${
              pinError
                ? 'bg-red-500'
                : i < pin.length
                  ? 'bg-amber-400 scale-110'
                  : 'bg-slate-600'
            }`}
          />
        ))}
      </div>

      {pinError && <p className="text-red-400 text-xs font-bold mb-4">Invalid PIN</p>}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            onClick={() => handlePinDigit(String(d))}
            className="h-14 rounded-2xl bg-slate-800 text-white text-2xl font-bold active:bg-slate-700 active:scale-95 transition-all"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePinDigit('0')}
          className="h-14 rounded-2xl bg-slate-800 text-white text-2xl font-bold active:bg-slate-700 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={handlePinDelete}
          className="h-14 rounded-2xl bg-slate-800 text-slate-400 text-lg font-bold active:bg-slate-700 transition-all flex items-center justify-center"
        >
          ⌫
        </button>
      </div>

      <p className="text-slate-600 text-[10px] mt-6 text-center leading-relaxed">
        Demo PINs: <span className="text-slate-400">1234</span> (Tech — report &amp; resolve) &middot;{' '}
        <span className="text-slate-400">5678</span> (Operator — report only) &middot;{' '}
        <span className="text-slate-400">0000</span> (Manager — full access)
      </p>
    </div>
  );

  const renderHome = () => (
    <div className="p-5 h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 mt-1">
        <div className="flex items-center gap-2 text-slate-800">
          <Wrench className="w-5 h-5 text-amber-500" />
          <span className="text-xl font-bold tracking-tight">EquipLog</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{currentUser?.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform mb-6"
      >
        <QrCode className="w-16 h-16" />
        <span className="text-2xl font-extrabold tracking-tight">SCAN QR</span>
        <span className="text-xs font-bold opacity-80 uppercase tracking-widest">
          Tap to identify equipment
        </span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 h-px bg-slate-300" />
        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Or Search
        </span>
        <div className="flex-1 h-px bg-slate-300" />
      </div>

      {/* Manual Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-5">
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Equipment Code
        </label>
        <input
          type="text"
          placeholder="e.g. LATHE-04"
          value={searchCode}
          onChange={(e) => {
            setSearchCode(e.target.value);
            setSearchError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full bg-slate-100 text-lg font-bold p-4 rounded-2xl mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center uppercase"
        />
        {searchError && (
          <p className="text-red-500 text-xs font-medium text-center mb-2">{searchError}</p>
        )}
        <button
          onClick={handleSearch}
          className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 active:bg-slate-700 text-lg"
        >
          <Search className="w-5 h-5" /> SEARCH
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3 mt-auto">
        {canAudit && (
          <button
            onClick={() => navigate('audit')}
            className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center gap-1 active:bg-slate-50 transition-colors shadow-sm"
          >
            <Shield className="w-5 h-5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Audit Log</span>
          </button>
        )}
        <button
          onClick={() => navigate('equipList')}
          className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center gap-1 active:bg-slate-50 transition-colors shadow-sm relative"
        >
          <FileText className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">All Equipment</span>
          {openIssueCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {openIssueCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderScan = () => (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center relative">
      {fullscreen ? (
        <>
          <div
            id="qr-reader"
            ref={qrContainerRef}
            className="w-full flex-1 relative"
            style={{ maxHeight: '70%' }}
          />
          <p className="text-amber-400 mt-4 font-bold animate-pulse text-lg tracking-wide">
            Point at QR code...
          </p>
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-slate-900 to-slate-900" />
          <div className="relative z-10 w-56 h-56 border-4 border-amber-500 rounded-3xl overflow-hidden flex items-center justify-center bg-black/50">
            <div className="w-full h-1 bg-amber-400 absolute shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-scan" />
            <QrCode className="w-28 h-28 text-slate-500 opacity-50" />
          </div>
          <p className="text-amber-400 mt-6 font-bold animate-pulse text-lg tracking-wide">
            Scanning...
          </p>
        </>
      )}
      <button
        onClick={() => {
          stopQrScanner();
          setScreen(navStack[navStack.length - 1] || 'home');
          setNavStack((s) => s.slice(0, -1));
        }}
        className="mt-4 mb-6 text-slate-500 text-sm font-medium underline z-10"
      >
        Cancel
      </button>
    </div>
  );

  const renderProfile = () => {
    if (!selected) return null;
    const isDown = selected.status !== 'Operational';
    const recentLogs = selected.logs.slice(0, 3);
    const openIssues = selected.logs.filter((l) => l.type === 'issue' && l.status === 'open');

    return (
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 pt-5 flex items-center gap-3 rounded-b-2xl relative z-10">
          <button
            onClick={() => {
              setScreen('home');
              setNavStack([]);
            }}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">{selected.code}</h2>
            <p className="text-slate-400 text-xs">{selected.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-6 space-y-4">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-base border-2 shadow-sm ${
              isDown
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isDown ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-wider opacity-70 block">
                Status
              </span>
              <span>{selected.status}</span>
            </div>
            {isDown && canResolve && (
              <button
                onClick={handleMarkOperational}
                className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
              >
                Mark OK
              </button>
            )}
          </div>

          {/* Equipment Details */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Location</span>
                <span className="font-medium text-slate-700">{selected.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Last Service</span>
                <span className="font-medium text-slate-700">{selected.lastService}</span>
              </div>
            </div>
          </div>

          {/* Open Issues Alert */}
          {openIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <p className="text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
                {openIssues.length} Open Issue{openIssues.length > 1 ? 's' : ''}
              </p>
              {openIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start justify-between gap-2 bg-white rounded-xl p-3 mb-2 last:mb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-red-800 font-medium truncate">{issue.note}</p>
                    <p className="text-[10px] text-red-400">
                      {issue.user} &middot; {issue.date}
                    </p>
                  </div>
                  {canResolve && (
                    <button
                      onClick={() => handleResolve(issue.id)}
                      className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg flex-shrink-0 active:scale-95"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Report Issue Button */}
          <button
            onClick={() => navigate('report')}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-5 rounded-3xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-3 border-b-4 border-red-800 active:border-b-0 active:mt-1"
          >
            <AlertTriangle className="w-7 h-7" /> REPORT ISSUE
          </button>

          {/* Recent Logs */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wide">
              <History className="w-4 h-4 text-slate-400" /> Recent Activity
            </h3>
            <button
              onClick={() => navigate('history')}
              className="text-amber-600 text-xs font-bold flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 border-l-4"
                style={{ borderLeftColor: logTypeColor(log.type) }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: logTypeColor(log.type) + '18',
                      color: logTypeColor(log.type),
                    }}
                  >
                    {logTypeLabel(log.type)}
                  </span>
                  {log.status === 'open' && (
                    <span className="text-[9px] font-bold text-red-500 uppercase">● Open</span>
                  )}
                </div>
                <p className="text-slate-700 text-sm font-medium mb-1">{log.note}</p>
                {log.photo && (
                  <img
                    src={log.photo}
                    alt="Attached"
                    className="w-full h-20 object-cover rounded-lg mb-1"
                  />
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <UserCheck className="w-3 h-3" />
                  <span className="font-medium">{log.user}</span>
                  <span>&middot;</span>
                  <span>{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReport = () => (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 pt-5 flex items-center gap-3 rounded-b-2xl relative z-10">
        <button
          onClick={goBack}
          className="p-2 -ml-2 hover:bg-red-700 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight">Report Issue</h2>
          <p className="text-red-200 text-xs">{selected?.code}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mark as Down toggle */}
        <button
          onClick={() => setMarkDown(!markDown)}
          className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 font-bold text-base transition-colors ${
            markDown
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {markDown ? (
            <ToggleRight className="w-8 h-8 text-red-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-slate-400" />
          )}
          <span>Mark as Down / Needs Repair</span>
        </button>

        {/* Note */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Description (optional)
          </label>
          <textarea
            value={issueNote}
            onChange={(e) => setIssueNote(e.target.value)}
            placeholder="e.g. Safety guard cracked on left side"
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>

        {/* Photo */}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />
        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-2xl border border-slate-200"
            />
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (fullscreen && isNative) {
                handleNativePhoto();
              } else {
                photoRef.current?.click();
              }
            }}
            className="w-full bg-white hover:bg-slate-50 text-slate-500 font-bold py-6 rounded-3xl flex flex-col justify-center items-center gap-2 border-2 border-dashed border-slate-300 active:bg-slate-100 transition-colors"
          >
            <Camera className="w-8 h-8 text-slate-400" />
            <span className="text-sm uppercase tracking-wide">Add Photo (Optional)</span>
          </button>
        )}

        {/* Auto-log notice */}
        <div className="bg-slate-100 p-3 rounded-2xl flex gap-3 items-start border border-slate-200">
          <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Logged automatically &middot; Signature:{' '}
            <strong className="text-slate-700">{currentUser?.name}</strong> &middot;{' '}
            {currentUser?.role}
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="p-4 pt-2">
        <button
          onClick={handleSubmitIssue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-2xl py-5 rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 border-b-4 border-amber-600 active:border-b-0 active:mt-1"
        >
          SUBMIT
        </button>
      </div>
    </div>
  );

  const renderHistory = () => {
    if (!selected) return null;
    const filtered =
      historyFilter === 'all'
        ? selected.logs
        : selected.logs.filter((l) => l.status === historyFilter);

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-slate-900 text-white p-4 pt-5 flex items-center gap-3 rounded-b-2xl relative z-10">
          <button onClick={goBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-xl">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">Maintenance History</h2>
            <p className="text-slate-400 text-xs">{selected.code}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 p-4 pb-2">
          {['all', 'open', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setHistoryFilter(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                historyFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'open' ? '● Open' : '✓ Done'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-8">No entries found.</p>
          )}
          {filtered.map((log) => (
            <div
              key={log.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 border-l-4"
              style={{ borderLeftColor: logTypeColor(log.type) }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: logTypeColor(log.type) + '18',
                    color: logTypeColor(log.type),
                  }}
                >
                  {logTypeLabel(log.type)}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase ${
                    log.status === 'open' ? 'text-red-500' : 'text-emerald-500'
                  }`}
                >
                  {log.status === 'open' ? '● Open' : '✓ Completed'}
                </span>
              </div>
              <p className="text-slate-700 text-sm font-medium mb-2">{log.note}</p>
              {log.photo && (
                <img
                  src={log.photo}
                  alt="Attached"
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <UserCheck className="w-3 h-3" />
                  <span className="font-medium">
                    {log.user} ({log.role})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{log.date}</span>
              </div>
              {log.type === 'issue' && log.status === 'open' && canResolve && (
                <button
                  onClick={() => handleResolve(log.id)}
                  className="mt-3 w-full bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl active:scale-95 transition-transform"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAudit = () => {
    const allLogs = equipment
      .flatMap((eq) => eq.logs.map((log) => ({ ...log, eqCode: eq.code, eqName: eq.name })))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-slate-900 text-white p-4 pt-5 flex items-center gap-3 rounded-b-2xl relative z-10">
          <button
            onClick={() => {
              setScreen('home');
              setNavStack([]);
            }}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">Audit Log</h2>
            <p className="text-slate-400 text-xs">Digital Chain of Custody</p>
          </div>
        </div>

        {/* Export button — Manager only */}
        {canAudit && (
          <div className="px-4 pt-4">
            <button
              onClick={() => showToast('PDF report exported!')}
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:bg-slate-700 text-sm"
            >
              <Download className="w-4 h-4" /> Export Time-Stamped Report
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {allLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]"
                >
                  {log.eqCode}
                </span>
                <span
                  className="font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: logTypeColor(log.type) + '18',
                    color: logTypeColor(log.type),
                  }}
                >
                  {logTypeLabel(log.type)}
                </span>
                <span
                  className={`text-[9px] font-bold ml-auto ${
                    log.status === 'open' ? 'text-red-500' : 'text-emerald-500'
                  }`}
                >
                  {log.status === 'open' ? '● Open' : '✓'}
                </span>
              </div>
              <p className="text-slate-600 mb-1 leading-snug">{log.note}</p>
              <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                <Shield className="w-3 h-3" />
                <span>
                  {log.user} &middot; {log.role} &middot; {log.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEquipList = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-slate-900 text-white p-4 pt-5 flex items-center gap-3 rounded-b-2xl relative z-10">
        <button
          onClick={() => {
            setScreen('home');
            setNavStack([]);
          }}
          className="p-2 -ml-2 hover:bg-slate-800 rounded-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold tracking-tight flex-1">All Equipment</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {equipment.map((eq) => {
          const isDown = eq.status !== 'Operational';
          const opens = eq.logs.filter((l) => l.type === 'issue' && l.status === 'open').length;
          return (
            <button
              key={eq.id}
              onClick={() => {
                setSelectedId(eq.id);
                navigate('profile');
              }}
              className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 text-left active:bg-slate-50 transition-colors"
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  isDown ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{eq.code}</p>
                <p className="text-slate-500 text-xs truncate">{eq.name}</p>
              </div>
              {opens > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                  {opens} open
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="h-full bg-emerald-600 flex flex-col items-center justify-center px-8">
      <div className="bg-white/20 rounded-full p-6 mb-6">
        <CheckCircle2 className="w-16 h-16 text-white" />
      </div>
      <h2 className="text-white text-2xl font-extrabold mb-2 text-center">Issue Reported!</h2>
      <p className="text-emerald-100 text-sm text-center">
        Logged automatically with your signature and timestamp.
      </p>
    </div>
  );

  /* ───────── Screen map ───────── */

  const screens = {
    login: renderLogin,
    home: renderHome,
    scan: renderScan,
    profile: renderProfile,
    report: renderReport,
    history: renderHistory,
    audit: renderAudit,
    equipList: renderEquipList,
    success: renderSuccess,
  };

  /* ───────── RENDER ───────── */

  if (fullscreen) {
    return (
      <div className="relative w-full h-full flex flex-col text-left font-sans text-slate-900 bg-slate-50 overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex-1 overflow-hidden relative">
          {(screens[screen] || renderHome)()}

          {/* Toast */}
          {toast && (
            <div className="absolute bottom-6 left-4 right-4 bg-slate-900 text-white text-sm font-bold py-3 px-4 rounded-2xl text-center z-50 shadow-xl animate-fade-in">
              {toast}
            </div>
          )}
        </div>

        <style>{`
          @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .animate-scan {
            animation: scan 2s ease-in-out infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
          }
          #qr-reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 0 !important;
          }
          #qr-reader {
            border: none !important;
          }
          #qr-reader__scan_region {
            min-height: auto !important;
          }
          #qr-reader__dashboard {
            display: none !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-[320px] h-[640px] bg-slate-900 rounded-[2.5rem] border-[10px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col text-left font-sans text-slate-900 ring-4 ring-slate-700/50">
      {/* Notch */}
      <div className="h-7 w-full bg-slate-900 flex justify-between items-center px-6 relative z-20">
        <span className="text-white text-[10px] font-bold">9:41</span>
        <div className="w-24 h-5 bg-black rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0" />
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-hidden relative">
        {(screens[screen] || renderHome)()}

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-sm font-bold py-3 px-4 rounded-2xl text-center z-50 shadow-xl animate-fade-in">
            {toast}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MobileDemo;
