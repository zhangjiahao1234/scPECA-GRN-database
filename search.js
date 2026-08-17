const state = {
  catalog: null,
  datasets: [],
  selected: null,
};

const elements = {};

function byId(id) {
  return document.getElementById(id);
}

function uniqueInOrder(values) {
  return [...new Set(values)];
}

function countNetworks(rows) {
  return rows.reduce((total, row) => total + row.network_count, 0);
}

function optionLabel(label, rows) {
  return `${label} (${countNetworks(rows)})`;
}

function setOptions(select, options, preferredValue = undefined) {
  const previous =
    preferredValue === null
      ? ""
      : preferredValue === undefined
        ? select.value
        : preferredValue;
  select.replaceChildren();

  options.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });

  const values = options.map((item) => item.value);
  select.value = values.includes(previous) ? previous : values[0] || "";
}

function filteredRows(filters = {}) {
  return state.datasets.filter((row) =>
    Object.entries(filters).every(([key, value]) => row[key] === value)
  );
}

function populateFilters(changedLevel = "species") {
  const speciesValues = uniqueInOrder(state.datasets.map((row) => row.species));
  setOptions(
    elements.species,
    speciesValues.map((value) => ({
      value,
      label: optionLabel(value, filteredRows({ species: value })),
    }))
  );

  const species = elements.species.value;
  const systemRows = filteredRows({ species });
  const systemValues = uniqueInOrder(systemRows.map((row) => row.organ_system));
  setOptions(
    elements.system,
    systemValues.map((value) => ({
      value,
      label: optionLabel(
        value,
        filteredRows({ species, organ_system: value })
      ),
    })),
    changedLevel === "species" ? null : elements.system.value
  );

  const organSystem = elements.system.value;
  const formRows = filteredRows({ species, organ_system: organSystem });
  const preferredOrder = ["Bulk", "Unpaired", "Paired"];
  const formValues = uniqueInOrder(formRows.map((row) => row.data_form)).sort(
    (a, b) => preferredOrder.indexOf(a) - preferredOrder.indexOf(b)
  );
  setOptions(
    elements.dataForm,
    formValues.map((value) => ({
      value,
      label: optionLabel(
        value,
        filteredRows({ species, organ_system: organSystem, data_form: value })
      ),
    })),
    ["species", "system"].includes(changedLevel)
      ? null
      : elements.dataForm.value
  );

  const dataForm = elements.dataForm.value;
  const organTissueRows = filteredRows({
    species,
    organ_system: organSystem,
    data_form: dataForm,
  });
  setOptions(
    elements.organTissue,
    organTissueRows.map((row) => ({
      value: row.dataset_id,
      label: `${row.organ_tissue} (${row.network_count})`,
    })),
    changedLevel === "organ_tissue" ? elements.organTissue.value : null
  );

  renderSelected();
}

function createLink(url, label) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function accessionLinks(row) {
  elements.accessions.replaceChildren();
  if (!row.accessions.length) {
    elements.accessions.textContent = "No public accession reported";
    return;
  }

  row.accessions.forEach((accession, index) => {
    if (index > 0) {
      elements.accessions.append(document.createTextNode(", "));
    }
    const matchingUrl = row.source_urls.find((url) => url.includes(accession));
    if (matchingUrl) {
      elements.accessions.append(createLink(matchingUrl, accession));
    } else {
      elements.accessions.append(document.createTextNode(accession));
    }
  });
}

function sourceLinks(row) {
  elements.sourceLinks.replaceChildren();
  if (!row.source_urls.length) {
    elements.sourceLinks.textContent = "No public source record";
    return;
  }

  const list = document.createElement("div");
  list.className = "source-link-list";
  row.source_urls.forEach((url, index) => {
    const accession = row.accessions.find((value) => url.includes(value));
    let label = `Open source record ${index + 1}`;
    if (accession) {
      label = `Open ${accession}`;
    } else if (url.includes("encodeproject.org")) {
      label = "Open ENCODE record";
    } else if (url.includes("10xgenomics.com")) {
      label = "Open 10x Genomics dataset";
    } else if (url.includes("satijalab.org")) {
      label = "Open Seurat reference";
    } else if (
      url.includes("nature.com") ||
      url.includes("elifesciences.org")
    ) {
      label = "Open publication";
    }
    list.append(
      createLink(url, label)
    );
  });
  elements.sourceLinks.append(list);
}

