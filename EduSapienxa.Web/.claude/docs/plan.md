# Plan de desarrollo — Frontend EduSapienxa

> **Stack:** Angular 21 · TypeScript · Tailwind CSS v4 · Standalone Components · Signals  
> **Referencia visual:** [TailAdmin Angular](https://angular-demo.tailadmin.com/) — repo: `TailAdmin/free-angular-tailwind-dashboard`  
> **Convención:** Pasos marcados con 🧑 los ejecutas tú manualmente. Pasos marcados con 🤖 los ejecuta Claude Code.


El api de esta web es /c/Users/AsusG16/source/repos/PERSONAL/EduSapienxa.API.
---

## Skills disponibles (skills.sh)

Las siguientes skills están instaladas y Claude Code debe consultarlas y aplicarlas activamente durante el desarrollo:

| Skill | Origen | Cuándo aplicarla |
|---|---|---|
| `frontend-design` | `anthropics/skills` | En cada componente — producir UI de calidad profesional, no genérica |
| `tailwind-design-system` | `wshobson/agents` | Al configurar Tailwind v4 y al construir cualquier componente con clases utilitarias |
| `executing-plans` | `obra/superpowers` | Al inicio de cada paso — ejecutar en batches, reportar y esperar feedback |
| `verification-before-completion` | `obra/superpowers` | Antes de cerrar cada paso — verificar que compila, rutas cargan y servicios responden |
| `systematic-debugging` | `obra/superpowers` | Ante errores de tipos TypeScript, binding o llamadas HTTP fallidas |
| `webapp-testing` | `anthropics/skills` | Al finalizar cada módulo — validar flujos principales contra la API real |

> **Nota para Claude Code:** Al iniciar cada paso, identifica qué skills aplican y tenlas como referencia activa. Usa `executing-plans` como hilo conductor de todo el desarrollo.

---

## Contexto del backend

> **Importante para Claude Code:** El backend es una API RESTful en .NET 8 corriendo en la URL que el usuario indicará al comenzar. Antes de implementar cualquier servicio Angular, revisar los endpoints disponibles, los DTOs de respuesta y los headers de autenticación JWT requeridos. Todos los requests autenticados deben incluir el header `Authorization: Bearer <token>`.

### Endpoints disponibles

#### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Retorna JWT con claims: userId, email, role |

#### Catálogo
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categories` | Lista categorías activas |
| GET | `/api/categories/{id}` | Categoría con sus subcategorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/{id}` | Actualizar categoría |
| DELETE | `/api/categories/{id}` | Eliminar categoría |
| GET | `/api/subcategories` | Lista subcategorías |
| GET | `/api/subcategories/{id}` | Subcategoría con sus cursos |
| POST | `/api/subcategories` | Crear subcategoría |
| PUT | `/api/subcategories/{id}` | Actualizar subcategoría |
| DELETE | `/api/subcategories/{id}` | Eliminar subcategoría |
| GET | `/api/courses` | Lista cursos con filtros opcionales |
| GET | `/api/courses/{id}` | Curso completo con subcategorías |
| POST | `/api/courses` | Crear curso |
| PUT | `/api/courses/{id}` | Actualizar curso |
| DELETE | `/api/courses/{id}` | Eliminar curso |

#### Leads
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/leads` | Lista leads con filtro por estado |
| GET | `/api/leads/{id}` | Lead con historial de intereses |
| POST | `/api/leads` | Crear lead manual |
| PUT | `/api/leads/{id}` | Actualizar lead |
| POST | `/api/leads/{id}/interests` | Registrar interés |
| GET | `/api/leads/{id}/recommendations` | Cursos recomendados (excluye comprados) |

#### Compras
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/purchases` | Lista todas las compras |
| GET | `/api/leads/{id}/purchases` | Compras de un lead |
| POST | `/api/purchases` | Registrar compra manual |

#### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Lista usuarios del equipo |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/{id}` | Actualizar usuario |
| DELETE | `/api/users/{id}` | Desactivar usuario |

#### Dashboard
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard/summary` | Métricas generales |
| GET | `/api/dashboard/top-courses` | Cursos más consultados y comprados |

---

## Estructura del proyecto

```
EduSapienxa.Web/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── category.model.ts
│   │   │   │   ├── subcategory.model.ts
│   │   │   │   ├── course.model.ts
│   │   │   │   ├── lead.model.ts
│   │   │   │   ├── purchase.model.ts
│   │   │   │   ├── user.model.ts
│   │   │   │   └── dashboard.model.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── category.service.ts
│   │   │       ├── subcategory.service.ts
│   │   │       ├── course.service.ts
│   │   │       ├── lead.service.ts
│   │   │       ├── purchase.service.ts
│   │   │       ├── user.service.ts
│   │   │       └── dashboard.service.ts
│   │   ├── layout/
│   │   │   ├── main-layout/
│   │   │   ├── sidebar/
│   │   │   └── topbar/
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── data-table/
│   │   │       ├── stat-card/
│   │   │       ├── badge-status/
│   │   │       ├── confirm-modal/
│   │   │       └── page-header/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── catalog/
│   │   │   ├── leads/
│   │   │   ├── purchases/
│   │   │   └── users/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   ├── styles.css             ← Tailwind v4 @theme aquí
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
```

---

## Paso 1 🧑 — Crear el proyecto Angular

Ejecutar en terminal:

```bash

# Instalar Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# Dependencias de la app
npm install @angular/common @angular/forms
```

Configurar Tailwind v4 en `styles.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(45% 0.2 260);
  --color-primary-foreground: oklch(98% 0.01 264);
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0.025 264);
  --color-muted: oklch(96% 0.01 264);
  --color-muted-foreground: oklch(46% 0.02 264);
  --color-border: oklch(91% 0.01 264);
  --color-card: oklch(100% 0 0);
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-background: oklch(14.5% 0.025 264);
  --color-foreground: oklch(98% 0.01 264);
  --color-muted: oklch(22% 0.02 264);
  --color-border: oklch(22% 0.02 264);
  --color-card: oklch(14.5% 0.025 264);
}
```

Configurar `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:PUERTO/api'  // ← reemplazar con el puerto real del backend
};
```

---

## Paso 2 🤖 — Modelos TypeScript (core/models)

Crear interfaces que reflejen exactamente los DTOs del backend:

| Archivo | Contenido |
|---|---|
| `category.model.ts` | `Category`, `CreateCategoryDto`, `UpdateCategoryDto` |
| `subcategory.model.ts` | `Subcategory`, `CreateSubcategoryDto`, `UpdateSubcategoryDto` |
| `course.model.ts` | `Course`, `CreateCourseDto`, `UpdateCourseDto` |
| `lead.model.ts` | `Lead`, `LeadInterest`, `LeadStatus`, `CreateLeadDto` |
| `purchase.model.ts` | `Purchase`, `CreatePurchaseDto` |
| `user.model.ts` | `AppUser`, `CreateUserDto`, `UserRole` |
| `dashboard.model.ts` | `DashboardSummary`, `TopCourse` |
| `auth.model.ts` | `LoginRequest`, `LoginResponse`, `TokenClaims` |

> **Nota para Claude Code:** Verificar que cada interface coincida con la estructura de respuesta real de la API antes de continuar al paso siguiente.

---

## Paso 3 🤖 — Servicios HTTP (core/services)

Todos los servicios usan `HttpClient` con `inject()` y retornan `Observable<T>`. El interceptor del Paso 4 se encarga del JWT automáticamente.

| Servicio | Métodos clave |
|---|---|
| `auth.service.ts` | `login()`, `logout()`, `currentUser` (signal), `isAuthenticated` (signal), `hasRole()` |
| `category.service.ts` | `getAll()`, `getById()`, `create()`, `update()`, `delete()` |
| `subcategory.service.ts` | `getAll()`, `getById()`, `create()`, `update()`, `delete()` |
| `course.service.ts` | `getAll()`, `getById()`, `create()`, `update()`, `delete()` |
| `lead.service.ts` | `getAll()`, `getById()`, `create()`, `update()`, `addInterest()`, `getRecommendations()` |
| `purchase.service.ts` | `getAll()`, `getByLead()`, `create()` |
| `user.service.ts` | `getAll()`, `create()`, `update()`, `deactivate()` |
| `dashboard.service.ts` | `getSummary()`, `getTopCourses()` |

> **Patrón a seguir en todos los servicios con Signals:**
> ```typescript
> export class LeadService {
>   private http = inject(HttpClient);
>   private apiUrl = inject(ENVIRONMENT).apiUrl;
>
>   leads = signal<Lead[]>([]);
>   loading = signal(false);
>   error = signal<string | null>(null);
>
>   loadAll() {
>     this.loading.set(true);
>     this.http.get<Lead[]>(`${this.apiUrl}/leads`).subscribe({
>       next: data => { this.leads.set(data); this.loading.set(false); },
>       error: err => { this.error.set(err.message); this.loading.set(false); }
>     });
>   }
> }
> ```

---

## Paso 4 🤖 — Core: guards, interceptor y configuración

**`auth.interceptor.ts`**
- Adjunta el JWT en el header `Authorization: Bearer <token>` en cada request
- Si la API retorna 401, redirige al login y limpia el token

**`auth.guard.ts`**
- Protege todas las rutas del dashboard
- Redirige a `/login` si no hay sesión activa

**`role.guard.ts`**
- Protege rutas exclusivas de `admin` (gestión de usuarios)
- Redirige a `/dashboard` si el rol es `editor`

**`app.config.ts`**
- Provee `HttpClient` con `provideHttpClient(withInterceptors([authInterceptor]))`
- Provee el router con `provideRouter(routes)`
- Provee `ENVIRONMENT` token con los valores del environment

**`app.routes.ts`**

```
/login                    → LoginComponent (pública)
/                         → redirect a /dashboard
/dashboard                → DashboardComponent (auth guard)
/catalog                  → CatalogComponent (auth guard)
/catalog/categories       → CategoriesComponent
/catalog/subcategories    → SubcategoriesComponent
/catalog/courses          → CoursesComponent
/leads                    → LeadsComponent (auth guard)
/leads/:id                → LeadDetailComponent
/purchases                → PurchasesComponent (auth guard)
/users                    → UsersComponent (auth + role: admin)
```

---

## Paso 5 🤖 — Layout principal

**Referencia visual:** sidebar y topbar de TailAdmin (`src/app/layout/`)

**`sidebar/`**
- Navegación lateral con los 5 módulos: Dashboard, Catálogo, Leads, Compras, Usuarios
- Colapsable en mobile (responsive)
- Resalta la ruta activa con `RouterLinkActive`
- Ítem de Usuarios visible solo para rol `admin`
- Dark mode toggle integrado

**`topbar/`**
- Nombre del usuario logueado (desde signal de `AuthService`)
- Botón de logout
- Toggle dark mode

**`main-layout/`**
- Contenedor principal que envuelve sidebar + topbar + `<router-outlet>`
- Aplica el layout solo a rutas protegidas

---

## Paso 6 🤖 — Componentes compartidos (shared/components)

Componentes reutilizables en todos los módulos. Basarse en los patrones visuales de TailAdmin:

| Componente | Descripción |
|---|---|
| `data-table` | Tabla con columnas configurables, paginación y búsqueda. Inputs: `columns`, `data`, `loading` (signal). |
| `stat-card` | Tarjeta de métrica con título, valor grande, subtítulo y variación. Referencia: cards del dashboard de TailAdmin. |
| `badge-status` | Pill de color según estado del lead: nuevo (azul), en conversación (amarillo), convertido (verde), inactivo (gris). |
| `confirm-modal` | Modal de confirmación para acciones destructivas (eliminar, desactivar). |
| `page-header` | Header de página con título, descripción y slot para botón de acción primaria. |

---

## Paso 7 🤖 — Módulo Auth

**Ruta:** `/login`

- Formulario con email y contraseña usando `ReactiveFormsModule`
- Llama a `AuthService.login()` y redirige a `/dashboard` en éxito
- Muestra error inline si las credenciales son inválidas
- Diseño centrado tipo card, sin sidebar — referencia: página de login de TailAdmin

---

## Paso 8 🤖 — Módulo Dashboard

**Ruta:** `/dashboard`

Consumir `GET /api/dashboard/summary` y `GET /api/dashboard/top-courses`.

**Secciones:**

- Fila de 4 `stat-card`: Total leads · Leads convertidos · Total cursos · Compras del mes
- Tabla de top cursos más consultados vs más comprados
- Lista de últimos leads capturados con su estado

> Referencia visual: ecommerce dashboard de TailAdmin — cards superiores + tabla central.

---

## Paso 9 🤖 — Módulo Catálogo

**Ruta:** `/catalog`

Tres sub-secciones con tabs o navegación secundaria:

**Categorías** (`/catalog/categories`)
- Tabla con: nombre, descripción, estado (badge activo/inactivo), acciones
- Botón crear → modal con formulario
- Botón editar → mismo modal pre-llenado
- Botón eliminar → `confirm-modal`

**Subcategorías** (`/catalog/subcategories`)
- Tabla con: nombre, categoría padre, estado, acciones
- Selector de categoría padre en el formulario

**Cursos** (`/catalog/courses`)
- Tabla con: nombre, subcategorías, precio, checkout URL, estado
- Formulario con selector múltiple de subcategorías (muchos a muchos)
- Campo `CheckoutUrl` con validación de URL
- Preview del link de checkout en la fila de la tabla

---

## Paso 10 🤖 — Módulo Leads

**Ruta:** `/leads`

**Lista de leads** (`/leads`)
- Tabla con: nombre, WhatsApp ID, fuente (badge WhatsApp/manual), estado (badge), última interacción, acciones
- Filtro por estado: todos / nuevo / en conversación / convertido / inactivo
- Botón crear lead manual → formulario en modal
- Click en fila → navegar a detalle

**Detalle de lead** (`/leads/:id`)
- Card con datos del lead (nombre, teléfono, email, WhatsApp ID)
- Selector de estado con `PUT /api/leads/{id}`
- Timeline de historial de intereses (`LeadInterest`) ordenado por fecha
- Lista de cursos adquiridos (Compras) con botón para registrar nueva compra
- Sección de cursos recomendados desde `GET /api/leads/{id}/recommendations`

---

## Paso 11 🤖 — Módulo Compras

**Ruta:** `/purchases`

- Tabla global de compras con: lead, curso, monto pagado, fecha, registrado por
- Botón registrar compra manual → modal con:
  - Selector de lead (buscar por nombre o teléfono)
  - Selector de curso
  - Campo monto pagado
  - Campo notas (opcional)
- Llama a `POST /api/purchases`

---

## Paso 12 🤖 — Módulo Usuarios

**Ruta:** `/users` (solo rol `admin`)

- Tabla con: nombre, email, rol (badge Admin/Editor), estado (activo/inactivo)
- Botón crear usuario → modal con formulario
- Botón editar → mismo modal pre-llenado
- Botón desactivar → `confirm-modal` → `DELETE /api/users/{id}`

---

## Paso 13 🤖 — Ajustes finales

- Manejo global de errores HTTP: interceptor que muestra notificación toast en errores 400, 403, 500
- Estado de carga global: skeleton loaders en tablas mientras `loading` signal es `true`
- Validación de formularios reactivos con mensajes de error inline en todos los módulos
- Responsive: verificar que sidebar colapsa correctamente en mobile y tablet
- Dark mode: probar todos los módulos en modo oscuro

---

## Resumen de responsabilidades

| Paso | Quién | Qué |
|---|---|---|
| 1 | 🧑 Tú | Crear proyecto Angular, instalar Tailwind v4, configurar environment con URL del backend |
| 2 | 🤖 Claude Code | Modelos TypeScript alineados con DTOs del backend |
| 3 | 🤖 Claude Code | Servicios HTTP con Signals |
| 4 | 🤖 Claude Code | Guards, interceptor JWT, rutas, app.config |
| 5 | 🤖 Claude Code | Layout: sidebar + topbar + main layout |
| 6 | 🤖 Claude Code | Componentes compartidos (tabla, stat-card, badge, modal) |
| 7 | 🤖 Claude Code | Módulo Auth — login |
| 8 | 🤖 Claude Code | Módulo Dashboard — métricas |
| 9 | 🤖 Claude Code | Módulo Catálogo — categorías, subcategorías, cursos |
| 10 | 🤖 Claude Code | Módulo Leads — lista y detalle |
| 11 | 🤖 Claude Code | Módulo Compras |
| 12 | 🤖 Claude Code | Módulo Usuarios |
| 13 | 🤖 Claude Code | Ajustes finales: errores, skeletons, responsive, dark mode |