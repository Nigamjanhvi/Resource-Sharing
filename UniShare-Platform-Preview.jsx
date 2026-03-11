import { useState } from "react";

const COLORS = {
  primary: "#0EA5E9",
  primaryDark: "#0284C7",
  secondary: "#6366F1",
  accent: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  bg: "#0F172A",
  bgCard: "#1E293B",
  bgCardHover: "#273344",
  border: "#334155",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textDim: "#64748B",
};

const MOCK_RESOURCES = [
  { id: 1, title: "Engineering Mathematics Vol. II", category: "Books", condition: "Good", priceType: "Free", price: 0, university: "MIT", views: 234, bookmarks: 18, status: "Available", postedBy: { name: "Alex Chen", avatar: "AC", trustScore: 4.8, totalRatings: 23 }, createdAt: "2 days ago", description: "Comprehensive engineering math textbook covering calculus, linear algebra, and differential equations. Very good condition with minimal highlighting.", tags: ["math", "engineering", "calculus"] },
  { id: 2, title: "Oscilloscope – 100MHz Dual Channel", category: "Electronics", condition: "Good", priceType: "Rent", price: 15, university: "Stanford", views: 89, bookmarks: 7, status: "Available", postedBy: { name: "Priya Singh", avatar: "PS", trustScore: 4.6, totalRatings: 11 }, createdAt: "5 days ago", description: "Professional oscilloscope perfect for electronics lab projects. Includes probes and carry case.", tags: ["electronics", "lab", "oscilloscope"] },
  { id: 3, title: "Data Structures Notes – CS301", category: "Notes", condition: "New", priceType: "Free", price: 0, university: "UC Berkeley", views: 512, bookmarks: 41, status: "Available", postedBy: { name: "Jordan Kim", avatar: "JK", trustScore: 4.9, totalRatings: 34 }, createdAt: "1 day ago", description: "Handwritten + typed notes covering BST, Graphs, DP and more. Exam-focused with solved problems.", tags: ["CS", "data-structures", "algorithms"] },
  { id: 4, title: "Organic Chemistry Lab Kit", category: "Lab Tools", condition: "Used", priceType: "Exchange", price: 0, university: "Caltech", views: 67, bookmarks: 5, status: "Available", postedBy: { name: "Sam Rivera", avatar: "SR", trustScore: 4.4, totalRatings: 8 }, createdAt: "1 week ago", description: "Full lab kit including glassware, spatulas, and basic reagents. Open to exchange for physics equipment.", tags: ["chemistry", "lab", "organic"] },
  { id: 5, title: "MacBook Pro 2021 M1 Charger", category: "Electronics", condition: "New", priceType: "Sale", price: 45, university: "Harvard", views: 178, bookmarks: 12, status: "Available", postedBy: { name: "Emma Johnson", avatar: "EJ", trustScore: 5.0, totalRatings: 5 }, createdAt: "3 days ago", description: "Original Apple 140W MagSafe 3 charger, still in box. Selling because I got a new charger.", tags: ["apple", "charger", "macbook"] },
  { id: 6, title: "Calculus: Early Transcendentals", category: "Books", condition: "Used", priceType: "Sale", price: 25, university: "MIT", views: 301, bookmarks: 22, status: "Available", postedBy: { name: "Wei Zhang", avatar: "WZ", trustScore: 4.7, totalRatings: 19 }, createdAt: "4 days ago", description: "Stewart Calculus 8th edition with all exercises. Some pen marks but very readable. Sold separately or bundled.", tags: ["calculus", "math", "stewart"] },
];

const NAV_ITEMS = ["Home", "Browse", "Post Resource", "Messages", "Dashboard"];
const CATEGORIES = ["All", "Books", "Notes", "Electronics", "Lab Tools", "Stationery", "Software"];
const PRICE_FILTERS = ["All", "Free", "Exchange", "Rent", "Sale"];

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: { bg: "#172554", text: "#60A5FA", border: "#1D4ED8" },
    green: { bg: "#052e16", text: "#4ADE80", border: "#15803D" },
    amber: { bg: "#451a03", text: "#FCD34D", border: "#B45309" },
    purple: { bg: "#2e1065", text: "#C084FC", border: "#7E22CE" },
    red: { bg: "#450a0a", text: "#FCA5A5", border: "#B91C1C" },
    gray: { bg: "#1e293b", text: "#94A3B8", border: "#475569" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
      {children}
    </span>
  );
};

