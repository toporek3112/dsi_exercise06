CREATE DATABASE grafana;
CREATE DATABASE tmp;

\c tmp

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    stock VARCHAR(10),
    open NUMERIC(10, 2) NOT NULL,
    high NUMERIC(10, 2) NOT NULL,
    low NUMERIC(10, 2) NOT NULL,
    close NUMERIC(10, 2) NOT NULL,
    volume INTEGER NOT NULL
);
