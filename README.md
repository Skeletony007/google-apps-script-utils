[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

## Gmail Policy

## Install using [clasp](https://github.com/google/clasp) 🔗

```
git clone https://github.com/skeletony007/GmailPolicy.git
cd GmailPolicy

clasp create --type standalone
sed -i '' 's#}#,"filePushOrder":["'"$PWD"'/BatchRequest/BatchRequests.js","'"$PWD"'/GoogleApi.js","'"$PWD"'/GmailApi.js","'"$PWD"'/GmailUtil.js","'"$PWD"'/GmailPolicy.js","'"$PWD"'/GmailPolicyUI.js"]}#' .clasp.json
clasp push -f
```


## Q&A

**Q: Why use [tanaikech/BatchRequest](https://github.com/tanaikech/BatchRequest) over [Google JavaScript client library batching](https://github.com/google/google-api-javascript-client/blob/master/docs/batch.md)?**

A: The Google Apps Script compiler does not seem to support the [setup](https://github.com/google/google-api-javascript-client/blob/master/docs/start.md)

**Q: Why map `users.threads.get` over `users.threads.list`?**

A: `users.threads.get` does not return `message.internalDate`,
`users.threads.get` does. See [message
resource](https://developers.google.com/gmail/api/reference/rest/v1/users.messages#resource:-message)
