# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 🌍 3D Polución: Un Paseo Metaversiano por España

<div align="center">

![Spain 3D Air Quality](https://img.shields.io/badge/España-3D%20Visualización-green?style=for-the-badge&logo=react)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API%20Real-blue?style=for-the-badge&logo=openweathermap)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Rendering-red?style=for-the-badge&logo=three.js)

**Una experiencia 3D inmersiva que visualiza la calidad del aire de España en tiempo real** 🚁✨

[🚀 Demo Live](#-instalación-y-uso) • [📱 Características](#-características) • [🛠️ Tech Stack](#️-tech-stack) • [🤝 Contribuir](#-contribuir)

</div>

---

## 🎯 ¿Qué hace esta locura?

Imagínate **volar sobre España** y ver en 3D cómo está la calidad del aire en tiempo real. Este proyecto combina **datos científicos reales** con una experiencia visual épica que incluye:

- 🏙️ **70+ ciudades españolas** renderizadas en 3D
- 🌿 **Vegetación inteligente** que aparece/desaparece según la contaminación
- 🏭 **Elementos contaminantes** progresivos (chimeneas, smog, tráfico)
- 🌧️ **Efectos meteorológicos** reales (lluvia, nieve donde está ocurriendo)
- 🏰 **Patrimonio español** auténtico (molinos, castillos, catedrales)
- 🗺️ **Geografía detallada** con ríos, montañas y costas

## 📸 Screenshots

```
🌟 ¡Próximamente screenshots épicos! 🌟
```

## ✨ Características

### 🌍 **Visualización 3D Realista**
- Mapa de España expandido en el metaverso
- Montañas, ríos (Ebro, Tajo, Guadalquivir) y costas
- Islas Baleares y Canarias incluidas


### 📊 **Datos en Tiempo Real**
- **API OpenWeatherMap** con 70+ ciudades monitoreadas
- Calidad del aire (PM2.5, PM10, NO2, O3, SO2, CO)
- Datos meteorológicos (temperatura, lluvia, viento)
- Sistema de lotes inteligente para optimizar requests

### 🎨 **Elementos Interactivos**
- **Edificios dinámicos** que rotan según contaminación
- **Sistema de vegetación** basado en índices AQI
- **Elementos contaminantes** progresivos por nivel
- **Efectos atmosféricos** (partículas, lluvia, nieve)

### 🏛️ **Patrimonio Cultural**
- **Molinos de viento** en Castilla-La Mancha (Don Quijote)
- **Castillos medievales** en Castilla y León
- **Catedrales** en principales ciudades
- **Faros** en toda la costa española

### 🎮 **Experiencia de Usuario**
- **Filtros dinámicos** y búsqueda en tiempo real
- **Leyenda interactiva** completa
- **Controles de cámara** (órbita, zoom, rotación)
- **Todas las ciudades visibles** por defecto

## 🛠️ Tech Stack

<div align="center">

| Frontend | 3D Graphics | APIs | Tools |
|----------|-------------|------|-------|
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) | ![Three.js](https://img.shields.io/badge/Three.js-Latest-red?logo=three.js) | ![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-blue) | ![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript) | ![React Three Fiber](https://img.shields.io/badge/R3F-Latest-red) | ![REST](https://img.shields.io/badge/REST-APIs-green) | ![Git](https://img.shields.io/badge/Git-Version%20Control-orange?logo=git) |
| ![Styled Components](https://img.shields.io/badge/Styled%20Components-Latest-pink) | ![React Three Drei](https://img.shields.io/badge/Drei-Latest-red) | | ![ESLint](https://img.shields.io/badge/ESLint-Linting-purple?logo=eslint) |

</div>

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Clave API de OpenWeatherMap ([obtener aquí](https://openweathermap.org/api))

### Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/mezcolantriz/3dpolucion-un-paseo-metaversiano.git

# Entrar al directorio
cd 3dpolucion-un-paseo-metaversiano

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "VITE_OPENWEATHER_API_KEY=tu_api_key_aquí" > .env.local

# Ejecutar en desarrollo
npm run dev
```

### 🌐 Acceso Remoto

```bash
# Para compartir en red local
npm run dev -- --host

# Tu app estará disponible en:
# Local: http://localhost:5173/
# Red: http://tu-ip:5173/
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Spain3DMap.tsx  # Mapa 3D principal
│   ├── SkyscraperCluster.tsx # Edificios dinámicos
│   ├── FilterPanel.tsx # Panel de filtros
│   └── SpainMap.tsx    # Mapa 2D
├── services/           # Servicios API
│   └── airQualityService.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/              # Utilidades
│   └── index.ts
└── styles/             # Estilos globales
```

## 🎮 Cómo Usar la Aplicación

1. **🔍 Explora España**: Usa el ratón para rotar, hacer zoom y navegar
2. **📊 Filtra datos**: Panel izquierdo para filtrar por calidad del aire
3. **🏙️ Selecciona ciudades**: Click en edificios para ver detalles
4. **🗺️ Consulta la leyenda**: Esquina superior izquierda del mapa 3D
5. **🌦️ Observa el clima**: Efectos meteorológicos en tiempo real

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Aquí hay algunas ideas:

- 🏝️ Añadir más detalles geográficos
- 🎨 Mejorar efectos visuales
- 📊 Más tipos de datos ambientales
- 🌍 Expandir a otras regiones
- 🎮 Gamificación adicional

### Proceso de Contribución

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **OpenWeatherMap** por sus APIs de calidad del aire
- **Three.js** por hacer posible los gráficos 3D
- **React Three Fiber** por la integración perfecta
- **España** por ser tan hermosa para renderizar 🇪🇸

## 📞 Contacto

**mezcolantriz** - [@mezcolantriz](https://github.com/mezcolantriz)

**Enlace del Proyecto**: [https://github.com/mezcolantriz/3dpolucion-un-paseo-metaversiano](https://github.com/mezcolantriz/3dpolucion-un-paseo-metaversiano)

---

<div align="center">

**⭐ Si te gusta este proyecto, ¡dale una estrella! ⭐**

*Hecho con ❤️ y mucho café ☕ para un futuro más verde 🌱*

</div>

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
