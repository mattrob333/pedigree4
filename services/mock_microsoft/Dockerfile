FROM python:3.12-slim

WORKDIR /app
COPY services/mock_microsoft/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/mock_microsoft/mock_server.py .
COPY demo/mock_data ./mock_data
EXPOSE 9000
CMD ["uvicorn", "mock_server:app", "--host", "0.0.0.0", "--port", "9000"]
