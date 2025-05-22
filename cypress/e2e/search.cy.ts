describe('Search Page', () => {
  beforeEach(() => {
    cy.visit('/search');
  });

  it('should display the correct page title', () => {
    cy.title().should('eq', 'Search - Musicfy');
  });

  it('should display the main heading', () => {
    cy.contains('h1', 'Search').should('be.visible');
  });

  it('should display the search input field', () => {
    cy.get(
      'input[placeholder="Search for songs, albums, or playlists..."]'
    ).should('be.visible');
  });

  it('should display the initial message before searching', () => {
    cy.contains(
      'p.text-lg',
      'Start typing to search for songs, albums, and playlists'
    ).should('be.visible');
  });

  it('should display search results when a query is typed', () => {
    const searchQuery = 'test query';
    const mockResults = {
      songs: [
        { id: 'song1', title: 'Test Song 1', artists: ['Artist A'], album: 'Album X', duration: 180, image: 'song1.jpg', url: '/song/song1.mp3', color: '#123456' },
      ],
      albums: [
        { id: 'album1', title: 'Test Album 1', artists: ['Artist B'], image: 'album1.jpg', url: '/album/album1', type: 'album' },
      ],
      playlists: [
        { id: 'playlist1', title: 'Test Playlist 1', description: 'A cool playlist', image: 'playlist1.jpg', url: '/playlist/playlist1', type: 'playlist' },
      ],
    };
  
    // Intercept the API call
    cy.intercept('GET', `/api/search.json?q=${encodeURIComponent(searchQuery)}*`, {
      statusCode: 200,
      body: mockResults,
    }).as('getSearchResults');
  
    // Type into the search input
    cy.get('input[placeholder="Search for songs, albums, or playlists..."]').type(searchQuery);
  
    // Wait for the API call to complete
    cy.wait('@getSearchResults');
  
    cy.contains('h2', 'Songs').should('be.visible');
    cy.contains('h3', 'Test Song 1').should('be.visible');
  
    cy.contains('h2', 'Albums').should('be.visible');
    cy.contains('h3', 'Test Album 1').should('be.visible');
  
    cy.contains('h2', 'Playlists').should('be.visible');
    cy.contains('h3', 'Test Playlist 1').should('be.visible');
  
    cy.contains('Start typing to search...').should('not.exist');
    cy.contains('No results found for...').should('not.exist');
  });

  it('should display "no results" message when search yields no results', () => {
    const searchQuery = 'querywithnoresults';
    const mockEmptyResults = {
      songs: [],
      albums: [],
      playlists: [],
    };

    cy.intercept(
      'GET',
      `/api/search.json?q=${encodeURIComponent(searchQuery)}*`,
      {
        statusCode: 200,
        body: mockEmptyResults,
      }
    ).as('getEmptySearchResults');

    cy.get(
      'input[placeholder="Search for songs, albums, or playlists..."]'
    ).type(searchQuery);
    cy.wait('@getEmptySearchResults');

    cy.contains(`No results found for "${searchQuery}"`).should('be.visible');
    cy.contains('Try different keywords or check for typos').should(
      'be.visible'
    );

    // Ensure no result items are rendered
    cy.get(
      'div.flex.w-full.items-center.gap-4.text-left.transition-colors'
    ).should('not.exist');
  });
});
