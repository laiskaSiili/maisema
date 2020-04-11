FROM python:3.7-slim

# set work directory
WORKDIR /usr/src/djangoproject

# Create a group and user to run our app
ARG APP_USER=djangouser
RUN groupadd -r ${APP_USER} && useradd --no-log-init -r -g ${APP_USER} ${APP_USER}

ADD requirements.txt requirements.txt

# Install build deps, then run `pip install`, then remove unneeded build deps all in a single step.
# Correct the path to your production requirements file, if needed.
RUN set -ex \
    && BUILD_DEPS=" \
    build-essential \
    libpcre3-dev \
    libpq-dev \
    " \
    && apt-get update && apt-get install -y --no-install-recommends $BUILD_DEPS \
    && pip install --no-cache-dir -r /requirements.txt \
    \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false $BUILD_DEPS \
    && rm -rf /var/lib/apt/lists/*



COPY . /usr/src/djangoproject

EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "main.wsgi:application"]