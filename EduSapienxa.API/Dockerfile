# ═══════════════════════════════════════════════════════════
# ETAPA 1 — BUILD
# SDK completo para compilar. Esta imagen NO llega a producción.
# ═══════════════════════════════════════════════════════════
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos el .csproj primero para cachear el restore.
# Si el .csproj no cambia, Docker reutiliza esta capa
# sin volver a descargar paquetes NuGet.
COPY ["EduSapienxa.API/EduSapienxa.API.csproj", "EduSapienxa.API/"]

# Restaurar dependencias de NuGet
RUN dotnet restore "EduSapienxa.API/EduSapienxa.API.csproj"

# Copiar todo el código fuente
COPY . .

# Compilar y publicar en modo Release
# --no-restore: ya hicimos restore arriba
RUN dotnet publish "EduSapienxa.API/EduSapienxa.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

# ═══════════════════════════════════════════════════════════
# ETAPA 2 — RUNTIME
# Solo el runtime de ASP.NET — sin SDK, sin código fuente.
# Resultado: ~220MB vs ~750MB del SDK.
# ═══════════════════════════════════════════════════════════
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copiamos solo el output compilado de la etapa build
COPY --from=build /app/publish .

EXPOSE 8080

# Exec form para recibir señales del sistema correctamente
# (docker stop hace shutdown graceful en lugar de kill)
ENTRYPOINT ["dotnet", "EduSapienxa.API.dll"]