from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="API de Venta de Carros",
    description="API para publicar y administrar carros en venta. Diseñada para practicar con Postman.",
    version="1.0.0",
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Datos de demostración en memoria. Se reinician cuando se apaga el servidor.
carros = [
    {
        "id": 1,
        "marca": "Toyota",
        "modelo": "Corolla",
        "anio": 2022,
        "precio": 78000000,
        "kilometraje": 32000,
        "transmision": "Automática",
        "combustible": "Gasolina",
        "disponible": True,
    },
    {
        "id": 2,
        "marca": "Chevrolet",
        "modelo": "Onix",
        "anio": 2021,
        "precio": 52000000,
        "kilometraje": 45000,
        "transmision": "Mecánica",
        "combustible": "Gasolina",
        "disponible": True,
    },
]
siguiente_id = 3


class CarroEntrada(BaseModel):
    marca: str = Field(min_length=1, max_length=60)
    modelo: str = Field(min_length=1, max_length=60)
    anio: int = Field(ge=1950, le=2100)
    precio: float = Field(gt=0)
    kilometraje: int = Field(ge=0)
    transmision: str = Field(min_length=1, max_length=30)
    combustible: str = Field(min_length=1, max_length=30)
    disponible: bool = True


@app.get("/")
def inicio():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/holamundo", tags=["Estado"])
def hola_mundo():
    return {
        "mensaje": "Hola mundo, API de venta de carros funcionando",
        "documentacion": "/docs",
        "interfaz": "/",
        "rutas": ["/api/carros", "/api/carros/{carro_id}"],
    }


@app.get("/api/health", tags=["Estado"])
def estado_api():
    return {
        "mensaje": "API de venta de carros funcionando",
        "documentacion": "/docs",
        "interfaz": "/",
        "rutas": ["/api/carros", "/api/carros/{carro_id}"],
    }


@app.get("/api/carros")
def listar_carros(disponibles: bool | None = None):
    if disponibles is None:
        return carros
    return [carro for carro in carros if carro["disponible"] == disponibles]


@app.get("/api/carros/{carro_id}")
def obtener_carro(carro_id: int):
    for carro in carros:
        if carro["id"] == carro_id:
            return carro
    raise HTTPException(status_code=404, detail="Carro no encontrado")


@app.post("/api/carros", status_code=201)
def crear_carro(datos: CarroEntrada):
    global siguiente_id
    carro = {"id": siguiente_id, **datos.model_dump()}
    carros.append(carro)
    siguiente_id += 1
    return carro


@app.put("/api/carros/{carro_id}")
def actualizar_carro(carro_id: int, datos: CarroEntrada):
    for indice, carro in enumerate(carros):
        if carro["id"] == carro_id:
            actualizado = {"id": carro_id, **datos.model_dump()}
            carros[indice] = actualizado
            return actualizado
    raise HTTPException(status_code=404, detail="Carro no encontrado")


@app.delete("/api/carros/{carro_id}")
def eliminar_carro(carro_id: int):
    for indice, carro in enumerate(carros):
        if carro["id"] == carro_id:
            eliminado = carros.pop(indice)
            return {
                "mensaje": "Carro eliminado correctamente",
                "carro": eliminado,
            }
    raise HTTPException(status_code=404, detail="Carro no encontrado")
