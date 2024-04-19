from fastapi import FastAPI

app = FastAPI()

@app.get("/api/v1/hello")
async def hello_api():
    return {"message": "Hello from the FastAPI API!"}
