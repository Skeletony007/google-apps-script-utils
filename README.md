## Gmail Policy

## Install using [clasp](https://github.com/google/clasp) 🔗

```
git clone https://github.com/skeletony007/GmailPolicy.git
cd GmailPolicy

clasp create --type standalone
sed -i '' 's/}/,"filePushOrder":["BatchRequest.js","GoogleApi.js","GmailApi.js","Policy.js"]}/' .clasp.json
clasp push -f
```
