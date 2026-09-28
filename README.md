# 📖 MJVC Attendance - Instrucciones de Ejecución

Este documento explica cómo levantar y probar la aplicación tanto con Docker (recomendado) como de forma local (Node.js + XAMPP).

---

## ⚡ Opción 1: Desarrollo Rápido con Hot Reload (Docker BD + Next.js Local) — RECOMENDADA

La mejor experiencia de desarrollo: **Docker maneja MySQL** (sin instalar MySQL ni XAMPP en Windows) y **Next.js corre localmente** con Turbopack, permitiendo **Hot Reload instantáneo** en cada guardado de archivo.

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) iniciado.
- Node.js (v20 o superior) instalado.

### Pasos Rápidos
1. **Enciende la base de datos en Docker:**
   ```bash
   npm run db:up
   ```
2. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
3. Abre tu navegador en **[http://localhost:3000](http://localhost:3000)**.
   *Cualquier cambio que guardes en el código se reflejará al instante en tu pantalla.*

Para apagar la base de datos cuando termines: `npm run db:down`.

---

## 🐳 Opción 2: Ejecución 100% Contenedorizada (Producción con Docker)

Si deseas empaquetar toda la aplicación dentro de contenedores idénticos a producción (sin Node.js instalado en tu máquina):

```bash
docker compose up -d --build
```
- Para ver los registros: `docker compose logs -f`
- Para apagar: `docker compose down`

---

## 💻 Opción 2: Ejecución Local (Node.js + XAMPP)

Si prefieres seguir desarrollando directamente sin contenedores, puedes usar XAMPP para la base de datos y Node.js para la app.

### Prerrequisitos
- Node.js (v20 o superior).
- XAMPP (con MySQL).

### Pasos

1. **Inicia XAMPP** y enciende el módulo de **MySQL**.
2. **Prepara la Base de Datos**: Abre *phpMyAdmin* y asegúrate de crear una base de datos llamada `mjvc_attendance` (o el nombre que tengas en tu archivo `.env`).
3. En la terminal del proyecto, instala las dependencias (se requiere `--legacy-peer-deps` por algunas librerías UI):
```bash
npm install --legacy-peer-deps
```
4. Sincroniza la estructura de la base de datos con Prisma:
```bash
npx prisma generate
npx prisma db push
```
5. *(Opcional)* Llena la base de datos con datos de prueba:
```bash
npm run db:seed
```
6. Levanta el servidor de desarrollo:
```bash
npm run dev
```

7. Entra a **[http://localhost:3000](http://localhost:3000)** y verás la aplicación corriendo localmente.

---

### 🔑 Notas sobre los Nuevos Estados Justificados
Al probar la tabla de asistencia en el Dashboard, presiona los sellos de asistencia en los integrantes.
- **R (Retardo)** -> **RJ (Retardo Justificado)**
- **X (Falta)** -> **FJ (Falta Justificada)**

Al seleccionar `RJ` o `FJ`, aparecerá una pequeña ventana preguntando el motivo. Si quieres cancelar la justificación, simplemente deja el cuadro de texto vacío o dale en *Cancelar*.
