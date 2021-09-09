// type definitions for Cypress object "cy"
/// <reference types="cypress" />

const { names, colors, adjectives, NumberDictionary, uniqueNamesGenerator } = require("unique-names-generator");
const passwords_generator = require("generate-password");

function generate_name() {
  const config = { dictionaries: [names] };
  return uniqueNamesGenerator(config);
}

function generate_username(style = "lowerCase") {
  const config = {
    dictionaries: [adjectives, colors],
    separator: "",
    style,
    length: 2
  };
  return uniqueNamesGenerator(config);
}

function generate_number() {
  const config = {
    dictionaries: [NumberDictionary.generate({ min: 0, max: 999999999, length: 9 })],
  };
  return uniqueNamesGenerator(config)
}

function generate_password() {
  return passwords_generator.generate({
    length: 8,
    numbers: true
  })
}

describe("Regsitration process", function () {
  it("should be able to sign-in right after successful registration", function () {
    // Sign-in screen
    cy.visit("/signin");
    cy.getBySel("signup").click();

    const firstname = generate_name();
    const lastname = generate_name();
    const username = generate_username();
    const password = generate_password();
    const bankname = generate_username("capital");
    const routingnumber = generate_number();
    const accountnumber = generate_number();

    Cypress.log({ name: "GENERATED", message: `First name: ${firstname}` });
    Cypress.log({ name: "GENERATED", message: `Last name: ${lastname}` });
    Cypress.log({ name: "GENERATED", message: `Username: ${username}` });
    Cypress.log({ name: "GENERATED", message: `Password: ${password}` });
    Cypress.log({ name: "GENERATED", message: `Bank name: ${bankname}` });
    Cypress.log({ name: "GENERATED", message: `Routing number: ${routingnumber}` });
    Cypress.log({ name: "GENERATED", message: `Account number: ${accountnumber}` });

    // Sign-up screen
    cy.getBySel("signup-first-name").type(firstname);
    cy.getBySel("signup-last-name").type(lastname);
    cy.getBySel("signup-username").type(username);
    cy.getBySel("signup-password").type(password);
    cy.getBySel("signup-confirmPassword").type(password);
    cy.getBySel("signup-submit").click();

    // Sign-in screen
    cy.login(username, password);

    // Main screen
    cy.location().its("pathname").should("eq", "/"); // Assertion #1: We are now at the main page.
    cy.getBySel("user-onboarding-dialog").should("be.visible"); // Assertion #2: Onboarding dialog is shown.

    // Onboarding dialog
    cy.getBySel("user-onboarding-next").click();

    cy.getBySel("bankaccount-bankName-input").type(bankname);
    cy.getBySel("bankaccount-routingNumber-input").type(routingnumber);
    cy.getBySel("bankaccount-accountNumber-input").type(accountnumber);

    cy.getBySel("bankaccount-submit").click();
    cy.getBySel("user-onboarding-next").click();

    // Main screen
    cy.get("user-onboarding-dialog").should("not.exist"); // Assertion #3: Onboarding process is over. The dialog has been removed from the DOM.
  });
});
