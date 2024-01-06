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
GmailApi.requestTemplates = {
  'users.labels.create': paramaters => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${paramaters.pathParameters.userId}/labels`,
  }),
  'users.labels.list': parameters => ({
    method: 'GET',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/labels`
  }),
  'users.labels.patch': parameters => ({
    method: 'PATCH',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/labels/${parameters.pathParameters.id}`,
  }),
  'users.threads.get': parameters => ({
    method: 'GET',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/threads/${parameters.pathParameters.id}`
  }),
  'users.threads.list': parameters => ({
    method: 'GET',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/threads`
  }),
  'users.threads.delete': parameters => ({
    method: 'DELETE',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/threads/${parameters.pathParameters.id}/trash`
  }),
  'users.threads.modify': parameters => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/threads/${parameters.pathParameters.id}/modify`,
  }),
  'users.threads.trash': parameters => ({
    method: 'POST',
    endpoint: `https://gmail.googleapis.com/gmail/v1/users/${parameters.pathParameters.userId}/threads/${parameters.pathParameters.id}/trash`
  }),
};
