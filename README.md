# Camisa10 — E-commerce de Camisas de Futebol

Aplicação de e-commerce desenvolvida como projeto acadêmico. Permite que usuários naveguem por um catálogo de camisas de futebol, adicionem produtos ao carrinho, finalizem compras simuladas e acompanhem seus pedidos. Inclui uma área administrativa completa para gerenciar produtos, categorias e pedidos.

Toda a persistência de dados ocorre no navegador via `localStorage`. Não há servidor ou banco de dados externo.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | React 19 |
| Roteamento | React Router DOM 6 |
| Build | Vite 8 |
| Autenticação | bcryptjs 3 (hash de senha no cliente) |
| Estilização | CSS puro com variáveis customizadas |
| Persistência | localStorage (Browser Storage API) |
| Linting | ESLint 10 com plugins React Hooks e React Refresh |

---

## Funcionalidades

### Loja

- Página inicial com hero banner e seção de destaques
- Catálogo de produtos com filtros por liga, modelo e faixa de preço, além de busca por texto
- Página de produto com seleção de tamanho, controle de quantidade e validação de estoque em tempo real
- Carrinho de compras persistente entre sessões
- Checkout com formulário de endereço de entrega e escolha de pagamento (Pix ou Cartão)
- Histórico de pedidos por cliente com acompanhamento de status
- Cancelamento de pedido (disponível enquanto o status for "Recebido")
- Sistema de avaliações liberado após a entrega do pedido
- Edição de perfil e endereço salvo para compras futuras

### Área administrativa (`/admin`)

- Painel com acesso seguro restrito ao perfil `admin`
- CRUD completo de produtos com campos de preço, tamanho e estoque por variante (P, M, G, GG)
- CRUD de categorias (ligas), com proteção contra exclusão de categoria em uso
- Listagem de todos os pedidos com filtro por status e controle de transição de etapas (Recebido → Enviado → Entregue / Cancelado)

---

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

---

## Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/ViniciusBraga9/e-commerce-Camisa-Time.git
cd e-commerce-Camisa-Time/frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

Os arquivos gerados ficam em `frontend/dist`.

---

## Credenciais de demonstração

As contas abaixo são criadas automaticamente no primeiro acesso (dados iniciais do `localStorage`).

| Perfil | E-mail | Senha |
|---|---|---|
| Cliente | `cliente@camisa10.test` | *(ver campo "Acesso de teste" na tela de login)* |
| Admin | `admin@camisa10.test` | *(mesma senha do cliente)* |

Para redefinir os dados ao estado inicial, limpe o `localStorage` do navegador (`F12 > Application > Local Storage > Clear`).

---

## Estrutura do projeto

```
frontend/
  public/
    camisas/          Imagens dos produtos (.webp)
    ligas/            Logos das ligas
    marca/            Logotipo e imagens da marca
    fontes/           Fontes Manrope e Barlow (.woff2)
  src/
    components/       Componentes reutilizáveis (Layout, Icone, Interface, Vitrine...)
    context/          LojaContext e LojaProvider (estado global)
    data/             Dados iniciais do catálogo e estado de demonstração
    estilos/          CSS modular (base, layout, catalogo, cliente, admin, responsivo)
    pages/
      admin/          Painel administrativo (Administracao, AdminProdutos, AdminCategorias, AdminPedidos)
    routes/           RotaPrivada (guarda de rota com suporte a perfis)
    services/         Lógica de negócio (banco, contas, pedidos, endereco, admin)
```

---

## Arquitetura

O estado global é mantido por `LojaContext`, que expõe o objeto `banco` (snapshot do `localStorage`) e a função `alterar`, usada em toda a aplicação para escrever dados de forma síncrona e atualizar o estado React em seguida.

A autenticação é feita inteiramente no cliente: as senhas são armazenadas como hashes bcrypt no `localStorage` e verificadas localmente. A sessão possui data de expiração e é sincronizada entre abas via o evento `storage`.

As rotas privadas (`RotaPrivada`) aceitam um prop `perfil` (`"cliente"` ou `"admin"`) e redirecionam para o login quando não há sessão ativa, ou exibem uma tela de acesso restrito quando o perfil do usuário não corresponde.

---

## Observações

Este projeto foi desenvolvido com fins educacionais. O fluxo de pagamento é simulado e nenhum dado real é transmitido ou armazenado em servidor.
