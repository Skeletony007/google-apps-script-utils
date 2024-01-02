class GmailApi extends GoogleApi {
  constructor() {
    super('batch/gmail/v1');
  }
}

GmailApi.apiRequest = {
  'gmail.users.labels.create': (pathParameters, requestBody) => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels`,
    requestBody: requestBody
  }),
  'gmail.users.labels.list': pathParameters => ({
    method: 'GET',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels`
  }),
  'gmail.users.labels.patch': (pathParameters, requestBody) => ({
    method: 'PATCH',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels/${pathParameters.id}`,
    requestBody: requestBody
  }),
  'gmail.users.threads.get': (pathParameters, queryParameters) => ({
    method: 'GET',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}?format=${queryParameters.format}`
  }),
  'gmail.users.threads.delete': pathParameters => ({
    method: 'DELETE',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/trash`
  }),
  'gmail.users.threads.modify': (pathParameters, requestBody) => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/modify`,
    requestBody: requestBody
  }),
  'gmail.users.threads.trash': pathParameters => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/trash`
  }),
};
