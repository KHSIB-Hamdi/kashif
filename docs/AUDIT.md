# Repository Audit

Date: 2026-09-06
Scope: full repository — architecture, configuration, dependencies, security, code quality.

Every finding below was verified against the code. Nothing here is inferred from documentation or
assumed. Paths are relative to the repository root; `` is shorthand for the nested
the repository root application directory.

Each finding is classified:

- **RESOLVED FROM CODE** — the code answered the question; documented, no change needed.
- **SAFE TO IMPROVE** — unambiguous defect, fixed during this audit.
- **REQUIRES USER DECISION** — needs a business or architecture call; current behaviour preserved.

---

## 1. Architecture

### Components

| Component | Responsibility |
|---|---|
| `backend/djangoapp/mainapp` | Settings, URL root, ASGI/WSGI entrypoints |
| `transactions` | `Transaction` model, REST CRUD, filtering, **the ETL + prediction pipeline**, WS consumer |
| `prediction` | `ModelPerformance` (metrics per transaction), `ModelRating` (operator feedback), WS consumer |
| `alerts` | `Alert` model, 10-most-recent endpoint, WS consumer |
| `comments` | Operator comments on the model |
| `users` | Token auth via `rest_auth`, `UserActivity` audit log, login/logout signals, WS consumer |
| `frontend/react_app` | CRA SPA: Redux store, routed views, four WebSocket subscriptions |
| `nginx` | Reverse proxy (Docker only) |
| `fraud-detection.ipynb` | EDA + Random Forest training; produces `random_forest.pkl` |

### Communication

- **Browser → REST**: axios, base URL from `src/settings.js`, DRF token auth.
- **Browser → Realtime**: four WebSockets to `ws://localhost:8001` (hardcoded).
- **ETL → Browser**: the management command calls `async_to_sync(channel_layer.group_send)`;
  Redis carries the message; Daphne fans it out to subscribed consumers.
- **Backend → Postgres**: Django ORM.
- **Backend → SMTP**: `send_mail` on each flagged transaction.
- **Browser → Power BI**: direct embed with a client-side AAD token.

### External dependencies

Redis (channel layer), PostgreSQL, an SMTP server (Gmail), Power BI Service.

---

## 2. Critical findings

### 2.1 The repository was not under version control — **RESOLVED FROM CODE**

The only `.git` directory was `frontend/react_app/.git`, containing a single commit
(`Initialize project using Create React App`), no remote, with every subsequent change untracked.
The backend, Docker, nginx and all configuration had **never** been version-controlled.

**Consequence (positive):** no credential is in any Git history, because there is no history.
**Action taken:** a root `.gitignore` was written *first*, then Git initialized at the root and the
nested CRA `.git` removed. Nothing was committed without review.

### 2.2 `django-rest-auth` could not run on Django 5.1 — **RESOLVED — FIXED**

`django-rest-auth==0.9.5` (released 2017, unmaintained) is pinned alongside `Django==5.1` and is
imported at `backend/djangoapp/users/views.py:1`.

A clean `pip install -r requirements.txt` followed by `manage.py check` fails:

```
ImportError: cannot import name 'ugettext_lazy' from 'django.utils.translation'
```

`ugettext_lazy` was removed in Django 4.0 and `force_text` in Django 4.0 as well.

**Why the app appeared to work:** the bundled `localPythonEnv/` contains a **hand-patched**
copy of `rest_auth` — `ugettext_lazy` → `gettext_lazy` in four files, and `force_text` →
`force_bytes` in `serializers.py`. That patch existed only inside an untracked virtualenv and was
never recorded anywhere. **Any fresh checkout was unstartable.**

This was verified by diffing the project venv's `rest_auth` against a clean install of the same
pinned version.

**Fixed:** migrated to `dj-rest-auth==7.2.0` (the maintained successor). `INSTALLED_APPS` now lists
`dj_rest_auth`, and `users/views.py` imports from `dj_rest_auth.views`. The `/api/auth/` URLs and the
token flow are unchanged.

Verified: a clean `pip install -r backend/requirements.txt` followed by `manage.py check` passes with
**no manual patching**, and `users/tests.py` asserts token login, bad-credential rejection, the
authenticated-user endpoint, and that login still writes a `UserActivity` row through Django's
`user_logged_in` signal (which also resolves C11 below).

### 2.3 The Docker stack could not build or run — **RESOLVED — FIXED**

Four independent breakages:

