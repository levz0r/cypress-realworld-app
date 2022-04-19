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

function translate_status_word_to_status_code(status_word) {
    let status_code;
    switch (status_word) {
        case "Unauthorized":
            status_code = 401;
            break;
        case "OK":
            status_code = 200;
            break;
        default:
            status_code = undefined;
            break;
    }
    return status_code;
}

Then("'{word}' requests to '{word}' returned with status '{word}'", function (method, route, response_status_word) {
    const expected_status_code = translate_status_word_to_status_code(response_status_word);
    cy.intercept(
        {
            method,
            url: route
        }
    ).as("request");
    cy.wait("@request").then(interception => {
        assert.equal(interception.response.statusCode, expected_status_code)
    })
});

Then('the {word} error message is displayed', function (selector) {
    cy.getBySel(`${selector}-error`).should("be.visible");
});

When('user clicks {word}', function (selector) {
    cy.getBySel(selector).click();
});

When('user navigates to "{word}" screen', function (path) {
    cy.visit(path);
});

Given('user navigates to "{word}" screen', function (path) {
    cy.visit(path);
    cy.location().its("pathname").should("eq", path);
});

When('current screen is "{word}"', function (path) {
    cy.location().its("pathname").should("eq", path);
});

Then('current screen is "{word}"', function (path) {
    cy.location().its("pathname").should("eq", path);
});

Given('user is not logged in', function () {
    localStorage.removeItem("authState");
});

Given('user refreshes the page', function () {
    cy.reload();
});

Given("'{word}' requests to '{word}' as '{word}'", function (method, route, alias) {
    cy.intercept(
        {
            method,
            url: route
        }
    ).as(alias);
});

Then("'{word}' returned with headers {string}", function (alias, headers) {
    const expected_headers = headers.split(",").map(header => header.trim().toLowerCase());
    cy.wait(`@${alias}`).then(interception => {
        expect(interception.response.headers).to.include.all.keys(expected_headers);
    });
});

When("'{word}' redirects to {word}", function (alias, target) {
    cy.wait(`@${alias}`).then(interception => {
        expect(interception.response.statusCode).equal(302);
        expect(interception.response.headers).to.include({ "Location": target })
    });
});
