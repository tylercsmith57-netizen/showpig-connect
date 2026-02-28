import { useState, useEffect } from "react";
import { supabase } from './supabaseClient';
import { loadFarmData } from './db';
import { initialData } from './lib/constants';
import { css } from './lib/styles';
import { IconDashboard, IconSow, IconBoar, IconCalendar, IconPigs, IconCustomers, IconReports } from './components/icons';
import { RecordSaleModal } from './components/breeder/Modals/RecordSaleModal';

// Breeder views
import { Dashboard } from './components/breeder/Dashboard';
import { SowsView, SowDetail } from './components/breeder/SowsView';
import { LitterDetail } from './components/breeder/LitterDetail';
import { PigsView, PigDetail } from './components/breeder/PigsView';
import { BreedingCalendar } from './components/breeder/BreedingCalendar';
import { ShowmenView } from './components/breeder/ShowmenView';
import { BoarsView } from './components/breeder/BoarsView';
import { FinancialReports } from './components/breeder/FinancialReports';

// Breeder modals
import { SowModal, BoarModal, ShowmanModal, AddPigModal, RecordFarrowModal, LogBreedModal, AddExpenseModal } from './components/breeder/modals/BreederModals';

// Showman
import { ShowmanDashboard } from './components/showman/ShowmanPortal';

// Shared / Auth
import { LandingPage, BreederLogin, BreederSignup, CustomerLogin } from './components/shared/Auth';
import { ShowmanLogin, ShowmanSignup } from './components/shared/ShowmanAuth';
import { CustomerPortal } from './components/shared/Auth';

export default function App() {
  const [portal, setPortal] = useState("landing");
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [loggedInShowman, setLoggedInShowman] = useState(null);

const [data, setData] = useState(initialData)
const [loading, setLoading] = useState(false)

useEffect(() => {
  if (portal !== 'breeder') return
  setLoading(true)
  loadFarmData().then(result => {
    if (result) {
      setData(result.farmData)
      setFarmId(result.farmId)
    } else {
      setData({ farm: { name: '', owner: '', location: '' }, sows: [], boars: [], litters: [], pigs: [], showmen: [] })
    }
    setLoading(false)
  })
}, [portal])
  const [view, setView] = useState({ page: "dashboard" });

  // Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDefaultSow, setExpenseDefaultSow] = useState(null);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [breedDefaultSow, setBreedDefaultSow] = useState(null);
  const [showSowModal, setShowSowModal] = useState(false);
  const [editSow, setEditSow] = useState(null);
  const [showBoarModal, setShowBoarModal] = useState(false);
  const [editBoar, setEditBoar] = useState(null);
  const [showShowmanModal, setShowShowmanModal] = useState(false);
  const [editShowman, setEditShowman] = useState(null);
  const [showAddPigModal, setShowAddPigModal] = useState(false);
  const [addPigLitterId, setAddPigLitterId] = useState(null);
  const [showFarrowModal, setShowFarrowModal] = useState(false);
  const [farrowDefaultSow, setFarrowDefaultSow] = useState(null);
  const [farmId, setFarmId] = useState(null)
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleDefaultCustomer, setSaleDefaultCustomer] = useState(null);

  // Data mutations
  const logBreedDate = async (sowId, cycle, autoExpenses = []) => {
    const cycleData = {
      farm_id: farmId,
      sow_id: sowId,
      boar_id: cycle.sireId || null,
      breed_date: cycle.breedDate,
      method: cycle.method || 'Natural',
      doses: cycle.doses || 1,
      notes: cycle.notes || null,
      conceived: cycle.conceived || false,
      conceive_date: cycle.conceiveDate || null,
      farrow_date_actual: cycle.expectedFarrowDate || cycle.farrowDateActual || null,
      missed: cycle.missed || false,
      missed_date: cycle.missedDate || null,
    }
    const { data: newCycle } = await supabase.from('breeding_cycles').insert(cycleData).select().single()
    const cycleWithId = newCycle ? { ...cycle, id: newCycle.id } : { id: uid(), ...cycle }

    if (autoExpenses.length > 0) {
      const expenseRows = autoExpenses.map(e => ({
        farm_id: farmId,
        sow_id: e.sowId,
        date: e.cost.date,
        category: e.cost.category,
        description: e.cost.description,
        amount: e.cost.amount,
      }))
      await supabase.from('sow_expenses').insert(expenseRows)
    }

    setData(prev => {
      let updated = { ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: [...(s.breedingCycles || []), cycleWithId] }) };
      if (autoExpenses.length > 0) {
        updated = { ...updated, sows: updated.sows.map(s => { const mine = autoExpenses.filter(e => e.sowId === s.id); return mine.length === 0 ? s : { ...s, costs: [...(s.costs || []), ...mine.map(e => e.cost)] }; }) };
      }
      return updated;
    });
  };
  const addExpenses = async (entries) => {
    const expenseRows = entries.map(e => ({
      farm_id: farmId,
      sow_id: e.sowId,
      date: e.cost.date,
      category: e.cost.category,
      description: e.cost.description,
      amount: e.cost.amount,
    }))
    await supabase.from('sow_expenses').insert(expenseRows)
    setData(prev => ({ ...prev, sows: prev.sows.map(s => { const mine = entries.filter(e => e.sowId === s.id); return mine.length === 0 ? s : { ...s, costs: [...(s.costs || []), ...mine.map(e => e.cost)] }; }) }));
  };
