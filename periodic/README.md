# google-apps-script-periodic-utils
Time-based trigger Google Apps Script utilities

## Usage

1. Enable the Gmail API service.
    a. In the Apps Script editor, select the "Add a service" option.
    b. Find the "Gmail" API and add it to the project.
    ![image1](https://github.com/Skeletony007/google-apps-script-periodic-utils/blob/main/periodic/images/gmail-api-screenshot.png?raw=true)
    Note: You will need to authorise access to your Google Account:
    ![image1](https://github.com/Skeletony007/google-apps-script-periodic-utils/blob/main/periodic/images/oauth-scopes-screenshot.png?raw=true)
2. Replicate the `files` folder of this repository as script files in Google Apps Script.
3. Modify the `preferences` constant with your desired preferences. See `Preferences.gs` for more information.
4. Run the functions in `Main.gs` function to test the script.
5. Set a time-based trigger to run the these functions at the desired frequency.
    ![image1](https://github.com/Skeletony007/google-apps-script-periodic-utils/blob/main/periodic/images/triggers-screenshot.png?raw=true)
