# Market Intelligence Platform - Setup & Documentation

## 🚀 Como Executar o Projeto

Este projeto está totalmente containerizado com Docker. Para subir a aplicação completa (Frontend + Backend), siga os passos abaixo:

1.  Certifique-se de ter o **Docker** e o **Docker Compose** instalados.
2.  Na raiz do projeto, execute:
    ```bash
    docker compose up --build
    ```
3.  Acesse as interfaces:
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Backend (API)**: [http://localhost:8000/api](http://localhost:8000/api)
    *   **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🗺️ Camadas de Dados Implementadas

O mapa interativo suporta as seguintes camadas, que podem ser alternadas na Sidebar:

1.  **Filiais Próprias**: Localização exata das lojas da rede (marcadores azuis).
2.  **Potencial de Mercado**: Heatmap que colore os estados baseando-se em um score de 0-100 (PIB, população, renda).
3.  **Volume de Demanda**: Bolhas proporcionais ao volume de consumo estimado por estado.
4.  **Zonas de Expansão**: Destaque para estados com alto potencial e baixa cobertura de lojas próprias.
5.  **Concorrência**: Localização dos principais concorrentes (marcadores vermelhos).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React + Vite**: Framework principal e ferramental de build.
- **TypeScript**: Tipagem estrita em todo o código.
- **Leaflet.js + React-Leaflet**: Biblioteca de mapas.
- **Recharts**: Gráficos de barra e pizza para análise de dados.
- **Lucide-React**: Conjunto de ícones premium.
- **CSS Modules**: Estilização isolada com tema escuro.

### Backend
- **Node.js + Express**: Servidor de API robusto.
- **TypeScript**: Consistência de tipos com o frontend.
- **Mock Data**: Gerador de dados realistas para os 27 estados brasileiros.

### Infraestrutura
- **Docker Compose**: Orquestração de serviços.
- **Nginx**: Servidor web e proxy reverso para o frontend.

---

## 📐 Decisões Técnicas

-   **Abordagem Mobile-First**: O dashboard é totalmente responsivo, adaptando o painel de detalhes e a sidebar para telas menores que 768px.
-   **Dark UI**: Paleta de cores baseada no GitHub Dark para reduzir a fadiga visual e destacar os dados coloridos.
-   **Performance**: Uso de `React.useMemo` e referências estáveis no mapa para garantir scroll e zoom fluidos mesmo com múltiplas camadas ativas.
-   **Segurança e Estrutura**: Backend com health check dedicado e Frontend servido via Nginx com fallback para SPA.
