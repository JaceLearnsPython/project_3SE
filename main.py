from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.get("/api/v1/hello")
async def hello_api():
    return {"message": "Hello from the FastAPI API!"}


app.mount("/", StaticFiles(directory="ui/dist", html=True), name="ui")
