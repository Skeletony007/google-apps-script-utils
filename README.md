<h1 align="center"> Unofficial Gmail Policy </h1>
<a href="https://github.com/google/clasp"><img src="https://img.shields.io/badge/built%20with-clasp-4285f4.svg" alt="clasp"></a>

### Features

- Outlook-like [retention policies](https://support.microsoft.com/en-us/office/retention-and-archive-policies-in-outlook-web-app-465372e4-e16b-47db-bee0-aba44799085e) for Gmail
- [Trigger](https://developers.google.com/apps-script/guides/triggers) Google API jobs for [threads](https://developers.google.com/gmail/api/reference/rest/v1/users.threads), [messages](https://developers.google.com/gmail/api/reference/rest/v1/users.messages), and [labels](https://developers.google.com/gmail/api/reference/rest/v1/users.labels)

### Install using [clasp](https://github.com/google/clasp) 🔗

```
git clone https://github.com/skeletony007/UnofficialGmailPolicy.git
cd GmailPolicy

clasp create --type standalone
sed -i '' 's#}#,"filePushOrder":["'"$PWD"'/BatchRequest/BatchRequests.js","'"$PWD"'/GoogleApi.js","'"$PWD"'/GmailApi.js","'"$PWD"'/GmailUtil.js","'"$PWD"'/GmailPolicy.js","'"$PWD"'/GmailPolicyUI.js"]}#' .clasp.json
clasp push -f
```

### Configure using [Apps Script](https://developers.google.com/apps-script/) online 📜

Place the `Config.gs` as the final [execution order](https://github.com/google/clasp/issues/72) file.

### Q&A

**Q: Why use [tanaikech/BatchRequest](https://github.com/tanaikech/BatchRequest) over [Google JavaScript client library batching](https://github.com/google/google-api-javascript-client/blob/master/docs/batch.md)?**

A: The Google Apps Script compiler does not seem to support the [setup](https://github.com/google/google-api-javascript-client/blob/master/docs/start.md)

**Q: Why map `users.threads.get` over `users.threads.list`?**

A: `users.threads.get` does not return `message.internalDate`, `users.threads.get` does. See [message resource](https://developers.google.com/gmail/api/reference/rest/v1/users.messages#resource:-message)
