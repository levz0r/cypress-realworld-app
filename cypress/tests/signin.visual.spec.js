// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Sign-in screen visual tests", function () {
    const viewports = [
        { name: "iPhone 6", width: 375, height: 667 },
        { name: "iPad 2", width: 768, height: 1024 },
        { name: "Desktop", width: 1024, height: 768 }
    ];

    viewports.forEach(viewport => {
        it(`${viewport.name} (${viewport.width}x${viewport.height}) visual regression test`, function () {
            cy.viewport(viewport.width, viewport.height);
            cy.visit("/signin");
            cy.screenshot(`actual_${viewport.width}x${viewport.height}`);
            cy.task("compareSnapshots", { specName: Cypress.spec.name, width: viewport.width, height: viewport.height }).then(diff => {
                expect(diff, `Expected no pixel changes, had ${diff} instead`).to.eq(0);
            });
        });
    });
});
