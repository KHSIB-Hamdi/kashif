###########
# BUILDER #
###########

# Django 5.1 requires Python >= 3.10. (Was python:3.7.9-slim-stretch, which
# could not run the pinned dependencies and whose apt repos are EOL.)
FROM python:3.12-slim-bookworm AS builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# psycopg2-binary ships wheels, but scikit-learn/scipy may need a toolchain.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt


#########
# FINAL #
#########

FROM python:3.12-slim-bookworm

# netcat is used by entrypoint.sh to wait for Postgres.
RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/* && rm -rf /wheels

WORKDIR /usr/src/app

COPY ./entrypoint.sh /usr/src/app/entrypoint.sh
RUN sed -i 's/\r$//' /usr/src/app/entrypoint.sh && chmod +x /usr/src/app/entrypoint.sh

COPY ./djangoapp .

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
