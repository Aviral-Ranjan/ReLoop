import { useRef, useState } from "react";
import {
  ArrowUpRight, Calendar, Check, ChevronDown, CircuitBoard, Clock, FileImage, Laptop,
  Leaf, MapPin, Menu, Phone, Recycle, ScanLine, Smartphone, Sparkles, X, Zap
} from "lucide-react";

const categories = [
  { name: "Smartphones & Tablets", icon: Smartphone, copy: "Phones, tablets and small screens ready for a considered next step.", tone: "rose" },
  { name: "Laptops & Computers", icon: Laptop, copy: "Give working parts and valuable materials a better route back into use.", tone: "sand" },
  { name: "Chargers & Cables", icon: Zap, copy: "Sort the everyday accessories taking up space in your drawer.", tone: "clay" },
  { name: "Small Electronics", icon: CircuitBoard, copy: "Identify compact devices before they become a difficult-to-recycle mix.", tone: "sage" }
];
const demoResults = {
  Smartphones: { category: "Smartphone", type: "Mobile electronic device", grade: "B", reward: 150, confidence: 94 },
  Laptops: { category: "Laptop", type: "Portable computer", grade: "A", reward: 850, confidence: 96 },
  Earphones: { category: "Earphones", type: "Wired audio accessory", grade: "B", reward: 100, confidence: 91 },
  Accessories: { category: "Accessory", type: "Charger or cable", grade: "C", reward: 75, confidence: 88 }
};
const gradeDescriptions = {
  A: "Excellent condition · working and suitable for reuse",
  B: "Good condition · working with light wear",
  C: "Usable for parts or recovery · visible wear",
  D: "End-of-life condition · recycle safely"
};

function classifyLocally(fileName = "", selectedDemo = "") {
  const name = fileName.toLowerCase();
  let key = selectedDemo;
  if (!key) {
    if (/(earphone|earbud|headphone|headset|audio)/.test(name)) key = "Earphones";
    else if (/(laptop|notebook|computer|macbook)/.test(name)) key = "Laptops";
    else if (/(mobile|phone|smartphone|iphone|android|samsung)/.test(name)) key = "Smartphones";
    else key = "Accessories";
  }
  const match = demoResults[key] || demoResults.Accessories;
  return {
    category: match.category,
    productType: match.type,
    conditionGrade: match.grade,
    confidence: match.confidence,
    estimatedMinimumReward: match.reward,
    mode: "LOCAL DEMO"
  };
}