const deleteCycle = async (sowId, cycleId) => {
  if (!window.confirm("Delete this breeding cycle? This cannot be undone.")) return;
  await supabase.from('breeding_cycles').delete().eq('id', cycleId)
  setData(prev => ({ ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: (s.breedingCycles || []).filter(c => c.id !== cycleId) }) }))
}

const saveSow = async (sow) => {
  const sowData = {
    farm_id: farmId,
    name: sow.name,
    tag: sow.tag,
    breed: sow.breed,
    dob: sow.dob || null,
    sire: sow.sire || null,
    dam_sire: sow.damSire || null,
    active: true,
    notes: sow.notes || null,
  }

  if (sow.id && !sow.id.startsWith('sow-') && !sow.id.startsWith('id-')) {
    await supabase.from('sows').update(sowData).eq('id', sow.id)
    setData(prev => ({ ...prev, sows: prev.sows.map(s => s.id === sow.id ? { ...sow, ...sowData } : s) }))
  } else {
    const { data: newSow } = await supabase.from('sows').insert(sowData).select().single()
    if (newSow) setData(prev => ({ ...prev, sows: [...prev.sows, { ...sow, id: newSow.id }] }))
  }
}

const deleteSow = async (id) => {
  if (!window.confirm("Delete this sow? Associated litters and pigs will remain.")) return;
  await supabase.from('sows').delete().eq('id', id)
  setData(prev => ({ ...prev, sows: prev.sows.filter(s => s.id !== id) }))
};
const saveBoar = async (boar) => {
  const boarData = {
    farm_id: farmId,
    name: boar.name,
    tag: boar.tag,
    breed: boar.breed || null,
    dob: boar.dob || null,
    owner: boar.owner || null,
    location: boar.location || 'on-farm',
    method: boar.method || 'Natural',
    semen_dose_price: boar.semenDosePrice || 0,
    doses_per_breeding: boar.dosesPerBreeding || 1,
    active: true,
    notes: boar.notes || null,
  }

  if (boar.id && !boar.id.startsWith('boar-') && !boar.id.startsWith('id-')) {
    await supabase.from('boars').update(boarData).eq('id', boar.id)
    setData(prev => ({ ...prev, boars: prev.boars.map(b => b.id === boar.id ? { ...boar, ...boarData } : b) }))
  } else {
    const { data: newBoar } = await supabase.from('boars').insert(boarData).select().single()
    if (newBoar) setData(prev => ({ ...prev, boars: [...prev.boars, { ...boar, id: newBoar.id }] }))
  }
}