| File | Problem |
|---|---|
| `backend/Dockerfile` | Base image `python:3.7.9-slim-stretch`; Django 5.1 requires Python ≥ 3.10. Also `stretch` is EOL and its apt repos are gone. |
| `frontend/Dockerfile` | Base image `node:12.18.3-alpine3.9`; react-scripts 5 requires Node ≥ 14. |
| `docker-compose.yml` | No `redis` service, yet `CHANNEL_LAYERS` requires one. No ASGI/Daphne service — the `django` service runs `gunicorn mainapp.wsgi:application`, which cannot serve WebSockets. |
| `nginx/nginx.conf` | No `location /ws` block and no `Upgrade`/`Connection` headers, so WebSocket handshakes are proxied to the React app. |

Together these mean **the realtime feature — the core of the product — cannot function in Docker
at all**, and neither image builds against the pinned dependencies.

**Fixed:** all four.

| File | Change |
|---|---|
| `backend/Dockerfile` | `python:3.7.9-slim-stretch` → `python:3.12-slim-bookworm`; `netcat` → `netcat-openbsd`; added `build-essential` in the builder stage for scipy/scikit-learn; strips CRLF from `entrypoint.sh` before `chmod` |
| `frontend/Dockerfile` | `node:12.18.3-alpine3.9` → `node:20-alpine`; `npm install` → `npm ci` against the committed lockfile; pinned `serve@14` |
| `docker-compose.yml` | Added a `redis:7-alpine` service and a `daphne` service running `daphne -b 0.0.0.0 -p 8001 mainapp.asgi:application`; `django` and `daphne` receive `REDIS_HOST`/`REDIS_PORT`; `nginx` depends on `daphne` |
| `nginx/nginx.conf` | Added a `daphne_backend` upstream and a `location /ws/` block with `proxy_http_version 1.1`, `Upgrade`/`Connection` headers and an 86400s read timeout |

`CHANNEL_LAYERS` in `settings.py` now reads `REDIS_HOST`/`REDIS_PORT` from the environment (default
`127.0.0.1:6379`) so the same settings work locally and in Docker.

The frontend WebSocket URL is no longer hardcoded: `src/settings.js` exports `WS_SERVER`, which is
`ws://localhost:8001` in development and the page's own origin in production (so nginx's `/ws/`
proxy is used), overridable via `REACT_APP_WS_SERVER`.

### 2.4 The model file does not exist — **PARTIALLY FIXED**

`ETL_script.py:163` and `import_transactions.py:181` both do:

```python
rf_model = joblib.load(r"C:\Users\hamdi\Documents\random_forest.pkl")
```

The file is not in the repository and not at that path on this machine. Its provenance is
`fraud-detection.ipynb` cell 259, which writes `/kaggle/working/random_forest.pkl`.

**Fixed (the path):** both commands now load `settings.FRAUD_MODEL_PATH`, which defaults to
`<djangoapp>/models/random_forest.pkl` and is overridable via the `FRAUD_MODEL_PATH` environment
variable. `backend/djangoapp/models/README.md` documents how to produce the file; `*.pkl` is
git-ignored since it is a build artifact.

**Still outstanding:** the artifact itself is not distributed. Publishing it (object storage, a
release asset, an MLflow registry) remains a decision for the owner — as does whether the notebook
should be refactored to save straight into `models/`.

---

## 3. Configuration and dependency findings

### 3.1 Both `requirements.txt` files were UTF-16 — **SAFE TO IMPROVE — FIXED**

`requirements.txt` and `backend/requirements.txt` were UTF-16LE with BOM. pip mis-parses
this; the first parsed entry came out as a nonexistent package `3-1==1.0.0`.

**Fixed:** both rewritten as UTF-8/LF. Verified lossless — every original pin preserved (62 → 63
and 49 → 53 entries, the deltas being only the intended additions below).

### 3.2 `django-filter` was missing from both requirements files — **SAFE TO IMPROVE — FIXED**

`transactions/views.py:7` imports `DjangoFilterBackend` and uses it at line 41 for the main
transaction list endpoint, but `django-filter` appeared in neither requirements file, and
`django_filters` was not in `INSTALLED_APPS`.

**Fixed:** `django-filter==24.3` added to both files (version matched to what was actually
installed), and `'django_filters'` added to `INSTALLED_APPS`. `manage.py check` now passes.

### 3.3 `channels-redis` was missing from the backend requirements — **SAFE TO IMPROVE — FIXED**

