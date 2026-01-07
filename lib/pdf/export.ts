import { humanizeLevel, humanizeScenario } from "@/components/PlanContext";
import { PlanInput, PlanOutput } from "@/lib/schema";

type PrintSizeCode = "A6" | "A7";

type SizeConfig = {
  code: PrintSizeCode;
  label: string;
  margin: string;
  bleed: string;
};

const SIZE_CONFIG: Record<PrintSizeCode, SizeConfig> = {
  A6: { code: "A6", label: "A6 · 105 x 148 mm", margin: "10mm", bleed: "5mm" },
  A7: { code: "A7", label: "A7 · 74 x 105 mm", margin: "8mm", bleed: "4mm" },
};

type ExportOptions = {
  plan: PlanOutput;
  input: PlanInput;
  size: PrintSizeCode;
};

type CorridorPoint = PlanOutput["routes"]["base"]["corridor"][number];
type MapData = PlanOutput["scenarioPlans"][number]["card"]["map"];

function buildStyleTag(size: SizeConfig) {
  const style = document.createElement("style");
  style.textContent = `
    @page {
      size: ${size.code} portrait;
      margin: ${size.margin};
    }

    :root {
      --pdf-ink: #1b1a14;
      --pdf-paper: #f9f2dc;
      --pdf-olive: #4a5a3a;
      --pdf-rust: #b35a2a;
      --pdf-bleed: ${size.bleed};
      --pdf-margin: ${size.margin};
      --pdf-safe: calc(var(--pdf-margin) + 2mm);
      --pdf-shadow: rgba(27, 26, 20, 0.1);
    }

    body.pdf-printing {
      background: var(--pdf-paper);
    }

    body.pdf-printing > *:not(.pdf-overlay) {
      display: none !important;
    }

    .pdf-overlay {
      position: fixed;
      inset: 0;
      overflow: auto;
      background: var(--pdf-paper);
      color: var(--pdf-ink);
      z-index: 2147483000;
      padding: 16px;
      font-family: "Inter", "Helvetica Neue", Arial, system-ui, sans-serif;
    }

    .pdf-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pdf-page {
      position: relative;
      page-break-after: always;
      break-inside: avoid;
      background: linear-gradient(180deg, rgba(255,255,255,0.45), rgba(229, 211, 168, 0.4)), var(--pdf-paper);
      border: 1px solid rgba(27, 26, 20, 0.15);
      box-shadow: 0 10px 24px var(--pdf-shadow);
      padding: calc(var(--pdf-safe) / 2 + var(--pdf-bleed));
      border-radius: 12px;
      min-height: 100%;
    }

    .pdf-card {
      position: relative;
      border-radius: 10px;
      background: white;
      border: 2px solid var(--pdf-ink);
      box-shadow: inset 0 0 0 6px rgba(27, 26, 20, 0.04);
      padding: 14px;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pdf-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 2px solid rgba(27, 26, 20, 0.15);
      padding-bottom: 8px;
    }

    .pdf-card__title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--pdf-olive);
      margin: 0;
      font-weight: 700;
    }

    .pdf-card__meta {
      font-size: 11px;
      margin: 2px 0 0;
      color: rgba(27, 26, 20, 0.7);
    }

    .pdf-badge {
      border: 2px solid var(--pdf-ink);
      border-radius: 12px;
      padding: 6px 8px;
      font-size: 10px;
      text-align: right;
      background: linear-gradient(180deg, rgba(27, 26, 20, 0.05), transparent);
      min-width: 108px;
    }

    .pdf-body {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 10px;
    }

    .pdf-body--solo {
      grid-template-columns: 1fr;
    }

    .pdf-map-stack {
      display: grid;
      gap: 10px;
    }

    .pdf-map {
      border: 2px solid var(--pdf-ink);
      border-radius: 10px;
      background: repeating-linear-gradient(
        135deg,
        rgba(27, 26, 20, 0.03) 0,
        rgba(27, 26, 20, 0.03) 6px,
        transparent 6px,
        transparent 12px
      ),
      linear-gradient(180deg, rgba(74, 90, 58, 0.08), rgba(74, 90, 58, 0));
      padding: 10px;
      box-shadow: inset 0 0 0 4px rgba(27, 26, 20, 0.04);
    }

    .pdf-map__title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: var(--pdf-olive);
      margin: 0 0 6px;
    }

    .pdf-route {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .pdf-route__point {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--pdf-ink);
      background: white;
      font-size: 10px;
      font-weight: 700;
      position: relative;
    }

    .pdf-route__point::after {
      content: attr(data-label);
      position: absolute;
      top: 110%;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 9px;
      color: rgba(27, 26, 20, 0.75);
    }

    .pdf-route__connector {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, var(--pdf-ink), rgba(27, 26, 20, 0.4));
    }

    .pdf-map__meta {
      display: grid;
      gap: 4px;
      font-size: 10px;
      line-height: 1.4;
    }

    .pdf-map__meta strong {
      font-weight: 700;
    }

    .pdf-section {
      border: 1.5px dashed rgba(27, 26, 20, 0.25);
      border-radius: 10px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.9);
      display: grid;
      gap: 6px;
    }

    .pdf-section__title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--pdf-rust);
      margin: 0;
      font-weight: 700;
    }

    .pdf-stages {
      display: grid;
      gap: 4px;
      font-size: 11px;
    }

    .pdf-stages li {
      list-style: none;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid rgba(27, 26, 20, 0.18);
      background: linear-gradient(180deg, rgba(27, 26, 20, 0.04), rgba(27, 26, 20, 0.01));
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .pdf-stages strong {
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .pdf-list {
      display: grid;
      gap: 4px;
      font-size: 11px;
      padding-left: 16px;
    }

    .pdf-list li {
      line-height: 1.4;
    }

    .pdf-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      font-size: 10px;
      margin-top: auto;
    }

    .pdf-chip {
      padding: 6px 8px;
      border-radius: 999px;
      border: 1.5px solid var(--pdf-ink);
      background: rgba(27, 26, 20, 0.05);
    }

    .pdf-crop {
      position: absolute;
      width: 12mm;
      height: 12mm;
      pointer-events: none;
    }

    .pdf-crop::before,
    .pdf-crop::after {
      content: "";
      position: absolute;
      background: var(--pdf-ink);
    }

    .pdf-crop--tl { top: calc(-1 * var(--pdf-bleed)); left: calc(-1 * var(--pdf-bleed)); }
    .pdf-crop--tr { top: calc(-1 * var(--pdf-bleed)); right: calc(-1 * var(--pdf-bleed)); }
    .pdf-crop--bl { bottom: calc(-1 * var(--pdf-bleed)); left: calc(-1 * var(--pdf-bleed)); }
    .pdf-crop--br { bottom: calc(-1 * var(--pdf-bleed)); right: calc(-1 * var(--pdf-bleed)); }

    .pdf-crop--tl::before,
    .pdf-crop--tr::before,
    .pdf-crop--bl::before,
    .pdf-crop--br::before {
      width: 10mm;
      height: 0.6mm;
    }

    .pdf-crop--tl::after,
    .pdf-crop--tr::after,
    .pdf-crop--bl::after,
    .pdf-crop--br::after {
      width: 0.6mm;
      height: 10mm;
    }

    .pdf-crop--tl::before { top: 0; left: 0; }
    .pdf-crop--tl::after { top: 0; left: 0; }

    .pdf-crop--tr::before { top: 0; right: 0; }
    .pdf-crop--tr::after { top: 0; right: 0; }

    .pdf-crop--bl::before { bottom: 0; left: 0; }
    .pdf-crop--bl::after { bottom: 0; left: 0; }

    .pdf-crop--br::before { bottom: 0; right: 0; }
    .pdf-crop--br::after { bottom: 0; right: 0; }
  `;
  return style;
}

