import { ScenarioCode, StageKey } from "./schema";

export const stageWindows: Record<StageKey, string> = {
  STG0: "0–60 min",
  STG1: "1–6 h",
  STG2: "6–24 h",
  STG3: "24–72 h",
};

type ScenarioMock = {
  title: string;
  blurb: string;
  stages: Record<StageKey, string[]>;
  do: string[];
  dont: string[];
};

export const scenarioMockContent: Record<ScenarioCode, ScenarioMock> = {
  AIR: {
    title: "Aerosol tóxico",
    blurb: "Moverse bajo cubierta, sin exposición directa al aire exterior.",
    stages: {
      STG0: [
        "Sellar máscara y gafas de inmediato",
        "Moverse solo entre techos cortos",
        "Cerrar rejillas y ventilaciones abiertas",
      ],
      STG1: [
        "Saltar entre refugios, máximo 5 min expuestos",
        "Priorizar calles sin viento cruzado",
        "Controlar olor, ardor y visión",
      ],
      STG2: [
        "Rotar guías con protección ocular",
        "Revisar filtros improvisados",
        "Marcar zonas con olor fuerte",
      ],
      STG3: [
        "Descansar en interiores sin cristales",
        "Reportar tos, mareo o irritación",
        "Planificar salidas al amanecer",
      ],
    },
    do: ["Mascarilla sellada siempre", "Ojos cubiertos", "Rutas techadas y cortas"],
    dont: ["No te detengas bajo carteles", "No abras pozos o rejillas", "No sigas masas sin filtro"],
  },
  NUK: {
    title: "Evento radiológico",
    blurb: "Sello hermético inicial, cálculo de dosis y traslados breves en sombra.",
    stages: {
      STG0: [
        "Entrar dos muros adentro",
        "Sellar rendijas con cinta y plástico",
        "Registrar hora exacta de exposición",
      ],
      STG1: [
        "Ventilar solo ventanas 5 min controlados",
        "Filtrar agua y cubrirla",
        "Limitar movimientos verticales",
      ],
      STG2: [
        "Traslados breves entre sombras",
        "Cubrir piel y cabello",
        "Evitar charcos y polvo acumulado",
      ],
      STG3: [
        "Rotar puntos de descanso para bajar dosis",
        "Comprobar contaminación antes de entrar",
        "Bolsear ropa y residuos aparte",
      ],
    },
    do: ["Sella ventanas y puertas", "Cuenta minutos fuera", "Doble capa en cabeza"],
    dont: ["No corras a la azotea", "No uses lluvia como limpieza", "No compartas máscaras húmedas"],
  },
  CIV: {
    title: "Disturbio civil",
    blurb: "Bajo perfil, rutas secundarias y comunicaciones mínimas.",
    stages: {
      STG0: [
        "Oculta logos y símbolos",
        "Elige salida lateral inmediata",
        "Memoriza dos rutas alternas",
      ],
      STG1: [
        "Calles secundarias con cobertura",
        "Habla en susurro y en parejas",
        "Evita puntos de control densos",
      ],
      STG2: [
        "Revisa toques de queda y cortes",
        "Evita plazas y avenidas abiertas",
        "Descansa en habitaciones cerradas",
      ],
      STG3: [
        "Cambia horarios y patrón diario",
        "Coordina señales breves y claras",
        "Kit de identificación a mano",
      ],
    },
    do: ["Ropa neutra y capas", "Efectivo pequeño listo", "Mensajes cortos cifrados"],
    dont: ["No filmes incidentes", "No discutas con autoridad", "No te unas a multitudes"],
  },
  EQK: {
    title: "Sismo urbano",
    blurb: "Proteger estructura, evitar colapsos secundarios y mover hacia áreas abiertas.",
    stages: {
      STG0: [
        "Protégete junto a mueble sólido",
        "Cubre cabeza y cuello",
        "Aléjate de vidrios y fachadas",
      ],
      STG1: [
        "Evalúa salida sin usar ascensores",
        "Corta gas/agua si es seguro",
        "Despeja rutas hacia puntos abiertos",
      ],
      STG2: [
        "Evita puentes y túneles dañados",
        "Revisa estructura antes de reentrar",
        "Marca zonas de derrumbe",
      ],
      STG3: [
        "Planifica desvíos largos y seguros",
        "Comunica estado cada 4h",
        "Descansa lejos de cornisas",
      ],
    },
    do: ["Calzado duro puesto", "Botiquín a mano", "Linterna y casco"],
    dont: ["No uses ascensores", "No bloquees escaleras", "No reentres sin inspección"],
  },
  UNK: {
    title: "Amenaza desconocida",
    blurb: "Recolectar señales sin exponerse ni revelar posición.",
    stages: {
      STG0: [
        "Observa en silencio 3 min",
        "Cuenta personas y lesiones",
        "Recursos cercanos discretos",
      ],
      STG1: [
        "Define ventana de comunicación",
        "Punto alto cubierto para vigilar",
        "Anota cambios visibles",
      ],
      STG2: [
        "Prueba rutas alternativas en silencio",
        "Reduce luz y firma térmica",
        "Plan de extracción listo",
      ],
      STG3: [
        "Actualiza mapa con marcas propias",
        "Rota descansos y vigías",
        "Revisa detonantes para evacuar",
      ],
    },
    do: ["Baterías preservadas", "Perfil bajo siempre", "Notas cortas y precisas"],
    dont: ["No compartas ubicación exacta", "No hagas ruido innecesario", "No ignores patrones locales"],
  },
};
