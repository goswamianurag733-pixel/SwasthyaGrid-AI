# SwasthyaGrid AI — VS Code Project

A full-stack academic/demo prototype for national-scale health resource and supply-chain intelligence.

## Features

- National PHC dashboard
- Medicine inventory monitoring
- Bed availability tracking
- Medical staff attendance monitoring
- 7-day medicine demand forecasting
- Stock-out risk classification
- Early warning alerts
- Cross-facility redistribution recommendations
- Simulated federated learning using FedAvg
- State and medicine filters
- REST API using Flask
- Responsive frontend without external frontend dependencies

## Requirements

- Python 3.10 or newer
- VS Code
- Internet is not required after Python packages are installed

## Run in VS Code — Windows

Open the project folder in VS Code, then open Terminal:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
python backend\app.py
```

Open:

http://127.0.0.1:5000

## Run on macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/app.py
```

Then open:

http://127.0.0.1:5000

## API endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/facilities`
- `GET /api/resources`
- `GET /api/alerts`
- `GET /api/forecast?medicine=ORS`
- `GET /api/redistribution?medicine=ORS`
- `POST /api/federated/train`

## Project structure

```text
swasthyagrid-ai/
├── backend/
│   ├── app.py
│   ├── ai_engine.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── data/
│       └── health_data.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .gitignore
└── README.md
```

## Important

This is an academic/demo prototype with simulated data. It is not connected to India's government health systems and must not be used for real clinical, emergency, patient-care, procurement, or government decisions.

For a production-grade implementation, replace the JSON data layer with secure databases/APIs, add authentication and authorization, audit logging, encryption, observability, model governance, real federated-learning infrastructure, and validated forecasting models.
