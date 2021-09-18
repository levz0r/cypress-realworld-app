// type definitions for Cypress object "cy"
/// <reference types="cypress" />

const { Given, When, Then, Before } = require('cypress-cucumber-preprocessor/steps');

Before(function () {
    cy.visit("/signin")
});

When('user types {string} in {string}', function (text, selector) {
    cy.getBySel(selector).type(text);
});

Then('the {string} button should be enabled', function (selector) {
    cy.getBySel(selector).should("not.be.disabled");
});

Given('{word} requests to {word} returned with status {int}', function (method, route, status_code) {
    cy.intercept(
        {
            method,
            url: route
        },
        { statusCode: status_code }
    );
});

Then('the {word} error message is displayed', function (selector) {
    cy.getBySel(`${selector}-error`).should("be.visible");
})

When('user clicks {word}', function (selector) {
    cy.getBySel(selector).click();
});