`settings.py` configures `channels_redis.core.RedisChannelLayer`, but `backend/requirements.txt`
— the file baked into the Docker image — did not include it.

**Fixed:** added `channels-redis==4.2.0`, `redis==5.0.8`, `msgpack==1.0.8` to the backend file.

### 3.4 The two requirements files diverge — **REQUIRES USER DECISION**

Beyond the fixes above, `requirements.txt` still contains ~13 packages absent from the backend
file (`uvicorn`, `watchfiles`, `httptools`, `websockets`, `anyio`, `h11`, `sniffio`, `click`,
`colorama`, `PyYAML`, `python-dotenv`, plus transitives). The `django-cron` discrepancy is gone —
it was removed from both files along with the dead `CRON_CLASSES` setting (see 3.7).

**Decision required:** are these two intentionally different (dev superset vs. runtime), or has one
drifted? A `requirements-dev.txt` split would make the intent explicit. Note `uvicorn` is installed
but never used — the ASGI server in use is Daphne.

### 3.5 `DEFAULT_FROM_EMAIL` was undefined — **SAFE TO IMPROVE — FIXED**

`ETL_script.py` reads `settings.DEFAULT_FROM_EMAIL` when sending fraud alerts, but the setting did
not exist, so Django silently fell back to `webmaster@localhost`.

**Fixed:** defined in `settings.py`, defaulting to `EMAIL_HOST_USER`, overridable by environment.

### 3.6 `settings.py` used `os` without importing it — **SAFE TO IMPROVE — FIXED**

`os` was only in scope by accident, via `from .local_settings import *` re-exporting it.
**Fixed:** explicit `import os` added at the top.

### 3.7 `CRON_CLASSES` pointed at nothing — **SAFE TO IMPROVE — FIXED**

`settings.py` declares `CRON_CLASSES = ["mainapp.import_transactions_cron_job"]`. That module and
class do not exist anywhere in the repository — the string appears exactly once, in settings.
`django_cron` is also absent from `INSTALLED_APPS`, so the setting is entirely inert, though
`django-cron==0.5.0` is installed by the backend requirements.

**Fixed:** the setting was removed along with the `django-cron` dependency, since the referenced
class never existed and `django_cron` was not in `INSTALLED_APPS` — nothing could ever have run.

**Note for the owner:** if scheduled ingestion *was* intended, it now needs building from scratch
(a management command on a cron/Celery/systemd timer). Nothing was lost by removing inert config.

### 3.8 Environment separation is incomplete — **RESOLVED FROM CODE**

`local_settings.py` branches on `DJANGO_ENV`. Only `development`/`production` read environment
variables; anything else falls back to local defaults. There is no staging environment; tests use
`mainapp/test_settings.py`.

**Fixed:** `CORS_ORIGIN_ALLOW_ALL = True` was applied unconditionally, including in production. It
now reads a comma-separated `CORS_ALLOWED_ORIGINS` when `DJANGO_ENV` is `development` or
`production`, setting `CORS_ORIGIN_ALLOW_ALL = False` when origins are supplied. With the variable
unset it still falls back to allow-all, so **set it before deploying.**

---

## 4. Security findings

No secret was ever committed to Git, because the project had no Git history. All findings below
concern credentials present in working-tree files that *would* have been committed on first push.

**No secret values are reproduced in this document.**

| # | What | Where | Status |
|---|---|---|---|
| S1 | Azure AD JWT access token, embedded in frontend source. Payload contained personal data: a full name, a university UPN, and an originating IP address. Expired ~Sept 2024. | `frontend/react_app/src/views/analytics/PowerBI.js` | **Removed.** Replaced with `REACT_APP_POWERBI_ACCESS_TOKEN`. Verified absent from source and from a fresh production bundle. |
| S2 | Power BI report GUID and embed URL hardcoded | same file | **Removed.** Now `REACT_APP_POWERBI_REPORT_ID` / `_EMBED_URL`. |
| S3 | Gmail App Password in plaintext | `backend/djangoapp/mainapp/settings.py` | **Removed.** Now `EMAIL_HOST_PASSWORD` from environment. |
| S4 | Personal Gmail address as SMTP user | `settings.py` | **Removed.** Now `EMAIL_HOST_USER` from environment. |
| S5 | Two personal email addresses hardcoded as sender/recipient in a debug endpoint | `users/views.py` `send_test_email` | **Removed.** Now uses `settings.DEFAULT_FROM_EMAIL`. |
| S6 | Database password, Django admin password, and `SECRET_KEY` | `backend/.env`, `postgres/.env` | **Left on disk, now git-ignored.** `.env.example` templates added. |
| S7 | `django-insecure-…` `SECRET_KEY` literal | `settings.py` | **Removed.** Now `os.environ.get('SECRET_KEY', ...)` with a self-describing CHANGE-ME default. `local_settings.py` still overrides it in both real environments. |
| S9 | Hardcoded local Postgres username and password in the non-Docker branch | `mainapp/local_settings.py` | **Removed.** Now read from `DB_USER`/`DB_PASSWORD`/`DB_DATABASE`/`DB_HOST`/`DB_PORT` with non-secret defaults. |
| S10 | **Training notebook cell outputs embed real transaction rows** — reference numbers, amounts, product and merchant labels, ~150k-row frames. The same class of data deliberately excluded as `*.xlsx`. | `fraud-detection.ipynb` | **Excluded from Git** pending a decision (see below). Untouched on disk. |
| S8 | Real bank transaction data (8.7 MB export) and an internship report | repository root | **Left on disk, now git-ignored.** |

