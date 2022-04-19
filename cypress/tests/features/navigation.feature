Feature: Navigation
    User Stories for navigation within the application

	Scenario: User is able to navigate to signup screen from signin screen
        Given user navigates to "/signin" screen
        When current screen is "/signin"
        And user navigates to "/signup" screen
        Then current screen is "/signup"

    Scenario: User is unable to navigate to user/settings screen without logging in
        Given user is not logged in
        And user navigates to "/signin" screen
        When user navigates to "/user/settings" screen
        Then current screen is "/signin"

    Scenario: Screen doesn't change after page refresh
        Given user navigates to "/signup" screen
        And user refreshes the page
        Then current screen is "/signup"
