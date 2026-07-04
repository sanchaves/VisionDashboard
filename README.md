# VisionDashboard - Sistema MVC com Supabase

Sistema web desenvolvido para controle de vendas, metas, produtos e comissões de vendedores. O projeto usa arquitetura MVC no front-end e Supabase como banco de dados/back-end na nuvem.

## Funcionalidades

### Login por perfil
- Analista: registra e mantém dados operacionais.
- Gestor: acompanha indicadores, filtros e gráficos.
- Vendedor: consulta vendas, comissão e progresso da meta.

### Área do Analista
- Registrar vendas com cálculo automático da comissão.
- Consultar vendas lançadas por vendedor e mês.
- Editar vendas cadastradas e recalcular comissão.
- Excluir vendas cadastradas quando necessário.
- Cadastrar metas mensais para vendedores.
- Consultar, editar e excluir metas.
- Cadastrar produtos/equipamentos.
- Consultar, editar e excluir produtos quando o banco permitir.
- Ajustar regras de comissão por produto.

### Área do Gestor
- Visualizar faturamento, ticket médio, premiações e média de comissão.
- Filtrar dados por vendedor, produto e período.
- Acompanhar ranking e desempenho por produto.

### Área do Vendedor
- Visualizar vendas realizadas.
- Acompanhar comissão gerada.
- Verificar meta mensal e progresso no mês.

## Arquitetura MVC

O projeto foi organizado separando responsabilidades:

```text
/projeto
  index.html
  analista.html
  gestor.html
  vendedor.html
  README.md
  .gitignore
  .env.example
  /Assets
    logo.png
  /CSS
    style.css
  /JS
    config.example.js
    config.js          (uso local, não versionar)
    model.js           (acesso ao Supabase e operações de dados)
    view.js            (manipulação do DOM e renderização da interface)
    controller.js      (eventos, validações e fluxo entre Model e View)
  /cypress
    /e2e
      spec.cy.js
```

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript ES Modules
- Supabase Auth
- Supabase Database
- Lucide Icons
- Chart.js
- Cypress para teste end-to-end

## Configuração do Supabase

O arquivo com dados reais do Supabase fica em `JS/config.js` e está no `.gitignore` para não ser enviado ao GitHub por engano.

Para configurar em outro computador:

1. Copie `JS/config.example.js`.
2. Renomeie a cópia para `JS/config.js`.
3. Preencha `SUPABASE_URL` e `SUPABASE_KEY` com os dados do seu projeto Supabase.

Também existe um `.env.example` para documentar as variáveis esperadas.

> Observação: por ser uma aplicação front-end estática, a chave `anon public` do Supabase é usada no navegador. As regras de segurança devem ser protegidas principalmente pelas políticas RLS do Supabase.

## Como executar localmente

Use uma extensão como Live Server no VS Code ou sirva a pasta com um servidor local.

Exemplo com Live Server:

1. Abra a pasta do projeto no VS Code.
2. Confira se `JS/config.js` está configurado.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

## Teste E2E com Cypress

Instale as dependências:

```bash
npm install
```

Com o projeto aberto em um servidor local, execute:

```bash
npm run test:e2e
```

Ou em modo terminal:

```bash
npm run test:e2e:run
```

O teste cobre acesso à tela inicial, login do analista e validação dos controles principais de consulta/manutenção de vendas.

## Critérios atendidos

- Separação MVC em `model.js`, `view.js` e `controller.js`.
- Operações de criação, consulta, edição e exclusão nos principais registros do sistema.
- Integração com banco de dados na nuvem via Supabase.
- Estrutura de pastas organizada.
- Arquivos de configuração local documentados e ignorados no Git.
- Interface responsiva para desktop e mobile.
- Campos de formulário com labels associados.
- Imagem principal com texto alternativo.
- Teste E2E com Cypress incluído.
