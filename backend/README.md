# Backend - Sistema de Alojamiento NYU

Backend desarrollado con NestJS para gestionar el flujo de alojamiento estudiantil: autenticacion, solicitudes, asignaciones, infraestructura residencial, incidencias, check-in/check-out e integraciones externas de matricula y pagos.

## Stack tecnico

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- class-validator / class-transformer
- Jest

## Estructura principal

```text
src/
  app.module.ts
  main.ts
  common/
    decorators/
    guards/
    types/
  config/
    database.config.ts
    env.config.ts
  database/
    data-source.ts
    migrations/
  integrations/
    estudiantes/
    pagos/
  modules/
    asignaciones/
    auth/
    checkin/
    edificios/
    habitaciones/
    historial/
    incidencias/
    matricula-integration/
    pagos/
    periodos/
    pisos/
    residencias/
    solicitudes/
    solicitudes-admin/
    users/
```

## Instalacion

Desde la carpeta `backend/`:

```bash
npm install
```

## Variables de entorno

El backend carga variables desde `.env` usando `ConfigModule`.

```env
PORT=3000
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN_SECONDS=28800

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=nyu_accommodation
DB_SSL=false

INTEGRATION_API_KEY=service-token
INTEGRATION_MATRICULA_API_KEY=matricula-private-key

PAGOS_BASE_URL=https://example.com
PAGOS_PRIVATE_KEY=pagos-private-key
```

Notas:

- `DB_SSL` por defecto se interpreta como activo si no se define como `false`.
- `JWT_SECRET` tiene un valor por defecto de desarrollo, pero debe cambiarse en produccion.
- `INTEGRATION_API_KEY` se usa para endpoints protegidos con `ApiKeyGuard`.
- `INTEGRATION_MATRICULA_API_KEY` se usa para consultar la API externa de matriculas.
- `PAGOS_BASE_URL` y `PAGOS_PRIVATE_KEY` se usan en el servicio de pagos, aunque el controller de pagos aun no expone endpoints.

## Comandos disponibles

```bash
npm run start:dev
npm run build
npm run start
npm run start:prod
npm run lint
npm run format
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

Migraciones TypeORM:

```bash
npm run migration:generate -- src/database/migrations/NombreMigracion
npm run migration:run
npm run migration:revert
```

## Arranque de la aplicacion

El bootstrap se encuentra en `src/main.ts`.

- Habilita CORS con `origin: '*'`.
- Usa `ValidationPipe` global con `whitelist`, `transform` y `forbidNonWhitelisted`.
- Escucha en `process.env.PORT` o `3000` por defecto.

## Base de datos

La conexion se configura en `src/config/database.config.ts`.

- Motor: PostgreSQL.
- ORM: TypeORM.
- `autoLoadEntities: true`.
- `synchronize: false`.
- Migraciones desde `src/database/migrations`.

## Autenticacion y autorizacion

El sistema usa JWT con header Bearer:

```http
Authorization: Bearer <accessToken>
```

Roles soportados:

- `ADMIN`
- `STUDENT`

Guards principales:

- `JwtAuthGuard`: valida token JWT y carga `request.user`.
- `RolesGuard`: valida que el usuario tenga uno de los roles requeridos.
- `ApiKeyGuard`: valida `Authorization: Bearer <INTEGRATION_API_KEY>` para integraciones entre servicios.

## Usuarios semilla

Al iniciar el modulo de autenticacion, si no existen usuarios en la tabla `usuario`, se crean usuarios de demostracion.

| Rol | RUT | Password |
| --- | --- | --- |
| ADMIN | `12345678-5` | `Admin123*` |
| STUDENT | `87654321-K` | `Student123*` |
| STUDENT | `11222333-4` | `Student456*` |
| STUDENT | `20567891-7` | `Student789*` |

## Endpoints

Las rutas se listan sin prefijo global porque actualmente la aplicacion no define uno.

### Salud general

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/` | Endpoint base de la aplicacion. |

### Auth

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/auth/login` | Publico | Inicia sesion y retorna JWT. |
| POST | `/auth/register` | Publico | Registra usuario y retorna JWT. |
| GET | `/auth/me` | JWT | Retorna el usuario autenticado. |
| GET | `/auth/admin-only` | ADMIN | Endpoint de prueba para admin. |
| GET | `/auth/student-only` | STUDENT | Endpoint de prueba para estudiante. |

Ejemplo login:

```json
{
  "rut": "12345678-5",
  "password": "Admin123*"
}
```

Respuesta esperada:

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": 1,
    "rut": "12345678-5",
    "fullName": "Administrador NYU",
    "role": "ADMIN",
    "genero": "Masculino"
  }
}
```

