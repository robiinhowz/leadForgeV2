# Vitrine de Valores

Plataforma brasileira de descoberta de empresas, marcas, lojas virtuais, profissionais e criadores de conteúdo que divulgam publicamente seus valores e posicionamentos.

## Status

**Etapa 1 — Versão demonstrativa (frontend funcional).**

Esta versão é puramente de interface. Não há backend, autenticação, pagamentos ou banco de dados. Todos os dados exibidos são fictícios e ilustrativos.

## Como executar

```bash
npm install
npm run dev
```

Para gerar a build de produção:

```bash
npm run build
npm run preview
```

Para verificar os tipos:

```bash
npm run typecheck
```

## Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router (rotas client-side)
- Leaflet + React Leaflet (mapa interativo com OpenStreetMap)
- lucide-react (ícones)

## Estrutura

```
src/
  components/      Componentes reutilizáveis (Header, Footer, BusinessCard, Filters, etc.)
  data/            Catálogo demonstrativo (businesses.ts) — substituir por API na Etapa 2
  lib/             Utilitários e hook de filtros
  pages/           Páginas/rotas da aplicação
  types.ts         Tipos compartilhados
```

## Rotas

| Caminho                  | Descrição                                  |
|--------------------------|--------------------------------------------|
| `/`                      | Página inicial com hero, mapa e categorias  |
| `/explorar`              | Diretório com busca e filtros funcionais    |
| `/mapa`                  | Mapa interativo com filtros e lista lateral |
| `/negocio/:slug`         | Perfil individual de negócio demonstrativo |
| `/divulgar`              | Landing page para futuros anunciantes       |
| `/sobre`                 | Sobre a plataforma e critérios              |
| `/sobre/privacidade`     | Política de privacidade (demonstrativa)    |
| `/sobre/contato`         | Formulário de contato (demonstrativo)       |

## Limitações atuais

- Todos os negócios são **dados demonstrativos fictícios**.
- Nenhum dado é persistido ou enviado a servidor.
- Formulários (divulgar, contato, reportar erro) são **apenas locais**.
- O plano de R$ 9,90/mês é uma **proposta planejada** — sem pagamento real.
- O mapa usa tiles públicos do OpenStreetMap (não tratar como infraestrutura ilimitada).

## Próximos passos (Etapa 2)

- Substituir `src/data/businesses.ts` por uma API/banco de dados real.
- Implementar autenticação de administradores e anunciantes.
- Integrar pagamentos (cobrança do plano mensal).
- Implementar fluxo de aprovação editorial.
- Persistir correções e contestações.
