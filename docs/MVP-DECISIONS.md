# PLAN72 — Decisiones cerradas del MVP

**Estado:** en definición activa
**Objetivo:** convertir la landing existente en el primer MVP comercial y funcional de PLAN72.

## 1. Definición del producto

PLAN72 es un producto + servicio de evacuación para emergencias.

El MVP está diseñado para:

- Una mochila para dos adultos.
- Evacuación a pie.
- Cobertura operativa durante las primeras 72 horas.
- Una ruta específica por tipo de emergencia.
- Un único spot de destino en la primera versión.

La promesa no es ofrecer una única ruta válida para cualquier catástrofe. La promesa es generar la ruta de menor exposición disponible para la emergencia seleccionada.

## 2. Emergencias incluidas

El usuario selecciona manualmente una de estas cinco emergencias:

1. Inundación.
2. Incendio forestal.
3. Terremoto.
4. Tsunami.
5. Conflicto o bombardeo.

Cada emergencia puede conducir al mismo spot, pero la ruta y los criterios de seguridad cambian según el escenario.

## 3. Alcance rápido del MVP

El MVP debe ser visible, navegable y entendible antes de incorporar inteligencia avanzada.

Para esta primera versión:

- Las cinco emergencias aparecen como opciones seleccionables.
- La emergencia seleccionada acompaña a la ruta y al plan.
- Puede existir una recomendación mínima de equipamiento asociada a cada emergencia.
- No es necesario cambiar toda la estética, el mapa 3D ni la ambientación visual según la emergencia.
- No es necesario implementar todavía modelos avanzados de riesgo ni cálculos distintos de alta precisión por catástrofe.
- El objetivo inmediato es que el usuario entienda qué hace PLAN72, pueda probar el flujo y vea un resultado concreto.

Queda como mejora posterior:

- Visuales específicos por emergencia.
- Capas de riesgo diferenciadas.
- Rutas realmente optimizadas con criterios geográficos propios de cada amenaza.
- Recomendaciones avanzadas de equipamiento por escenario.
- Más de un spot y selección automática del destino más apropiado.

## 4. Ubicación inicial

El usuario puede introducir:

- Una dirección exacta.
- Una dirección aproximada.
- Un barrio.
- Una zona.
- Una referencia cercana.

Después puede mover manualmente el punto de inicio en el mapa.

PLAN72 no exige conocer el domicilio exacto. La interfaz debe explicar que una ubicación aproximada es suficiente para probar el servicio.

## 5. Privacidad y persistencia

### Usuario no registrado

- Puede utilizar el mapa 3D.
- Puede indicar una zona aproximada.
- Puede seleccionar una emergencia.
- Puede ver una simulación parcial de la ruta.
- La ubicación y la simulación no se guardan.

### Usuario registrado

- Puede guardar su ubicación seleccionada.
- Puede desbloquear la ruta completa.
- Puede conservar su plan.
- Puede guardar una mochila preseleccionada.
- Puede continuar configurando PLAN72 en diferentes sesiones.

## 6. Preview y registro

Antes de registrarse, el usuario ve solamente una vista previa parcial de la ruta.

La preview puede mostrar:

- Punto de partida aproximado.
- Emergencia seleccionada.
- Dirección general de evacuación.
- Distancia estimada.
- Tiempo aproximado a pie.
- Primer tramo de la ruta.
- Algunos riesgos o criterios considerados.

Para acceder a la ruta completa, las instrucciones y el plan guardado, el usuario debe crear una cuenta o iniciar sesión.

## 7. Navegación no lineal

La landing no obliga a seguir un único flujo.

El usuario puede comenzar por:

### Mochilas

- Comparar Esencial, Preparada y Avanzada.
- Preseleccionar una mochila.
- Continuar después con la creación de la ruta.

### Ruta de escape

- Seleccionar ubicación y emergencia.
- Ver la preview.
- Registrarse para desbloquear el plan.
- Elegir después una mochila.

Mochila y plan son módulos independientes, pero deben completarse mutuamente.

## 8. Mochilas y precios

La landing mostrará tres mochilas base:

- Esencial.
- Preparada.
- Avanzada.

Cada mochila tendrá:

- Una configuración base funcional.
- Un precio base visible.
- Posibilidad de incorporar módulos y personalizaciones.

La configuración base siempre debe ser una solución válida. No debe parecer un producto incompleto que obliga a comprar extras.

La definición exacta del precio no es prioritaria para esta fase del MVP. Puede utilizarse temporalmente un precio orientativo o un marcador de contenido hasta cerrar composición y costes.

## 9. Prioridad inmediata

La prioridad es construir y ajustar la landing existente.

Cada nueva decisión debe:

1. Quedar registrada en este documento.
2. Traducirse a contenido, interacción o estructura de la landing.
3. Evitar crear documentos paralelos que no se reflejen en el producto.

El criterio de ejecución es: primero algo visible y utilizable; después se mejoran las partes débiles con iteraciones concretas.

## 10. Flujo provisional del MVP

1. El usuario entra en la landing.
2. Puede explorar mochilas o comenzar una ruta.
3. Indica una zona o dirección aproximada.
4. Ajusta el punto en el mapa 3D.
5. Selecciona una emergencia.
6. PLAN72 genera una preview de una ruta hacia el spot único.
7. Se muestran distancia, tiempo y parte del recorrido.
8. El usuario se registra para desbloquear la ruta completa.
9. La cuenta guarda el plan y la mochila preseleccionada.
10. El usuario completa ambos módulos hasta tener su PLAN72.