function formatRoutePoint(point: CorridorPoint, index: number) {
  if (index === 0) return point.label || "Start";
  if (index === -1) return point.label || "Objective";
  return point.label || `DP${index}`;
}

function createRouteStrip(points: CorridorPoint[]) {
  const wrapper = document.createElement("div");
  wrapper.className = "pdf-route";

  points.forEach((point, idx) => {
    if (idx > 0) {
      const connector = document.createElement("div");
      connector.className = "pdf-route__connector";
      wrapper.appendChild(connector);
    }

    const dot = document.createElement("div");
    dot.className = "pdf-route__point";
    dot.textContent = `${idx + 1}`;
    dot.dataset.label = formatRoutePoint(point, idx === points.length - 1 ? -1 : idx);
    wrapper.appendChild(dot);
  });

  return wrapper;
}

function createList(items: string[]) {
  const list = document.createElement("ul");
  list.className = "pdf-list";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  return list;
}

function createMapPanel(map: MapData, title: string, resourceNodes: number) {
  const mapPanel = document.createElement("section");
  mapPanel.className = "pdf-map";

  const mapTitle = document.createElement("p");
  mapTitle.className = "pdf-map__title";
  mapTitle.textContent = title;
  mapPanel.appendChild(mapTitle);

  const routeStrip = createRouteStrip(map.corridor);
  mapPanel.appendChild(routeStrip);

  const mapMeta = document.createElement("div");
  mapMeta.className = "pdf-map__meta";
  mapMeta.innerHTML = `
    <div><strong>Intent:</strong> ${map.intent}</div>
    <div><strong>Objective:</strong> ${map.objective}</div>
    <div><strong>Alt routes:</strong> ${map.alts.length || "N/A"}</div>
    <div><strong>Nodes:</strong> ${resourceNodes}</div>
  `;
  mapPanel.appendChild(mapMeta);

  return mapPanel;
}

