const elements = {
  grid: document.querySelector("#car-grid"),
  search: document.querySelector("#search-input"),
  filter: document.querySelector("#availability-filter"),
  resultCount: document.querySelector("#result-count"),
  statTotal: document.querySelector("#stat-total"),
  statAvailable: document.querySelector("#stat-available"),
  statBrands: document.querySelector("#stat-brands"),
  empty: document.querySelector("#empty-state"),
  status: document.querySelector("#status-banner"),
  dialog: document.querySelector("#car-dialog"),
  form: document.querySelector("#car-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  submitButton: document.querySelector("#submit-button"),
  formError: document.querySelector("#form-error"),
  toast: document.querySelector("#toast"),
};

let cars = [];
let editingId = null;
let toastTimer;

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("es-CO");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error("No fue posible conectar con la API. Comprueba que el servidor esté activo.");
  }

  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`La API devolvió una respuesta no válida (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((issue) => `${issue.loc?.at(-1) ?? "campo"}: ${issue.msg}`).join(". ")
      : data?.detail;
    throw new Error(detail || `La solicitud falló con HTTP ${response.status}.`);
  }

  return data;
}

function filteredCars() {
  const searchTerm = elements.search.value.trim().toLocaleLowerCase("es");
  const availability = elements.filter.value;

  return cars.filter((car) => {
    const matchesSearch = `${car.marca} ${car.modelo}`.toLocaleLowerCase("es").includes(searchTerm);
    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && car.disponible) ||
      (availability === "unavailable" && !car.disponible);
    return matchesSearch && matchesAvailability;
  });
}

function renderCar(car) {
  const availabilityLabel = car.disponible ? "Disponible" : "No disponible";
  const availabilityClass = car.disponible ? "" : " availability-unavailable";
  return `
    <article class="car-card">
      <div class="car-visual">
        <span class="car-id">MOTORÍA / ${String(car.id).padStart(3, "0")}</span>
        <span class="availability${availabilityClass}">${availabilityLabel}</span>
        <img src="/static/car-illustration.svg" alt="Ilustración de vehículo" loading="lazy" />
      </div>
      <div class="car-card-body">
        <span class="car-year">${escapeHtml(car.anio)} · ${escapeHtml(car.transmision)}</span>
        <div class="car-title-row">
          <h3 class="car-title">${escapeHtml(car.marca)} ${escapeHtml(car.modelo)}</h3>
          <span class="car-price">${currencyFormatter.format(car.precio)}</span>
        </div>
        <div class="car-specs">
          <span>${numberFormatter.format(car.kilometraje)} km</span>
          <span>${escapeHtml(car.combustible)}</span>
        </div>
        <div class="card-footer">
          <span class="car-fuel">Ref. #${String(car.id).padStart(4, "0")}</span>
          <div class="card-actions">
            <button class="icon-button" type="button" data-action="edit" data-id="${car.id}" aria-label="Editar ${escapeHtml(car.marca)} ${escapeHtml(car.modelo)}" title="Editar carro">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"></path><path d="M13 6 18 11"></path></svg>
            </button>
            <button class="icon-button icon-button-danger" type="button" data-action="delete" data-id="${car.id}" aria-label="Eliminar ${escapeHtml(car.marca)} ${escapeHtml(car.modelo)}" title="Eliminar carro">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderInventory() {
  const visibleCars = filteredCars();
  const availableCount = cars.filter((car) => car.disponible).length;
  const brandCount = new Set(cars.map((car) => car.marca.toLocaleLowerCase("es"))).size;

  elements.statTotal.textContent = numberFormatter.format(cars.length);
  elements.statAvailable.textContent = numberFormatter.format(availableCount);
  elements.statBrands.textContent = numberFormatter.format(brandCount);
  elements.resultCount.textContent = `${visibleCars.length} ${visibleCars.length === 1 ? "vehículo encontrado" : "vehículos encontrados"}`;
  elements.grid.innerHTML = visibleCars.map(renderCar).join("");
  elements.grid.hidden = visibleCars.length === 0;
  elements.empty.hidden = visibleCars.length !== 0;
  elements.grid.setAttribute("aria-busy", "false");
}

