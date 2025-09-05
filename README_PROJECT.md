# 🏢 España Calidad del Aire - Visualización en Tiempo Real

Una aplicación web profesional y artística que visualiza la calidad del aire en España en tiempo real, utilizando rascacielos 3D que crecen según los niveles de contaminación atmosférica.

## 🚀 Características

- **Visualización en Tiempo Real**: Datos actualizados cada 5 minutos desde APIs oficiales
- **Mapa Interactivo**: Mapa de España con marcadores dinámicos que muestran el índice de calidad del aire (ICA)
- **Rascacielos 3D**: Representación artística donde la altura y color de los edificios reflejan la contaminación
- **Interfaz Profesional**: Diseño moderno con glassmorphism y animaciones fluidas
- **Múltiples Contaminantes**: Monitoreo de PM2.5, PM10, NO2, O3, SO2 y CO
- **Responsive**: Adaptado para diferentes tamaños de pantalla

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** con TypeScript
- **Vite** como bundler
- **Styled Components** para estilos
- **Framer Motion** para animaciones
- **Leaflet** para mapas interactivos

### Visualización 3D
- **Three.js** para gráficos 3D
- **React Three Fiber** para integración con React
- **React Three Drei** para helpers y controles

### APIs y Datos
- **OpenWeatherMap API** para datos de calidad del aire
- **Axios** para peticiones HTTP
- **Datos simulados** para desarrollo y demo

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tuusuario/eltiempo-spain-air-quality.git
   cd eltiempo-spain-air-quality
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus claves de API:
   ```
   VITE_OPENWEATHER_API_KEY=tu_clave_openweather
   VITE_IQAIR_API_KEY=tu_clave_iqair
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🔑 APIs Utilizadas

### OpenWeatherMap
1. Regístrate en [OpenWeatherMap](https://openweathermap.org/api)
2. Obtén tu API key gratuita
3. Añádela a tu archivo `.env`

### IQAir (Opcional)
1. Regístrate en [IQAir](https://www.iqair.com/commercial-air-quality-monitors/api)
2. Obtén tu API key
3. Añádela a tu archivo `.env`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── SpainMap.tsx    # Mapa principal de España
│   └── Skyscraper.tsx  # Rascacielos 3D
├── hooks/              # Custom hooks
│   └── useAirQuality.ts # Hook para datos de calidad del aire
├── services/           # Servicios y APIs
│   └── airQualityService.ts # Servicio de datos
├── types/              # Definiciones TypeScript
│   └── index.ts        # Tipos principales
├── utils/              # Utilidades
│   └── index.ts        # Funciones auxiliares
└── App.tsx             # Componente principal
```

## 🎨 Características de Diseño

### Colores de Calidad del Aire
- 🟢 **Excelente (1)**: Verde brillante
- 🟡 **Buena (2)**: Amarillo
- 🟠 **Moderada (3)**: Naranja
- 🔴 **Mala (4)**: Rojo
- 🟣 **Muy Mala (5)**: Púrpura
- ⚫ **Peligrosa (6)**: Granate oscuro

### Animaciones
- **Rascacielos**: Crecimiento animado al cargar
- **Respiración**: Los edificios "respiran" según contaminación
- **Pulsos**: Efectos de pulso para niveles críticos
- **Partículas**: Sistema de partículas para contaminación extrema

## 📊 Datos Mostrados

### Por Ubicación
- Índice de Calidad del Aire (ICA)
- PM2.5 y PM10 (µg/m³)
- NO2, O3, SO2 (µg/m³)
- CO (mg/m³)
- Timestamp de última actualización

### Estadísticas Globales
- ICA promedio nacional
- PM2.5 máximo registrado
- Número de ubicaciones monitoreadas

## 🌍 Ciudades Monitoreadas

- Madrid
- Barcelona
- Valencia
- Sevilla
- Bilbao
- Zaragoza

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## 📱 Responsividad

La aplicación está optimizada para:
- **Desktop**: Experiencia completa con mapa y estadísticas
- **Tablet**: Interfaz adaptada con controles táctiles
- **Mobile**: Vista optimizada para pantallas pequeñas

## 🚦 Estado del Proyecto

- ✅ Visualización de mapa interactivo
- ✅ Integración con APIs de calidad del aire
- ✅ Componentes de rascacielos 3D
- ✅ Sistema de actualización en tiempo real
- ✅ Diseño responsive y profesional
- 🔄 Próximamente: Visualización 3D completa del mapa
- 🔄 Próximamente: Histórico de datos
- 🔄 Próximamente: Predicciones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ por un desarrollador senior especializado en aplicaciones web profesionales y visualización de datos.

## 🙏 Agradecimientos

- [OpenWeatherMap](https://openweathermap.org/) por los datos de calidad del aire
- [Leaflet](https://leafletjs.com/) por el sistema de mapas
- [Three.js](https://threejs.org/) por las capacidades 3D
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) por la integración con React

---

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**