### Actions required by the repository owner

These are **not** things this audit can or should do automatically:

1. **Rotate the Gmail App Password (S3).** It was in plaintext on disk. Revoke it in the Google
   account's App Passwords panel and issue a new one.
2. **Rotate the database and Django admin passwords (S6)** if this machine or these files were ever
   shared.
3. **Confirm the Power BI token (S1) is expired and revoke it if not.** Its `exp` claim indicates
   September 2024, but verify. Also consider whether the PII it contains was ever exposed.
4. **Confirm clearance for the bank data (S8)** before any push, even to a private repository.
5. **Decide how to track the notebook (S10).** It is currently git-ignored, which loses the
   model's provenance from version control. The usual fix is to strip outputs before
   committing — `pip install nbstripout && nbstripout fraud-detection.ipynb` — then remove the
   `fraud-detection.ipynb` rule from `.gitignore`. This was not done automatically because it
   rewrites the notebook file, discarding results you may still want locally.

### Structural security note

`REACT_APP_*` variables are compiled into the JavaScript bundle and are readable by every visitor.
Moving the Power BI token to an environment variable removes it from source control but **does not**
make it secret at runtime. The correct fix is a backend endpoint that mints short-lived embed tokens
per request. Flagged as a future improvement, not implemented.

---

## 5. Code quality findings

### Fixed

| Finding | Location |
|---|---|
| Dead import `Trim`, never referenced | `transactions/views.py` |
| Dead import `Transaction`, unused since migration `0005` dropped the FK | `comments/models.py` |
| Unused duplicate `UserSerializer`, shadowing the real one in `users/serializers.py` | `comments/serializers.py` |
| **C1 — inverted field name.** `IS_COMPLIANT` → `IS_FRAUDULENT`, via a pure `RenameField` migration (`transactions/0005`) so existing rows keep their values. Updated the model, both ETL commands, the WebSocket payload key and all four frontend consumers. The serializer uses `fields = '__all__'`, so it followed automatically. The source CSV column is still read as `IS_COMPLIANT` — that is an external contract, not a field name. | model, migration, ETL, frontend |
| **C4 — duplicate `react-scripts`.** Removed the stale `^3.0.1` from `dependencies`; `5.0.1` in `devDependencies` is now the only declaration. Also dropped the deprecated `@babel/plugin-proposal-private-property-in-object` from `dependencies` (its renamed successor is already in `devDependencies`). | `react_app/package.json` |
| **C5 — two empty files.** Deleted `views/user/addUser.js` and `views/user/updateUser.js` (0 bytes, never imported — the only `addUser` reference in the tree is an unrelated Redux action). | `react_app/src/views/user/` |
| **C6 — dead navigation + wrong URL.** `ModelSelection.js` navigated to `/prediction-result/:id/:model`, which `Urls.js` never defined; it now returns to `/transactions`. `predictionActions.js` posted to a **relative** `/api/predict`, hitting the dev server instead of Django — it now goes through `settings.API_SERVER`. Both carry comments noting the endpoint is unimplemented. | `views/transaction/`, `store/prediction/` |
| **C7 — `Response(print(...))`.** All three `destroy()` methods now return `Response(status=204)` instead of an empty 200 plus a stdout write. Asserted by tests. | `transactions/`, `comments/`, `users/` views |
| **C8 — debug logging.** Removed 12 debug `console.log` dumps (a per-action reducer dump, a per-render user-list dump, filter/modal/column traces, a full transaction dump). Kept all `console.error` calls; converted two misused `console.log` error paths to `console.error`. | `react_app/src/` |
| **C9 — unbounded `localStorage`.** The six mirrored streams grew forever and were re-read on load. History is now capped at 500 entries per stream, and every read/write is wrapped in `try/catch` so private-window and blocked-storage cases degrade to empty instead of throwing. | `WebSocketContext.js` |
| **C10 — comments list capped at 10 oldest.** `Comment.objects.all().order_by('id')[:10]` → newest-first with a real `PageNumberPagination` class. | `comments/views.py` |
| **C11 — `UserActivity` writes unverified.** Now covered by a test asserting a login writes a `UserActivity` row through Django's `user_logged_in` signal under `dj-rest-auth`. Confirmed working. | `users/tests.py` |
| **C12 — `db.sqlite3` leftover.** Git-ignored. Tests use in-memory SQLite via `mainapp/test_settings.py`. | — |
| **C14 — no test coverage.** Added 17 backend tests and 6 frontend tests; see section 8. The stale CRA `App.test.js` (asserting "learn react" against a `connect`ed component with no `Provider`) was replaced. | see section 8 |

