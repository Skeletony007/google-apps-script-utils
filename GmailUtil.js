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

    this.GmailApi.setBatchRequest(
      [GmailApi.apiRequest['users.labels.list'](
        { userId: this.userId }
      )].concat(
        (() => {
          var threads = [];
          var nextPageToken;
          do {
            this.GmailApi.setBatchRequest([
              GmailApi.apiRequest['users.threads.list'](
                { userId: this.userId },
                { maxResults: 500, pageToken: nextPageToken, q: this.initialQuery, includeSpamTrash: true }
              )
            ]);
            const res = this.GmailApi.executeBatchRequest()[0];
            threads = threads.concat(res.threads);
            nextPageToken = res.nextPageToken;
          } while (nextPageToken);
          return threads.filter(thread => thread !== undefined);
        })().map(thread => GmailApi.apiRequest['users.threads.get'](
          { userId: this.userId, id: thread.id },
          { format: 'minimal' }
        ))
      )
    );
    [this.labels, ...this.threads] = this.GmailApi.executeBatchRequest();
  }

  getThreads() {
    return this.threads;
  }

  setThreads(threads) {
    this.threads = threads;
  }

  getLabels() {
    return this.labels;
  }

  setLabels(labels) {
    this.labels = labels;
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
    const filteredThreads = this.getThreads().filter(thread =>
      thread.messages && thread.messages.some(message =>
        message.labelIds && message.labelIds.includes(labelId)
      )
    );

    return filteredThreads;
  }

  getThreadsByRootLabel(labelId) {
    const rootLabelName = this.getLabelName(labelId);
    const filteredThreads = [].concat(...this.getLabels().labels
      .filter(label =>
        label.name === rootLabelName || label.name.startsWith(`${rootLabelName}/`)
      ).map(label => this.getThreadsByLabel(label.id))
    );

    return filteredThreads;
  }
}
