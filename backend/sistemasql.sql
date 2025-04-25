CREATE DATABASE sistema_medicamentos;

CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    idade INT NOT NULL,
    quarto VARCHAR(50) NOT NULL
);


CREATE TABLE medicamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    frequencia VARCHAR(50) NOT NULL,
    dosagem VARCHAR(50) NOT NULL,
    horarios VARCHAR(100) NOT NULL,
    instrucoes TEXT,
    paciente_id INT REFERENCES pacientes(id) ON DELETE CASCADE
);