### Documented, not changed — **REQUIRES USER DECISION**

| # | Finding | Location | Why it matters |
|---|---|---|---|
| C2 | **Model metrics are degenerate.** `save_model_performance(txn, txn.IS_FRAUDULENT, result == 'fraud')` passes two arguments that are equal by construction, so accuracy is always 1.0 and precision/recall/F1 are 0.0 or 1.0. | `ETL_script.py`, `import_transactions.py` | The dashboard's model-performance charts are meaningless. Fixing needs labelled ground truth held separately from the prediction — a data-pipeline change, not a code fix. |
| C3 | **Two near-duplicate ETL commands** still duplicate `broadcast_transaction_update`, `broadcast_alert_update` and `save_model_performance` almost verbatim. | `transactions/management/commands/` | A change to one silently misses the other. Consolidating requires deciding which ingestion model is canonical (streaming vs. bulk-then-poll). |
| C6b | **`POST /api/predict` does not exist**, and neither do XGBoost or KNN models. The `/select-model` page offers all three. | `prediction/`, `views/transaction/ModelSelection.js` | The feature is unfinished, not broken. Completing it means building a prediction endpoint and training two more models — out of scope for an audit. |
| C15 | **`SECRET_KEY = 'localsecret'`** remains as the literal local-development fallback in `local_settings.py`. | `mainapp/local_settings.py` | Harmless and self-evidently non-secret, but if the `DJANGO_ENV` branch is ever misconfigured a predictable key is used. Environment-driving it everywhere would be tidier. |

### Naming inconsistencies — **REQUIRES USER DECISION**

- Directory casing: `src/Layouts/` (PascalCase) vs `src/views/`, `src/components/`, `src/store/`.
- File casing: the offending `addUser.js`/`updateUser.js` were deleted (empty, unused), so the
  remaining view/component files are consistently PascalCase.
- Model fields are `SCREAMING_SNAKE_CASE` (`REF_UNIQUE`, `MONTANT_TRX`) mirroring the source
  export's French column names, while every other model uses Django's `snake_case` convention.
  This is defensible — it maps 1:1 to the CSV — but it is inconsistent and undocumented.

---

## 6. Structural finding — **RESOLVED — FIXED**

The application used to live at `Fraud Detection/Fraud Detection/` — a directory nested inside
another of the **same name**, with the notebook and data at the outer level. Every documented path
was ambiguous and `cd "Fraud Detection"` had to be typed twice.

**Fixed:** the tree was flattened so `backend/`, `frontend/`, `nginx/`, `postgres/`,
`docker-compose.yml` and `requirements.txt` now sit at the repository root beside the notebook and
`docs/`.

Verified: Git recorded all 182 tracked files as `R100` renames — byte-identical content, nothing
lost or modified. Docker build contexts (`./backend`, `./frontend`, `./nginx`) were already
relative and are unaffected. All documentation paths were updated to match.

## 7. Deliberately unchanged

To be explicit about scope, the following were **not** touched:

- The feature-encoding and prediction logic inside the ETL commands (the `LabelEncoder`/`normalize`
  pipeline and the fixed `column_order`), beyond the field rename and the model-path change.
