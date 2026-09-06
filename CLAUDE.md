# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

The repo root holds the data-science artifacts; the deployable app lives one level down in `Fraud Detection/`.

- `fraud-detection.ipynb` — exploratory notebook (Kaggle paths) that cleans the raw transaction export, splits `LIB_COMMERÇANT` into `UTILISATION > EMPLACEMENT > TERRITOIRE`, label-encodes + normalizes, and trains the Random Forest that becomes `random_forest.pkl`.
- `2024-08-12 Extraction_du ... .xlsx` — raw transaction export used as ETL input.
- `Fraud Detection/` — Django + React + Postgres + nginx application (paths below are relative to this directory).

## Commands

Backend (`backend/djangoapp/`). Do **not** use the bundled `localPythonEnv/` — its
interpreter points at `C:\Users\hamdi\...`, a path that does not exist here; create a fresh
venv from `requirements.txt`. A clean install starts as-is (auth is `dj-rest-auth`; the old
`django-rest-auth` required a hand-patched venv and is gone).

```powershell
python -m venv .venv; .venv\Scripts\Activate.ps1; pip install -r ..\..\requirements.txt
python manage.py migrate
python manage.py runserver              # HTTP API on :8000
daphne -p 8001 mainapp.asgi:application # WebSockets on :8001 (see settings.js WS_SERVER)
python manage.py test --settings=mainapp.test_settings   # 17 tests, SQLite + in-memory channels
python manage.py test transactions.tests.TransactionAPITests --settings=mainapp.test_settings
python manage.py ETL_script "<path\to\file.xlsx>"          # stream rows: predict, alert, broadcast
python manage.py import_transactions "<path\to\file.xlsx>" # bulk load then batch-classify
```

Frontend (`frontend/react_app/`): `npm start` (:3000), `npm run build`, `npm test` (CRA/Jest; `npm test -- Transactions` for one file).

Full stack: `docker-compose up --build` from `Fraud Detection/` — nginx on :80 fronts gunicorn (django) and `serve` (react); `backend/entrypoint.sh` waits for postgres, collects static, migrates, and recreates the superuser from `DJANGO_ADMIN_*`.

Redis must be reachable at `127.0.0.1:6379` (`CHANNEL_LAYERS` in `settings.py`) or every broadcast silently fails.

## Architecture

**The prediction path is a management command, not a view.** Nothing in `prediction/views.py` runs the model. `transactions/management/commands/ETL_script.py` is the live pipeline: read CSV/XLSX row-by-row → `LabelEncoder` + `normalize` the same 10 columns in the same fixed `column_order` the notebook used → `rf_model.predict` → persist `Transaction` → write a `ModelPerformance` row → `broadcast_transaction_update` → on a flagged row, create an `Alert`, `broadcast_alert_update`, and send mail. `import_transactions.py` is the older two-phase variant (bulk_create with `PROCESSED=False`, then a polling loop). Both duplicate the broadcast/scoring helpers — a change to one usually belongs in the other.

Two gotchas baked into that code: the model is loaded from a hardcoded absolute path (`C:\Users\hamdi\Documents\random_forest.pkl`), and `result = 'normal' if prediction > 0.5 else 'fraud'` is then stored as `IS_COMPLIANT = result == 'fraud'`, so `IS_COMPLIANT` true means *non-compliant*. `save_model_performance` scores each single row against itself, so its metrics are degenerate by construction.

**Django apps** (`backend/djangoapp/`) — all mounted under `/api/` except `users` at `/api/auth/`:
- `transactions` — `Transaction` (uppercase French column names mirroring the export), DRF list/create/update/delete, `DjangoFilterBackend` filtering, 20-per-page pagination, and `/transactions/distinct/<field>/` powering the UI filter dropdowns.
- `prediction` — `ModelPerformance` (FK to Transaction, `related_name="model_performances"`, surfaced inside `TransactionDetailView`) and `ModelRating` (user feedback on a prediction, broadcast to the `ratings` group).
- `alerts`, `comments`, `users` (`UserActivity` login/logout log; auth via `rest_auth` + DRF `TokenAuthentication`).

**Realtime.** `mainapp/asgi.py` concatenates the `websocket_urlpatterns` from transactions, alerts, users and prediction into one `URLRouter`. Each consumer is a thin group subscriber (`transactions`, `alerts`, `user-activity`, `ratings`); producers are the sync management commands using `async_to_sync(channel_layer.group_send)`.

**Frontend** (`frontend/react_app/src/`) — CRA + Redux (classic `createStore` + thunk, one slice per domain under `store/`) + MUI/Bootstrap/ApexCharts.
- `settings.js` picks the API base: `localhost:8000` in dev, `REACT_APP_API_SERVER` (baked in at Docker build time from `ENV_API_SERVER`) in production.
- `Urls.js` holds every route; authenticated pages are wrapped in `PrivateRoute` and nested under `Layouts/FullLayout.js`.
- `WebSocketContext.js` opens all four sockets once at app start against a hardcoded `ws://localhost:8001` and mirrors each stream into `localStorage`, so dashboard state survives reloads but also goes stale — clear those keys when debugging odd dashboard data.

**Settings.** `mainapp/settings.py` ends with `from .local_settings import *`; `local_settings.py` is what actually decides DB/DEBUG/hosts, switching on `DJANGO_ENV` (`development`/`production` read env vars; anything else falls back to a hardcoded local postgres). Edit `local_settings.py`, not the block above it.

**Configuration.** Secrets now come from the environment: `EMAIL_HOST_USER`,
`EMAIL_HOST_PASSWORD` and `DEFAULT_FROM_EMAIL` in `settings.py`, and the Power BI report id /
embed url / access token in `src/views/analytics/PowerBI.js`. Each directory holding a `.env`
has a matching `.env.example` listing the real keys with placeholder values — update both
together. Every `.env`, the `*.xlsx` bank data and the internship PDF are git-ignored; never
re-introduce a literal credential into tracked source. `local_settings.py` and `postgres/.env`
still hold local DB credentials on disk.

**Before changing anything, read [`docs/AUDIT.md`](docs/AUDIT.md).** It records what was fixed
and what is deliberately left alone. Things that still look like bugs but are known and
intentional: `save_model_performance` computes degenerate metrics by construction (C2),
`POST /api/predict` genuinely does not exist so `/select-model` cannot work (C6b), and the two
ETL commands are near-duplicates until someone picks a canonical one (C3).

Traps worth knowing:
- The model field is **`IS_FRAUDULENT`** (renamed from `IS_COMPLIANT`, migration
  `transactions/0005`), but the **source CSV column is still `IS_COMPLIANT`** — do not "fix" the
  read in `import_transactions.py`.
- The model file is `settings.FRAUD_MODEL_PATH` (default `<djangoapp>/models/random_forest.pkl`)
  and is **not** in the repository.
- Both suites pass and exit non-zero on failure. Keep them green.
- The training notebook must stay output-stripped — its outputs embedded real transaction rows.