const deleteBoar = async (id) => {
  if (!window.confirm("Delete this boar?")) return;
  await supabase.from('boars').delete().eq('id', id)
  setData(prev => ({ ...prev, boars: prev.boars.filter(b => b.id !== id) }))
};
const saveShowman = async (sm) => {
  const customerData = {
    farm_id: farmId,
    name: sm.name,
    email: sm.email || null,
    phone: sm.phone || null,
    city: sm.city || null,
    state: sm.state || null,
    age: sm.age || null,
    club: sm.club || null,
    notes: sm.notes || null,
    portal_enabled: true,
  }

  if (sm.id && !sm.id.startsWith('showman-') && !sm.id.startsWith('id-')) {
    await supabase.from('customers').update(customerData).eq('id', sm.id)
    setData(prev => ({ ...prev, showmen: prev.showmen.map(s => s.id === sm.id ? { ...sm, ...customerData } : s) }))
  } else {
    const { data: newCustomer } = await supabase.from('customers').insert(customerData).select().single()
    if (newCustomer) {
      setData(prev => ({ ...prev, showmen: [...prev.showmen, { ...sm, id: newCustomer.id }] }))
    }
  }
}
  const deleteShowman = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await supabase.from('customers').delete().eq('id', id)
    setData(prev => {
      const sm = prev.showmen.find(s => s.id === id);
      const updatedPigs = prev.pigs.map(p => sm?.pigIds?.includes(p.id) ? { ...p, sold: false, showmanName: null, showmanContact: null, showmanPhone: null } : p);
      return { ...prev, showmen: prev.showmen.filter(s => s.id !== id), pigs: updatedPigs };
    });
  };
  const addPig = async (pig) => {
  const pigData = {
    farm_id: farmId,
    litter_id: pig.litterId || null,
    tag: pig.tag,
    sex: pig.sex,
    birth_weight: pig.birthWeight || null,
    color: pig.color || null,
    purchase_price: pig.purchasePrice || 0,
    sold: pig.sold || false,
  }

  const { data: newPig } = await supabase.from('pigs').insert(pigData).select().single()
  if (newPig) setData(prev => ({ ...prev, pigs: [...prev.pigs, { ...pig, id: newPig.id }] }))
}

  const addLitter = async (litter) => {
  const litterData = {
    farm_id: farmId,
    sow_id: litter.sowId,
    boar_id: litter.boarId || null,
    farrow_date: litter.farrowDate,
    number_born: litter.numberBorn || 0,
    number_born_alive: litter.numberBornAlive || 0,
    number_weaned: litter.numberWeaned || 0,
    wean_date: litter.weanDate || null,
    age_weaned_days: litter.ageWeanedDays || null,
    notes: litter.notes || null,
  };

  const { data: inserted, error } = await supabase.from("litters").insert([litterData]).select().single();
  if (error) { console.error("addLitter error:", error); return; }

  // Save auto-generated pigs to Supabase
  let savedPigs = [];
  if (litter.generatedPigs?.length > 0) {
    const pigRows = litter.generatedPigs.map(p => ({
      farm_id: farmId,
      litter_id: inserted.id,
      tag: p.tag,
      sex: p.sex,
      birth_weight: p.birthWeight || null,
      color: p.color || null,
      purchase_price: p.purchasePrice || 0,
      sold: false,
    }));
    const { data: insertedPigs } = await supabase.from("pigs").insert(pigRows).select();
    savedPigs = (insertedPigs || []).map((sp, i) => ({
      ...litter.generatedPigs[i],
      id: sp.id,
      litterId: inserted.id,
    }));
  }

  setData(prev => {
    const updatedSows = prev.sows.map(s => {
      if (s.id !== litter.sowId) return s;
      const updatedCycles = (s.breedingCycles || []).map(c =>
        c.id === litter.cycleId ? { ...c, farrowDateActual: litter.farrowDate } : c
      );
      return { ...s, breedingCycles: updatedCycles };
    });
    return {
      ...prev,
      sows: updatedSows,
      litters: [...prev.litters, { ...litter, id: inserted.id }],
      pigs: [...prev.pigs, ...savedPigs],
    };
  });
};

   const retainAnimal = async ({ type, record }) => {
  if (type === "sow") {
    await saveSow(record);
  } else {
    await saveBoar(record);
  }
};


  const recordSale = ({ sale, soldPigIds, customer, priceOverrides }) => {
  setData(prev => {
    const updatedPigs = prev.pigs.map(p => {
      if (!soldPigIds.includes(p.id)) return p;
      const salePrice = parseFloat(priceOverrides[p.id] ?? p.askingPrice ?? p.purchasePrice ?? 0);
      return { ...p, sold: true, soldDate: sale.saleDate, customerId: customer?.id, showmanName: customer?.name || null, purchasePrice: salePrice, saleId: sale.id };
    });
    const updatedShowmen = prev.showmen.map(sm => {
      if (sm.id !== customer?.id) return sm;
      return { ...sm, pigIds: [...new Set([...(sm.pigIds || []), ...soldPigIds])] };
    });
    return { ...prev, pigs: updatedPigs, showmen: updatedShowmen, sales: [...(prev.sales || []), sale] };
  });
};

