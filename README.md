# NBA

A web app to display up-to-date scores and stats for the current NBA season.

This app provides a UI for users to view the scores of their favourite NBA basketball games and never miss out on an important basket that could propel their team to victory!

Game results and box scores are updated live as the action takes place.

[Check out my NBA App](https://serene-meadow-18864.herokuapp.com/)

## UI Screenshots

![Homepage](/img/1.png)

![scores](/img/2.png)

Note: All NBA statistics are retrieved from the [MySportsFeed](https://www.mysportsfeeds.com/) API

---

## Setup:

1. Clone the respository
2. Install the necessary node packages: `npm install`
3. Setup Environment Variables for the username and password to the [MySportsFeed](https://www.mysportsfeeds.com/) API

### Setting Environment Variables:
    Linux/Unix
    1. export NBAUSERNAME=<username>
    2. export NBAPASSWORD=<password>

    Windows
    1. set NBAUSERNAME=<username>
    2. set NBAPASSWORD=<password>

---

## Running the Application

1. Starting the Express server: `node app.js`
2. The running application can be found at whatever port your application is configured to, likely: `localhost:3000`, unless your port has been changed in your environment variables.
