# Guía de pruebas con Postman

Esta guía contiene las rutas completas y explica cómo probar cada endpoint de la API con Postman.

## Archivos incluidos

```text
static/
├── app.js
├── car-illustration.svg
├── index.html
└── styles.css
postman/
└── API_Venta_Carros.postman_collection.json
POSTMAN_DOCUMENTATION.md
```

La **URL base** para las solicitudes de la API es:

```text
http://localhost:1002
```

La página principal (`http://localhost:1002/`) es la interfaz web; no es una consulta JSON. Para probar el saludo de la API usa `GET http://localhost:1002/api/holamundo`.

La colección contiene solicitudes para verificar el estado, listar y filtrar carros, consultar por ID, crear, actualizar y eliminar.

## 1. Iniciar la API

Abre PowerShell en la carpeta `api_venta_carros` (donde están `main.py` y `requirements.txt`) e inicia FastAPI:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 1002
```

Si ya creaste el entorno virtual, no es necesario repetir el primer comando. Deja abierta la terminal mientras haces las pruebas.

## 2. Importar la colección

1. Abre Postman.
2. Selecciona **Import**.
3. Arrastra el archivo `postman/API_Venta_Carros.postman_collection.json` o selecciónalo desde el explorador de archivos.
4. Abre la colección **API de Venta de Carros**.

La colección usa la variable `baseUrl`, configurada como `http://localhost:1002`. Si ejecutas la API en otra dirección, edita esa variable en la colección. Cada URL de la colección concatena esta variable con la ruta del endpoint.

## 3. Solicitudes disponibles

| Nombre en Postman | Método | URL completa | Resultado esperado |
|---|---|---|---|
| Verificar que la API funciona | GET | `http://localhost:1002/api/holamundo` | `200 OK`, saludo y estado |
| Listar todos los carros | GET | `http://localhost:1002/api/carros` | `200 OK`, arreglo JSON |
| Listar carros disponibles | GET | `http://localhost:1002/api/carros?disponibles=true` | `200 OK`, solo disponibles |
| Consultar carro con ID 1 | GET | `http://localhost:1002/api/carros/1` | `200 OK`, Toyota Corolla inicial |
| Consultar carro inexistente | GET | `http://localhost:1002/api/carros/9999` | `404 Not Found` |
| Crear carro | POST | `http://localhost:1002/api/carros` | `201 Created` |
| Actualizar carro creado | PUT | `http://localhost:1002/api/carros/{{carroId}}` | `200 OK` |
| Eliminar carro creado | DELETE | `http://localhost:1002/api/carros/{{carroId}}` | `200 OK` |

> En Postman, `{{carroId}}` se sustituye automáticamente por la variable guardada por la solicitud **Crear carro**. Ejecuta las solicitudes de administración en orden: **Crear**, **Actualizar** y **Eliminar**.

## 4. Consultas GET manuales

Para cada consulta, crea una solicitud nueva en Postman, selecciona el método indicado, pega la URL completa y pulsa **Send**.

### Estado de la API

```http
GET http://localhost:1002/api/holamundo
```

Devuelve un JSON de saludo y las rutas principales. La raíz `http://localhost:1002/` abre la página web, por eso no debe usarse para esperar el JSON de la API.

### Listar todos los carros

```http
GET http://localhost:1002/api/carros
```

Devuelve un arreglo JSON con todos los carros.

### Filtrar por disponibilidad

```http
GET http://localhost:1002/api/carros?disponibles=true
```

Para listar los que no están disponibles, cambia el valor a `false`:

```http
GET http://localhost:1002/api/carros?disponibles=false
```

También puedes poner la ruta `/api/carros` en Postman y definir `disponibles` como `true` o `false` en la pestaña **Params**.

### Consultar un carro por ID

```http
GET http://localhost:1002/api/carros/1
```

Reemplaza `1` por el ID que quieras consultar. Si no existe, la API devuelve `404 Not Found` y `{"detail":"Carro no encontrado"}`.

## 5. Crear un carro

Selecciona el método `POST`, usa la URL `http://localhost:1002/api/carros` y en Postman selecciona **Body → raw → JSON**. Postman enviará `Content-Type: application/json`.

```json
{
  "marca": "Mazda",
  "modelo": "Mazda 3",
  "anio": 2023,
  "precio": 92000000,
  "kilometraje": 18000,
  "transmision": "Automática",
  "combustible": "Gasolina",
  "disponible": true
}
```

La respuesta es `201 Created` e incluye el ID asignado por la API. La colección guarda ese ID en `carroId` para usarlo en las solicitudes **Actualizar carro creado** y **Eliminar carro creado**.

## 6. Actualizar un carro

Selecciona `PUT` y la URL `http://localhost:1002/api/carros/1`. Sustituye `1` por el ID a actualizar; en la colección, usa **Actualizar carro creado** después de crear el carro. Envía todos los campos requeridos en **Body → raw → JSON**, usando la misma estructura JSON del ejemplo de creación.

La respuesta es `200 OK` con el objeto actualizado. Si el ID no existe, la API devuelve `404 Not Found`.

## 7. Eliminar un carro

Selecciona `DELETE` y usa `http://localhost:1002/api/carros/1`, reemplazando `1` por el ID deseado. La colección usa `{{carroId}}` para eliminar el carro que creó.

La respuesta es `200 OK` y contiene el mensaje de confirmación junto con el carro eliminado. Si el ID no existe, la API devuelve `404 Not Found`.

## 8. Ejecutar toda la colección

1. Abre el menú de la colección y selecciona **Run collection**.
2. Mantén el orden de las solicitudes. En particular, ejecuta **Crear carro**, luego **Actualizar carro creado** y finalmente **Eliminar carro creado**.
3. Ejecuta la colección.
4. Revisa los resultados de las pruebas en el resumen de ejecución.

Cada solicitud incluye comprobaciones automatizadas del código HTTP y, cuando aplica, del contenido de la respuesta. La consulta del ID `9999` verifica intencionalmente el caso `404`.

## Validaciones del cuerpo

Al crear o actualizar un carro, la API valida estos campos:

- `marca` y `modelo`: texto obligatorio de 1 a 60 caracteres.
- `anio`: entero entre 1950 y 2100.
- `precio`: número mayor que cero.
- `kilometraje`: entero igual o mayor que cero.
- `transmision` y `combustible`: texto obligatorio de 1 a 30 caracteres.
- `disponible`: booleano; si se omite, su valor predeterminado es `true`.

Si los datos no cumplen esas reglas, FastAPI responde con `422 Unprocessable Entity`.

## Probar la API sin colección

La interfaz web está disponible en `http://localhost:1002`. Para probar los endpoints manualmente, abre la documentación interactiva de FastAPI en `http://localhost:1002/docs` y ejecuta las solicitudes desde Swagger UI. El saludo de la API se consulta en `http://localhost:1002/api/holamundo`.

> **Nota:** los datos se guardan en memoria. Al reiniciar el servidor se restablecen los dos carros de ejemplo; los IDs creados durante una ejecución no persisten.
