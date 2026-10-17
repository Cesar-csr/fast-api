# API de Venta de Carros

API REST desarrollada con FastAPI para gestionar vehículos en venta, ideal para practicar pruebas con Postman y explorar documentación automática con Swagger.

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688)
![Postman](https://img.shields.io/badge/Postman-API%20Testing-orange)

</div>

## Estructura del proyecto

```text
api_venta_carros/
├── main.py
├── README.md
├── requirements.txt
├── POSTMAN_DOCUMENTATION.md
├── static/
│   ├── app.js
│   ├── car-illustration.svg
│   ├── index.html
│   └── styles.css
└── postman/
    └── API_Venta_Carros.postman_collection.json
```

## Descripción

La interfaz web está incluida en `static/` y se sirve desde la misma aplicación FastAPI. No es necesario instalar ni ejecutar un servidor frontend aparte.

Esta API permite:

- Administrar los carros desde una interfaz web.
- Listar carros disponibles y no disponibles.
- Consultar un vehículo por su ID.
- Registrar nuevos autos en venta.
- Actualizar información de un carro.
- Eliminar registros de la lista en memoria.

## Requisitos

- Python 3.10 o superior
- FastAPI
- Uvicorn / FastAPI CLI
- Postman (opcional, para pruebas manuales)

## Instalación

Abre PowerShell en la carpeta `api_venta_carros` (la que contiene `main.py` y `requirements.txt`) y ejecuta:

```bash
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 1002
```

Este comando instala las dependencias en el entorno del proyecto e inicia el servidor. Si `python` no está disponible, reemplázalo por `py` en el primer comando.

No cierres la terminal mientras uses la página.

## Abrir la aplicación

```text
http://localhost:1002
```

Abre esa dirección en el navegador para usar el frontend. No abras `index.html` directamente desde el explorador de archivos: la página necesita el servidor FastAPI para cargar el inventario y realizar cambios.

La página de estado de la API está en `http://localhost:1002/api/holamundo` y la documentación interactiva en `http://localhost:1002/docs`.

## URL base

```text
http://localhost:1002
```

## Endpoints

| Método | URL para Postman | Descripción |
|---|---|---
| GET | `http://localhost:1002/api/carros` | Lista todos los carros |
| GET | `http://localhost:1002/api/carros?disponibles=true` | Lista carros disponibles |
| GET | `http://localhost:1002/api/carros/{carro_id}` | Consulta un carro, por ejemplo `/api/carros/1` |
| POST | `http://localhost:1002/api/carros` | Registra un nuevo carro |
| PUT | `http://localhost:1002/api/carros/{carro_id}` | Actualiza un carro existente |
| DELETE | `http://localhost:1002/api/carros/{carro_id}` | Elimina un carro |

> La ruta `http://localhost:1002/` abre la página web. Para consultar la API desde Postman usa `/api/holamundo` y las rutas `/api/carros` para los datos.

## Pruebas con Postman

Importa en Postman la colección [`postman/API_Venta_Carros.postman_collection.json`](postman/API_Venta_Carros.postman_collection.json). Incluye solicitudes organizadas por operación y pruebas automáticas para verificar las respuestas.

Consulta la [guía detallada de Postman](POSTMAN_DOCUMENTATION.md) para ver cómo importar y ejecutar la colección, el orden de las solicitudes y los resultados esperados.

### 1. Verificar la API desde Postman

- Método: `GET`
- URL completa: `http://localhost:1002/api/holamundo`

Respuesta esperada:

```json
{
  "mensaje": "Hola mundo, API de venta de carros funcionando",
  "documentacion": "/docs",
  "interfaz": "/",
  "rutas": [
    "/api/carros",
    "/api/carros/{carro_id}"
  ]
}
```

### 2. Listar todos los carros

- Método: `GET`
- URL: `http://localhost:1002/api/carros`

### 3. Listar solo disponibles

- Método: `GET`
- URL completa: `http://localhost:1002/api/carros?disponibles=true`
- También puedes introducir `/api/carros` en Postman y definir `disponibles=true` en **Params**.

### 4. Consultar un carro por ID

- Método: `GET`
- URL: `http://localhost:1002/api/carros/1`

### 5. Crear un carro

- Método: `POST`
- URL: `http://localhost:1002/api/carros`
- Body: `raw` → `JSON`

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

Respuesta esperada:

```json
{
  "id": 3,
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

### 6. Actualizar un carro

- Método: `PUT`
- URL: `http://localhost:1002/api/carros/1`
- Body: `raw` → `JSON`

```json
{
  "marca": "Toyota",
  "modelo": "Corolla XEI",
  "anio": 2022,
  "precio": 75000000,
  "kilometraje": 35000,
  "transmision": "Automática",
  "combustible": "Gasolina",
  "disponible": true
}
```

### 7. Eliminar un carro

- Método: `DELETE`
- URL: `http://localhost:1002/api/carros/1`

## Documentación interactiva

Con el servidor en ejecución, accede a:

```text
http://localhost:1002/docs
```

FastAPI genera automáticamente una interfaz Swagger con todos los endpoints, modelos y ejemplos.

## Observaciones importantes

- Los datos se almacenan en memoria.
- Al reiniciar el servidor, la API vuelve a los datos iniciales.
- Esta versión es educativa y de práctica.
- No incluye base de datos, autenticación ni almacenamiento persistente.

## Objetivo del proyecto

El objetivo es practicar el desarrollo de una API REST con FastAPI, probar endpoints con Postman y comprender el flujo básico de una aplicación backend en Python.
