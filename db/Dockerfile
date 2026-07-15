# PostgreSQL on Alpine — avoids pulling large postgres image from Docker Hub
FROM alpine:3.20

RUN apk add --no-cache postgresql16 postgresql16-contrib

ENV PGDATA=/var/lib/postgresql/data

RUN mkdir -p "$PGDATA" /run/postgresql \
  && chown -R postgres:postgres "$PGDATA" /run/postgresql

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

USER postgres
EXPOSE 5432

HEALTHCHECK --interval=5s --timeout=3s --retries=10 --start-period=15s \
  CMD pg_isready -U hanwha -d hanwhagreen || exit 1

ENTRYPOINT ["/bin/sh", "/usr/local/bin/docker-entrypoint.sh"]
