# ⚡ Guía de Desarrollo Rápido (Docker BD + Next.js Local con Hot Reload)

Esta configuración combina lo mejor de ambos mundos:
1. **Docker maneja la Base de Datos MySQL** (no necesitas instalar ni configurar MySQL ni XAMPP en Windows).
2. **Next.js corre directamente en tu máquina con Turbopack** (`npm run dev`), lo que te da **Hot Reload / Fast Refresh instantáneo (en milisegundos)**: cada vez que guardas un cambio en tu código, se refleja inmediatamente en tu navegador sin reconstruir Docker.

---

## 🚀 Flujo de Trabajo Diario (Paso a Paso)

### 1. Inicia Docker Desktop
Asegúrate de que Docker Desktop esté abierto en tu computadora.

### 2. Enciende la Base de Datos
En la terminal de tu proyecto, ejecuta:
```bash
npm run db:up
```
*(O el comando equivalente: `docker compose up -d db`)*.

> **¿Qué hace este comando?**
> Levanta el contenedor de MySQL en segundo plano en el puerto `3306`. Tus datos están seguros y persistidos en el volumen de Docker.

### 3. Inicia el Servidor de Desarrollo
En tu terminal:
```bash
npm run dev
```

### 4. ¡Abre tu Navegador!
Entra a:
👉 **[http://localhost:3000](http://localhost:3000)**

¡Listo! A partir de aquí:
- Edita cualquier archivo (`.tsx`, `.ts`, `.css`).
- Guarda con `Ctrl + S`.
- Tu pantalla se actualizará de inmediato.

---

## 🛑 ¿Cómo detener los servicios cuando termines de programar?

1. En la terminal donde corre Next.js, presiona `Ctrl + C` para detener el servidor de desarrollo.
2. Para apagar el contenedor de la base de datos:
   ```bash
   npm run db:down
   ```
   *(O `docker compose down`)*.

---

## 🛠️ Comandos de Utilidad

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Iniciar BD** | `npm run db:up` | Enciende MySQL en Docker en segundo plano |
| **Detener BD** | `npm run db:down` | Apaga MySQL de forma segura |
| **Ver estado de la BD** | `docker compose ps` | Verifica si el contenedor `mjvc_db` está saludable |
| **Prisma Studio** | `npx prisma studio` | Abre una interfaz visual en `http://localhost:5555` para ver y editar registros de la BD |
| **Reiniciar BD con datos de prueba** | `npm run db:reset` | Aplica migraciones limpias y carga los datos de prueba (`seed`) |
| **Ejecutar Pruebas** | `npm test` | Corre los tests unitarios con Vitest (todos deben pasar) |

---

## ❓ Preguntas Frecuentes

### ¿Tengo que hacer migraciones manualmente?
No para el día a día. La base de datos ya está configurada. Si en el futuro agregas nuevas tablas o columnas en `prisma/schema.prisma`, solo ejecutas:
```bash
npx prisma migrate dev
```

### ¿Qué pasa si quiero probar la aplicación empaquetada como en producción?
Tu archivo `docker-compose.yml` sigue 100% funcional. Si quieres levantar todo dentro de Docker como contenedor cerrado de producción, puedes hacer:
```bash
docker compose up -d --build
```
Y cuando quieras regresar a desarrollar con Hot Reload:
```bash
docker compose down
npm run db:up
npm run dev
```
