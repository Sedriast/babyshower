# 🎀 Baby Shower - Invitación Interactiva

Invitación digital para baby shower con animación scroll-driven y ruleta de regalos.

## Funcionalidades

- **Login con Google**: Autenticación mediante Firebase Auth
- **Animación scroll-driven**: 275 frames WebP controlados por scroll
- **Ruleta de regalos**: Rueda giratoria con regalo aleatorio al confirmar asistencia
- **Guardado en Firestore**: Datos del usuario y regalo asignado persistidos en la nube

## Estructura del proyecto

```
main/
├── index.html              # Punto de entrada
├── data/
│   └── gifts.json          # Lista de regalos (editar con regalos reales)
├── assets/
│   └── frames/             # 275 frames WebP (0001.webp - 0275.webp)
├── scripts/
│   ├── login.js            # Firebase Auth + Firestore (datos de usuario)
│   ├── main.js             # Motor de animación scroll-driven
│   └── roulette.js         # Ruleta, girado, resultado y guardado
└── styles/
    ├── login.css           # Estilos del login
    ├── main.css            # Estilos de la animación
    └── roulette.css        # Estilos de la ruleta
```

## Tecnologías

- HTML5 / CSS3 / JavaScript vanilla
- Firebase v11.6.0 (Auth + Cloud Firestore)
- Canvas API (ruleta)

## Configuración

1. Clonar el repositorio
2. Abrir `index.html` en un navegador (requiere servidor local por CORS en `fetch`)
3. Editar `data/gifts.json` con la lista de regalos reales
4. La configuración de Firebase está en `scripts/login.js`

## Flujo de usuario

1. Iniciar sesión con Google
2. Hacer scroll para reproducir la animación
3. Al llegar al final, aparece el botón "Confirmar asistencia"
4. Clic en el botón abre la ruleta
5. Girar la ruleta para obtener un regalo aleatorio
6. El regalo se guarda automáticamente en Firestore

## Regalos

Editar `data/gifts.json`:

```json
[
  { "id": 1, "name": "Nombre del regalo", "emoji": "🧸" }
]
```