const unassignCustomer = async (customerId, pigId) => {
  await supabase.from("pigs").update({ sold: false, sold_date: null, customer_id: null }).eq("id", pigId);
  // Find and delete the sale item
  const pig = data.pigs.find(p => p.id === pigId);
  if (pig?.saleId) {
    await supabase.from("sale_items").delete().eq("pig_id", pigId);
    // If no more items on that sale, delete the sale too
    const { data: remaining } = await supabase.from("sale_items").select("id").eq("sale_id", pig.saleId);
    if (!remaining || remaining.length === 0) await supabase.from("sales").delete().eq("id", pig.saleId);
  }
  setData(prev => {
    const updatedShowmen = prev.showmen.map(sm => sm.id === customerId ? { ...sm, pigIds: (sm.pigIds || []).filter(id => id !== pigId) } : sm);
    const updatedPigs = prev.pigs.map(p => p.id === pigId ? { ...p, sold: false, soldDate: null, customerId: null, showmanName: null, saleId: null } : p);
    return { ...prev, showmen: updatedShowmen, pigs: updatedPigs };
  });
};
  const navItems = [
    { id: "dashboard", icon: <IconDashboard />, label: "Dashboard", section: null },
    { id: "sows", icon: <IconSow />, label: "Sow Herd", section: "Herd Management" },
    { id: "boars", icon: <IconBoar />, label: "Service Sires", section: null },
    { id: "breeding", icon: <IconCalendar />, label: "Breeding Calendar", section: null },
    { id: "pigs", icon: <IconPigs />, label: "Individual Pigs", section: "Marketplace" },
    { id: "showmen", icon: <IconCustomers />, label: "Customers", section: null },
    { id: "reports", icon: <IconReports />, label: "Financial Reports", section: "Analytics" },
  ];

  const activePage = view.page.replace("Detail", "").replace("litter", "sow").replace("breeding", "breeding");

  const renderPage = () => {
    switch (view.page) {
      case "dashboard": return <Dashboard data={data} />;
      case "sows": return <SowsView data={data} setView={setView} onAddExpense={(id) => { setExpenseDefaultSow(id); setShowExpenseModal(true); }} onAddSow={() => { setEditSow(null); setShowSowModal(true); }} onEditSow={(sow) => { setEditSow(sow); setShowSowModal(true); }} onDeleteSow={deleteSow} />;
      case "sowDetail": return <SowDetail data={data} id={view.id} setView={setView} onAddExpense={(id) => { setExpenseDefaultSow(id); setShowExpenseModal(true); }} onLogBreed={(id) => { setBreedDefaultSow(id); setShowBreedModal(true); }} onRecordFarrow={(id) => { setFarrowDefaultSow(id); setShowFarrowModal(true); }} onMarkMissed={(sowId, cycleId) => setData(prev => ({ ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: (s.breedingCycles||[]).map(c => c.id !== cycleId ? c : { ...c, missed: true, missedDate: new Date().toISOString().split("T")[0] }) }) }))} 
      onConfirmConceived={async (sowId, cycleId) => {const today = new Date().toISOString().split("T")[0];await supabase.from("breeding_cycles").update({ conceived: true, conceive_date: today }).eq("id", cycleId); setData(prev => ({ ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: (s.breedingCycles||[]).map(c => c.id !== cycleId ? c : { ...c, conceived: true, conceiveDate: today }) }) }));}} onDeleteCycle={deleteCycle} />;
      case "litterDetail": return <LitterDetail data={data} id={view.id} setView={setView} onUpdateLitter={(updated) => setData(prev => ({ ...prev, litters: prev.litters.map(l => l.id === updated.id ? updated : l) }))} onAddPigToLitter={(litterId) => { setAddPigLitterId(litterId); setShowAddPigModal(true); }} />;
      case "boars": return <BoarsView data={data} onAddBoar={() => { setEditBoar(null); setShowBoarModal(true); }} onEditBoar={(boar) => { setEditBoar(boar); setShowBoarModal(true); }} onDeleteBoar={deleteBoar} />;
      case "breeding": return <BreedingCalendar data={data} setView={setView} onLogBreed={(id) => { setBreedDefaultSow(id); setShowBreedModal(true); }} />;
      case "pigs": return <PigsView data={data} setView={setView} onAddPig={() => { setAddPigLitterId(null); setShowAddPigModal(true); }} onRecordSale={() => setShowSaleModal(true)} />;
      case "pigDetail": return <PigDetail data={data} id={view.id} setView={setView} onAssignCustomer={null} onUnassignCustomer={unassignCustomer} onRetainAnimal={retainAnimal} />;
      case "showmen": return <ShowmenView data={data} setView={setView} onAddShowman={() => { setEditShowman(null); setShowShowmanModal(true); }} onEditShowman={(sm) => { setEditShowman(sm); setShowShowmanModal(true); }} onDeleteShowman={deleteShowman} onRecordSale={(customerId) => { setSaleDefaultCustomer(customerId); setShowSaleModal(true); }} />;
      case "reports": return <FinancialReports data={data} />;
      default: return <div className="empty" style={{ padding: 80 }}>Coming soon...</div>;
    }
  };

  //  Portal routing 
 if (loading) return <div style={{ color: 'white', padding: 40, fontSize: '1.2rem' }}>Loading...</div>
