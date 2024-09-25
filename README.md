> NLW Pocket Javascript

# in.orbit - Backend

## Projeto

O in.orbit é uma aplicação para ajudar você a alcançar suas metas semanais. Foi desenvolvido durante a NLW Pocket Javascript da Rocketseat.

## Tecnologias

- Fastify
- Drizzle ORM
- Drizzle Kit
- Docker
- Postgres
- TypeScript
- Biome
- Zod
- Dayjs

## Rodando o projeto

### Pré-requisitos

- Bun
- Docker
- Docker Compose

### Instalação

Clone o repositório e instale as dependências.

```bash
git clone https://github.com/adeonirlabs/nlw-pocket-js-backend.git
cd nlw-pocket-js-backend
bun install
```

Suba os containers do banco de dados

```bash
docker compose up -d
```

Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente.

```bash
cp .env.example .env
```

Rode o comando para gerar o schema do banco de dados e popular com dados de exemplo.

```bash
bun run drizzle-kit generate
bun run drizzle-kit migrate

bun run seed
```

Suba o servidor de desenvolvimento

```bash
bun run dev
```

## Documentação

[API Documentation](./postman-collection.json)

> O projeto original não inclui Biome e Tanstack Router
