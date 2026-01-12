import React, { useState, useMemo } from 'react';

const ManpowerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [inputs, setInputs] = useState({
    namaCabang: 'Cabang Jakarta Selatan',
    totalSesi: 400,
    durasiSesi: 90,
    siswaPerKelas: 8,
    pctPeak: 65,
    hariOps: 26,
    pctBatal: 5,
    pctResched: 12,
    pctNoshow: 8,
    gapFactor: 15,
    prepPerSesi: 30,
    assessPerSesi: 15,
    adminPct: 10,
    meetingJam: 10,
    ftJamHari: 8,
    ftHariBulan: 26,
    ftMaxTeach: 6,
    ftEfektif: 80,
    flJamHari: 5,
    flHariBulan: 20,
    flMaxTeach: 4,
    flEfektif: 65,
    flIdle: 25,
  });

  const [ftTeachers, setFtTeachers] = useState([
    { 
      id: 1, 
      nama: 'Teacher 1',
      gaji: 6000000,
      tunjangan: 1500000,
      transport: 500000,
      makan: 500000,
      komunikasi: 200000,
      bpjs: 400000,
      tools: 200000,
      seragam: 100000,
      training: 300000,
      extraClassRate: 100000,
      extraClassQty: 5,
      extraProjectRate: 500000,
      extraProjectQty: 1,
      targetMengajar: 120,
      bonusTarget: 500000,
    },
  ]);

  const [flConfig, setFlConfig] = useState({
    jumlahFL: 2,
    rateSesi60: 150000,
    rateSesi90: 200000,
  });

  const [showHelp, setShowHelp] = useState({});

  const toggleHelp = (key) => {
    setShowHelp(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const update = (key, val) => {
    setInputs(prev => ({ ...prev, [key]: key === 'namaCabang' ? val : (parseFloat(val) || 0) }));
  };

  const updateFL = (key, val) => {
    setFlConfig(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const updateFT = (id, field, val) => {
    setFtTeachers(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: field === 'nama' ? val : (parseFloat(val) || 0) } : t
    ));
  };

  const addFT = () => {
    const newId = Math.max(...ftTeachers.map(t => t.id), 0) + 1;
    setFtTeachers(prev => [...prev, { 
      id: newId, 
      nama: `Teacher ${newId}`,
      gaji: 5000000, tunjangan: 1000000, transport: 400000, makan: 400000, komunikasi: 150000,
      bpjs: 350000, tools: 150000, seragam: 100000, training: 200000,
      extraClassRate: 100000, extraClassQty: 0, extraProjectRate: 500000, extraProjectQty: 0,
      targetMengajar: 100, bonusTarget: 400000,
    }]);
  };

  const removeFT = (id) => {
    if (ftTeachers.length > 1) setFtTeachers(prev => prev.filter(t => t.id !== id));
  };

  const duplicateFT = (id) => {
    const source = ftTeachers.find(t => t.id === id);
    if (source) {
      const newId = Math.max(...ftTeachers.map(t => t.id), 0) + 1;
      setFtTeachers(prev => [...prev, { ...source, id: newId, nama: `${source.nama} (copy)` }]);
    }
  };

  const calcFTCost = (t) => {
    const gajiTetap = t.gaji + t.tunjangan + t.transport + t.makan + t.komunikasi;
    const nonGaji = t.bpjs + t.tools + t.seragam + t.training;
    const extraClass = t.extraClassRate * t.extraClassQty;
    const extraProject = t.extraProjectRate * t.extraProjectQty;
    const bonus = t.bonusTarget;
    return { gajiTetap, nonGaji, extraClass, extraProject, bonus, total: gajiTetap + nonGaji + extraClass + extraProject + bonus };
  };

  const calc = useMemo(() => {
    const i = inputs;
    const r = {};
    
    r.jumlahFTAktual = ftTeachers.length;
    r.ftCostDetail = ftTeachers.map(t => ({ ...t, cost: calcFTCost(t) }));
    r.totalCostFTAktual = r.ftCostDetail.reduce((sum, t) => sum + t.cost.total, 0);
    r.avgCostFT = r.jumlahFTAktual > 0 ? r.totalCostFTAktual / r.jumlahFTAktual : 0;
    
    r.totalGajiTetap = r.ftCostDetail.reduce((sum, t) => sum + t.cost.gajiTetap, 0);
    r.totalNonGaji = r.ftCostDetail.reduce((sum, t) => sum + t.cost.nonGaji, 0);
    r.totalExtraClass = r.ftCostDetail.reduce((sum, t) => sum + t.cost.extraClass, 0);
    r.totalExtraProject = r.ftCostDetail.reduce((sum, t) => sum + t.cost.extraProject, 0);
    r.totalBonus = r.ftCostDetail.reduce((sum, t) => sum + t.cost.bonus, 0);
    
    r.jumlahFLAktual = flConfig.jumlahFL;
    r.flRatePerSesi = i.durasiSesi === 60 ? flConfig.rateSesi60 : flConfig.rateSesi90;
    r.flRatePerJam = r.flRatePerSesi / (i.durasiSesi / 60);
    
    r.jamDasar = (i.totalSesi * i.durasiSesi) / 60;
    r.jamPeak = r.jamDasar * (i.pctPeak / 100);
    r.jamBatal = r.jamDasar * (i.pctBatal / 100);
    r.jamResched = r.jamDasar * (i.pctResched / 100) * 0.5;
    r.jamNoshow = r.jamDasar * (i.pctNoshow / 100);
    r.jamGap = r.jamDasar * (i.gapFactor / 100);
    r.jamPeakOverhead = r.jamPeak * 0.1;
    r.totalAdjustment = -r.jamBatal + r.jamResched - r.jamNoshow - r.jamGap + r.jamPeakOverhead;
    
    r.totalPrep = (i.totalSesi * i.prepPerSesi) / 60;
    r.totalAssess = (i.totalSesi * i.assessPerSesi) / 60;
    r.totalAdmin = r.jamDasar * (i.adminPct / 100);
    r.nonMengajarCabang = r.totalPrep + r.totalAssess + r.totalAdmin;
    
    r.jamMengajarEfektif = r.jamDasar + r.totalAdjustment;
    r.totalWorkload = r.jamMengajarEfektif + r.nonMengajarCabang;
    r.pctMengajar = (r.jamMengajarEfektif / r.totalWorkload) * 100;
    r.pctNonMengajar = (r.nonMengajarCabang / r.totalWorkload) * 100;
    
    r.ftJamKotor = i.ftJamHari * i.ftHariBulan;
    r.ftKapasitasEfektif = r.ftJamKotor * (i.ftEfektif / 100);
    r.ftMaxTeachBulan = i.ftMaxTeach * i.ftHariBulan;
    r.ftKapasitasAktual = Math.min(r.ftKapasitasEfektif, r.ftMaxTeachBulan) - i.meetingJam;
    
    r.flJamKotor = i.flJamHari * i.flHariBulan;
    r.flKapasitasEfektif = r.flJamKotor * (i.flEfektif / 100) * (1 - i.flIdle / 100);
    r.flMaxTeachBulan = i.flMaxTeach * i.flHariBulan;
    r.flKapasitasAktual = Math.min(r.flKapasitasEfektif, r.flMaxTeachBulan);
    
    r.ftSesiPerBulan = Math.floor(r.ftKapasitasAktual / (i.durasiSesi / 60));
    r.flSesiPerBulan = Math.floor(r.flKapasitasAktual / (i.durasiSesi / 60));
    
    r.kebutuhanFTIdeal = Math.ceil(r.totalWorkload / r.ftKapasitasAktual);
    r.kebutuhanFLIdeal = Math.ceil(r.totalWorkload / r.flKapasitasAktual);
    r.ftSetaraFL = Math.round((r.ftKapasitasAktual / r.flKapasitasAktual) * 10) / 10;
    
    r.kapasitasFTTotal = r.jumlahFTAktual * r.ftKapasitasAktual;
    r.kapasitasFLTotal = r.jumlahFLAktual * r.flKapasitasAktual;
    r.kapasitasTotal = r.kapasitasFTTotal + r.kapasitasFLTotal;
    
    r.workloadGap = r.totalWorkload - r.kapasitasTotal;
    r.isUnderStaffed = r.workloadGap > 0;
    r.isOverStaffed = r.workloadGap < -r.ftKapasitasAktual;
    
    r.utilizationFT = r.jumlahFTAktual > 0 ? (Math.min(r.jamMengajarEfektif, r.kapasitasFTTotal) / r.kapasitasFTTotal) * 100 : 0;
    r.teachingIntensityFT = r.jumlahFTAktual > 0 ? (Math.min(r.jamMengajarEfektif, r.kapasitasFTTotal) / (r.jumlahFTAktual * r.ftJamKotor)) * 100 : 0;
    r.burnoutRisk = r.teachingIntensityFT > 80 ? 'TINGGI' : r.teachingIntensityFT > 60 ? 'SEDANG' : 'RENDAH';
    r.burnoutColor = r.teachingIntensityFT > 80 ? 'text-red-600' : r.teachingIntensityFT > 60 ? 'text-yellow-600' : 'text-green-600';
    
    r.totalSiswa = i.totalSesi * i.siswaPerKelas;
    r.totalCostFLAktual = r.jumlahFLAktual * r.flSesiPerBulan * r.flRatePerSesi;
    r.totalCostAktual = r.totalCostFTAktual + r.totalCostFLAktual;
    r.costPerSesiAktual = i.totalSesi > 0 ? r.totalCostAktual / i.totalSesi : 0;
    r.costPerSiswaAktual = r.totalSiswa > 0 ? r.totalCostAktual / r.totalSiswa : 0;
    
    r.costPerSesiFT = r.ftSesiPerBulan > 0 ? r.avgCostFT / r.ftSesiPerBulan : 0;
    r.costPerSesiFL = r.flRatePerSesi;
    
    r.totalTargetMengajar = r.ftCostDetail.reduce((sum, t) => sum + t.targetMengajar, 0);
    
    const makeScenario = (name, desc, ftCount, flCount) => {
      const s = { name, desc, ft: ftCount, fl: flCount };
      s.total = s.ft + s.fl;
      s.kapasitas = (s.ft * r.ftKapasitasAktual) + (s.fl * r.flKapasitasAktual);
      s.coverageOk = s.kapasitas >= r.totalWorkload;
      s.costFT = s.ft * r.avgCostFT;
      s.costFL = s.fl * r.flSesiPerBulan * r.flRatePerSesi;
      s.totalCost = s.costFT + s.costFL;
      s.costPerSesi = i.totalSesi > 0 ? s.totalCost / i.totalSesi : 0;
      return s;
    };
    
    const s1 = makeScenario('FULL-TIME', `${r.kebutuhanFTIdeal} FT`, r.kebutuhanFTIdeal, 0);
    const hybridFT = Math.ceil(r.kebutuhanFTIdeal * 0.75);
    const sisaJam = r.totalWorkload - (hybridFT * r.ftKapasitasAktual);
    const hybridFL = sisaJam > 0 ? Math.ceil(sisaJam / r.flKapasitasAktual) : 0;
    const s2 = makeScenario('HYBRID', `${hybridFT} FT + ${hybridFL} FL`, hybridFT, hybridFL);
    const minFT = Math.max(1, Math.ceil(r.kebutuhanFTIdeal * 0.3));
    const sisaJamFL = r.totalWorkload - (minFT * r.ftKapasitasAktual);
    const maxFL = sisaJamFL > 0 ? Math.ceil(sisaJamFL / r.flKapasitasAktual) : 0;
    const s3 = makeScenario('FL HEAVY', `${minFT} FT + ${maxFL} FL`, minFT, maxFL);
    const s4 = makeScenario('SAAT INI', `${r.jumlahFTAktual} FT + ${r.jumlahFLAktual} FL`, r.jumlahFTAktual, r.jumlahFLAktual);
    s4.isCurrent = true;
    s4.costFT = r.totalCostFTAktual;
    s4.totalCost = r.totalCostAktual;
    s4.costPerSesi = r.costPerSesiAktual;
    
    r.skenario = [s4, s1, s2, s3];
    const validScenarios = [s1, s2, s3].filter(s => s.coverageOk);
    r.bestScenario = validScenarios.length > 0 ? validScenarios.reduce((a, b) => a.totalCost < b.totalCost ? a : b) : s1;
    r.gapVsBest = {
      ft: r.bestScenario.ft - r.jumlahFTAktual,
      fl: r.bestScenario.fl - r.jumlahFLAktual,
      cost: r.totalCostAktual - r.bestScenario.totalCost
    };
    
    return r;
  }, [inputs, ftTeachers, flConfig]);

  const fmtRp = (n) => `Rp ${Math.round(n || 0).toLocaleString('id-ID')}`;
  const fmtPct = (n) => `${(n || 0).toFixed(1)}%`;

  // Field dengan penjelasan
  const Field = ({ label, field, unit, step = 1, value, onChange, help, example }) => {
    const fieldKey = field || label;
    const isOpen = showHelp[fieldKey];
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {help && (
            <button 
              onClick={() => toggleHelp(fieldKey)}
              className={`text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              {isOpen ? '✕' : '?'}
            </button>
          )}
        </div>
        
        {isOpen && help && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="text-gray-700 mb-2">{help}</p>
            {example && (
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">📌 Cara dapat datanya:</p>
                <p className="text-xs text-blue-700">{example}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type={field === 'namaCabang' ? 'text' : 'number'}
            value={value !== undefined ? value : inputs[field]}
            onChange={(e) => onChange ? onChange(e.target.value) : update(field, e.target.value)}
            step={step}
            className="flex-1 px-3 py-2 text-right font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {unit && <span className="flex items-center px-3 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-fit">{unit}</span>}
        </div>
      </div>
    );
  };

  const Section = ({ title, icon, children, action, color = 'gray', description }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 border-${color}-500 overflow-hidden mb-4`}>
      <div className={`bg-${color}-50 px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span>{icon}</span> {title}
          </h3>
          {action}
        </div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  const FTCard = ({ teacher, onUpdate, onRemove, onDuplicate, canRemove }) => {
    const cost = calcFTCost(teacher);
    const [expanded, setExpanded] = useState(false);
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200 p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <input type="text" value={teacher.nama} onChange={(e) => onUpdate(teacher.id, 'nama', e.target.value)}
            className="font-bold text-lg bg-transparent border-none focus:outline-none text-gray-800" />
          <div className="flex gap-2">
            <button onClick={() => setExpanded(!expanded)} className="text-blue-600 hover:text-blue-800 text-sm">
              {expanded ? '▲ Tutup' : '▼ Detail'}
            </button>
            <button onClick={() => onDuplicate(teacher.id)} className="text-green-600 hover:text-green-800 text-sm">📋</button>
            {canRemove && <button onClick={() => onRemove(teacher.id)} className="text-red-500 hover:text-red-700">✕</button>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center mb-3">
          <div className="bg-white rounded-lg p-2 border">
            <p className="text-xs text-gray-500">Gaji+Tunj</p>
            <p className="font-bold text-blue-700 text-sm">{fmtRp(cost.gajiTetap)}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border">
            <p className="text-xs text-gray-500">Non-Gaji</p>
            <p className="font-bold text-purple-700 text-sm">{fmtRp(cost.nonGaji)}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border">
            <p className="text-xs text-gray-500">Extra</p>
            <p className="font-bold text-green-700 text-sm">{fmtRp(cost.extraClass + cost.extraProject)}</p>
          </div>
          <div className="bg-blue-600 rounded-lg p-2 text-white">
            <p className="text-xs opacity-80">TOTAL</p>
            <p className="font-bold text-sm">{fmtRp(cost.total)}</p>
          </div>
        </div>

        {expanded && (
          <div className="border-t pt-3 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">💰 Gaji & Tunjangan Tetap</p>
              <p className="text-xs text-gray-500 mb-2">Komponen yang dibayar rutin setiap bulan ke teacher</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Gaji Pokok</label>
                  <p className="text-xs text-gray-400 mb-1">Gaji dasar dari payroll</p>
                  <input type="number" value={teacher.gaji} onChange={(e) => onUpdate(teacher.id, 'gaji', e.target.value)} step={100000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tunjangan Jabatan</label>
                  <p className="text-xs text-gray-400 mb-1">Berdasarkan level/posisi</p>
                  <input type="number" value={teacher.tunjangan} onChange={(e) => onUpdate(teacher.id, 'tunjangan', e.target.value)} step={100000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Transport</label>
                  <p className="text-xs text-gray-400 mb-1">Uang transport bulanan</p>
                  <input type="number" value={teacher.transport} onChange={(e) => onUpdate(teacher.id, 'transport', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Uang Makan</label>
                  <p className="text-xs text-gray-400 mb-1">Tunjangan makan</p>
                  <input type="number" value={teacher.makan} onChange={(e) => onUpdate(teacher.id, 'makan', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Komunikasi</label>
                  <p className="text-xs text-gray-400 mb-1">Pulsa/internet</p>
                  <input type="number" value={teacher.komunikasi} onChange={(e) => onUpdate(teacher.id, 'komunikasi', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">📦 Biaya Non-Gaji</p>
              <p className="text-xs text-gray-500 mb-2">Biaya yang ditanggung perusahaan tapi bukan masuk ke gaji teacher</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-500">BPJS</label>
                  <p className="text-xs text-gray-400 mb-1">Kesehatan + TK (±4% gaji)</p>
                  <input type="number" value={teacher.bpjs} onChange={(e) => onUpdate(teacher.id, 'bpjs', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tools/Alat</label>
                  <p className="text-xs text-gray-400 mb-1">Laptop, ATK (amortisasi/bln)</p>
                  <input type="number" value={teacher.tools} onChange={(e) => onUpdate(teacher.id, 'tools', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Seragam</label>
                  <p className="text-xs text-gray-400 mb-1">Biaya/tahun ÷ 12</p>
                  <input type="number" value={teacher.seragam} onChange={(e) => onUpdate(teacher.id, 'seragam', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Training</label>
                  <p className="text-xs text-gray-400 mb-1">Budget training/tahun ÷ 12</p>
                  <input type="number" value={teacher.training} onChange={(e) => onUpdate(teacher.id, 'training', e.target.value)} step={50000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">⭐ Extra Income</p>
              <p className="text-xs text-gray-500 mb-2">Pendapatan tambahan di luar gaji tetap</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Extra Class</p>
                  <p className="text-xs text-gray-400 mb-2">Kelas tambahan di luar jadwal normal</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Rate/class</label>
                      <input type="number" value={teacher.extraClassRate} onChange={(e) => onUpdate(teacher.id, 'extraClassRate', e.target.value)} step={10000}
                        className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                    </div>
                    <div className="w-16">
                      <label className="text-xs text-gray-500">Qty</label>
                      <input type="number" value={teacher.extraClassQty} onChange={(e) => onUpdate(teacher.id, 'extraClassQty', e.target.value)}
                        className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                    </div>
                  </div>
                  <p className="text-right text-sm font-bold text-green-700 mt-1">= {fmtRp(teacher.extraClassRate * teacher.extraClassQty)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Extra Project</p>
                  <p className="text-xs text-gray-400 mb-2">Project khusus: event, kurikulum, dll</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Rate/project</label>
                      <input type="number" value={teacher.extraProjectRate} onChange={(e) => onUpdate(teacher.id, 'extraProjectRate', e.target.value)} step={100000}
                        className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                    </div>
                    <div className="w-16">
                      <label className="text-xs text-gray-500">Qty</label>
                      <input type="number" value={teacher.extraProjectQty} onChange={(e) => onUpdate(teacher.id, 'extraProjectQty', e.target.value)}
                        className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                    </div>
                  </div>
                  <p className="text-right text-sm font-bold text-purple-700 mt-1">= {fmtRp(teacher.extraProjectRate * teacher.extraProjectQty)}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Target & Bonus</p>
              <p className="text-xs text-gray-500 mb-2">KPI mengajar dan insentif pencapaian</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Target Sesi/Bulan</label>
                  <p className="text-xs text-gray-400 mb-1">Jumlah sesi yang harus dicapai</p>
                  <input type="number" value={teacher.targetMengajar} onChange={(e) => onUpdate(teacher.id, 'targetMengajar', e.target.value)}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Bonus Capai Target</label>
                  <p className="text-xs text-gray-400 mb-1">Bonus jika target tercapai</p>
                  <input type="number" value={teacher.bonusTarget} onChange={(e) => onUpdate(teacher.id, 'bonusTarget', e.target.value)} step={100000}
                    className="w-full px-2 py-1 text-right font-mono text-sm border rounded" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ScenarioCard = ({ s, isBest }) => (
    <div className={`rounded-xl p-3 border-2 ${s.isCurrent ? 'border-blue-500 bg-blue-50' : isBest ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{s.name}</h4>
          <p className="text-xs text-gray-500">{s.desc}</p>
        </div>
        {s.isCurrent && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">NOW</span>}
        {isBest && !s.isCurrent && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">BEST</span>}
      </div>
      {!s.coverageOk && <p className="text-xs text-red-600 mb-1">⚠️ Kurang kapasitas</p>}
      <p className="font-bold">{fmtRp(s.totalCost)}<span className="text-xs font-normal text-gray-500">/bln</span></p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">MANPOWER ANALYTICS ENGINE</h1>
            <p className="text-slate-400 text-sm">v6 — Dengan Penjelasan Lengkap</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Status Banner */}
        <div className={`rounded-2xl p-6 mb-4 shadow-lg text-white ${
          calc.isUnderStaffed ? 'bg-gradient-to-r from-red-500 to-red-700' : 
          calc.isOverStaffed ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
          'bg-gradient-to-r from-emerald-500 to-teal-600'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <input type="text" value={inputs.namaCabang} onChange={(e) => update('namaCabang', e.target.value)}
                className="bg-transparent border-none text-2xl font-bold focus:outline-none mb-2 w-full" placeholder="Nama Cabang" />
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-black">{calc.jumlahFTAktual}</p>
                  <p className="text-sm opacity-80">FT</p>
                </div>
                <span className="text-2xl opacity-50">+</span>
                <div className="text-center">
                  <p className="text-4xl font-black">{calc.jumlahFLAktual}</p>
                  <p className="text-sm opacity-80">FL</p>
                </div>
                <span className="text-2xl opacity-50">=</span>
                <div className="text-center bg-white/20 rounded-xl px-4 py-2">
                  <p className="text-4xl font-black">{calc.jumlahFTAktual + calc.jumlahFLAktual}</p>
                  <p className="text-sm opacity-80">Total</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Total Cost/Bulan</p>
              <p className="text-3xl font-bold">{fmtRp(calc.totalCostAktual)}</p>
              {calc.gapVsBest.cost > 0 && (
                <p className="text-sm opacity-90 mt-1">💰 Bisa hemat {fmtRp(calc.gapVsBest.cost)}/bln</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT - Input dengan Penjelasan */}
          <div className="lg:col-span-3 space-y-4">
            <Section title="Data Kelas" icon="📚" color="blue" description="Data dari sistem scheduling cabang">
              <Field 
                label="Total Sesi/Bulan" 
                field="totalSesi" 
                unit="sesi"
                help="Jumlah SEMUA sesi kelas yang dijadwalkan dalam 1 bulan. Termasuk group class, private, trial, dll."
                example="Lihat di sistem scheduling → Total sesi bulan ini. Atau hitung: sesi per hari × hari operasional. Contoh: 20 sesi/hari × 20 hari = 400 sesi"
              />
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Durasi Sesi</label>
                  <button onClick={() => toggleHelp('durasiSesi')}
                    className={`text-xs px-2 py-0.5 rounded-full ${showHelp['durasiSesi'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {showHelp['durasiSesi'] ? '✕' : '?'}
                  </button>
                </div>
                {showHelp['durasiSesi'] && (
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <p className="text-gray-700 mb-2">Berapa menit durasi standar 1 sesi kelas di cabang ini.</p>
                    <div className="bg-white p-2 rounded border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">📌 Cara dapat datanya:</p>
                      <p className="text-xs text-blue-700">Dari SOP cabang. Biasanya 60 menit (1 jam) atau 90 menit (1.5 jam)</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {[60, 90].map(d => (
                    <button key={d} onClick={() => update('durasiSesi', d)}
                      className={`flex-1 py-2 rounded-lg font-bold ${inputs.durasiSesi === d ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      {d} menit
                    </button>
                  ))}
                </div>
              </div>
              
              <Field 
                label="Siswa per Kelas" 
                field="siswaPerKelas" 
                unit="org"
                help="Rata-rata jumlah siswa dalam 1 kelas. Untuk group class biasanya 6-12, private = 1."
                example="Dari data siswa: Total siswa aktif ÷ Jumlah kelas. Atau lihat report rata-rata class size"
              />
              
              <Field 
                label="% Peak Hour" 
                field="pctPeak" 
                unit="%"
                help="Persentase kelas yang jatuh di JAM SIBUK (biasanya 15:00-20:00). Semakin tinggi = semakin sulit scheduling, butuh lebih banyak teacher standby."
                example="Hitung dari jadwal: Jumlah sesi di jam 15:00-20:00 ÷ Total sesi × 100. Contoh: 260 sesi sore dari 400 total = 65%"
              />
            </Section>

            <Section title="Operasional" icon="⚙️" color="gray" description="Data dari report operasional bulanan">
              <Field 
                label="Hari Ops/Bulan" 
                field="hariOps" 
                unit="hari"
                help="Berapa hari cabang BUKA dalam 1 bulan."
                example="Hitung dari kalender: Senin-Sabtu = 26 hari, Senin-Jumat = 22 hari, 7 hari seminggu = 30 hari"
              />
              
              <Field 
                label="% Batal" 
                field="pctBatal" 
                unit="%"
                help="Persentase kelas yang DIBATALKAN TOTAL — tidak jadi sama sekali. Jam ini hilang, tidak perlu diajar."
                example="Dari report pembatalan: Jumlah sesi batal ÷ Total sesi dijadwalkan × 100. Contoh: 20 batal dari 400 = 5%"
              />
              
              <Field 
                label="% Reschedule" 
                field="pctResched" 
                unit="%"
                help="Persentase kelas yang PINDAH JADWAL — kelas tetap jalan tapi ganti waktu. Ini menambah beban koordinasi teacher."
                example="Dari report reschedule: Jumlah sesi reschedule ÷ Total sesi × 100. Contoh: 48 reschedule dari 400 = 12%"
              />
              
              <Field 
                label="% No-Show" 
                field="pctNoshow" 
                unit="%"
                help="Persentase sesi dimana SISWA TIDAK HADIR tanpa kabar. Teacher tetap standby tapi mengajar tidak efektif."
                example="Dari report kehadiran: Jumlah sesi no-show ÷ Total sesi × 100. Contoh: 32 no-show dari 400 = 8%"
              />
              
              <Field 
                label="Gap Factor" 
                field="gapFactor" 
                unit="%"
                help="Persentase waktu yang HILANG karena JEDA antar kelas. Misal: kelas jam 10 selesai, kelas berikutnya jam 13 = ada gap 2 jam yang tidak produktif."
                example="Estimasi dari pola jadwal: Jika banyak gap 1-2 jam antar kelas = 15-20%. Jika jadwal padat minim gap = 5-10%. Perlu observasi langsung"
              />
            </Section>

            <Section title="Beban Akademik" icon="📋" color="purple" description="Waktu kerja di luar mengajar">
              <Field 
                label="Prep/Sesi" 
                field="prepPerSesi" 
                unit="menit"
                help="Waktu yang dibutuhkan teacher untuk MENYIAPKAN materi SEBELUM mengajar 1 sesi. Termasuk: baca materi, siapkan slide, setup alat."
                example="Tanya teacher langsung atau observasi. Default industri pendidikan: 30 menit per sesi"
              />
              
              <Field 
                label="Assess/Sesi" 
                field="assessPerSesi" 
                unit="menit"
                help="Waktu untuk KOREKSI TUGAS dan buat FEEDBACK SETELAH mengajar 1 sesi. Termasuk: isi progress report, feedback ke ortu."
                example="Tanya teacher langsung. Default industri: 15 menit per sesi"
              />
              
              <Field 
                label="% Admin" 
                field="adminPct" 
                unit="%"
                help="Persentase waktu untuk TUGAS ADMIN: isi sistem, update data siswa, komunikasi ortu, dll. Dihitung dari total jam mengajar."
                example="Estimasi: Jika 60 jam mengajar dan 6 jam admin = 10%. Default: 10% dari jam mengajar"
              />
              
              <Field 
                label="Meeting/Bulan" 
                field="meetingJam" 
                unit="jam"
                help="Total JAM untuk MEETING TIM dan TRAINING per bulan PER TEACHER. Ini mengurangi kapasitas mengajar."
                example="Hitung: Weekly meeting 2 jam × 4 minggu = 8 jam + Training bulanan 2 jam = 10 jam total"
              />
            </Section>

            <Section title="Kapasitas FT" icon="👔" color="blue" description="Standar kerja Full-Time">
              <Field 
                label="Jam Kerja/Hari" 
                field="ftJamHari" 
                unit="jam"
                help="Jam kerja KONTRAK per hari — berapa jam FT harus hadir (bukan jam mengajar)."
                example="Dari kontrak kerja. Standar: 8 jam/hari"
              />
              
              <Field 
                label="Hari Kerja/Bulan" 
                field="ftHariBulan" 
                unit="hari"
                help="Berapa hari FT MASUK KERJA dalam 1 bulan."
                example="Dari aturan kerja: Senin-Sabtu = 26 hari, Senin-Jumat = 22 hari"
              />
              
              <Field 
                label="Max Teach/Hari" 
                field="ftMaxTeach" 
                unit="jam"
                help="BATAS MAKSIMUM jam MENGAJAR per hari. Lebih dari ini = risiko burnout. Sisanya untuk prep, admin, istirahat."
                example="Kebijakan cabang. Rekomendasi: 5-6 jam mengajar dari 8 jam kerja"
              />
              
              <Field 
                label="Efektivitas" 
                field="ftEfektif" 
                unit="%"
                help="Persentase jam kerja yang BENAR-BENAR PRODUKTIF. Manusia tidak 100% produktif — ada istirahat, transisi, gangguan."
                example="Realistis: 80% (dari 8 jam kerja, efektif produktif sekitar 6.4 jam)"
              />
            </Section>

            <Section title="Kapasitas FL" icon="🎯" color="orange" description="Standar kerja Freelance">
              <Field 
                label="Jam Available/Hari" 
                field="flJamHari" 
                unit="jam"
                help="RATA-RATA jam freelance BERSEDIA mengajar per hari. FL biasanya tidak full day."
                example="Dari data kehadiran FL atau tanya langsung. Tipikal: 4-5 jam/hari"
              />
              
              <Field 
                label="Hari Aktif/Bulan" 
                field="flHariBulan" 
                unit="hari"
                help="Berapa hari FL AKTIF mengajar dalam 1 bulan. Biasanya lebih sedikit dari FT."
                example="Dari data kehadiran FL. Tipikal: 15-20 hari/bulan"
              />
              
              <Field 
                label="Max Teach/Hari" 
                field="flMaxTeach" 
                unit="jam"
                help="Batas maksimum jam mengajar FL per hari."
                example="Dari kebijakan atau observasi. Tipikal: 3-4 jam/hari"
              />
              
              <Field 
                label="Efektivitas" 
                field="flEfektif" 
                unit="%"
                help="FL biasanya KURANG EFEKTIF dari FT karena: tidak full commitment, koordinasi lebih sulit, kurang engaged."
                example="Lebih rendah dari FT. Default: 65% (vs FT 80%)"
              />
              
              <Field 
                label="Idle Factor" 
                field="flIdle" 
                unit="%"
                help="Persentase waktu FL yang TIDAK PRODUKTIF karena: gap jadwal lebih besar, koordinasi lebih lama, response time lambat."
                example="Estimasi dari pola kerja FL. Default: 25% (1 dari 4 jam tidak produktif)"
              />
            </Section>
          </div>

          {/* MIDDLE - Teachers */}
          <div className="lg:col-span-5 space-y-4">
            <Section title={`Teacher Full-Time (${ftTeachers.length})`} icon="👔" color="blue"
              description="Input gaji per orang — klik Detail untuk lihat semua komponen"
              action={<button onClick={addFT} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">+ Tambah FT</button>}>
              {ftTeachers.map(t => (
                <FTCard key={t.id} teacher={t} onUpdate={updateFT} onRemove={removeFT} onDuplicate={duplicateFT} canRemove={ftTeachers.length > 1} />
              ))}
              
              <div className="bg-blue-100 rounded-xl p-4 mt-4">
                <h4 className="font-bold text-blue-800 mb-3">Ringkasan Biaya FT</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span>Gaji+Tunjangan:</span><span className="font-mono">{fmtRp(calc.totalGajiTetap)}</span></div>
                  <div className="flex justify-between"><span>Non-Gaji:</span><span className="font-mono">{fmtRp(calc.totalNonGaji)}</span></div>
                  <div className="flex justify-between"><span>Extra Class:</span><span className="font-mono">{fmtRp(calc.totalExtraClass)}</span></div>
                  <div className="flex justify-between"><span>Extra Project:</span><span className="font-mono">{fmtRp(calc.totalExtraProject)}</span></div>
                  <div className="flex justify-between"><span>Bonus:</span><span className="font-mono">{fmtRp(calc.totalBonus)}</span></div>
                  <div className="flex justify-between font-bold text-blue-800 border-t pt-1"><span>TOTAL FT:</span><span>{fmtRp(calc.totalCostFTAktual)}</span></div>
                </div>
              </div>
            </Section>

            <Section title={`Teacher Freelance (${flConfig.jumlahFL})`} icon="🎯" color="orange"
              description="Input jumlah FL dan rate per sesi — semua FL pakai rate yang sama">
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Jumlah FL Aktif</label>
                    <button onClick={() => toggleHelp('jumlahFL')}
                      className={`text-xs px-2 py-0.5 rounded-full ${showHelp['jumlahFL'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {showHelp['jumlahFL'] ? '✕' : '?'}
                    </button>
                  </div>
                  {showHelp['jumlahFL'] && (
                    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <p className="text-gray-700 mb-2">Berapa orang freelance yang AKTIF mengajar bulan ini di cabang.</p>
                      <div className="bg-white p-2 rounded border border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">📌 Cara dapat datanya:</p>
                        <p className="text-xs text-blue-700">Hitung dari data FL aktif di sistem. FL yang bulan ini ada jadwal mengajar.</p>
                      </div>
                    </div>
                  )}
                  <input type="number" value={flConfig.jumlahFL} onChange={(e) => updateFL('jumlahFL', e.target.value)} min={0}
                    className="w-full px-3 py-3 text-center text-3xl font-bold border rounded-lg" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Rate/Sesi 60m</label>
                      <button onClick={() => toggleHelp('rate60')}
                        className={`text-xs px-2 py-0.5 rounded-full ${showHelp['rate60'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {showHelp['rate60'] ? '✕' : '?'}
                      </button>
                    </div>
                    {showHelp['rate60'] && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                        <p className="text-gray-700">Tarif FL untuk 1 sesi durasi 60 menit.</p>
                        <p className="text-blue-700 mt-1">📌 Dari kontrak FL atau kebijakan rate cabang</p>
                      </div>
                    )}
                    <input type="number" value={flConfig.rateSesi60} onChange={(e) => updateFL('rateSesi60', e.target.value)} step={10000}
                      className={`w-full px-3 py-2 text-right font-mono border rounded-lg ${inputs.durasiSesi === 60 ? 'bg-orange-100 border-orange-400' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Rate/Sesi 90m</label>
                      <button onClick={() => toggleHelp('rate90')}
                        className={`text-xs px-2 py-0.5 rounded-full ${showHelp['rate90'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {showHelp['rate90'] ? '✕' : '?'}
                      </button>
                    </div>
                    {showHelp['rate90'] && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                        <p className="text-gray-700">Tarif FL untuk 1 sesi durasi 90 menit.</p>
                        <p className="text-blue-700 mt-1">📌 Biasanya 1.3-1.5x dari rate 60 menit</p>
                      </div>
                    )}
                    <input type="number" value={flConfig.rateSesi90} onChange={(e) => updateFL('rateSesi90', e.target.value)} step={10000}
                      className={`w-full px-3 py-2 text-right font-mono border rounded-lg ${inputs.durasiSesi === 90 ? 'bg-orange-100 border-orange-400' : ''}`} />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rate aktif ({inputs.durasiSesi}m):</span>
                    <span className="font-bold">{fmtRp(calc.flRatePerSesi)}/sesi</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kapasitas/FL:</span>
                    <span className="font-mono">{calc.flSesiPerBulan} sesi/bulan</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-orange-700 border-t pt-2">
                    <span>Total Cost FL:</span>
                    <span>{fmtRp(calc.totalCostFLAktual)}/bulan</span>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* RIGHT - Results */}
          <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                <p className="text-xs text-gray-500">Workload</p>
                <p className="text-xl font-bold text-blue-700">{calc.totalWorkload.toFixed(0)} jam</p>
              </div>
              <div className={`rounded-xl p-3 text-center border ${calc.kapasitasTotal >= calc.totalWorkload ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-xs text-gray-500">Kapasitas</p>
                <p className={`text-xl font-bold ${calc.kapasitasTotal >= calc.totalWorkload ? 'text-green-700' : 'text-red-700'}`}>{calc.kapasitasTotal.toFixed(0)} jam</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-200">
                <p className="text-xs text-gray-500">1 FT = X FL</p>
                <p className="text-xl font-bold text-purple-700">{calc.ftSetaraFL}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-3 text-center border">
                <p className="text-xs text-gray-500">Cost/Sesi</p>
                <p className="text-xl font-bold text-gray-700">{fmtRp(calc.costPerSesiAktual)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3">🎯 Target vs Kebutuhan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Target FT:</span><span className="font-bold">{calc.totalTargetMengajar} sesi</span></div>
                <div className="flex justify-between"><span>Sesi Dibutuhkan:</span><span className="font-bold">{inputs.totalSesi} sesi</span></div>
                <div className={`flex justify-between p-2 rounded ${calc.totalTargetMengajar >= inputs.totalSesi ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span>Selisih:</span>
                  <span className={`font-bold ${calc.totalTargetMengajar >= inputs.totalSesi ? 'text-green-700' : 'text-red-700'}`}>
                    {calc.totalTargetMengajar - inputs.totalSesi} sesi
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3">Perbandingan Skenario</h3>
              <div className="grid grid-cols-2 gap-2">
                {calc.skenario.map(s => (
                  <ScenarioCard key={s.name} s={s} isBest={calc.bestScenario?.name === s.name && !s.isCurrent} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3">Metrik Risiko</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Utilization FT</span>
                    <span className="font-mono">{fmtPct(calc.utilizationFT)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className={`h-2 rounded-full ${calc.utilizationFT > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                      style={{width: `${Math.min(calc.utilizationFT, 100)}%`}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Teaching Intensity</span>
                    <span className="font-mono">{fmtPct(calc.teachingIntensityFT)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className={`h-2 rounded-full ${calc.teachingIntensityFT > 70 ? 'bg-orange-500' : 'bg-green-500'}`} 
                      style={{width: `${Math.min(calc.teachingIntensityFT, 100)}%`}} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm">Burnout Risk</span>
                  <span className={`font-bold ${calc.burnoutColor}`}>{calc.burnoutRisk}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3">Ringkasan Biaya</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Cost FT/Sesi:</span><span className="font-mono">{fmtRp(calc.costPerSesiFT)}</span></div>
                <div className="flex justify-between"><span>Rate FL/Sesi:</span><span className="font-mono">{fmtRp(calc.costPerSesiFL)}</span></div>
                <div className="flex justify-between"><span>Total Siswa:</span><span className="font-mono">{calc.totalSiswa}</span></div>
                <div className="flex justify-between border-t pt-2"><span>Cost/Siswa:</span><span className="font-mono">{fmtRp(calc.costPerSiswaAktual)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6 pb-4">
          MANPOWER ANALYTICS ENGINE v6.0 — Dengan Penjelasan Lengkap di Setiap Field
        </p>
      </div>
    </div>
  );
};

export default ManpowerDashboard;