### Solicitudes de estudiantes

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/solicitudes/status` | Publico | Estado del modulo. |
| GET | `/solicitudes` | STUDENT | Historial de solicitudes del estudiante autenticado. |
| GET | `/solicitudes/me` | STUDENT | Solicitud del estudiante para el periodo activo. |
| POST | `/solicitudes` | STUDENT | Crea una solicitud para el periodo activo. |

Reglas principales:

- Solo se permite una solicitud por estudiante por periodo activo.
- Si no hay periodo activo, la creacion falla.
- La solicitud se crea con estado `Pendiente`.

### Solicitudes de administracion

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/solicitudes-admin` | ADMIN | Lista todas las solicitudes. |
| GET | `/solicitudes-admin/periodos/:idPeriodo` | ADMIN | Lista solicitudes por periodo. |
| PATCH | `/solicitudes-admin/solicitudes-admin/:idSolicitud` | ADMIN | Cambia estado de una solicitud y registra admin. |

Nota: la ruta PATCH contiene el segmento repetido `solicitudes-admin` porque asi esta implementada actualmente.

### Asignaciones

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/asignaciones` | ADMIN | Crea una asignacion desde una solicitud y habitacion. |
| GET | `/asignaciones` | ADMIN | Lista todas las asignaciones. |
| GET | `/asignaciones/historial` | STUDENT | Historial de asignaciones del estudiante autenticado. |
| GET | `/asignaciones/activa` | STUDENT | Asignacion activa del estudiante autenticado. |
| GET | `/asignaciones/estudiantes/:rut/activa` | ADMIN | Busca asignacion activa de un estudiante por RUT. |
| GET | `/asignaciones/periodos/:idPeriodo` | ADMIN | Lista asignaciones por periodo. |
| GET | `/asignaciones/periodos/:idPeriodo/residentes/activos` | ADMIN | Total de residentes activos en un periodo. |
| PATCH | `/asignaciones/:idAsignacion/habitacion` | ADMIN | Reasigna habitacion. |
| DELETE | `/asignaciones/:idAsignacion` | ADMIN | Registra renuncia y libera cupo. |
| GET | `/asignaciones/residentes/:rut` | ADMIN | Busca residente por RUT para control de estancia. |
| PATCH | `/asignaciones/:idAsignacion/ingresos` | ADMIN | Registra check-in. |
| PATCH | `/asignaciones/:idAsignacion/salidas` | ADMIN | Registra check-out. |
| GET | `/asignaciones/estudiantes/:rut/estado` | API Key | Indica si el estudiante tiene residencia activa en el periodo actual. |

Crear asignacion:

```json
{
  "idSolicitud": 10,
  "idHabitacion": 4
}
```

Reglas principales al crear asignacion:

- La solicitud debe existir.
- La solicitud debe estar `Pendiente` o `En Revision`.
- La habitacion, piso y edificio asociados deben existir.
- El estudiante debe tener matricula activa en la integracion externa.
- El genero del estudiante debe coincidir con el edificio, excepto edificios `Mixto`.
- La habitacion debe tener cupos disponibles.
- Al asignar, disminuye `capacidadActual` de la habitacion.
- Si la habitacion queda sin cupos, se marca como no disponible.
- La solicitud queda `Aprobada` y enlazada con la asignacion.

Reglas principales de check-out:

- La asignacion debe existir.
- La asignacion debe estar `Activa`.
- Debe existir `fechaCheckIn` antes de permitir check-out.
- Se libera cupo de habitacion.
- La asignacion queda `Finalizada`.

### Residencias

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/residencias/status` | Publico | Estado del modulo. |
| GET | `/residencias/disponibilidad` | STUDENT | Consulta disponibilidad por genero y semestre. |

Query params esperados:

- `gender`
- `semester`

