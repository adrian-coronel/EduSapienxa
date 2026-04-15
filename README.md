# sapienxa-landingpage

Repositorio monorepo de **EduSapienxa**, compuesto por:

- **EduSapienxa.Web**: Frontend Angular 21 + Tailwind CSS.
- **EduSapienxa.API**: Backend ASP.NET Core 8 + Entity Framework Core + PostgreSQL.

## Requisitos

- Node.js 20+ y npm 10+
- .NET SDK 8
- PostgreSQL 14+

## Estructura

```text
sapienxa-landingpage/
├─ EduSapienxa.Web/
└─ EduSapienxa.API/
```

## Ejecutar frontend

```bash
cd EduSapienxa.Web
npm install
npm start
```

Frontend por defecto: `http://localhost:4200`

## Ejecutar backend

1. Configura la conexión de base de datos en `EduSapienxa.API/appsettings.json` o `appsettings.Development.json`.
2. Ejecuta:

```bash
cd EduSapienxa.API
dotnet restore
dotnet run
```

Swagger disponible en entorno de desarrollo al iniciar la API.

## Notas

- La API usa autenticación JWT.
- CORS permite `http://localhost:4200` por defecto.
- Al iniciar, se realiza seed de datos iniciales y usuario administrador si no existe.
