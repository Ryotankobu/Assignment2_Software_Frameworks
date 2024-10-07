describe('Login Page', () => {

  // Test case for displaying the login page
  it('should display the login page', () => {
    cy.visit('http://localhost:4200/login'); // Update this to your app's login URL

    // Check that username and password input fields are visible
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });

  // Test case for successful login with valid credentials
  it('should log in a user with valid credentials', () => {
    cy.visit('http://localhost:4200/login');

    // Fill in the username and password
    cy.get('input[name="username"]').type('ChatUser');  // Use a valid username
    cy.get('input[name="password"]').type('123');       // Use the corresponding password

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the URL changes to the chat page after login
    cy.url().should('include', '/chat');

    // Check if sessionStorage contains the logged-in user's info
    cy.window().then((window) => {
      const user = window.sessionStorage.getItem('current_user');
      expect(user).to.exist;
    });
  });

  // Test case for invalid login with wrong credentials
  it('should display an error for invalid credentials', () => {
    cy.visit('http://localhost:4200/login');

    // Enter invalid credentials
    cy.get('input[name="username"]').type('wronguser');
    cy.get('input[name="password"]').type('wrongpassword');

    // Submit the form
    cy.get('button[type="submit"]').click();

     // Use contains() to directly match the error message text
      cy.contains('Invalid username or password')
        .should('be.visible');
  });

  // Test case for submitting the form with empty input fields
  it('should show validation errors for empty fields', () => {
    cy.visit('http://localhost:4200/login');

    // Submit the form without entering credentials
    cy.get('button[type="submit"]').click();

    // Check for validation errors on the fields
    cy.get('input[name="username"]:invalid').should('exist');  // Ensure username field is invalid
    cy.get('input[name="password"]:invalid').should('exist');  // Ensure password field is invalid
  });
});