### Edificios

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/edificios` | ADMIN | Lista edificios. |
| GET | `/edificios/infraestructura` | JWT | Retorna infraestructura completa. |
| GET | `/edificios/infraestructura/:generoEdificio` | JWT | Retorna infraestructura filtrada por genero. |
| GET | `/edificios/genero/:generoEdificio` | JWT | Retorna edificios por genero, validando acceso de estudiante. |
| PATCH | `/edificios/:id` | ADMIN | Modifica un edificio. |

### Pisos

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/pisos` | ADMIN | Lista pisos. |
| POST | `/pisos` | ADMIN | Crea piso. |
| GET | `/pisos/edificio/:idEdificio` | ADMIN | Lista pisos de un edificio. |
| PATCH | `/pisos/:id` | ADMIN | Modifica piso. |
| DELETE | `/pisos/:id` | ADMIN | Elimina piso. |

Crear piso:

```json
{
  "nroPiso": 1,
  "nombre": "Piso 1",
  "idEdificio": 2
}
```

### Habitaciones

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/habitaciones` | ADMIN | Crea habitacion. |
| GET | `/habitaciones` | ADMIN | Lista habitaciones. |
| GET | `/habitaciones/detalles` | ADMIN | Lista habitaciones con informacion de piso. |
| GET | `/habitaciones/disponibles/total` | JWT | Total de habitaciones disponibles. |
| GET | `/habitaciones/edificio/:idEdificio` | ADMIN | Lista habitaciones por edificio. |
| PATCH | `/habitaciones/:id` | ADMIN | Modifica habitacion. |
| DELETE | `/habitaciones/:id` | ADMIN | Elimina habitacion. |

Crear habitacion:

```json
{
  "nroHabitacion": 101,
  "capacidadActual": 2,
  "disponibilidad": true,
  "idPiso": 1
}
```

### Incidencias

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/incidencias/status` | Publico | Estado del modulo. |
| POST | `/incidencias` | ADMIN | Crea incidencia. |
| GET | `/incidencias` | Publico | Lista incidencias, opcionalmente filtradas. |

Crear incidencia:

```json
{
  "descripcion": "Falla en calefaccion",
  "gravedad": "Moderado",
  "idHabitacion": 10,
  "rutEstudiante": "87654321-K",
  "rutAdmin": "12345678-5"
}
```

Filtros soportados por query segun DTO:

- `rut`
- Otros campos definidos en `IncidenciaQueryDto`.

### Periodos

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/periodos/actual` | Publico | Retorna periodo academico actual. |
| GET | `/periodos` | Publico | Lista periodos. |

### Matricula

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/matricula/:rut/estado` | ADMIN | Verifica si el estudiante tiene matricula activa. |

La verificacion consulta la API externa `https://matricula-nyu-backend.onrender.com`.

Flujo interno:

- Solicita token con `INTEGRATION_MATRICULA_API_KEY`.
- Consulta estado de matricula enviando el RUT.
- Retorna `{ "esActivo": true }` o `{ "esActivo": false }`.

### Users

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/users/status` | Publico | Estado del modulo. |

### Historial

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/historial/status` | Publico | Estado del modulo. |

Nota: el modulo `historial` existe, pero el historial funcional actualmente se obtiene desde `/solicitudes` y `/asignaciones/historial`.

### Checkin legacy

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| PATCH | `/checkin/:idAsignacion` | Segun controller | Modulo separado de check-in. |

Nota: el flujo principal de check-in/check-out usado por asignaciones esta en `/asignaciones/:idAsignacion/ingresos` y `/asignaciones/:idAsignacion/salidas`.

### Pagos

El modulo `pagos` esta registrado, pero `PagosController` no expone endpoints actualmente.

El servicio `PagosService` contiene metodos para:

- Solicitar token temporal a la API externa de pagos.
- Crear orden de pago con `referenceId`, `amount` y `description`.
- Consultar estado de pago por `referenceId`.

Estados esperados por la API externa:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

## Entidades principales

### UsuarioEntity

Tabla: `usuario`

Campos principales:

- `idUsuario`
- `nombre`
- `rut`
- `contrasena`
- `tipoUsuario`
- `genero`

### SolicitudEntity

Tabla: `solicitudes`

Campos principales:

- `idSolicitud`
- `estado`
- `fechaSolicitud`
- `idPeriodo`
- `idAsignacion`
- `rutEstudiante`
- `rutAdmin`

### AsignacionEntity

Tabla: `asignacion_estancia`

Campos principales:

- `idAsignacion`
- `fechaAsignacion`
- `fechaCheckIn`
- `fechaCheckOut`
- `estado`
- `idHabitacion`
- `idPeriodo`
- `rutEstudiante`
- `rutAdmin`
- `fechaPago`
- `referenceId`
- `estadoPago`