function renderCellTypes(row, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const cells = row.cell_entities.filter((cell) =>
    cell.name.toLowerCase().includes(normalizedQuery)
  );

  elements.cellTable.replaceChildren();
  cells.forEach((cell) => {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    const file = document.createElement("td");
    name.textContent = cell.name;
    file.textContent = cell.network_file;
    tr.append(name, file);
    elements.cellTable.append(tr);
  });

  elements.cellTypeCount.textContent =
    normalizedQuery && cells.length !== row.network_count
      ? `${cells.length} of ${row.network_count} networks shown`
      : `${row.network_count} network${row.network_count === 1 ? "" : "s"}`;
  elements.noCellResults.hidden = cells.length !== 0;
}

function renderSelected() {
  const row = state.datasets.find(
    (item) => item.dataset_id === elements.organTissue.value
  );
  state.selected = row || null;

  if (!row) {
    elements.result.hidden = true;
    return;
  }

  elements.resultPath.textContent =
    `${row.species} / ${row.organ_system} / ${row.data_form}`;
  elements.resultTitle.textContent =
    `${row.organ_tissue} (${row.network_count})`;
  if (row.figshare_url) {
    elements.downloadButton.href = row.figshare_url;
    elements.downloadButton.removeAttribute("aria-disabled");
    elements.downloadButton.classList.remove("is-disabled");
    elements.downloadButton.title = "Open this source collection on Figshare";
  } else {
    elements.downloadButton.removeAttribute("href");
    elements.downloadButton.setAttribute("aria-disabled", "true");
    elements.downloadButton.classList.add("is-disabled");
    elements.downloadButton.title = "Figshare link is being verified";
  }

  const description = row.summary_text[0].replace(/^Description:\s*/, "");
  elements.description.textContent = description;
  elements.sourceName.textContent = row.source_name;
  elements.recordTitle.textContent = row.record_title;
  elements.articleTitle.textContent = row.article_title || "";
  elements.articleTitleRow.hidden = !row.article_title;
  elements.assayDescription.textContent = row.assay_description;
  accessionLinks(row);
  sourceLinks(row);

  elements.cellFilter.value = "";
  renderCellTypes(row);
  elements.result.hidden = false;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.hidden = false;
}

async function loadCatalog() {
  try {
    const response = await fetch("catalog.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Catalog request failed (${response.status})`);
    }
    state.catalog = await response.json();
    state.datasets = state.catalog.datasets;

    const humanTotal = state.catalog.species_totals?.Human || 0;
    const mouseTotal = state.catalog.species_totals?.Mouse || 0;
    elements.catalogStatus.textContent =
      `${humanTotal} human + ${mouseTotal} mouse GRNs · ` +
      `${state.catalog.organ_tissue_total} organ/tissue entries`;
    populateFilters("species");
  } catch (error) {
    showError(
      "The catalog could not be loaded. Open this folder through a local web " +
      "server or GitHub Pages rather than opening search.html directly."
    );
    elements.catalogStatus.textContent = "Catalog unavailable";
    console.error(error);
  }
}

function initialize() {
  elements.species = byId("species");
  elements.system = byId("system");
  elements.dataForm = byId("data-form");
  elements.organTissue = byId("organ-tissue");
  elements.catalogStatus = byId("catalog-status");
  elements.errorMessage = byId("error-message");
  elements.result = byId("result");
  elements.resultPath = byId("result-path");
  elements.resultTitle = byId("result-title");
  elements.downloadButton = byId("download-button");
  elements.description = byId("description");
  elements.sourceName = byId("source-name");
  elements.recordTitle = byId("record-title");
  elements.articleTitle = byId("article-title");
  elements.articleTitleRow = byId("article-title-row");
  elements.assayDescription = byId("assay-description");
  elements.accessions = byId("accessions");
  elements.sourceLinks = byId("source-links");
  elements.cellFilter = byId("cell-filter");
  elements.cellTypeCount = byId("cell-type-count");
  elements.cellTable = byId("cell-table");
  elements.noCellResults = byId("no-cell-results");

  elements.species.addEventListener("change", () => populateFilters("species"));
  elements.system.addEventListener("change", () => populateFilters("system"));
  elements.dataForm.addEventListener("change", () => populateFilters("form"));
  elements.organTissue.addEventListener("change", renderSelected);
  elements.cellFilter.addEventListener("input", () => {
    if (state.selected) {
      renderCellTypes(state.selected, elements.cellFilter.value);
    }
  });

  byId("year").textContent = new Date().getFullYear();
  loadCatalog();
}

document.addEventListener("DOMContentLoaded", initialize);
