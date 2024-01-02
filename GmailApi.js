class GmailApi extends GoogleApi {
  constructor() {
    super('batch/gmail/v1');
  }
}

/**
 * API request definitions for the Gmail API.
 * @typedef {Object} ApiRequestDefinitions
 * @property {function} 'gmail.users.labels.create' - Creates a new label.
 * @property {function} 'gmail.users.labels.list' - Lists all labels in the user's mailbox.
 * @property {function} 'gmail.users.labels.patch' - Patch the specified label.
 * @property {function} 'gmail.users.threads.get' - Gets the specified thread.
 * @property {function} 'gmail.users.threads.delete' - Immediately and permanently deletes the specified thread. Any messages that belong to the thread are also deleted. This operation cannot be undone. Prefer threads.trash instead.
 * @property {function} 'gmail.users.threads.modify' - Modifies the labels applied to the thread. This applies to all messages in the thread.
 * @property {function} 'gmail.users.threads.trash' - Moves the specified thread to the trash. Any messages that belong to the thread are also moved to the trash.
 *
 * @type {ApiRequestDefinitions}
 */
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