- The degenerate metric calculation (C2) and the unfinished multi-model feature (C6b).
- Redux store shape, reducers and action types.
- Model fields' `SCREAMING_SNAKE_CASE` naming, which maps 1:1 to the source export.
- Any external credential. **Nothing was rotated or revoked.**

## 8. Validation performed

Run against the fully-changed tree in a clean virtualenv (Python 3.12) and the committed
`node_modules`.

| Check | Result |
|---|---|
| `pip install -r backend/requirements.txt` in a clean venv | **PASS** — resolves and installs; no manual patching |
| `manage.py check` | **PASS** — no issues |
| `manage.py makemigrations --check --dry-run` | **PASS** — no drift after the rename migration |
| `manage.py test --settings=mainapp.test_settings` | **PASS — 17/17** |
| `npm run build` | **PASS** — ~484 kB gzipped, pre-existing ESLint warnings only |
| `npm test -- --watchAll=false` | **PASS — 6/6**, exit code 0 |
| `docker compose config` | **PASS** — 6 services, 4 volumes, valid |
| Secret sweep of staged content | **PASS** — no credentials, tokens, keys or bank data staged |
| Notebook output scan after stripping | **PASS** — 0 of 22 output cells retain data; all 261 cells preserved |

### What the tests assert

**Backend — 17 tests**

- `transactions/tests.py` — the `IS_FRAUDULENT` rename (field present, `IS_COMPLIANT` absent, and
  the serializer emits the new name), list pagination, `django-filter` filtering, transaction
  detail including nested model performances, 404 on a missing transaction, the distinct-values
  allow-list accepting `PRODUIT` and rejecting `MONTANT_TRX`, and `204` on delete.
- `users/tests.py` — the `dj-rest-auth` migration: token login, bad-credential rejection,
  `logout`/`users/detail/` requiring auth, the current-user endpoint returning the right user,
  `204` on user delete, and that a login writes a `UserActivity` row via Django's `user_logged_in`
  signal.

**Frontend — 6 tests**

- `src/settings.test.js` — `API_SERVER` in development and production, `WS_SERVER` defaulting to
  the daphne port, `REACT_APP_WS_SERVER` overriding it, the same-origin `ws://` derivation used
  behind nginx, and `SESSION_DURATION`.

`App.test.js` was deleted rather than repaired. Rendering the full app in jsdom drags in
`react-gauge-chart` → ESM d3, which CRA 5's Jest cannot transform without fighting
`transformIgnorePatterns` across a dozen transitive packages. Testing the URL-resolution logic
directly is cheaper and covers the code that actually changed. A component-level smoke test would
need either a lighter chart library or a Vite/Jest migration.

`package.json` gained a `jest.moduleNameMapper` entry pointing `axios` at its CommonJS build —
without it Jest fails on axios's ESM bundle. This is a supported CRA override.

### Not validated

- **Docker image builds** — see the note recorded alongside this table.
- **The ETL pipeline end to end** — requires `random_forest.pkl`, which is not distributed (2.4).
- **Live WebSocket delivery** — requires a running Redis plus Daphne and a browser; the wiring was
  verified by reading `asgi.py`, the routing modules and the nginx config, not by observing a
  message arrive.
- **Email alerts** — requires real SMTP credentials.

## 9. Recommended future work

Ordered by value. Everything the owner authorised in this pass is done; these are what remain.

1. **Distribute the model artifact** (2.4). The path is configurable now, but the `.pkl` still has
   to be produced by hand from the notebook. Consider a release asset or object storage, and have
   the notebook write straight into `models/`.
2. **Give the metrics real ground truth** (C2). The current per-row self-comparison makes the
   performance dashboard meaningless.
3. **Move the Power BI token behind a backend endpoint.** `REACT_APP_*` values are public by
   construction.
4. **Set `CORS_ALLOWED_ORIGINS`** before any real deployment — unset still means allow-all.
5. **Finish or remove the multi-model feature** (C6b): either build `POST /api/predict` and train
   XGBoost/KNN, or drop the `/select-model` page.
6. **Consolidate the two ETL commands** (C3) once you decide which ingestion model is canonical.
7. **Broaden test coverage** — the feature-encoding path in the ETL is the highest-risk untested
   code, and component tests need the chart-library/ESM problem solved.
8. **Add CI.** Now that both suites pass and exit non-zero on failure, a GitHub Actions workflow
   running `manage.py test` and `npm test` would actually gate merges. Deliberately not added in
   this pass — it was worth having green suites first.
9. **Pin the remaining dependency drift** (3.4) or split into `requirements-dev.txt`.
