FROM python:latest

COPY . /app
WORKDIR /app

RUN pip install poetry

RUN poetry install

EXPOSE 8000

# set entry
ENTRYPOINT ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
