describe('Vision Dashboard - Teste básico das telas', () => {
  it('deve abrir a página inicial', () => {
    cy.visit('http://127.0.0.1:5500/index.html');
    cy.get('body').should('be.visible');
  });
    
  it('deve abrir a área do analista', () => {
    cy.visit('http://127.0.0.1:5500/analista.html');
    cy.get('body').should('be.visible');
  });

  it('deve abrir a área do gestor', () => {
    cy.visit('http://127.0.0.1:5500/gestor.html');
    cy.get('body').should('be.visible');
  });

  it('deve abrir a área do vendedor', () => {
    cy.visit('http://127.0.0.1:5500/vendedor.html');
    cy.get('body').should('be.visible');
  });
});