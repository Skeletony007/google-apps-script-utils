/**
 * A lazy interface for the Gmail RESTful API.
 * 
 * @class
 */
class GmailUtil {
  /**
   * Constructs a new GmailUtil instance.
   *
   * @constructor
   * @param userId {string} - The user's ID for Gmail.
   * @param initialQuery {string} - The initial query for Gmail threads.
   */
  constructor({ userId = 'me', initialQuery = '' }) {
    this.userId = userId;
    this.initialQuery = initialQuery;

    this.GmailApi = new GmailApi();

    this.GmailApi.setBatchRequest([
      GmailApi.getRequest({
        name: 'users.labels.list',
        parameters: {
          pathParameters: { userId: this.userId }
        }
      }),
      ...(() => {
        var threads = [];
        var nextPageToken;
        do {
          this.GmailApi.setBatchRequest([
            GmailApi.getRequest({
              name: 'users.threads.list',
              parameters: {
                pathParameters: { userId: this.userId },
                queryParameters: {
                  maxResults: 500,
                  ...(nextPageToken && { pageToken: nextPageToken }),
                  q: this.initialQuery,
                  includeSpamTrash: true
                }
              }
            })
          ]);
          const res = this.GmailApi.executeBatchRequest()[0];
          threads = threads.concat(res.threads);
          nextPageToken = res.nextPageToken;
        } while (nextPageToken);
        return threads.filter(thread => thread !== undefined);
      })().map(thread => GmailApi.getRequest({
        name: 'users.threads.get',
        parameters: {
          pathParameters: { userId: this.userId, id: thread.id },
          queryParameters: { format: 'minimal' }
        }
      }))
    ]);
    [this.labels, ...this.threads] = this.GmailApi.executeBatchRequest();
  }

  setLabels(labels) {
    this.labels = labels;
  }

  setThreads(threads) {
    this.threads = threads;
  }

  getLabels() {
    return this.labels;
  }

  getThreads() {
    return this.threads;
  }

  getLabelId(labelName) {
    const label = this.getLabels().labels.find(label => label.name === labelName);
    return label ? label.id : null;
  }

  getLabelName(labelId) {
    const label = this.getLabels().labels.find(label => label.id === labelId);
    return label ? label.name : null;
  }

  getThreadsByLabel(labelId) {
    return this.getThreads()
      .filter(thread => thread.messages && thread.messages
        .some(message => message.labelIds && message.labelIds.includes(labelId))
      );;
  }

  getThreadsByRootLabel(labelId) {
    const rootLabelName = this.getLabelName(labelId);
    return this.getLabels().labels
      .filter(label => label.name === rootLabelName || label.name.startsWith(`${rootLabelName}/`))
      .flatMap(label => this.getThreadsByLabel(label.id));
  }
}
