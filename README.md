# Hackathon Expo App

![Python Testing](https://github.com/bitcamp/hackathon-expo-app/workflows/Python%20Testing/badge.svg)

![Technica Expo Site](img/MainExpoPage.png)

A beautiful and intuitive web app to display hackathon projects for expo
attendees, hackers, and sponsors to locate or learn more info about a hack.
This web app also provides powerful admin and sponsor features beyond a basic
display website, including:

* Admin dashboard
    * Import project data from .csv files (from Devpost)
    * Automatically or manually assign table numbers to projects
    * CRUD project data on the fly
* Sponsor winner selection
    * Access code secure login
    * Sponsors can select projects as winner(s) for their challenges (so the organizing team can have a record of winners)
    * UI warning if a project is winning too many challenges (to avoid one project sweeping all prizes)

## Page URLs

Starting from localhost in a development environment, use the following links to
access this application.

- Home `/`
- Sponsor Login `/sponsorlogin`
- Sponsor Dashboard `/sponsor`
- Admin Login `/adminlogin`
- Admin Dashboard `/admin`

## Contribution Guidelines

Whenever you make an improvement, please *submit a pull request*
(never push to master).

Make sure your commit messages are consistent with these guidelines (from
[here](https://chris.beams.io/posts/git-commit/)):

- Separate subject from body with a blank line
- Limit the subject line to 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Use the imperative mood in the subject line (e.g. Clean your room, Close the door, Take out the trash)
- Wrap the body at 72 characters
- Use the body to explain what and why vs. how

If you're working on improving the Flask app, please use PEP 8 Python style
guide! You can find the linter for Atom
[here](https://atom.io/packages/linter-python-pep8).

## Hackathon Organizer Playbook

### Before the Hackathon

- Deploy all of the services for this expo app.
- Create your Devpost and add your sponsor's challenges (or your own!) - make
  sure to follow the [Devpost Guidelines](#devpost-guidelines) outlined below!
- Log in as `admin` and add sponsors and assign unique access codes (or leave
  blank input boxes to auto-generate an unique 8-character access code).
- Add the challenges to each sponsor (*important:* when naming the challenge,
  make sure it is exactly the same string as you created in Devpost, but remove
  the ` - company_name` portion (e.g. if you have a challenge in Devpost that
  says `Best Hack to Transform Transportation - Lyft`, you should add a
  challenge of the name `Best Hack to Transform Transportation` in the admin
  console)).
- Prepare some form of communication to give your sponsors their access codes
  and login link.
- Follow the instructions in `expo/src/customize` to customize the app for
  your hackathon.

### Before The Expo
- Hold sponsor briefing to give winner selection instructions and guidelines.

### After Devpost submission deadline ends
- Export projects from Devpost in CSV format
- Seed projects into DB via admin dashboard
- Assign table numbers via admin dashboard

### Monitoring expo progress
- Sponsors should be actively submitting in their winner selections as they
  finish judging their challenges - this can be monitored via the admin dashboard

### After the Hackathon
- From the network tab, access your `/expo` page and copy/paste the `/projects` and `/challenges` responses into json files (stored in `expo/src/responseData` named `projects.json` and `challenges.json`).
- In `Backend.js`, flip the `useCachedResponseData` flag to true. This will turn off all routes except for the homepage (`/expo`) and pull data from the cached json files. After re-deploying your React app, you can turn off your database and the flask server.

## Sponsor Instructions
Log in with your access code at gotechnica.org/expo/sponsor

![Sponsor Login Page](img/SponsorLogin.png)

Welcome to your sponsor dashboard! This is where you’ll select the winner(s) of your challenge. For those of you who have multiple challenges, you’ll be selecting the winner or winners for each of your challenges, one at a time. Please use the “Filter by challenge” dropdown box to select which challenge you’re currently selecting the winner for. If you only have one challenge you’re judging today, don’t worry about the filter dropdown!
If you come across a team who you’d like to award your prize to, but they didn’t specifically submit to your challenge, don’t worry! Just come to talk to one of us and we can get that updated for you :)

![Sponsor Dashboard](img/SponsorDashboard.png)

When you’re ready to select your winner (or multiple winners), click the checkbox (or checkboxes) next to the project and then scroll all the way down and click Submit.

![Submit winners](img/SponsorSubmitWinner.png)

Please make sure you’ve selected the correct team before you submit your final decisions!

![Pre-submission confirmation modal](img/SponsorConfirmSubmit.png)

Once you’re finished, you’ll be able to see the checkmark (or checkmarks) next to each of your challenges.

![Submitted text](img/SponsorSubmitted.png)

A few other things that we’ve built into our system to hopefully make your lives easier:

1. We’ve gone into our database and recorded how many prizes you’re planning on giving based on the pre-event info you sent us. You can select less teams than you originally wanted to give out prizes for, but if you want to select more than you originally told us (for most of you, this limit is 1 team), just come speak with one of us! The reason we implemented this upper cap is to make sure you have enough prizes for the teams you’ve selected, and it wasn’t just an accidental submission. Better safe than sorry!
2. We really want to encourage as many individuals as possible, and one of the ways is making sure we have a good variety of winners and not just one team taking home all the gold. If a team has already won two prizes (based on what other sponsors have submitted in our system), then we’ll pop up a reminder so that you know that this project has already been picked. If that shows up, we’d encourage you to select another project as your challenge winner!

![Validations and Modals](img/SponsorMoreModals.png)

Happy judging!


## Devpost Guidelines

v1 of this expo app makes a few assumptions about how Devpost is set up. Not
following these requirements may lead to unexpected behavior in your deployment.

- Challenge names should be formatted as `challenge_name - company_name` (e.g.
  `Best Hack to Transform Transportation - Lyft` or `Funniest Hack - Technica`).
  This is a temporary workaround that will be resolved in a future release.
- The challenge name portion (not including company name) should not be a
  substring of another challenge (e.g. `Funniest Hack I - Technica` and
  `Funniest Hack II - Technica` is not valid since `Funniest Hack I` is a
  substring of `Funniest Hack II`). This is a temporary workaround that will be
  resolved in a future release.
- You can create a custom field for hacks that need to stay at their current table.
  To do this, you can configure the environment/config variable in your
  `api/config.py` file. This string should be labeled exactly as you configured in
  Devpost (e.g. `Does your hack need to stay at your current table? (i.e. hardware,
  VR/AR hacks). If so, what table number are you at?`).


## Deployment

[![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=expo-backend&templateURL=https://s3.amazonaws.com/bitcamp-templates/expo-deployment.template)

You can deploy straight to AWS using the button above, other instructions on deploying manually and development can be found [here](api/README.md).