if (!data && portal === 'breeder') return <div style={{ color: 'white', padding: 40 }}>Could not load farm data.</div>
  if (portal === "landing") {
    return <LandingPage onSelectBreeder={() => setPortal("breeder-login")} onSelectCustomer={() => setPortal("showman-login")} onSignup={() => setPortal("breeder-signup")} onSignupShowman={() => setPortal("showman-signup")} />;
  }
  if (portal === "breeder-login") {
    return <BreederLogin onLogin={() => setPortal("breeder")} onBack={() => setPortal("landing")} />;
  }
  if (portal === "breeder-signup") {
    return <BreederSignup onSignup={() => setPortal("breeder-login")} onBack={() => setPortal("landing")} />;
  }
  if (portal === "showman-login") {
    return <ShowmanLogin onLogin={(profile) => { setLoggedInShowman(profile); setPortal("showman"); }} onBack={() => setPortal("landing")} onSignup={() => setPortal("showman-signup")} />;
  }
  if (portal === "showman-signup") {
    return <ShowmanSignup onSignup={() => setPortal("showman-login")} onBack={() => setPortal("landing")} />;
  }
  if (portal === "showman") {
    return <ShowmanDashboard profile={loggedInShowman} onLogout={() => { setLoggedInShowman(null); setPortal("landing"); supabase.auth.signOut(); }} />;
  }
  if (portal === "customer-login") {
    return <CustomerLogin data={data} onLogin={(customer) => { setLoggedInCustomer(customer); setPortal("customer"); }} onBack={() => setPortal("landing")} />;
  }
  if (portal === "customer" && loggedInCustomer) {
    const freshCustomer = data.showmen.find(sm => sm.id === loggedInCustomer.id) || loggedInCustomer;
    const updatePig = (updatedPig) => setData(prev => ({ ...prev, pigs: prev.pigs.map(p => p.id === updatedPig.id ? updatedPig : p) }));
    return <CustomerPortal customer={freshCustomer} data={data} onUpdatePig={updatePig} onLogout={() => { setLoggedInCustomer(null); setPortal("landing"); }} />;
  }

  //  Breeder portal 
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-brand">
            <h1>ShowPig<br />Connect</h1>
            <p>{data.farm.name}</p>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item, i) => {
              const prevItem = i > 0 ? navItems[i - 1] : null;
              const showSection = item.section && item.section !== prevItem?.section;
              return (
                <div key={item.id}>
                  {showSection && <div className="nav-section">{item.section}</div>}
                  <div className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setView({ page: item.id })}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
          <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", background: "var(--blue-bright)", color: "var(--text)" }} onClick={() => { setExpenseDefaultSow(null); setShowExpenseModal(true); }}>+ Add Expense</button>
            <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", fontSize: "0.75rem" }} onClick={() => setPortal("landing")}>← Switch Portal</button>
          </div>
        </div>
        <div className="main">{renderPage()}</div>

        {showBreedModal && <LogBreedModal sows={data.sows} boars={data.boars} defaultSowId={breedDefaultSow} onSave={(sowId, cycle, autoExpenses) => { logBreedDate(sowId, cycle, autoExpenses); setShowBreedModal(false); setBreedDefaultSow(null); }} onClose={() => setShowBreedModal(false)} />}
        {showFarrowModal && <RecordFarrowModal sows={data.sows} boars={data.boars} defaultSowId={farrowDefaultSow} onSave={(litter) => { addLitter(litter); setShowFarrowModal(false); setFarrowDefaultSow(null); }} onClose={() => { setShowFarrowModal(false); setFarrowDefaultSow(null); }} />}
        {showExpenseModal && <AddExpenseModal sows={data.sows} defaultSowId={expenseDefaultSow} onSave={(entries) => { addExpenses(entries); setShowExpenseModal(false); setExpenseDefaultSow(null); }} onClose={() => { setShowExpenseModal(false); setExpenseDefaultSow(null); }} />}
        {showSowModal && <SowModal sow={editSow} onSave={(sow) => { saveSow(sow); setShowSowModal(false); setEditSow(null); }} onClose={() => { setShowSowModal(false); setEditSow(null); }} />}
        {showBoarModal && <BoarModal boar={editBoar} onSave={(boar) => { saveBoar(boar); setShowBoarModal(false); setEditBoar(null); }} onClose={() => { setShowBoarModal(false); setEditBoar(null); }} />}
        {showShowmanModal && <ShowmanModal showman={editShowman} onSave={(sm) => { saveShowman(sm); setShowShowmanModal(false); setEditShowman(null); }} onClose={() => { setShowShowmanModal(false); setEditShowman(null); }} />}
        {showAddPigModal && <AddPigModal litterId={addPigLitterId} litters={data.litters} sows={data.sows} onSave={(pig) => { addPig(pig); setShowAddPigModal(false); setAddPigLitterId(null); }} onClose={() => { setShowAddPigModal(false); setAddPigLitterId(null); }} />}
        {showSaleModal && <RecordSaleModal data={data} farmId={farmId} defaultCustomerId={saleDefaultCustomer} onSave={recordSale} onClose={() => { setShowSaleModal(false); setSaleDefaultCustomer(null); }} />}
      </div>
    </>
  );
}
