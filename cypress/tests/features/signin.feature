Feature: Sign-In Screen
    User Stories for the Sign-In screen

    Background: current screen is Sign-In

	# Our first scenario
    Scenario: SIGN IN button should be enabled when username and password are provided
        When user types 'admin' in 'signin-username'
        When user types 'admin123!' in 'signin-password'
        Then the 'signin-submit' button should be enabled

    # Stub a response using cy.intercept()
    Scenario: An error message should be displayed when back-end returns 401
        When 'POST' requests to '/login' returned with status 401
        And user types 'admin' in 'signin-username'
        And user types 'admin123!' in 'signin-password'
        And user clicks signin-submit
        Then the signin error message is displayed
