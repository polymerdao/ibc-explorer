describe('Universal Channels', () => {
  it('should load universal channels by default', () => {
    cy.visit('/channels');
    // Ensure there are at least 4 channels displayed by default
    cy.get('table').find('tr').should('have.length.gte', 5);
  })
})

describe('In-Progress Channels', () => {
  it('should filter in-progress channels', () => {
    cy.visit('/channels');
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="channel-type"]').click();
    cy.intercept('GET', '/api/channels*').as('getChannels');
    cy.get('[data-testid="in-progress"]').click();
    cy.wait('@getChannels').then((interception) => {
      const channels = interception.response.body;
      cy.get('table').find('tr').should('have.length', channels.length + 1);
      channels.forEach(element => {
        expect(element.state).to.be.oneOf([1, 2]);
      });
    })
  })
})

describe('Search by Channel ID', () => {
  it('should search channels by ID', () => {
    cy.visit('/channels');
    const channelId = 'channel-40688';
    cy.get('[data-testid="search-input"]').type(channelId);
    cy.intercept('GET', '/api/channels*').as('getChannels');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getChannels').then((interception) => {
      const channel = interception.response.body[0];
      expect(channel.channelId).to.equal(channelId);
    })
  })

  it('should display channel details', () => {
    // Search for a channel
    cy.visit('/channels');
    const channelId = 'channel-40688';
    cy.get('[data-testid="search-input"]').type(channelId);
    cy.intercept('GET', '/api/channels*').as('getChannels');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getChannels');

    // Ensure the channel details are displayed
    cy.get('[data-testid="channel-details"]').should('be.visible');
    cy.get('[data-testid="tx-hash"]').find('a').should('exist');
    cy.get('[data-testid="tx-hash"]').find('a').should('include.text', '0xaaa000');
  })
})
