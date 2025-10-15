# 📱 Espacios Creativos - Documentación

## 🎯 Descripción del Proyecto
Espacios Creativos es una aplicación móvil moderna desarrollada en React Native con Expo Router para la gestión y reserva de espacios y salas de reuniones. La aplicación ofrece una experiencia de usuario premium con interfaz optimizada para todos los dispositivos (móvil, tablet y desktop).

## ✨ Características Principales

### 🎨 Interfaz de Usuario Mejorada (UI/UX)
- **Diseño Responsive**: Adaptado para móviles, tablets y desktop
- **Tema Oscuro**: Paleta de colores neón (#E50914, #00FF87, #00FFFF, #FFB800)
- **Animaciones Fluidas**: Transiciones y efectos visuales optimizados
- **Navegación Intuitiva**: Sistema de navegación mejorado entre pantallas

### 📱 Sistema de Navegación
- **FAB Menu en Desktop**: Menú flotante con animaciones para dispositivos grandes
- **Menú Desplegable en Móviles**: Navegación lateral optimizada para touch

## 🏠 Pantallas Implementadas

### 1. Login (login.tsx)
- Autenticación de usuarios con validaciones
- Diseño moderno con animaciones de entrada
- Campos: Email y contraseña
- Enlace a registro para nuevos usuarios

### 2. Registro (register.tsx)
- Creación de nuevas cuentas
- Validación de fortaleza de contraseñas
- Campos: Nombre completo, email, contraseña y confirmación
- Indicador visual de requisitos de contraseña

### 3. Inicio (index.tsx)
- Listado de salas disponibles
- Sistema de búsqueda y filtrado
- Estadísticas de salas
- Tarjetas informativas con características
- Diseño de lista optimizado

### 4. Mis Reservas (bookings.tsx)
- Gestión de reservas del usuario
- Estados: Pendiente, Aprobada, Rechazada
- Acciones: Cancelar reservas pendientes
- Historial de reservas pasadas

### 5. Perfil (profile.tsx)
- Información personal del usuario
- Avatar centrado con nombre debajo
- Estadísticas de cuenta
- Información detallada (nombre, email, carnet, rol, estado)
- Acceso a panel de administrador (si aplica)

### 6. Acerca de (about.tsx)
- Información personal del desarrollador
- Descripción de la aplicación
- Servicios ofrecidos
- Información de contacto

## 🔧 Funcionalidades Técnicas

### Sistema de Autenticación
- Context API para gestión de estado de autenticación
- Integración con Supabase para backend
- Protección de rutas privadas

### Gestión de Estado
- Context API para estado global
- Estado de autenticación persistente
- Gestión de perfil de usuario

### Responsive Design
- **Breakpoints definidos**:
  - Móvil: < 768px
  - Tablet: 768px - 1024px
  - Desktop: ≥ 1024px
- Funciones de escalado responsive para fuentes, padding e iconos

### Animaciones y Transiciones
- Animated API de React Native
- Transiciones suaves entre pantallas
- Efectos de entrada escalonados
- Animaciones de botones FAB

## 🎪 Componentes Especiales

### FAB Menu (Desktop)
- Botón flotante con opciones expandibles
- Animaciones de escala y rotación
- Labels con tooltips informativos
- Opciones: Inicio, Mi Lista, Perfil, Acerca de, Información, Cerrar Sesión

### Menú Lateral (Móvil/Tablet)
- Drawer deslizante con información de usuario
- Avatar con foto y datos personales
- Secciones de navegación organizadas
- Animaciones de entrada escalonada

### Modal de Información del Sistema
- Información técnica de la aplicación
- Detalles del dispositivo y sistema operativo
- Versión y build de la app
- Información del desarrollador

## 🛠 Tecnologías Utilizadas

### Frontend
- React Native con TypeScript
- Expo Router para navegación
- Expo SDK para funcionalidades nativas
- Lucide React Native para iconografía

### Backend
- Supabase para base de datos y autenticación
- PostgreSQL para almacenamiento de datos

### Estilos
- StyleSheet de React Native
- Diseño responsive con cálculos dinámicos
- Sombras y efectos visuales nativos

## 📁 Estructura del Proyecto

app/
├── (auth)/                    # Rutas de autenticación
│   ├── login.tsx             # Pantalla de inicio de sesión
│   └── register.tsx          # Pantalla de registro
├── (tabs)/                   # Pantallas principales con navegación
│   ├── _layout.tsx           # Layout de navegación principal
│   ├── index.tsx             # Inicio - Lista de salas
│   ├── bookings.tsx          # Mis Reservas
│   ├── profile.tsx           # Perfil de usuario
│   └── about.tsx             # Acerca de la aplicación
├── admin/                    # Panel de administración
└── contexts/                 # Contextos de React para estado global


## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|---------|-----|
| Rojo | #E50914 | Botones principales, títulos |
| Verde Neón | #00FF87 | Estados activos, confirmaciones |
| Cian | #00FFFF | Información, detalles |
| Amarillo | #FFB800 | Advertencias, destacados |
| Rosa | #FF6B9D | Elementos especiales |
| Fondo | #141414 | Fondo principal |
| Cards | #1A1A1A | Tarjetas y contenedores |

## 🔄 Flujo de la Aplicación
1. **Autenticación** → Login/Registro
2. **Navegación Principal** → FAB Menu o Drawer
3. **Gestión de Salas** → Ver, buscar y reservar espacios
4. **Gestión de Reservas** → Ver estado y cancelar reservas
5. **Perfil** → Información personal y configuración
6. **Información** → Acerca de la app y soporte

## 👤 Roles de Usuario
- **Usuario Estándar**: Reservar salas, gestionar sus reservas
- **Administrador**: Panel de administración para gestionar todas las reservas

## 📱 Características de Responsive
- **Móvil**: Navegación por drawer, diseño compacto
- **Tablet**: Layout intermedio, más espacio para contenido
- **Desktop**: FAB menu, layout expandido, mejor uso del espacio

## 🚀 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npx expo start

# Ejecutar en plataforma específica
npx expo start --ios
npx expo start --android
npx expo start --web

📄 Licencia

Desarrollado con ❤️ por Jose Pablo Miranda Quintanilla
Carnet: MQ100216

    Este README documenta la versión 2.1.0 (Build 347) de Espacios Creativos
