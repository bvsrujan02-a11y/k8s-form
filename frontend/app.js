const form = document.getElementById("form");
const output = document.getElementById("output");
let api = false;
let records = [];

async function init() {
  try {
    const response = await fetch("/api/records");
    if (response.ok) {
      api = true;
      records = await response.json();
      render();
    }
  } catch (_) {}
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function render() {
  output.innerHTML = records.map(r => `
    <div>
      <b>${escapeHtml(r.name)}</b> — ${escapeHtml(r.email)}
      <p>${escapeHtml(r.notes)}</p>
      <button type="button" onclick="editRecord('${r.id}')">Edit</button>
      <button type="button" onclick="deleteRecord('${r.id}')">Delete</button>
    </div>
  `).join("");
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("recordId")?.value || "";
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    notes: document.getElementById("notes").value
  };

  if (api) {
    const response = await fetch(
      id ? `/api/records/${id}` : "/api/records",
      {
        method: id ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      }
    );
    if (!response.ok) return alert("Unable to save record");
    records = await (await fetch("/api/records")).json();
    render();
  } else {
    output.innerHTML = `
      <p>Name: ${escapeHtml(data.name)}</p>
      <p>Email: ${escapeHtml(data.email)}</p>
      <p>Notes: ${escapeHtml(data.notes)}</p>`;
  }

  form.reset();
  const hidden = document.getElementById("recordId");
  if (hidden) hidden.value = "";
});

window.editRecord = id => {
  const r = records.find(x => x.id === id);
  if (!r) return;
  document.getElementById("recordId").value = r.id;
  document.getElementById("name").value = r.name;
  document.getElementById("email").value = r.email;
  document.getElementById("notes").value = r.notes;
};

window.deleteRecord = async id => {
  if (!confirm("Delete this record?")) return;
  const response = await fetch(`/api/records/${id}`, {method: "DELETE"});
  if (!response.ok) return alert("Unable to delete record");
  records = await (await fetch("/api/records")).json();
  render();
};

init();

