Feature: Backend
    User Stories that interact with the backend server

    Scenario: The server is not letting logging-in with wrong credentials
        When user types 'admin' in 'signin-username'
        And user types 'admin123!' in 'signin-password'
        When user clicks signin-submit
        Then 'POST' requests to '/login' returned with status 'Unauthorized'

    Scenario: The server is letting logging-in with correct credentials
        When user types 'admin' in 'signin-username'
        And user types 'admin-password' in 'signin-password'
        When user clicks signin-submit
        Then 'POST' requests to '/login' returned with status 'OK'

    Scenario: The server returns CORS headers when user logs-in
        Given 'POST' requests to '/login' as 'login'
        When user types 'admin' in 'signin-username'
        And user types 'admin-password' in 'signin-password'
        When user clicks signin-submit
        Then 'login' returned with headers 'Access-Control-Allow-Credentials, Access-Control-Allow-Origin'

# Scenario Outline: The /redirect endpoint redirects to various target URL's
#     Given 'GET' requests to '/redirect' as 'redirect'
#     When 'redirect' is called with <target>
#     Then 'redirect' redirects to <url>

#     Examples:
#         | target | url                    |
#         | google | https://www.google.com |
#         | yahoo  | https://yahoo.com      |
#         | bing   | https://bing.com       |
