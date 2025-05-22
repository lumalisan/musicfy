describe('Library Page', () => {
  beforeEach(() => {
    // Visit a non-protected page that loads Clerk first
    cy.visit('/');

    // Get credentials from cypress.env.json
    const email = Cypress.env('CLERK_TEST_USER_EMAIL');
    const password = Cypress.env('CLERK_TEST_USER_PASSWORD');

    if (!email || !password) {
      throw new Error('CLERK_TEST_USER_EMAIL or CLERK_TEST_USER_PASSWORD not set in cypress.env.json');
    }

    // Sign in using Clerk custom command
    cy.clerkSignIn({
      strategy: 'password',
      identifier: email,
      password: password,
    });

    cy.visit('/library');
  });

  it('should display the correct page title', () => {
    cy.title().should('eq', 'Musicfy - Your Library');
  });

  it('should display the main heading', () => {
    cy.contains('h1', 'Your Library').should('be.visible');
  });

  it('should display the Create Playlist modal trigger/button', () => {
    cy.get('button[aria-label="Create playlist"]').should('be.visible');
  });

  it('should display playlists if available (verifying SSR data)', () => {
    cy.get('article.group.max-w-52', { timeout: 10000 }).should('exist');

    cy.contains('Your library is empty. Start by creating a new playlist!').should('not.exist');
    cy.contains('Could not load your playlists').should('not.exist');
  });
});