function createStageList(stages: PlanOutput["scenarioPlans"][number]["card"]["stages"]) {
  const list = document.createElement("ul");
  list.className = "pdf-stages";
  stages.forEach((stage) => {
    const li = document.createElement("li");
    const label = document.createElement("strong");
    label.textContent = stage.stage;
    const actions = document.createElement("span");
    actions.textContent = stage.actions.join(" · ");
    li.appendChild(label);
    li.appendChild(actions);
    list.appendChild(li);
  });
  return list;
}

function createMapCardPage(plan: PlanOutput, input: PlanInput, size: SizeConfig) {
  const page = document.createElement("section");
  page.className = "pdf-page";

  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const crop = document.createElement("div");
    crop.className = `pdf-crop pdf-crop--${pos}`;
    page.appendChild(crop);
  });

  const card = document.createElement("article");
  card.className = "pdf-card";

  const header = document.createElement("header");
  header.className = "pdf-card__header";

  const title = document.createElement("div");
  const titleLabel = document.createElement("p");
  titleLabel.className = "pdf-card__title";
  titleLabel.textContent = `${input.city} / MapCard / ${input.moment}`;
  const subtitle = document.createElement("p");
  subtitle.className = "pdf-card__meta";
  subtitle.textContent = `Nivel ${humanizeLevel(input.level)} · ${size.label}`;
  title.appendChild(titleLabel);
  title.appendChild(subtitle);

  const badge = document.createElement("div");
  badge.className = "pdf-badge";
  badge.innerHTML = `<div>Map</div><strong>Corridor</strong>`;

  header.appendChild(title);
  header.appendChild(badge);

  const body = document.createElement("div");
  body.className = "pdf-map-stack";

  const mapCards = plan.scenarioPlans.slice(0, 2).map((scenarioPlan) => ({
    title: `${humanizeScenario(scenarioPlan.scenario)} corridor`,
    map: scenarioPlan.card.map,
    resourceNodes: scenarioPlan.card.resourceNodes.length,
  }));

  mapCards.forEach((mapCard) => {
    body.appendChild(createMapPanel(mapCard.map, mapCard.title, mapCard.resourceNodes));
  });

  const footer = document.createElement("footer");
  footer.className = "pdf-footer";
  const chips: string[] = [
    `Scenarios · ${plan.scenarioPlans.map((planItem) => planItem.scenario).join(" + ")}`,
    `Resources · ${input.resourceNodes.length}`,
    `Generated · ${new Date(plan.meta.generatedAt).toLocaleString()}`,
  ];

  chips.forEach((chipText) => {
    const chip = document.createElement("span");
    chip.className = "pdf-chip";
    chip.textContent = chipText;
    footer.appendChild(chip);
  });

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  page.appendChild(card);
  return page;
}

