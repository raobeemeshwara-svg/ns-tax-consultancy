// ===== Settings (change here if needed) =====
const WHATSAPP_NUMBER = "916281873262";   // country code + number, no + or spaces
const SMS_NUMBER      = "+916281873262";
const WEEKS_AHEAD     = 8;                // how many weekends to show

// Available sessions (Saturday & Sunday only): 10-12 and 6-8 PM, 30-minute slots
const SLOTS = [
  { label: "10:00 AM", h: 10, m: 0 },  { label: "10:30 AM", h: 10, m: 30 },
  { label: "11:00 AM", h: 11, m: 0 },  { label: "11:30 AM", h: 11, m: 30 },
  { label: "6:00 PM",  h: 18, m: 0 },  { label: "6:30 PM",  h: 18, m: 30 },
  { label: "7:00 PM",  h: 19, m: 0 },  { label: "7:30 PM",  h: 19, m: 30 }
];

const $ = (id) => document.getElementById(id);
let selectedDate = null, selectedTime = null;

// Footer year
$("year").textContent = new Date().getFullYear();

// Nav scroll + mobile menu
const nav = $("nav"), menu = $("menu");
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40));
$("burger").addEventListener("click", () => menu.classList.toggle("open"));
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// ===== Dates: next Saturdays & Sundays =====
function weekendDates() {
  const out = [], d = new Date();
  d.setHours(0, 0, 0, 0);
  const end = new Date(d); end.setDate(end.getDate() + WEEKS_AHEAD * 7);
  for (; d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 || d.getDay() === 6) out.push(new Date(d));
  }
  return out;
}
const fmtDay  = (d) => d.toLocaleDateString("en-IN", { weekday: "short" });
const fmtShort = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtFull = (d) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function renderDates() {
  const box = $("dates");
  weekendDates().forEach(d => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip";
    b.innerHTML = `${fmtShort(d)}<small>${fmtDay(d)}</small>`;
    b.addEventListener("click", () => {
      box.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      b.classList.add("active");
      selectedDate = d; selectedTime = null;
      renderTimes();
    });
    box.appendChild(b);
  });
}

function renderTimes() {
  const box = $("times");
  box.innerHTML = "";
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();
  SLOTS.forEach(s => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = s.label;
    const slotTime = new Date(selectedDate); slotTime.setHours(s.h, s.m, 0, 0);
    if (isToday && slotTime <= now) b.disabled = true;     // past slots today
    b.addEventListener("click", () => {
      box.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      b.classList.add("active"); selectedTime = s.label;
    });
    box.appendChild(b);
  });
}
renderDates();

// ===== Submit: opens WhatsApp / SMS with the appointment message =====
let channel = "whatsapp";
document.querySelectorAll(".form-actions button").forEach(btn =>
  btn.addEventListener("click", () => { channel = btn.dataset.channel; })
);

$("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $("formError");
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const service = $("service").value;
  const notes = $("notes").value.trim();

  if (!name || !phone || !service) { err.textContent = "Please fill in your name, phone number and service."; return; }
  if (!/^[+\d][\d\s-]{7,}$/.test(phone)) { err.textContent = "Please enter a valid phone number."; return; }
  if (!selectedDate) { err.textContent = "Please select a date (Saturday or Sunday)."; return; }
  if (!selectedTime) { err.textContent = "Please select a time slot."; return; }
  err.textContent = "";

  const msg =
`*New Appointment Request – NS Tax Consultancy*

Name: ${name}
Phone: ${phone}
Service: ${service}
Date: ${fmtFull(selectedDate)}
Time: ${selectedTime}${notes ? "\nMessage: " + notes : ""}

Please confirm my appointment. Thank you.`;

  if (channel === "sms") {
    const plain = msg.replace(/\*/g, "");
    window.location.href = `sms:${SMS_NUMBER}?&body=${encodeURIComponent(plain)}`;
  } else {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  }
});
