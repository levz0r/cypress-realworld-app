// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Sign-in screen", function () {
  it("should enable SIGN IN button when username and password are provided", function () {
    cy.visit("/signin");
    cy.getBySel("signin-username").type("admin");
    cy.getBySel("signin-password").type("admin123!");
    cy.getBySel("signin-submit").should("not.be.disabled");
  });

  it("should display an error when back-end returns 401", function () {
    cy.visit("/signin");
    cy.intercept(
      {
        method: "POST",
        url: "/login"
      },
      { statusCode: 401 }
    );
    cy.getBySel("signin-username").type("admin");
    cy.getBySel("signin-password").type("admin123!");
    cy.getBySel("signin-submit").click();
    cy.getBySel("signin-error").should("be.visible");
  });

  it("should have remember=true in POST body when 'Remember me' checkbox is checked", function () {
    cy.visit("/signin");
    cy.getBySel("signin-username").type("admin");
    cy.getBySel("signin-password").type("admin123!");
    cy.getBySel("signin-remember-me").find("input").check();

    cy.intercept("POST", "/login", (req) => {
      expect(req.body).to.have.property("remember");
      expect(req.body.remember).to.eq(true);
    });

    cy.getBySel("signin-submit").click();
  });

  it("should display a 'Username is required' error when submitting an empty form", function () {
    cy.visit("/signin");
    cy.get("form").submit();
    cy.getBySel("signin-username").find("input").should("have.attr", "aria-invalid", "true");
    cy.get("#username-helper-text").should("be.visible").and("have.text", "Username is required");
  });

  it("should display a 'Password must contain at least 4 characters' error when submitting a form with a valid username and a short password", function () {
    cy.visit("/signin");
    cy.getBySel("signin-username").type("admin");
    cy.getBySel("signin-password").type("a");
    cy.get("form").submit();
    cy.getBySel("signin-username").find("input").should("have.attr", "aria-invalid", "false"); // The username is valid now
    cy.getBySel("signin-password").find("input").should("have.attr", "aria-invalid", "true"); // The password is 1 character long - therefor invalid
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("have.text", "Password must contain at least 4 characters");
  });

  it("should submit the form when the form is valid", function () {
    cy.visit("/signin");
    cy.getBySel("signin-username").type("admin");
    cy.getBySel("signin-password").type("admin123!");
    cy.intercept("POST", "/login", (req) => {
      expect(req).to.be.not.empty;
    });
    cy.get("form").submit();
  });

  it("initial authState value should be 'unauthorized", function () {
    cy.visit("/signin").then(() => {
      const authState = JSON.parse(localStorage.getItem("authState"));
      expect(authState.value).equal("unauthorized");
    });
  });
});
