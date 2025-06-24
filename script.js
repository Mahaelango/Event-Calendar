const calendarGrid = document.getElementById("calendar-grid");
const eventList = document.getElementById("event-list");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const monthDropdown = document.getElementById("monthDropdown");
const yearDropdown = document.getElementById("yearDropdown");

const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");

let currentDate = new Date();
let selectedDate = new Date();
let staticEvents = [];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

async function loadStaticEvents() {
  try {
    const res = await fetch("events.json", { cache: "no-store" });
    staticEvents = await res.json();
  } catch (err) {
    console.error("Failed to load events.json:", err);
    staticEvents = [];
  }
}

function loadEventsForDay(dateStr) {
  const events = staticEvents.filter(ev => ev.date === dateStr);
  eventList.innerHTML = "";

  if (events.length === 0) {
    eventList.innerHTML = "<li>No events</li>";
    return;
  }

  events.forEach((ev, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${ev.title} | ${ev.start} - ${ev.end}
      <button class="edit-btn" data-index="${index}" data-date="${ev.date}">✏️</button>
      <button class="delete-btn" data-index="${index}" data-date="${ev.date}">🗑️</button>
    `;
    eventList.appendChild(li);
  });

  // Event listeners for Edit and Delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const date = e.target.getAttribute("data-date");
      const index = e.target.getAttribute("data-index");
      const filtered = staticEvents.filter(ev => ev.date === date);
      const toRemove = filtered[index];
      staticEvents = staticEvents.filter(ev => ev !== toRemove);
      generateCalendar(currentDate);
      loadEventsForDay(date);
    });
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const date = e.target.getAttribute("data-date");
      const index = e.target.getAttribute("data-index");
      const filtered = staticEvents.filter(ev => ev.date === date);
      const toEdit = filtered[index];
      eventTitle.value = toEdit.title;
      startTime.value = toEdit.start;
      endTime.value = toEdit.end;

      // Remove it from list so on submit it adds fresh
      staticEvents = staticEvents.filter(ev => ev !== toEdit);
      selectedDate = new Date(date);
    });
  });
}


function populateMonthDropdown() {
  monthDropdown.innerHTML = "";
  monthNames.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = month;
    if (index === currentDate.getMonth()) {
      option.selected = true;
    }
    monthDropdown.appendChild(option);
  });
}

function populateYearDropdown() {
  const currentYear = currentDate.getFullYear();
  yearDropdown.innerHTML = "";

  for (let y = currentYear - 20; y <= currentYear + 20; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) {
      option.selected = true;
    }
    yearDropdown.appendChild(option);
  }
}

function generateCalendar(date) {
  calendarGrid.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Fix for timezone
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = formatDate(today);
  const selectedStr = formatDate(selectedDate);

  populateMonthDropdown();
  populateYearDropdown();
  monthDropdown.value = currentDate.getMonth();
  yearDropdown.value = currentDate.getFullYear();

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    const cellDate = new Date(year, month, d);
    const cellStr = formatDate(cellDate);

    cell.textContent = d;
    cell.setAttribute("data-date", cellStr);

    if (cellStr === todayStr) cell.classList.add("today");
    if (cellStr === selectedStr) cell.classList.add("active");

    if (staticEvents.some(ev => ev.date === cellStr)) {
      const dot = document.createElement("span");
      dot.className = "event-dot";
      cell.appendChild(dot);
    }

    cell.addEventListener("click", () => {
      selectedDate = cellDate;
      document.querySelectorAll(".calendar-grid div").forEach(c => c.classList.remove("active"));
      cell.classList.add("active");
      loadEventsForDay(cellStr);
    });

    calendarGrid.appendChild(cell);
  }

  loadEventsForDay(formatDate(selectedDate));
}

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newEvent = {
    title: eventTitle.value,
    start: startTime.value,
    end: endTime.value,
    date: formatDate(selectedDate)
  };
  staticEvents.push(newEvent);
  generateCalendar(currentDate);
  loadEventsForDay(newEvent.date);
  eventForm.reset();
});

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate);
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate);
});

monthDropdown.addEventListener("change", () => {
  currentDate.setMonth(parseInt(monthDropdown.value));
  generateCalendar(currentDate);
});

yearDropdown.addEventListener("change", () => {
  currentDate.setFullYear(parseInt(yearDropdown.value));
  generateCalendar(currentDate);
});

(async function init() {
  await loadStaticEvents();
  generateCalendar(currentDate);
})();
