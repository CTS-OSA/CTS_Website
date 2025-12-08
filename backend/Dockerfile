FROM python:3.11-slim

WORKDIR /app/backend

RUN apt-get update && \
apt-get install -y gcc libpq-dev python3-dev && \
pip install --no-cache-dir -r requirements.txt && \
apt-get clean

COPY requirements.txt /app/backend/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/backend/

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]