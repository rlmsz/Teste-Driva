# Market Intelligence Platform

Plataforma de inteligência de mercado para análise de expansão de varejo no Brasil, desenvolvida como desafio técnico Driva.

## 🚀 Como Rodar

### Via Docker Compose (recomendado)

```bash
docker compose up --build
```

Aguarde o health check do backend passar (~10s) e acesse:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000/api](http://localhost:8000/api)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### Desenvolvimento Local

**Backend:**
```bash
cd backend
npm install
npm run dev   # porta 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # porta 5173
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Mapa | Leaflet + React-Leaflet |
| Gráficos | Recharts |
| Backend | Node.js, Express, TypeScript |
| Infra | Docker, Docker Compose, Nginx |

---

## 📊 Funcionalidades

### Camadas do Mapa
| Camada | Tipo | Descrição |
|--------|------|-----------|
| Filiais Próprias | Marcadores | Localização geográfica de cada loja com data de inauguração |
| Potencial de Mercado | Heatmap | Coloração por score (verde = alto, vermelho = baixo) baseado em PIB pc, população e renda |
| Volume de Demanda | Bolhas proporcionais | Círculos com tamanho proporcional ao volume estimado. Tooltip com valor absoluto |
| Zonas de Expansão | Overlay de polígonos | Estados priorizados por nível (Alto/Médio/Baixo) |
| Concorrência | Marcadores | Localização de players concorrentes |

### Filtros e Interação
- **Busca por texto** filtra filiais e concorrentes por nome/cidade
- **Filtro por região** (Norte, Nordeste, Centro-Oeste, Sudeste, Sul) — afeta marcadores e destaque visual no mapa
- **Clique em estado** abre painel lateral com indicadores detalhados + gráfico comparativo
- **Deseleção**: clique no mesmo estado ou no fundo do mapa para fechar o painel

---

## 📂 Estrutura do Projeto

```
.
├── frontend/               # SPA React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/        # BrazilMap + camadas individuais
│   │   │   ├── Sidebar/    # Filtros, busca e toggle de camadas
│   │   │   └── RegionPanel/ # Painel lateral de detalhes do estado
│   │   ├── hooks/          # useMapData (fetch centralizado)
│   │   ├── services/       # Axios + endpoints da API
│   │   └── types/          # Interfaces TypeScript compartilhadas
│   └── nginx.conf          # Serve SPA + proxy /api → backend
├── backend/                # API REST Express
│   └── src/
│       ├── routes/         # Um arquivo por recurso (branches, states, etc.)
│       └── data/           # JSONs estáticos com dados mockados
├── docker-compose.yml      # Orquestração com rede interna e health check
└── README.md
```
 
---

## 🏗️ Decisões de Arquitetura

- **Separação por responsabilidade**: cada camada do mapa é um componente isolado, fácil de substituir por dados reais.
- **Dados estáticos no backend**: a API serve JSONs estáticos com o envelope `{ data, meta }` — simula uma API real e permite substituição futura por banco de dados sem alterar o contrato.
- **Nginx como proxy reverso**: o frontend nunca faz chamadas diretas ao backend por IP/porta; toda comunicação passa por `/api` no mesmo host, evitando problemas de CORS em produção.
- **Rede Docker interna**: `backend` e `frontend` se comunicam pela rede `market-net`, sem expor a comunicação interna ao host.
- **GeoJSON enriquecido**: o arquivo `brazil-states.json` contém dados demográficos do Censo (população por gênero, zona, taxa de alfabetização), que são mesclados com os dados operacionais da API ao clicar num estado.