const categoryColor = (cat) => ({ Books: "blue", Notes: "green", Electronics: "amber", "Lab Tools": "purple", Stationery: "gray", Software: "red" }[cat] || "gray");
const priceColor = (pt) => ({ Free: "green", Exchange: "purple", Rent: "amber", Sale: "blue" }[pt] || "gray");

const Avatar = ({ initials, size = 36, bg = "#0EA5E9" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${bg}, ${bg}99)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>
    {initials}
  </div>
);

const StarRating = ({ score, size = 12 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(score) ? "#F59E0B" : "#334155", fontSize: size }}>★</span>
    );
  }
  return <span>{stars}</span>;
};

const PriceDisplay = ({ priceType, price }) => {
  if (priceType === "Free") return <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: 18 }}>FREE</span>;
  if (priceType === "Exchange") return <span style={{ color: "#C084FC", fontWeight: 700, fontSize: 18 }}>Exchange</span>;
  if (priceType === "Rent") return <span style={{ color: "#FCD34D", fontWeight: 700, fontSize: 18 }}>${price}<span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted }}>/mo</span></span>;
  return <span style={{ color: "#60A5FA", fontWeight: 700, fontSize: 18 }}>${price}</span>;
};

const ResourceCard = ({ resource, onClick, isBookmarked, onBookmark }) => {
  const [hovered, setHovered] = useState(false);
  const avatarColors = ["#0EA5E9", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const bg = avatarColors[resource.id % avatarColors.length];

  return (
    <div
      onClick={() => onClick(resource)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? COLORS.bgCardHover : COLORS.bgCard,
        border: `1px solid ${hovered ? COLORS.primary : COLORS.border}`,
        borderRadius: 16, padding: 0, cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 12px 40px rgba(14, 165, 233, 0.2)` : "0 2px 8px rgba(0,0,0,0.3)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image placeholder */}
      <div style={{ height: 160, background: `linear-gradient(135deg, ${bg}22, ${bg}44)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 48, opacity: 0.6 }}>
          {resource.category === "Books" ? "📚" : resource.category === "Notes" ? "📝" : resource.category === "Electronics" ? "💻" : resource.category === "Lab Tools" ? "🔬" : "📦"}
        </div>
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <Badge color={categoryColor(resource.category)}>{resource.category}</Badge>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(resource.id); }}
          style={{ position: "absolute", top: 10, right: 10, background: "rgba(15,23,42,0.8)", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: isBookmarked ? "#F59E0B" : COLORS.textMuted, fontSize: 16 }}
        >
          {isBookmarked ? "★" : "☆"}
        </button>
        <div style={{ position: "absolute", bottom: 10, right: 10 }}>
          <Badge color={priceColor(resource.priceType)}>{resource.priceType}</Badge>
        </div>
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ color: COLORS.text, fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{resource.title}</h3>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge color="gray">{resource.condition}</Badge>
          <span style={{ color: COLORS.textDim, fontSize: 11 }}>📍 {resource.university}</span>
        </div>

        <PriceDisplay priceType={resource.priceType} price={resource.price} />

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar initials={resource.postedBy.avatar} size={28} bg={bg} />
            <div>
              <div style={{ color: COLORS.text, fontSize: 11, fontWeight: 500 }}>{resource.postedBy.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <StarRating score={resource.postedBy.trustScore} size={10} />
                <span style={{ color: COLORS.textDim, fontSize: 10 }}>({resource.postedBy.totalRatings})</span>
              </div>
            </div>
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 11 }}>{resource.createdAt}</div>
        </div>

        <div style={{ display: "flex", gap: 12, color: COLORS.textDim, fontSize: 11 }}>
          <span>👁 {resource.views}</span>
          <span>★ {resource.bookmarks}</span>
        </div>
      </div>
    </div>
  );
};

