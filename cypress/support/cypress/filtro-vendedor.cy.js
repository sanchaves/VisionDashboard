describe('Vision Dashboard - Filtro de vendas do vendedor', () => {
  it('deve acessar a área do vendedor e filtrar vendas de julho', () => {
    cy.visit('http://127.0.0.1:5500/vendedor.html', {
      onBeforeLoad(win) {
        win.localStorage.setItem('user_nome', 'Eduardo');
        win.localStorage.setItem('user_cargo', 'vendedor');

        // Use aqui o ID real do usuário vendedor Eduardo, se vocês tiverem.
        // Se não souber agora, pode deixar esse texto só para testar a tela.
        win.localStorage.setItem('user_id', '8fc4c6c1-3204-4dd9-8ece-f2ec23e9dd92');
      },
    });

    cy.get('body').should('be.visible');

    cy.contains('Área do Vendedor').should('be.visible');
    cy.contains('Olá, Eduardo').should('be.visible');

    cy.get('#filtroInicio').clear().type('2026-07-01');
    cy.wait(700);

    cy.get('#filtroFim').clear().type('2026-07-31');
    cy.wait(700);

    cy.get('#btnFiltrar').click();
    cy.wait(1500);

    cy.contains('Histórico de Vendas Faturadas').should('be.visible');
    cy.get('#totalVendas').should('be.visible');
    cy.get('#totalPremio').should('be.visible');
    cy.get('#tabelaVendasCorpo').should('be.visible');
  });
});