function App() {
  const uploadRef = useRef(null);
  const [view, setView] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenu(false);
  };
  const openInfo = () => {
    setView("info");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openHome = () => {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openRecovery = (mode = "centres") => {
    setView(`recovery-${mode}`);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const chooseFile = (picked) => {
    const selected = picked?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (selected.size > 8 * 1024 * 1024) {
      setError("That image is larger than 8 MB. Please choose a smaller file.");
      return;
    }
    setError(""); setSelectedDemo(""); setFile(selected); setPreview(URL.createObjectURL(selected));
    setResult(null); setStatus("idle");
  };
  const chooseDemo = (name) => {
    setSelectedDemo(name); setFile(null); setPreview(""); setError(""); setResult(null); setStatus("idle");
  };
  const classify = async () => {
    setError(""); setStatus("loading");
    const localResult = classifyLocally(file?.name, selectedDemo);
    try {
      const data = new FormData();
      if (file) data.append("image", file);
      if (selectedDemo) data.append("demoCategory", selectedDemo);
      const response = await fetch("http://localhost:4000/api/waste/classify", { method: "POST", body: data });
      if (!response.ok) throw new Error("The classification service could not respond.");
      const payload = await response.json();
      setResult(payload.result); setQuantity(1); setStatus("success");
    } catch {
      setResult(localResult); setQuantity(1); setStatus("success");
    }
  };
  const clearSelection = () => {
    setFile(null); setPreview(""); setSelectedDemo(""); setResult(null); setStatus("idle"); setError("");
  };
  const total = (result?.estimatedMinimumReward || 0) * quantity;

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <nav className="nav container">
          <button className="brand" onClick={() => scrollTo("top")} aria-label="ReLoop home">
            <span className="brand-mark"><Recycle size={16} strokeWidth={2.5} /></span><span>ReLoop</span>
          </button>
          <div className={`nav-links ${mobileMenu ? "open" : ""}`}>
            <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
            <button onClick={() => scrollTo("categories")}>Recycling</button>
            <button onClick={() => scrollTo("rewards")}>Rewards</button>
            <button onClick={openInfo}>Info</button>
            <button onClick={() => openRecovery("centres")}>Recovery</button>
            <button className="mobile-cta" onClick={() => scrollTo("upload")}>Start Recycling</button>
          </div>
          <div className="nav-actions"><button className="button button-dark compact" onClick={() => view === "home" ? scrollTo("upload") : openHome()}>{view === "home" ? "Start Recycling" : "Back Home"} <ArrowUpRight size={15} /></button></div>
          <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button>
        </nav>
      </header>

      {view === "info" ? <InfoPage onBack={openHome} /> : view.startsWith("recovery-") ? <RecoveryPage mode={view.replace("recovery-", "")} onBack={openHome} onSwitch={openRecovery} /> : <main id="top">
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Smart e-waste recovery</div>
            <h1>Give your old tech a <em>second life.</em></h1>
            <p className="hero-intro">Turn unused electronics into meaningful rewards. Identify your e-waste, discover its recovery value, and find the right way to recycle it.</p>
            <div className="hero-buttons"><button className="button button-dark" onClick={() => scrollTo("upload")}>Identify My E-Waste <ArrowUpRight size={17} /></button><button className="button button-outline" onClick={() => scrollTo("how-it-works")}>How It Works</button></div>
            <div className="trust-row">
              {[["Responsible recycling", Leaf], ["AI-assisted identification", ScanLine], ["Rewards for recovery", Sparkles]].map(([label, Icon]) => <div className="trust-item" key={label}><Icon size={15} /><span>{label}</span></div>)}
            </div>
          </div>
          <UploadPanel {...{ uploadRef, preview, selectedDemo, chooseFile, chooseDemo, clearSelection, classify, status, error, result }} />
        </section>

        {result && <section className="results-section container" aria-live="polite">
          <div className="result-heading"><div><div className="eyebrow">Classification report</div><h2>Your recovery snapshot</h2></div><span className="demo-pill"><span /> Demo mode</span></div>
          <div className="results-card">
            <div className="result-main"><div className="result-label">Identification</div><div className="result-category"><div className="result-icon"><Smartphone size={24} /></div><div><h3>{result.category}</h3><p>{result.productType}</p></div></div><div className="detail-grid"><div><span>E-waste grade</span><strong>{result.conditionGrade}</strong><small>{gradeDescriptions[result.conditionGrade]}</small></div><div><span>Classification confidence</span><strong>{result.confidence}%</strong><small>Lightweight prototype estimate</small></div></div></div>
            <div className="reward-panel"><div className="result-label">Estimated minimum reward</div><div className="reward-value">₹{total.toLocaleString("en-IN")}</div><p>Indicative estimate for {quantity} {quantity === 1 ? "item" : "items"}. Final reward is confirmed after physical inspection and successful pickup.</p><div className="quantity"><span>Quantity</span><div><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><strong>{quantity}</strong><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div></div></div>
            <div className="result-actions"><div><div className="result-label">Next step</div><p>Choose how you would like to continue.</p></div><button className="button button-dark" onClick={() => openRecovery("pickup")}>Schedule a Pickup <ArrowUpRight size={16} /></button><button className="button button-outline" onClick={() => openRecovery("centres")}>Find a Recycling Centre</button></div>
          </div>
        </section>}

        <section id="how-it-works" className="dark-section"><div className="container"><div className="section-top"><div className="eyebrow light"><span className="eyebrow-dot" /> A simpler way forward</div><h2>From unused tech<br />to <em>renewed value.</em></h2></div><div className="steps">{[["01", "Identify", "Upload a photo and discover the likely e-waste category and condition."], ["02", "Recover", "Choose a pickup service or find a suitable recycling centre."], ["03", "Earn", "Receive the eligible recovery reward and recycling-linked shopping coupons."]].map(([num, title, copy]) => <div className="step" key={num}><span className="step-number">{num}</span><div className="step-line" /><div className="step-content"><ScanLine size={20} /><h3>{title}</h3><p>{copy}</p></div></div>)}</div></div></section>

        <section id="categories" className="categories-section container"><div className="section-heading"><div><div className="eyebrow">Know your next step</div><h2>Every device deserves<br />a better <em>next step.</em></h2></div><p>Small choices add up. Start by understanding what is in your drawer and where it can go next.</p></div><div className="category-grid">{categories.map(({ name, icon: Icon, copy, tone }) => <article className={`category-card ${tone}`} key={name}><div className="category-visual"><Icon size={42} strokeWidth={1.2} /><span className="visual-orbit" /></div><div className="category-meta"><h3>{name}</h3><p>{copy}</p><button onClick={() => { chooseDemo(name.split(" ")[0] === "Smartphones" ? "Smartphones" : name.split(" ")[0] === "Laptops" ? "Laptops" : "Accessories"); scrollTo("upload"); }}>Explore category <ArrowUpRight size={15} /></button></div></article>)}</div></section>

        <section id="rewards" className="rewards-section container"><div className="reward-art"><div className="art-label">A more considered lifecycle</div><div className="art-circle circle-one" /><div className="art-circle circle-two" /><div className="art-device"><Smartphone size={62} strokeWidth={1} /><span>RELOOP<br /><b>01 / 03</b></span></div><div className="art-caption">Recover what still has value.</div></div><div className="rewards-copy"><div className="eyebrow">Recovery, made rewarding</div><h2>Make responsible disposal <em>rewarding.</em></h2><p>ReLoop makes the value of a responsible handoff easier to understand, from the first estimate to the final verified recovery.</p><div className="reward-model"><div className="model-row"><span className="model-index">01</span><div><h3>Recovery reward</h3><p>An indicative minimum amount based on category and quantity, confirmed after pickup and inspection.</p></div></div><div className="model-row"><span className="model-index">02</span><div><h3>Recycling coupon</h3><p>A prototype coupon issued after successful recycling through participating recovery partners.</p></div></div></div><div className="mini-reward"><span>YOUR ESTIMATED RECOVERY VALUE</span><strong>₹150</strong><small>Illustrative minimum reward · 1 smartphone</small></div><small className="disclaimer">Prototype example only. Actual rewards depend on category, condition, quantity, and verification.</small></div></section>
      </main>}

      <footer className="footer"><div className="container footer-inner"><div><button className="brand footer-brand" onClick={openHome}><span className="brand-mark"><Recycle size={16} /></span><span>ReLoop</span></button><p>Giving old tech a better next step.</p></div><div className="footer-links"><button onClick={() => view === "info" ? openHome() : scrollTo("how-it-works")}>How It Works</button><button onClick={() => view === "info" ? openHome() : scrollTo("categories")}>Categories</button><button onClick={() => view === "info" ? openHome() : scrollTo("rewards")}>Rewards</button><button onClick={openInfo}>Info</button></div><div className="footer-note">Built for a more responsible<br />electronics lifecycle.<small>© 2026 ReLoop</small></div></div></footer>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Close notice"><X size={16} /></button></div>}
    </div>
  );
}

function RecoveryPage({ mode, onBack, onSwitch }) {
  const [submitted, setSubmitted] = useState(false);
  const centres = [
    ["Green Loop Centre", "Sector 18, Noida", "+91 000000000"],
    ["Earthwise Recycling Hub", "Vasant Kunj, New Delhi", "+91 000000000"],
    ["Second Cycle Point", "Gurugram Sector 44", "+91 000000000"],
    ["Clean Circuit Centre", "Rohini, New Delhi", "+91 000000000"],
    ["Urban Reclaim Hub", "Faridabad Sector 16", "+91 000000000"],
    ["Renew Electronics Point", "Ghaziabad Raj Nagar", "+91 000000000"]
  ];
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return <main className="recovery-page">
    <section className="recovery-hero container">
      <button className="back-link" onClick={onBack}><ArrowUpRight size={15} className="back-arrow" /> Back to ReLoop</button>
      <div className="eyebrow"><span className="eyebrow-dot" /> Delhi NCR recovery network</div>
      <h1>A responsible next step, <em>near you.</em></h1>
      <p>Find a nearby recycling centre or request a convenient pickup for your electronics. All listings and contact details below are dummy data for this prototype.</p>
      <div className="recovery-tabs"><button className={mode === "centres" ? "active" : ""} onClick={() => onSwitch("centres")}>Find a recycling centre</button><button className={mode === "pickup" ? "active" : ""} onClick={() => onSwitch("pickup")}>Schedule a pickup</button></div>
    </section>
    {mode === "centres" ? <section className="centres-section container"><div className="recovery-section-heading"><div><div className="eyebrow">Dummy listings · Delhi NCR</div><h2>Recovery points<br /><em>close to home.</em></h2></div><p><MapPin size={16} /> Locations shown across Delhi, Noida, Gurugram, Faridabad, and Ghaziabad.</p></div><div className="centre-grid">{centres.map(([name, address, phone], index) => <article className="centre-card" key={name}><div className="centre-number">0{index + 1}</div><h3>{name}</h3><div className="centre-detail"><MapPin size={14} /><span>{address}, Delhi NCR</span></div><div className="centre-detail"><Phone size={14} /><span>{phone}</span></div><button onClick={() => onSwitch("pickup")}>Schedule pickup here <ArrowUpRight size={14} /></button></article>)}</div></section> : <section className="pickup-section container"><div className="pickup-intro"><div className="eyebrow">Dummy booking flow</div><h2>Schedule a <em>pickup.</em></h2><p>Tell us where to collect your electronics. This prototype does not create a real booking or contact a service provider.</p><div className="pickup-note"><Clock size={17} /><span>Pickup window<br /><strong>Monday to Saturday · 10:00 AM – 6:00 PM</strong></span></div></div><form className="pickup-form" onSubmit={handleSubmit}><div className="form-label">Pickup details</div><label>Your name<input required name="name" placeholder="Enter your name" /></label>        <label>Phone number<input required name="phone" placeholder="+91 0000000000" pattern="[+]91 [0-9]{10}" /></label><label>Delhi NCR address<textarea required name="address" placeholder="House / building, locality, city"></textarea></label><div className="form-row"><label>Preferred date<input required type="date" name="date" /></label><label>Preferred time<select required name="time" defaultValue=""><option value="" disabled>Select a window</option><option>10:00 AM – 1:00 PM</option><option>2:00 PM – 6:00 PM</option></select></label></div><label>Items for pickup<input required name="items" placeholder="Example: 1 laptop and 2 earphones" /></label><button className="button button-dark pickup-submit" type="submit">{submitted ? "Request received" : "Request a demo pickup"} <ArrowUpRight size={16} /></button>{submitted && <p className="form-success"><Check size={15} /> Demo request recorded locally.</p>}</form></section>}
  </main>;
}

function InfoPage({ onBack }) {
  const categories = [
    ["Smartphones and tablets", "Devices with screens, batteries, cameras, and circuit boards. Remove personal data before handing them over."],
    ["Laptops and computers", "Portable and desktop computers that may contain reusable memory, storage, displays, metals, and batteries."],
    ["Earphones and headphones", "Wired and wireless audio devices. Keep batteries and cables together where possible and avoid putting them in household bins."],
    ["Chargers, cables, and small electronics", "Adapters, wires, keyboards, mice, remotes, and other compact electronics that need specialist recovery."]
  ];
  const grades = [
    ["A", "Ready for reuse", "Working reliably with little visible wear. Reuse, resale, donation, or refurbishment should be considered first."],
    ["B", "Working with light wear", "The device works but has minor scratches, cosmetic wear, or an older battery. Repair or refurbishment may extend its life."],
    ["C", "Parts or material recovery", "The device has significant wear or limited functionality. Recyclers can recover useful parts and materials."],
    ["D", "End of life", "The device is unsafe, severely damaged, or non-functional. Use an authorized e-waste collection service."]
  ];
  return <main className="info-page">
    <section className="info-hero container">
      <button className="back-link" onClick={onBack}><ArrowUpRight size={15} className="back-arrow" /> Back to ReLoop</button>
      <div className="eyebrow"><span className="eyebrow-dot" /> ReLoop information guide</div>
      <h1>Make a more informed <em>next step.</em></h1>
      <p>Understand the electronics you are sorting, what their condition grade means, and how responsible recovery supports a more sustainable electronics lifecycle.</p>
    </section>
    <section className="info-block container">
      <div className="info-section-heading"><div className="eyebrow">01 / Categories</div><h2>What can be recovered?</h2><p>Different devices contain different materials and need different handling. These are the categories supported by this prototype.</p></div>
      <div className="info-category-list">{categories.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={18} /></article>)}</div>
    </section>
    <section className="info-grade-section"><div className="container"><div className="info-section-heading"><div className="eyebrow light"><span className="eyebrow-dot" /> 02 / E-waste grades</div><h2>Every grade points<br />to a <em>better action.</em></h2><p>Grades are illustrative prototype guidance. A physical inspection is needed for a final condition and reward.</p></div><div className="grade-grid">{grades.map(([grade, title, copy]) => <article key={grade}><strong>{grade}</strong><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
    <section className="info-sustainability container"><div className="sustainability-visual"><div className="sustainability-ring" /><Leaf size={54} strokeWidth={1.2} /><span>REUSE<br />RECOVER<br />REPEAT</span></div><div className="sustainability-copy"><div className="eyebrow">03 / Sustainable development</div><h2>Small recovery choices support <em>lasting progress.</em></h2><p>Sustainable development means meeting today’s needs while protecting the ability of future generations to meet theirs. For electronics, that starts with keeping products and materials in use for longer.</p><div className="sustainability-points"><div><strong>Extend product life</strong><span>Repair, reuse, donate, or refurbish working devices before recycling them.</span></div><div><strong>Recover valuable materials</strong><span>Responsible recyclers can separate materials and reduce the need for new extraction.</span></div><div><strong>Protect people and places</strong><span>Authorized collection helps keep hazardous components out of soil, water, and informal waste streams.</span></div></div><p className="info-disclaimer">ReLoop is a college project prototype. Its rewards, grades, and sustainability guidance are illustrative and should not replace local recycling regulations.</p></div></section>
  </main>;
}

function UploadPanel({ uploadRef, preview, selectedDemo, chooseFile, chooseDemo, clearSelection, classify, status, error, result }) {
  const hasSelection = Boolean(preview || selectedDemo);
  return <section id="upload" className="upload-card" ref={uploadRef}>
    <div className="card-topline"><span>01 / 03</span><span className="scan-label">AI-assisted scan</span></div>
    <div className="upload-title"><div><div className="eyebrow">Start with what you have</div><h2>What's in your drawer?</h2><p>Upload a photo of your unused electronics to get started.</p></div><div className="scan-symbol"><ScanLine size={24} /></div></div>
    <div className={`dropzone ${hasSelection ? "has-selection" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files); }} onClick={() => !hasSelection && document.getElementById("file-input").click()} role="button" tabIndex="0" onKeyDown={(e) => e.key === "Enter" && document.getElementById("file-input").click()}>
      {preview ? <img src={preview} alt="Selected e-waste preview" /> : hasSelection ? <div className="demo-preview"><Smartphone size={40} /><span>{selectedDemo} demo item</span></div> : <><FileImage size={30} /><strong>Drop your e-waste photo here</strong><span>or browse files · JPG, PNG, WEBP</span><button className="browse-button" type="button" onClick={(e) => { e.stopPropagation(); document.getElementById("file-input").click(); }}>Browse files</button></>}
      {hasSelection && <button className="change-button" type="button" onClick={(e) => { e.stopPropagation(); clearSelection(); }}>Change selection <X size={14} /></button>}
    </div>
    <input id="file-input" ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => chooseFile(e.target.files)} />
    {error && <p className="error-message">{error}</p>}
    <div style={{height: "20px"}}></div>
    <button className="identify-button" disabled={!hasSelection || status === "loading"} onClick={classify}>{status === "loading" ? "Classifying..." : result ? "Identify another item" : "Identify E-Waste"} <ArrowUpRight size={17} /></button>

  </section>;
}

export default App;
