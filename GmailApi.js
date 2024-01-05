class GmailApi extends GoogleApi {
  constructor() {
    super('batch/gmail/v1');
  }
}

/**
 * API request definitions for the Gmail API.
 * @typedef {Object} ApiRequestDefinitions
 * @property {function} 'users.labels.create' - Creates a new label.
 * @property {function} 'users.labels.list' - Lists all labels in the user's mailbox.
 * @property {function} 'users.labels.patch' - Patch the specified label.
 * @property {function} 'users.threads.get' - Gets the specified thread.
 * @property {function} 'users.threads.delete' - Immediately and permanently deletes the specified thread. Any messages that belong to the thread are also deleted. This operation cannot be undone. Prefer threads.trash instead.
 * @property {function} 'users.threads.modify' - Modifies the labels applied to the thread. This applies to all messages in the thread.
 * @property {function} 'users.threads.trash' - Moves the specified thread to the trash. Any messages that belong to the thread are also moved to the trash.
 *
 * @type {ApiRequestDefinitions}
 */
GmailApi.apiRequest = {
  'users.labels.create': ({ pathParameters, requestBody }) => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels`,
    requestBody: requestBody
  }),
  'users.labels.list': ({ pathParameters }) => ({
    method: 'GET',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels`
  }),
  'users.labels.patch': ({ pathParameters, requestBody }) => ({
    method: 'PATCH',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels/${pathParameters.id}`,
    requestBody: requestBody
  }),
  'users.threads.get': ({ pathParameters, queryParameters }) => ({
    method: 'GET',
    endpoint: GoogleApi.addQueryParameters(`https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}`, queryParameters)
  }),
  'users.threads.list': ({ pathParameters, queryParameters }) => ({
    method: 'GET',
    endpoint: GoogleApi.addQueryParameters(`https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads`, queryParameters)
  }),
  'users.threads.delete': ({ pathParameters }) => ({
    method: 'DELETE',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/trash`
  }),
  'users.threads.modify': ({ pathParameters, requestBody }) => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/modify`,
    requestBody: requestBody
  }),
  'users.threads.trash': ({ pathParameters }) => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/trash`
  }),
};
