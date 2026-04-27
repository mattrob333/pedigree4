FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY services/api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY services/api/app ./app
COPY demo/mock_data ./demo/mock_data
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
