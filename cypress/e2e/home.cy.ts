describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the correct page title', () => {
    cy.title().should('eq', 'Musicfy - Music for Everyone');
  });

  it('should display the Greetings component', () => {
    cy.contains('h1', 'Good Night').should('be.visible');
  });

  it('should display the Discover Albums section', () => {
    cy.contains('h2', 'Discover Albums').should('be.visible');
  });

  it('should display the Featured Playlists section', () => {
    cy.contains('h2', 'Featured Playlists').should('be.visible');
  });
});
