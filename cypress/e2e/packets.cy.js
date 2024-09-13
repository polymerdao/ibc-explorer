let packetId = '';
let txHash = '';

describe('Page Load', () => {
  it('should load packets', () => {
    cy.visit('/packets');
    cy.get('table').find('tr').should('have.length', 21);
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets').then((interception) => {
      const packet = interception.response.body.packets[0];
      packetId = packet.id;
      txHash = packet.sendTx;
    })
  })
})

describe('Pagination', () => {
  it('should paginate packets by timestamp', () => {
    cy.visit('/packets');

    // Find time of first packet from second page
    cy.intercept('GET', '/api/packets*offset=20').as('getSecondPage');
    cy.get('[data-testid="next-page"]').click();
    let firstPacketSecondPage = null;
    cy.wait('@getSecondPage').then((interception) => {
      const firstPacket = interception.response.body.packets[0];
      firstPacketSecondPage = firstPacket;
    })

    // Go back to first page and make sure they're more recent
    cy.intercept('GET', '/api/packets*offset=0').as('getFirstPage');
    cy.get('[data-testid="prev-page"]').click();
    cy.wait('@getFirstPage').then((interception) => {
      const packets = interception.response.body.packets;
      packets.forEach(packet => {
        expect(packet.createTime).to.be.gte(firstPacketSecondPage.createTime);
      })
    })
  })
})

describe('Filtering', () => {
  it('should filter packets by state', () => {
    cy.visit('/packets');
    // Filter for confirming packets
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="state-filter"]').click();
    cy.get('[data-testid="ACK"]').click();
    cy.get('[data-testid="SENT"]').click();
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets').then((interception) => {
      const packets = interception.response.body.packets;
      cy.get('table').find('tr').should('have.length', packets.length + 1);
      packets.forEach(element => {
        expect(element.state).to.equal(3);
      });
    })

    // Filter for relaying packets
    cy.get('[data-testid="state-filter"]').click();
    cy.get('[data-testid="SENT"]').click();
    cy.get('[data-testid="RECV,WRITE_ACK"]').click();
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets').then((interception) => {
      const packets = interception.response.body.packets;
      cy.get('table').find('tr').should('have.length', packets.length + 1);
      packets.forEach(element => {
        expect(element.state).to.equal(1);
      });
    })
  })

  it('should filter packets by source and dest chains', () => {
    cy.visit('/packets');
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="src-filter"]').click();
    cy.get('[data-testid="optimism"]').click();
    cy.get('[data-testid="dest-filter"]').click();
    cy.get('[data-testid="base"]').click();
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets').then((interception) => {
      const packets = interception.response.body.packets;
      cy.get('table').find('tr').should('have.length', packets.length + 1);
      packets.forEach(element => {
        expect(element.sourceClient).contains('optimism');
        expect(element.destClient).contains('base');
      });
    })
  })
})

describe('Searching', () => {
  it('should search packets by ID', () => {
    cy.visit('/packets');
    cy.get('[data-testid="search-input"]').type(packetId);
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets').then((interception) => {
      const packets = interception.response.body.packets;
      packets.forEach(element => {
        expect(element.id).to.equal(packetId);
      });
    })
  })

  it('should search packets by tx hash', () => {
    cy.visit('/packets');
    cy.get('[data-testid="search-input"]').clear().type(txHash);
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets').then((interception) => {
      const packets = interception.response.body.packets;
      packets.forEach(element => {
        expect(element.sendTx).to.equal(txHash);
      });
    })
  })
})

describe('Packet Details', () => {
  it('should view packet details', () => {
    cy.visit('/packets');

    // Find a confirming packet to test details and open modal
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="state-filter"]').click();
    cy.get('[data-testid="ACK"]').click();
    cy.get('[data-testid="SENT"]').click();
    cy.intercept('GET', '/api/packets*').as('getPackets');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getPackets');
    cy.get('table').find('tr').eq(1).click();

    // Check tx links are correct for confirming state
    cy.get('[data-testid="packet-details"]').should('exist');
    cy.get('[data-testid="send-tx"]').find('a').should('exist');
    cy.get('[data-testid="recv-tx"]').find('a').should('exist');
    cy.get('[data-testid="ack-tx"]').find('a').should('have.length', 0);
  })
})