const ResourceDetail = ({ resource, onClose, onRequest }) => {
  const [requested, setRequested] = useState(false);
  const avatarColors = ["#0EA5E9", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const bg = avatarColors[resource.id % avatarColors.length];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 200, background: `linear-gradient(135deg, ${bg}33, ${bg}55)`, borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative" }}>
          {resource.category === "Books" ? "📚" : resource.category === "Notes" ? "📝" : resource.category === "Electronics" ? "💻" : resource.category === "Lab Tools" ? "🔬" : "📦"}
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(15,23,42,0.8)", border: `1px solid ${COLORS.border}`, borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: COLORS.text, fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <Badge color={categoryColor(resource.category)}>{resource.category}</Badge>
              <Badge color={priceColor(resource.priceType)}>{resource.priceType}</Badge>
              <Badge color="gray">{resource.condition}</Badge>
            </div>
            <h2 style={{ color: COLORS.text, fontSize: 22, fontWeight: 700, margin: 0 }}>{resource.title}</h2>
          </div>
          <div>
            <PriceDisplay priceType={resource.priceType} price={resource.price} />
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{resource.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {resource.tags.map(tag => (
              <span key={tag} style={{ background: "#0EA5E911", color: COLORS.primary, border: `1px solid #0EA5E933`, padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>#{tag}</span>
            ))}
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={resource.postedBy.avatar} size={44} bg={bg} />
            <div style={{ flex: 1 }}>
              <div style={{ color: COLORS.text, fontWeight: 600 }}>{resource.postedBy.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <StarRating score={resource.postedBy.trustScore} size={13} />
                <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{resource.postedBy.trustScore} ({resource.postedBy.totalRatings} reviews)</span>
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2 }}>📍 {resource.university}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => { setRequested(true); onRequest(resource); }}
              disabled={requested}
              style={{ flex: 1, background: requested ? COLORS.success : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, border: "none", borderRadius: 12, padding: "14px 24px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: requested ? "default" : "pointer", transition: "all 0.2s" }}
            >
              {requested ? "✓ Request Sent!" : "Send Request"}
            </button>
            <button style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 20px", color: COLORS.text, cursor: "pointer", fontSize: 20 }}>💬</button>
            <button style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 20px", color: COLORS.text, cursor: "pointer", fontSize: 20 }}>☆</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostResourceModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ title: "", category: "Books", condition: "Good", priceType: "Free", price: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); setTimeout(onClose, 1500); };

  if (submitted) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: COLORS.bgCard, borderRadius: 20, padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: COLORS.text, margin: "0 0 8px" }}>Resource Posted!</h2>
        <p style={{ color: COLORS.textMuted }}>Your resource is now live</p>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 20, maxWidth: 520, width: "100%", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}33, ${COLORS.secondary}33)`, padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ color: COLORS.text, margin: 0, fontSize: 18 }}>Post a Resource</h2>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>Step {step} of 3</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.textMuted, fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? COLORS.primary : COLORS.border, transition: "background 0.3s" }} />
            ))}
          </div>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8, display: "block" }}>Resource Title *</label>
                <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="e.g. Engineering Mathematics Vol. II" style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8, display: "block" }}>Category *</label>
                <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none" }}>
                  {["Books","Notes","Electronics","Lab Tools","Stationery","Software","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8, display: "block" }}>Condition</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["New","Good","Used","Worn"].map(c => (
                    <button key={c} onClick={() => setFormData(p => ({...p, condition: c}))} style={{ flex: 1, padding: "10px 0", background: formData.condition === c ? `${COLORS.primary}22` : "transparent", border: `1px solid ${formData.condition === c ? COLORS.primary : COLORS.border}`, borderRadius: 10, color: formData.condition === c ? COLORS.primary : COLORS.textMuted, cursor: "pointer", fontSize: 13 }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8, display: "block" }}>Price Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[{v:"Free",e:"🆓"},{v:"Exchange",e:"🔄"},{v:"Rent",e:"⏰"},{v:"Sale",e:"💰"}].map(({v,e}) => (
                    <button key={v} onClick={() => setFormData(p => ({...p, priceType: v}))} style={{ padding: "12px 0", background: formData.priceType === v ? `${COLORS.primary}22` : "transparent", border: `1px solid ${formData.priceType === v ? COLORS.primary : COLORS.border}`, borderRadius: 10, color: formData.priceType === v ? COLORS.primary : COLORS.textMuted, cursor: "pointer", fontSize: 13 }}>{e} {v}</button>
                  ))}
                </div>
              </div>
              {(formData.priceType === "Sale" || formData.priceType === "Rent") && (
                <div>
                  <label style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8, display: "block" }}>Price ($)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} placeholder="Enter amount" style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: COLORS.textMuted }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14 }}>Drop images here or click to upload</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>PNG, JPG, PDF up to 10MB</div>
              </div>
              <div style={{ background: COLORS.bg, borderRadius: 12, padding: 16 }}>
                <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 10 }}>Review:</div>
                {[["Title", formData.title || "—"], ["Category", formData.category], ["Condition", formData.condition], ["Price Type", formData.priceType]].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ color: COLORS.textDim, fontSize: 13 }}>{k}</span>
                    <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {step > 1 && <button onClick={() => setStep(s => s-1)} style={{ flex: 1, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px", color: COLORS.text, cursor: "pointer", fontSize: 14 }}>← Back</button>}
            <button onClick={step < 3 ? () => setStep(s => s+1) : handleSubmit} style={{ flex: 2, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {step < 3 ? "Continue →" : "Post Resource 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const CHATS = [
    { id: 1, name: "Alex Chen", avatar: "AC", lastMsg: "Sure, let's meet tomorrow!", time: "2m", unread: 2, resource: "Engineering Math Vol.II" },
    { id: 2, name: "Priya Singh", avatar: "PS", lastMsg: "The oscilloscope is still available", time: "1h", unread: 0, resource: "Oscilloscope 100MHz" },
    { id: 3, name: "Jordan Kim", avatar: "JK", lastMsg: "Can I pick it up Friday?", time: "3h", unread: 1, resource: "CS301 Notes" },
  ];
  const [activeChat, setActiveChat] = useState(CHATS[0]);
  const MESSAGES = [
    { id: 1, text: "Hi! Is the Engineering Math book still available?", mine: false, time: "10:30" },
    { id: 2, text: "Yes it is! Are you interested in picking it up?", mine: true, time: "10:32" },
    { id: 3, text: "Definitely! How about we meet at the library tomorrow at 3pm?", mine: false, time: "10:35" },
    { id: 4, text: "Sure, let's meet tomorrow!", mine: true, time: "10:36" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 20, maxWidth: 720, width: "100%", height: 520, display: "flex", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Sidebar */}
        <div style={{ width: 240, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: COLORS.text, margin: 0, fontSize: 15 }}>Messages</h3>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.textMuted, fontSize: 20, cursor: "pointer" }}>×</button>
          </div>
          {CHATS.map(chat => (
            <div key={chat.id} onClick={() => setActiveChat(chat)} style={{ padding: "12px 16px", cursor: "pointer", background: activeChat.id === chat.id ? `${COLORS.primary}15` : "transparent", borderBottom: `1px solid ${COLORS.border}22`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Avatar initials={chat.avatar} size={36} bg="#0EA5E9" />
                {chat.unread > 0 && <div style={{ position: "absolute", top: -2, right: -2, background: COLORS.danger, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{chat.unread}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>{chat.name}</span>
                  <span style={{ color: COLORS.textDim, fontSize: 11 }}>{chat.time}</span>
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={activeChat.avatar} size={36} bg="#0EA5E9" />
            <div>
              <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}>{activeChat.name}</div>
              <div style={{ color: COLORS.textDim, fontSize: 12 }}>re: {activeChat.resource}</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {MESSAGES.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.mine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "70%", background: msg.mine ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` : COLORS.bg, borderRadius: msg.mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px" }}>
                  <div style={{ color: "#fff", fontSize: 13 }}>{msg.text}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4, textAlign: msg.mine ? "right" : "left" }}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10 }}>
            <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 14px", color: COLORS.text, fontSize: 13, outline: "none" }} />
            <button style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, border: "none", borderRadius: 12, padding: "10px 16px", color: "#fff", cursor: "pointer", fontSize: 16 }}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeNav, setActiveNav] = useState("Browse");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePriceFilter, setActivePriceFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [notifications] = useState(3);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Bookmark removed"); }
      else { next.add(id); showToast("⭐ Resource bookmarked!"); }
      return next;
    });
  };

  const filtered = MOCK_RESOURCES.filter(r => {
    if (activeCategory !== "All" && r.category !== activeCategory) return false;
    if (activePriceFilter !== "All" && r.priceType !== activePriceFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif", color: COLORS.text }}>
      {/* Navbar */}
      <nav style={{ background: `${COLORS.bgCard}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 32, height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
            <span style={{ fontWeight: 800, fontSize: 18, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>UniShare</span>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <button key={item} onClick={() => { setActiveNav(item); if (item === "Post Resource") setShowPost(true); if (item === "Messages") setShowChat(true); }} style={{ background: activeNav === item ? `${COLORS.primary}20` : "transparent", border: `1px solid ${activeNav === item ? COLORS.primary : "transparent"}`, borderRadius: 8, padding: "6px 14px", color: activeNav === item ? COLORS.primary : COLORS.textMuted, cursor: "pointer", fontSize: 13, fontWeight: activeNav === item ? 600 : 400, transition: "all 0.2s" }}>
                {item}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowChat(true)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, position: "relative" }}>
              💬
              <span style={{ position: "absolute", top: -4, right: -4, background: COLORS.danger, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
            </button>
            <button style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, position: "relative" }}>
              🔔
              <span style={{ position: "absolute", top: -4, right: -4, background: COLORS.danger, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifications}</span>
            </button>
            <Avatar initials="YO" size={36} bg="#6366F1" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.secondary}15 100%)`, borderBottom: `1px solid ${COLORS.border}`, padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px", background: `linear-gradient(135deg, ${COLORS.text}, ${COLORS.primary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Share Academic Resources
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 16, margin: "0 0 24px" }}>
            Exchange books, notes, lab equipment and more with students at your university
          </p>
          <div style={{ display: "flex", gap: 10, maxWidth: 600, margin: "0 auto 24px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.textDim, fontSize: 16 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books, notes, equipment..." style={{ width: "100%", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px 12px 42px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => setShowPost(true)} style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" }}>+ Post Resource</button>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[["📚", "2,400+", "Resources"], ["🏫", "150+", "Universities"], ["👥", "8,500+", "Students"], ["✅", "4,200+", "Exchanges"]].map(([icon, num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div style={{ color: COLORS.primary, fontWeight: 700, fontSize: 20 }}>{num}</div>
                <div style={{ color: COLORS.textDim, fontSize: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 24px", position: "sticky", top: 64, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 24, alignItems: "center", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: activeCategory === cat ? COLORS.primary : "transparent", border: `1px solid ${activeCategory === cat ? COLORS.primary : COLORS.border}`, borderRadius: 20, padding: "5px 14px", color: activeCategory === cat ? "#fff" : COLORS.textMuted, cursor: "pointer", fontSize: 12, fontWeight: activeCategory === cat ? 600 : 400, transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: COLORS.border, flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {PRICE_FILTERS.map(pf => (
              <button key={pf} onClick={() => setActivePriceFilter(pf)} style={{ background: activePriceFilter === pf ? `${COLORS.accent}22` : "transparent", border: `1px solid ${activePriceFilter === pf ? COLORS.accent : COLORS.border}`, borderRadius: 20, padding: "5px 14px", color: activePriceFilter === pf ? COLORS.accent : COLORS.textMuted, cursor: "pointer", fontSize: 12, fontWeight: activePriceFilter === pf ? 600 : 400, transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {pf}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", color: COLORS.textDim, fontSize: 12, flexShrink: 0 }}>{filtered.length} results</div>
        </div>
      </div>

      {/* Resource Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: COLORS.text }}>No resources found</h3>
            <p style={{ color: COLORS.textMuted }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filtered.map(r => (
              <ResourceCard key={r.id} resource={r} onClick={setSelectedResource} isBookmarked={bookmarks.has(r.id)} onBookmark={toggleBookmark} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedResource && <ResourceDetail resource={selectedResource} onClose={() => setSelectedResource(null)} onRequest={(r) => showToast(`✅ Request sent for "${r.title}"!`)} />}
      {showPost && <PostResourceModal onClose={() => { setShowPost(false); setActiveNav("Browse"); }} />}
      {showChat && <ChatPanel onClose={() => { setShowChat(false); setActiveNav("Browse"); }} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.type === "success" ? COLORS.success : COLORS.danger, color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeIn 0.2s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
