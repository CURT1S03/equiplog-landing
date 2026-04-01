import React, { useState } from 'react';
import { 
  QrCode, 
  History, 
  UserCheck, 
  AlertTriangle, 
  Smartphone, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  HardHat,
  Factory,
  Activity,
  Camera,
  Search,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

const MobileDemo = () => {
  const [screen, setScreen] = useState('home');
  const [searchCode, setSearchCode] = useState('');
  const [status, setStatus] = useState('Operational');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, date: 'Today, 08:15 AM', user: 'Tech J. Smith', note: 'Routine Maintenance. Oil changed.', type: 'maintenance' },
    { id: 2, date: 'Oct 12, 14:30 PM', user: 'Op M. Davis', note: 'Replaced worn belt.', type: 'repair' }
  ]);

  const handleScan = () => {
    setScreen('scan');
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScreen('profile');
    }, 1500);
  };

  const handleSearch = () => {
    if(searchCode.trim()) {
      setScreen('profile');
    }
  };

  const handleSubmitIssue = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      date: 'Just now',
      user: 'Current User (You)',
      note: 'Reported Issue: Equipment Down.',
      type: 'issue'
    };
    setLogs([newLog, ...logs]);
    setStatus('Down / Needs Repair');
    setScreen('profile');
  };

  return (
    <div className="relative mx-auto w-[320px] h-[640px] bg-slate-900 rounded-[2.5rem] border-[10px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col text-left font-sans text-slate-900 ring-4 ring-slate-700/50">
      {/* Status Bar Fake */}
      <div className="h-7 w-full bg-slate-900 flex justify-between items-center px-6">
        <span className="text-white text-[10px] font-bold">9:41</span>
        <div className="w-24 h-5 bg-black rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0"></div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        {screen === 'home' && (
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-8 mt-2 justify-center text-slate-800">
              <Wrench className="w-6 h-6 text-amber-500" />
              <span className="text-2xl font-bold tracking-tight">EquipLog</span>
            </div>
            
            <button 
              onClick={handleScan}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-transform mb-8"
            >
              <QrCode className="w-20 h-20" />
              <span className="text-3xl font-extrabold tracking-tight">SCAN QR</span>
              <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Tap to identify</span>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-300"></div>
              <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Or Search</span>
              <div className="flex-1 h-px bg-slate-300"></div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Manual Code</label>
              <input 
                type="text" 
                placeholder="e.g. LATHE-04" 
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full bg-slate-100 text-xl font-bold p-4 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center uppercase"
              />
              <button onClick={handleSearch} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 active:bg-slate-700 text-lg">
                <Search className="w-6 h-6" /> SEARCH
              </button>
            </div>
          </div>
        )}

        {screen === 'scan' && (
          <div className="h-full bg-slate-900 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-slate-900 to-slate-900"></div>
            <div className="relative z-10 w-64 h-64 border-4 border-amber-500 rounded-3xl overflow-hidden flex items-center justify-center bg-black/50">
              <div className="w-full h-1 bg-amber-400 absolute shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-scan"></div>
              <QrCode className="w-32 h-32 text-slate-500 opacity-50" />
            </div>
            <p className="text-amber-400 mt-8 font-bold animate-pulse text-xl tracking-wide">Scanning...</p>
          </div>
        )}

        {screen === 'profile' && (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-slate-900 text-white p-4 pt-6 flex items-center gap-3 shadow-md rounded-b-2xl relative z-10">
              <button onClick={() => setScreen('home')} className="p-2 -ml-2 hover:bg-slate-800 rounded-xl transition-colors">
                <ChevronLeft className="w-7 h-7" />
              </button>
              <h2 className="text-2xl font-bold flex-1 tracking-tight">{searchCode || 'LATHE-04'}</h2>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto pb-8">
              <div className={`p-4 rounded-2xl flex items-center gap-3 mb-8 font-bold text-lg border-2 shadow-sm ${status === 'Operational' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {status === 'Operational' ? <CheckCircle2 className="w-7 h-7 text-emerald-600" /> : <AlertTriangle className="w-7 h-7 text-red-600" />}
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider opacity-70">Current Status</span>
                  <span>{status}</span>
                </div>
              </div>

              {status === 'Operational' && (
                <button 
                  onClick={() => setScreen('report')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-2xl py-6 rounded-3xl shadow-lg active:scale-95 transition-transform mb-10 flex justify-center items-center gap-3 border-b-4 border-red-800 active:border-b-0 active:mt-1"
                >
                  <AlertTriangle className="w-8 h-8" /> REPORT ISSUE
                </button>
              )}

              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                <History className="w-5 h-5 text-slate-500" /> Maintenance Logs
              </h3>
              
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4" style={{borderLeftColor: log.type === 'issue' ? '#ef4444' : log.type === 'repair' ? '#f59e0b' : '#10b981'}}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        {log.user}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium mb-3">{log.note}</p>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen === 'report' && (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-red-600 text-white p-4 pt-6 flex items-center gap-3 shadow-md rounded-b-2xl relative z-10">
              <button onClick={() => setScreen('profile')} className="p-2 -ml-2 hover:bg-red-700 rounded-xl transition-colors">
                <ChevronLeft className="w-7 h-7" />
              </button>
              <h2 className="text-2xl font-bold flex-1 tracking-tight">Report Issue</h2>
            </div>
            
            <form onSubmit={handleSubmitIssue} className="p-5 flex-1 flex flex-col">
              <div className="bg-red-50 p-5 rounded-3xl border-2 border-red-200 mb-6 shadow-sm">
                <label className="flex items-center gap-4 text-red-900 font-bold text-xl cursor-pointer">
                  <input type="checkbox" required defaultChecked className="w-8 h-8 rounded-lg border-red-300 text-red-600 focus:ring-red-500" />
                  Mark as Down
                </label>
              </div>

              <button type="button" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-8 rounded-3xl mb-6 flex flex-col justify-center items-center gap-3 border-2 border-dashed border-slate-300 active:bg-slate-200">
                <Camera className="w-10 h-10 text-slate-400" />
                <span className="text-lg uppercase tracking-wide">Take Photo (Optional)</span>
              </button>

              <div className="flex-1"></div>

              <div className="bg-slate-100 p-4 rounded-2xl mb-6 flex gap-3 items-start border border-slate-200">
                <UserCheck className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Action logged automatically. Signature: <strong className="text-slate-700">Current User</strong>
                </p>
              </div>
              
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-3xl py-6 rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 border-b-4 border-amber-600 active:border-b-0 active:mt-1">
                SUBMIT
              </button>
            </form>
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
      `}</style>
    </div>
  );
};

export default function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-400 selection:text-slate-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-amber-400" />
          <span className="text-xl font-bold tracking-tight">EquipLog</span>
        </div>
        <a 
          href="#waitlist" 
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-2 px-5 rounded-md transition-colors text-sm md:text-base"
        >
          Join Waitlist
        </a>
      </nav>

      {/* Hero Section */}
      <header className="bg-slate-900 text-white pt-20 pb-24 px-6 md:px-12 flex flex-col items-center text-center">
        <div className="inline-block bg-slate-800 border border-slate-700 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          Designed for the Shop Floor
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Ditch the paper logs.<br />Track equipment instantly.
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          The point-of-use mobile app built for mechanics. No complex menus, no walking back to the workstation. Just scan, log, and fix.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <a href="#waitlist" className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
            Get Early Access <ArrowRight className="w-5 h-5" />
          </a>
        </div>
        
        {/* Interactive Mobile Demo */}
        <div className="mt-16 w-full flex justify-center perspective-1000">
           <div className="transform-gpu hover:scale-[1.02] transition-transform duration-500 ease-out">
             <MobileDemo />
           </div>
        </div>
      </header>

      {/* Problem Statement Section */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Shop Floor Reality</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our customer discovery revealed a massive gap in how small shops operate. Your workflow shouldn't be interrupted by outdated systems.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Workflow Friction</h3>
            <p className="text-slate-600">
              Mechanics stop what they're doing and walk across the shop to a workstation just to check a spreadsheet or find a paper log.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Activity className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Blind Maintenance</h3>
            <p className="text-slate-600">
              Workers go in blind because past repair history is buried in scattered documents, leading to repeated work and lost time.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-amber-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Smartphone className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Poor Usability</h3>
            <p className="text-slate-600">
              Gloves, dirty hands, and tiny screens don't mix. Existing tools are too complex for older mechanics or harsh physical conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Solution & Core Features */}
      <section className="py-20 px-6 md:px-12 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">A solution built for the realities of repair work.</h2>
              <p className="text-lg text-slate-600 mb-6">
                EquipLog provides instant, real-time visibility into an equipment's repair history and an automated digital chain of custody. It empowers small teams to reduce downtime and prevent safety incidents without the enterprise price tag.
              </p>
            </div>
            <div className="flex-1 w-full bg-slate-200 rounded-xl h-64 flex items-center justify-center border border-slate-300">
                <span className="text-slate-500 font-medium">Simple, high-contrast UI Mockup</span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-12">Core MVP Features</h3>
          
          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-amber-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="bg-amber-100 p-4 rounded-full flex-shrink-0">
                <QrCode className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Scan & Go: QR Code Equipment Search</h4>
                <p className="text-slate-600 mb-2">
                  No typing required. Mechanics with dirty hands or gloves can simply scan a QR code attached to the equipment to instantly pull up its records without leaving the job site.
                </p>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Zero Friction Entry</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="bg-blue-100 p-4 rounded-full flex-shrink-0">
                <UserCheck className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Automated Digital Chain of Custody</h4>
                <p className="text-slate-600 mb-2">
                  Automatically log who made updates and when. Close accountability gaps and ensure proactive compliance without requiring mechanics to fill out extra paperwork.
                </p>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Built-in Accountability</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-emerald-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="bg-emerald-100 p-4 rounded-full flex-shrink-0">
                <History className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Clear Maintenance & Repair History</h4>
                <p className="text-slate-600 mb-2">
                  Get a clean, easy-to-read timeline of all past work on a single screen. Stop guessing what the previous shift did, and start diagnosing problems faster.
                </p>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Real-Time Visibility</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Built strictly for the people doing the work.</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex items-start gap-4">
            <HardHat className="w-10 h-10 text-slate-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Mechanics & Field Workers</h3>
              <p className="text-slate-600">
                Especially older mechanics who prefer straightforward tools. We use big buttons, simple layouts, and fast scanning to accommodate physical shop floor conditions (gloves, grime, distance).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Factory className="w-10 h-10 text-slate-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Shop Managers</h3>
              <p className="text-slate-600">
                Managers who need affordable, proactive compliance tracking. They gain accurate records and team accountability without purchasing bloated, overpriced enterprise software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="waitlist" className="bg-slate-900 text-white py-24 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to upgrade your shop floor?</h2>
          <p className="text-xl text-slate-300 mb-10">
            We are currently building our MVP based on direct feedback from mechanics. Join the waitlist to get early beta access and shape the future of equipment tracking.
          </p>
          
          {submitted ? (
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
              <p className="text-slate-400">We'll be in touch as soon as the beta is ready for your shop.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                required
                placeholder="Enter your work email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-lg transition-colors whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} EquipLog Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}