function createScenarioPage(
  plan: PlanOutput,
  input: PlanInput,
  size: SizeConfig,
  cardPlan: PlanOutput["scenarioCards"][number],
) {
  const page = document.createElement("section");
  page.className = "pdf-page";

  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const crop = document.createElement("div");
    crop.className = `pdf-crop pdf-crop--${pos}`;
    page.appendChild(crop);
  });

  const card = document.createElement("article");
  card.className = "pdf-card";

  const header = document.createElement("header");
  header.className = "pdf-card__header";

  const title = document.createElement("div");
  const titleLabel = document.createElement("p");
  titleLabel.className = "pdf-card__title";
  titleLabel.textContent = `${input.city} / ${humanizeScenario(cardPlan.scenario)} / ${input.moment}`;
  const subtitle = document.createElement("p");
  subtitle.className = "pdf-card__meta";
  subtitle.textContent = `Nivel ${humanizeLevel(input.level)} · ${cardPlan.mode} corridor · ${size.label}`;
  title.appendChild(titleLabel);
  title.appendChild(subtitle);

  const badge = document.createElement("div");
  badge.className = "pdf-badge";
  badge.innerHTML = `<div>Scenario</div><strong>${cardPlan.label}</strong>`;

  header.appendChild(title);
  header.appendChild(badge);

  const body = document.createElement("div");
  body.className = "pdf-body";

  const mainPanel = document.createElement("section");
  mainPanel.className = "pdf-section";

  const mainTitle = document.createElement("p");
  mainTitle.className = "pdf-section__title";
  mainTitle.textContent = cardPlan.routeSummary;

  const stagesList = createStageList(cardPlan.stages);

  const doDont = document.createElement("div");
  doDont.className = "grid grid-cols-2 gap-3";
  const doTitle = document.createElement("p");
  doTitle.className = "pdf-section__title";
  doTitle.textContent = "Do";
  const doList = createList(cardPlan.do);
  const dontTitle = document.createElement("p");
  dontTitle.className = "pdf-section__title";
  dontTitle.textContent = "Don’t";
  const dontList = createList(cardPlan.dont.map((item) => `× ${item}`));

  const doBlock = document.createElement("div");
  doBlock.appendChild(doTitle);
  doBlock.appendChild(doList);

  const dontBlock = document.createElement("div");
  dontBlock.appendChild(dontTitle);
  dontBlock.appendChild(dontList);

  doDont.appendChild(doBlock);
  doDont.appendChild(dontBlock);

  mainPanel.appendChild(mainTitle);
  const routeMeta = document.createElement("p");
  routeMeta.className = "pdf-card__meta";
  routeMeta.textContent = `Route ${cardPlan.routeId} · Nodes ${cardPlan.nodeSetId} · ${cardPlan.nodeSummary}`;

  mainPanel.appendChild(stagesList);
  mainPanel.appendChild(doDont);
  mainPanel.appendChild(routeMeta);

  body.appendChild(mainPanel);

  const footer = document.createElement("footer");
  footer.className = "pdf-footer";
  const chips: string[] = [
    `Mode · ${cardPlan.mode}`,
    `Resources · ${cardPlan.nodeSummary}`,
    `Priority · ${cardPlan.resourcePriority.join(" · ")}`,
    `Generated · ${new Date(plan.meta.generatedAt).toLocaleString()}`,
  ];

  chips.forEach((chipText) => {
    const chip = document.createElement("span");
    chip.className = "pdf-chip";
    chip.textContent = chipText;
    footer.appendChild(chip);
  });

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  page.appendChild(card);
  return page;
}

