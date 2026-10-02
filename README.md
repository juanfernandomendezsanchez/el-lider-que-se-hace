# El líder que se hace

Plataforma web interactiva, en español, para que delegados de Modelo de Naciones Unidas entiendan, practiquen y recuerden cómo liderar en un comité, sobre todo en una crisis.

Plataforma educativa independiente. No es un sitio oficial de las Naciones Unidas.

## Secciones

- **Portada:** «¿Quién maneja tu cerebro en una crisis?» y repaso espaciado («Repasa hoy»).
- **Recorrido:** ruta visual de 12 lecciones de 5 a 8 minutos. Cada lección se recorre paso a paso, una idea por pantalla (texto, interactivo, ejemplo de comité, preguntas de una en una con retroalimentación inmediata y «Pruébalo hoy»); las preguntas falladas vuelven al final y se puede retomar donde se dejó. Racha de días en la portada.
- **Dos cerebros:** red neuronal del cerebro de líder vs. el de no líder, paso a paso, con modo proyección.
- **Simulador de crisis:** 6 escenarios ramificados que terminan con el protocolo PAUSA.
- **Gimnasio:** entrenador ¿Qué? ¿Y qué? ¿Y ahora qué?, respiración guiada, «Sí, y…» y «Detecta el secuestro», con racha de días.
- **Laboratorio de persuasión:** los 7 principios de Cialdini, clasificación honesta/manipulación, las 6 claves y un constructor de propuesta.
- **Diagnóstico:** «¿Qué delegado eres hoy?».
- **Mi mapa de líder:** autoevaluación de 8 habilidades, radar y plan personal.
- **Kit:** checklist previo, tarjeta PAUSA (imprimible y como fondo de pantalla) y reflexión posterior.
- **Modo instructor:** presentación a pantalla completa con notas (tecla N).
- **Para saber más:** fuentes parafraseadas.

## Tecnología

- Next.js (App Router) con exportación estática, TypeScript y Tailwind CSS. No necesita backend.
- El progreso se guarda en el navegador (localStorage). No hay cuentas.
- PWA: se puede instalar y funciona sin conexión después de la primera visita.

## Editar el contenido

Todo el texto vive en [`content/`](content/). Lee [`content/LEEME-como-editar.md`](content/LEEME-como-editar.md); no hace falta tocar código.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera el sitio estático en out/ (valida el contenido, copia la precarga y crea el service worker)
```

El build se detiene con un mensaje claro si un archivo de `content/` tiene un error o si una lección pasa de 8 minutos.

## Despliegue

Cada push a `main` publica el sitio en GitHub Pages (`.github/workflows/pages.yml`), en la subruta `/el-lider-que-se-hace/`. La subruta se define con la variable `BASE_PATH`; sin ella, el sitio se compila para la raíz y `out/` sirve en cualquier hosting estático.