async function loadCars() {
  elements.status.hidden = true;
  elements.grid.setAttribute("aria-busy", "true");
  elements.grid.innerHTML = '<div class="loading-state">Cargando inventario...</div>';

  try {
    cars = await requestJson("/api/carros");
    renderInventory();
  } catch (error) {
    elements.grid.innerHTML = "";
    elements.grid.hidden = true;
    elements.empty.hidden = true;
    elements.resultCount.textContent = "No se pudo cargar el inventario";
    elements.status.textContent = error.message;
    elements.status.hidden = false;
    elements.grid.setAttribute("aria-busy", "false");
  }
}

function openForm(car = null) {
  editingId = car?.id ?? null;
  elements.form.reset();
  elements.formError.hidden = true;
  elements.formError.textContent = "";
  elements.dialogTitle.textContent = editingId ? "Editar carro" : "Publica tu carro";
  elements.submitButton.innerHTML = editingId
    ? 'Guardar cambios <span aria-hidden="true">↗</span>'
    : 'Publicar carro <span aria-hidden="true">↗</span>';

  if (car) {
    for (const [key, value] of Object.entries(car)) {
      const field = elements.form.elements.namedItem(key);
      if (!field) continue;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value;
    }
  }

  elements.dialog.showModal();
  elements.form.elements.namedItem("marca").focus();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("toast-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("toast-visible"), 3200);
}

function getCarPayload() {
  const formData = new FormData(elements.form);
  return {
    marca: String(formData.get("marca")).trim(),
    modelo: String(formData.get("modelo")).trim(),
    anio: Number(formData.get("anio")),
    precio: Number(formData.get("precio")),
    kilometraje: Number(formData.get("kilometraje")),
    transmision: String(formData.get("transmision")).trim(),
    combustible: String(formData.get("combustible")).trim(),
    disponible: formData.has("disponible"),
  };
}

async function saveCar(event) {
  event.preventDefault();
  if (!elements.form.reportValidity()) return;

  elements.submitButton.disabled = true;
  elements.submitButton.textContent = editingId ? "Guardando..." : "Publicando...";
  elements.formError.hidden = true;
  const isEditing = editingId !== null;

  try {
    await requestJson(isEditing ? `/api/carros/${editingId}` : "/api/carros", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getCarPayload()),
    });
    elements.dialog.close();
    await loadCars();
    showToast(isEditing ? "Los cambios se guardaron correctamente." : "Tu carro ya está en el inventario.");
  } catch (error) {
    elements.formError.textContent = error.message;
    elements.formError.hidden = false;
  } finally {
    elements.submitButton.disabled = false;
    elements.submitButton.innerHTML = isEditing
      ? 'Guardar cambios <span aria-hidden="true">↗</span>'
      : 'Publicar carro <span aria-hidden="true">↗</span>';
  }
}

async function deleteCar(id) {
  const car = cars.find((item) => item.id === id);
  if (!car || !window.confirm(`¿Quieres eliminar el ${car.marca} ${car.modelo}? Esta acción no se puede deshacer.`)) return;

  try {
    await requestJson(`/api/carros/${id}`, { method: "DELETE" });
    await loadCars();
    showToast("El carro se eliminó del inventario.");
  } catch (error) {
    elements.status.textContent = error.message;
    elements.status.hidden = false;
    elements.status.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.querySelectorAll("#header-add-button, #inventory-add-button, #closing-add-button")
  .forEach((button) => button.addEventListener("click", () => openForm()));

document.querySelector("#dialog-close").addEventListener("click", () => elements.dialog.close());
document.querySelector("#dialog-cancel").addEventListener("click", () => elements.dialog.close());
elements.form.addEventListener("submit", saveCar);
elements.search.addEventListener("input", renderInventory);
elements.filter.addEventListener("change", renderInventory);
document.querySelector("#reset-filters").addEventListener("click", () => {
  elements.search.value = "";
  elements.filter.value = "all";
  renderInventory();
});
elements.grid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const carId = Number(button.dataset.id);
  const car = cars.find((item) => item.id === carId);
  if (button.dataset.action === "edit" && car) openForm(car);
  if (button.dataset.action === "delete") deleteCar(carId);
});
document.querySelector("#menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nav = document.querySelector(".header-nav");
  const isOpen = nav.classList.toggle("nav-open");
  button.setAttribute("aria-expanded", String(isOpen));
  button.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});
document.querySelectorAll(".header-nav a").forEach((link) => link.addEventListener("click", () => {
  document.querySelector(".header-nav").classList.remove("nav-open");
  document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
}));

loadCars();
