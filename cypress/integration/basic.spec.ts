describe('Example application', () => {
  it('The example renders a list of posts', () => {
    cy.visit('/')
    cy.findAllByRole('listitem').should('have.length.gte', 4)
  })
})
