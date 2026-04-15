import React from 'react';
import {
  QrCode,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  History,
  UserCheck,
  Camera,
  Search,
  Shield,
  FileText,
  ToggleRight,
  Clock,
  MapPin,
  LogOut,
  ChevronRight,
} from 'lucide-react';

function MiniScreen({ label, children }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-[180px] h-[320px] bg-slate-900 rounded-[1.5rem] border-[5px] border-slate-800 overflow-hidden flex flex-col shadow-xl ring-2 ring-slate-700/40 relative">
        {/* Mini notch */}
        <div className="h-4 w-full bg-slate-900 flex justify-center relative z-10">
          <div className="w-14 h-3 bg-black rounded-b-xl" />
        </div>
        <div className="flex-1 bg-slate-50 overflow-hidden text-[7px] text-slate-900 leading-tight">
          {children}
        </div>
      </div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function AppScreenshots() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
      {/* Login Screen */}
      <MiniScreen label="PIN Login">
        <div className="flex flex-col h-full bg-slate-900 items-center justify-center px-3">
          <div className="flex items-center gap-1 mb-1">
            <Wrench className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-bold text-white">EquipLog</span>
          </div>
          <p className="text-slate-400 text-[6px] mb-3">Enter your 4-digit PIN</p>
          <div className="flex gap-2 mb-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-amber-400' : 'bg-slate-600'}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-[120px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, '⌫'].map((d, i) =>
              d !== null ? (
                <div key={i} className="h-5 rounded-lg bg-slate-800 text-white text-[8px] font-bold flex items-center justify-center">
                  {d}
                </div>
              ) : (
                <div key={i} />
              )
            )}
          </div>
        </div>
      </MiniScreen>

      {/* Home Screen */}
      <MiniScreen label="Home / Scan">
        <div className="p-2 flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Wrench className="w-2.5 h-2.5 text-amber-500" />
              <span className="text-[8px] font-bold">EquipLog</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[5px] text-slate-400">J. Smith</span>
              <LogOut className="w-2 h-2 text-slate-400" />
            </div>
          </div>
          <div className="bg-amber-500 rounded-xl p-3 flex flex-col items-center gap-1 mb-2">
            <QrCode className="w-8 h-8 text-slate-900" />
            <span className="text-[9px] font-extrabold text-slate-900">SCAN QR</span>
            <span className="text-[5px] font-bold text-slate-900/60 uppercase">Tap to identify</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="text-[5px] text-slate-400 font-bold uppercase">Or Search</span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>
          <div className="bg-white rounded-xl p-2 border border-slate-200 flex-1">
            <div className="bg-slate-100 rounded-lg h-5 flex items-center justify-center mb-1.5">
              <span className="text-[6px] text-slate-400 font-bold">LATHE-04</span>
            </div>
            <div className="bg-slate-800 rounded-lg h-5 flex items-center justify-center gap-1">
              <Search className="w-2 h-2 text-white" />
              <span className="text-[7px] font-bold text-white">SEARCH</span>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2">
            <div className="flex-1 bg-white rounded-lg p-1.5 flex flex-col items-center border border-slate-200">
              <Shield className="w-2.5 h-2.5 text-slate-400" />
              <span className="text-[4px] font-bold text-slate-500 uppercase">Audit</span>
            </div>
            <div className="flex-1 bg-white rounded-lg p-1.5 flex flex-col items-center border border-slate-200">
              <FileText className="w-2.5 h-2.5 text-slate-400" />
              <span className="text-[4px] font-bold text-slate-500 uppercase">Equipment</span>
            </div>
          </div>
        </div>
      </MiniScreen>

      {/* Equipment Profile */}
      <MiniScreen label="Equipment Profile">
        <div className="flex flex-col h-full">
          <div className="bg-slate-900 text-white px-2 py-2 rounded-b-lg">
            <p className="text-[9px] font-bold">LATHE-04</p>
            <p className="text-[5px] text-slate-400">CNC Lathe #4</p>
          </div>
          <div className="p-2 flex-1 space-y-1.5 overflow-hidden">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <div>
                <span className="text-[4px] text-emerald-700 uppercase block">Status</span>
                <span className="text-[7px] font-bold text-emerald-800">Operational</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-1.5 border border-slate-100 grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-2 h-2 text-slate-400" />
                <div>
                  <span className="text-[4px] text-slate-400 block">Location</span>
                  <span className="text-[5px] font-medium">Bay A – West</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-2 h-2 text-slate-400" />
                <div>
                  <span className="text-[4px] text-slate-400 block">Last Service</span>
                  <span className="text-[5px] font-medium">Apr 1, 2026</span>
                </div>
              </div>
            </div>
            <div className="bg-red-600 rounded-xl py-2 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-white" />
              <span className="text-[8px] font-bold text-white">REPORT ISSUE</span>
            </div>
            <div className="flex items-center gap-1">
              <History className="w-2 h-2 text-slate-400" />
              <span className="text-[5px] font-bold text-slate-700 uppercase">Recent Activity</span>
              <ChevronRight className="w-2 h-2 text-amber-500 ml-auto" />
            </div>
            {[
              { color: '#10b981', note: 'Oil changed, filters replaced.', user: 'J. Smith' },
              { color: '#f59e0b', note: 'Replaced worn drive belt.', user: 'M. Davis' },
            ].map((log, i) => (
              <div key={i} className="bg-white rounded-lg p-1.5 border-l-2 border border-slate-100" style={{ borderLeftColor: log.color }}>
                <p className="text-[5px] text-slate-700 font-medium">{log.note}</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <UserCheck className="w-1.5 h-1.5 text-slate-400" />
                  <span className="text-[4px] text-slate-400">{log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MiniScreen>

      {/* Report Issue */}
      <MiniScreen label="Report Issue">
        <div className="flex flex-col h-full">
          <div className="bg-red-600 text-white px-2 py-2 rounded-b-lg">
            <p className="text-[9px] font-bold">Report Issue</p>
            <p className="text-[5px] text-red-200">LATHE-04</p>
          </div>
          <div className="p-2 flex-1 space-y-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5">
              <ToggleRight className="w-4 h-4 text-red-600" />
              <span className="text-[7px] font-bold text-red-800">Mark as Down</span>
            </div>
            <div>
              <span className="text-[5px] font-bold text-slate-500 uppercase">Description</span>
              <div className="bg-white border border-slate-200 rounded-lg h-8 mt-0.5 p-1">
                <span className="text-[5px] text-slate-400">Safety guard cracked...</span>
              </div>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl py-3 flex flex-col items-center gap-1">
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-[6px] font-bold text-slate-500 uppercase">Add Photo</span>
            </div>
            <div className="bg-slate-100 rounded-lg p-1.5 flex items-center gap-1">
              <UserCheck className="w-2 h-2 text-slate-400" />
              <span className="text-[4px] text-slate-500">Logged: <strong>J. Smith</strong> · Technician</span>
            </div>
            <div className="bg-amber-500 rounded-xl py-2 flex items-center justify-center mt-auto">
              <span className="text-[10px] font-extrabold text-slate-900">SUBMIT</span>
            </div>
          </div>
        </div>
      </MiniScreen>
    </div>
  );
}