### EdificioEntity

Tabla: `edificio`

Campos principales:

- `idEdificio`
- `nombre`
- `ubicacion`
- `capacidadHabitaciones`
- `genero`

### PisoEntity

Tabla: `piso`

Campos principales:

- `idPiso`
- `nroPiso`
- `nombre`
- `idEdificio`

### HabitacionEntity

Tabla: `habitacion`

Campos principales:

- `idHabitacion`
- `disponibilidad`
- `capacidadActual`
- `nroHabitacion`
- `idPiso`
- `capacidadTotal`

### IncidenciaEstanciaEntity

Tabla: `incidencia_estancia`

Campos principales:

- `idIncidencia`
- `descripcion`
- `fecha`
- `gravedad`
- `idHabitacion`
- `rutEstudiante`
- `rutAdmin`

### PeriodoEntity

Tabla: `periodo`

Campos principales:

- `idPeriodo`
- `nombre`
- `fechaInicio`
- `fechaTermino`

## Flujos principales

### Login

1. El cliente envia RUT y password a `/auth/login`.
2. El backend normaliza el RUT removiendo puntos y pasando a mayusculas.
3. Busca usuario por RUT original o normalizado.
4. Compara password.
5. Firma JWT con datos del usuario.
6. Retorna `accessToken` y `user`.

### Postulacion de estudiante

1. Estudiante autenticado llama `POST /solicitudes`.
2. Backend obtiene periodo activo.
3. Valida que no exista otra solicitud para ese estudiante en el periodo.
4. Crea solicitud `Pendiente`.

### Revision y asignacion por admin

1. Admin lista solicitudes desde `/solicitudes-admin`.
2. Admin puede cambiar estado a revision.
3. Admin selecciona habitacion.
4. Backend verifica matricula activa.
5. Backend valida genero, cupo y disponibilidad.
6. Backend crea asignacion y aprueba solicitud.

### Check-in

1. Admin busca residente por RUT.
2. Admin llama `PATCH /asignaciones/:idAsignacion/ingresos`.
3. Backend valida que la asignacion exista y este activa.
4. Backend registra `fechaCheckIn` y `rutAdmin`.

### Check-out

1. Admin llama `PATCH /asignaciones/:idAsignacion/salidas`.
2. Backend valida que la asignacion exista, este activa y tenga check-in.
3. Backend libera cupo de habitacion.
4. Backend marca asignacion como `Finalizada`.
5. Backend registra `fechaCheckOut` y `rutAdmin`.

### Renuncia

1. Admin llama `DELETE /asignaciones/:idAsignacion`.
2. Backend valida que la asignacion exista y este activa.
3. Backend libera cupo de habitacion.
4. Backend marca asignacion como `Renunciada`.
5. Backend registra fecha de salida y admin responsable.

## Estados usados

Solicitudes:

- `Pendiente`
- `En Revision`
- `Aprobada`
- `Rechazada`

Asignaciones:

- `Activa`
- `Finalizada`
- `Renunciada`

Pagos:

- `Pendiente`
- `Pagado`
- `Vencido`

## Seguridad y consideraciones

- El backend usa JWT para usuarios autenticados.
- El control por rol se aplica con `RolesGuard` y decorador `@Roles`.
- Algunas rutas de lectura siguen publicas, como `GET /incidencias`, `GET /periodos` y endpoints de status.
- CORS esta abierto para cualquier origen.
- Las contrasenas se almacenan y comparan como texto plano actualmente; para produccion se debe usar hashing.
- El secreto JWT por defecto es solo para desarrollo.

## Notas de estado actual

- El modulo de pagos tiene logica de service, pero no expone endpoints en el controller.
- El modulo `historial` solo expone status; el historial real se consulta desde solicitudes y asignaciones.
- Existe un modulo `checkin`, pero el flujo principal de check-in/check-out esta implementado dentro de asignaciones.
- Hay rutas del frontend que deben mantenerse alineadas con las rutas reales del backend, especialmente en asignaciones y check-in/out.
- Existen entidades duplicadas o variantes en algunos modulos (`solicitudes`, `periodos`, `residencias`), por lo que conviene revisar imports antes de refactorizar.

## Verificacion recomendada

Antes de entregar cambios de backend:

```bash
npm run build
npm run test
npm run lint
```

Para pruebas e2e:

```bash
npm run test:e2e
```
