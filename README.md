<h1 align="center"> Unofficial Gmail Policy </h1>
<a href="https://github.com/google/clasp"><img src="https://img.shields.io/badge/built%20with-clasp-4285f4.svg" alt="clasp"></a>
<a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="prettier"></a>

### Features

- Outlook-like [retention policies](https://support.microsoft.com/en-us/office/retention-and-archive-policies-in-outlook-web-app-465372e4-e16b-47db-bee0-aba44799085e) for Gmail
- [Trigger](https://developers.google.com/apps-script/guides/triggers) Google API jobs for [threads](https://developers.google.com/gmail/api/reference/rest/v1/users.threads), [messages](https://developers.google.com/gmail/api/reference/rest/v1/users.messages), and [labels](https://developers.google.com/gmail/api/reference/rest/v1/users.labels)

### Install using [clasp] 🔗

```
git clone --recurse-submodules https://github.com/skeletony007/UnofficialGmailPolicy.git
cd GmailPolicy

clasp create --type standalone
sed -i '' 's#}#,"filePushOrder":["'"$PWD"'/BatchRequest/BatchRequests.js","'"$PWD"'/GoogleApi.js","'"$PWD"'/GmailApi.js","'"$PWD"'/GmailUtil.js","'"$PWD"'/GmailPolicy.js","'"$PWD"'/GmailPolicyUI.js"]}#' .clasp.json
clasp push -f
```

### Configure using [Apps Script] online 📜

Place the `Config.gs` as the final [execution order](https://github.com/google/clasp/issues/72) file.

We define a function with time-based triggers to run the GmailPolicyUI instance.
Visit https://script.google.com/home/triggers to set triggers.
Since policies effect emails in day units, it is recommended to a the trigger to run daily.

Example config: using an anonymous function to speed up the policy execution

```javascript
// the initialQuery parameter is optional and we will use it to only fetch
// threads from the last 28 days.
ui = new GmailPolicyUI({
  initialQuery: (() => {
    const dateWithinDays = new Date();
    dateWithinDays.setDate(dateWithinDays.getDate() - 28);
    // format dd/mm/yyyy
    return `after:${dateWithinDays.getDate()}/${dateWithinDays.getMonth() + 1}/${dateWithinDays.getFullYear()}`;
  })(),
});
```

### Q&A

**Q: Why use [tanaikech/BatchRequest] over [Google JavaScript client library batching]?**

A: The Google Apps Script compiler does not seem to support the [setup](https://github.com/google/google-api-javascript-client/blob/master/docs/start.md)

**Q: Why map `users.threads.get` over `users.threads.list`?**

A: `users.threads.list` does not return `message.internalDate`, `users.threads.get` does. See [message resource](https://developers.google.com/gmail/api/reference/rest/v1/users.messages#resource:-message)

[clasp]: https://github.com/google/clasp
[Apps Script]: https://developers.google.com/apps-script/
[tanaikech/BatchRequest]: https://github.com/tanaikech/BatchRequest
[Google JavaScript client library batching]: https://github.com/google/google-api-javascript-client/blob/master/docs/batch.md