function createMapPage(plan: PlanOutput, input: PlanInput, size: SizeConfig) {
  const page = document.createElement("section");
  page.className = "pdf-page";

  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const crop = document.createElement("div");
    crop.className = `pdf-crop pdf-crop--${pos}`;
    page.appendChild(crop);
  });

  const card = document.createElement("article");
  card.className = "pdf-card";

  const header = document.createElement("header");
  header.className = "pdf-card__header";

  const title = document.createElement("div");
  const titleLabel = document.createElement("p");
  titleLabel.className = "pdf-card__title";
  titleLabel.textContent = `${input.city} / Map / ${input.moment}`;
  const subtitle = document.createElement("p");
  subtitle.className = "pdf-card__meta";
  subtitle.textContent = `Nivel ${humanizeLevel(input.level)} · Route ${plan.mapCard.routeId} · ${size.label}`;
  title.appendChild(titleLabel);
  title.appendChild(subtitle);

  const badge = document.createElement("div");
  badge.className = "pdf-badge";
  badge.innerHTML = `<div>MapCard</div><strong>${plan.mapCard.routeSummary}</strong>`;

  header.appendChild(title);
  header.appendChild(badge);

  const body = document.createElement("div");
  body.className = "pdf-body";

  const mapPanel = document.createElement("section");
  mapPanel.className = "pdf-map";

  const mapTitle = document.createElement("p");
  mapTitle.className = "pdf-map__title";
  mapTitle.textContent = "Corridor snapshot";
  mapPanel.appendChild(mapTitle);

  const routeStrip = createRouteStrip(plan.mapCard.map.corridor);
  mapPanel.appendChild(routeStrip);

  const mapMeta = document.createElement("div");
  mapMeta.className = "pdf-map__meta";
  mapMeta.innerHTML = `
    <div><strong>Intent:</strong> ${plan.mapCard.map.intent}</div>
    <div><strong>Objective:</strong> ${plan.mapCard.map.objective}</div>
    <div><strong>Alt routes:</strong> ${plan.mapCard.map.alts.length || "N/A"}</div>
    <div><strong>Nodes:</strong> ${plan.mapCard.resourceNodes.length}</div>
  `;
  mapPanel.appendChild(mapMeta);

  const mainPanel = document.createElement("section");
  mainPanel.className = "pdf-section";

  const mainTitle = document.createElement("p");
  mainTitle.className = "pdf-section__title";
  mainTitle.textContent = "Decision points";

  const decisionPoints = createList(
    plan.mapCard.decisionPoints.map(
      (point, idx) => `${String(idx + 1).padStart(2, "0")}. ${point.label ?? `DP${idx + 1}`} — ${point.lat.toFixed(3)}, ${point.lng.toFixed(3)}`,
    ),
  );

  const nodesTitle = document.createElement("p");
  nodesTitle.className = "pdf-section__title";
  nodesTitle.textContent = "Resource nodes";

  const nodesList = createList(
    plan.mapCard.resourceNodes.length > 0
      ? plan.mapCard.resourceNodes.map((node) => `${node.label} · ${node.types.join(", ")} — ${node.lat.toFixed(3)}, ${node.lng.toFixed(3)}`)
      : ["No nodes added."],
  );

  const legendTitle = document.createElement("p");
  legendTitle.className = "pdf-section__title";
  legendTitle.textContent = "Legend";

  const legendList = createList(
    plan.mapCard.resourceLegend.map((entry) => `${entry.type} · ${entry.label}`),
  );

  mainPanel.appendChild(mainTitle);
  mainPanel.appendChild(decisionPoints);
  mainPanel.appendChild(nodesTitle);
  mainPanel.appendChild(nodesList);
  mainPanel.appendChild(legendTitle);
  mainPanel.appendChild(legendList);

  body.classList.add("pdf-body--solo");
  body.appendChild(mainPanel);

  const footer = document.createElement("footer");
  footer.className = "pdf-footer";
  const chips: string[] = [
    `Route · ${plan.mapCard.routeId}`,
    `Nodes · ${plan.mapCard.nodeSetId}`,
    `Generated · ${new Date(plan.meta.generatedAt).toLocaleString()}`,
  ];

  chips.forEach((chipText) => {
    const chip = document.createElement("span");
    chip.className = "pdf-chip";
    chip.textContent = chipText;
    footer.appendChild(chip);
  });

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  page.appendChild(card);
  return page;
}

export function exportPlanAsPdf({ plan, input, size }: ExportOptions) {
  if (typeof document === "undefined") return;

  const sizeConfig = SIZE_CONFIG[size];
  if (!sizeConfig) return;

  const overlay = document.createElement("div");
  overlay.className = "pdf-overlay";

  const styleTag = buildStyleTag(sizeConfig);
  overlay.appendChild(styleTag);

  const grid = document.createElement("div");
  grid.className = "pdf-grid";
  overlay.appendChild(grid);

  const mapCardPage = createMapCardPage(plan, input, sizeConfig);
  grid.appendChild(mapCardPage);

  plan.scenarioPlans.forEach((scenarioPlan) => {
    const page = createScenarioPage(plan, input, sizeConfig, scenarioPlan);
    grid.appendChild(page);
  });

  const cleanup = () => {
    window.clearTimeout(fallbackTeardown);
    document.body.classList.remove("pdf-printing");
    overlay.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  document.body.classList.add("pdf-printing");
  document.body.appendChild(overlay);

  const fallbackTeardown = window.setTimeout(cleanup, 1500);

  requestAnimationFrame(() => {
    window.print();
  });
}
