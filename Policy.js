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
  constructor(userId = 'me', initialQuery = '') {
    this.userId = userId;

    this.GmailApi = new GmailApi('batch/gmail/v1');

    this.GmailApi.setBatchRequest([
      GmailApi.apiRequest['gmail.users.labels.list']({ userId: this.userId })
    ].concat(
      Gmail.Users.Threads.list(this.userId, {
        q: initialQuery,
        maxResults: 500, // todo LIMITED to processing only the 500 most recent emails implement while loop for date-based fetching
        includeSpamTrash: true
      }).threads.map(thread => GmailApi.apiRequest['gmail.users.threads.get'](
        { userId: this.userId, id: thread.id },
        { format: 'minimal' }
      ))
    ));
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

/**
 * Retention policy class.
 *
 * @class
 */
class GmailPolicy extends GmailUtil {
  constructor(userId = 'me') {
    super(userId);
  }

  retention({ labelId, retentionDays, methods = [], expectedLabels = [] }) { // only use 'gmail.users.threads' methods here
    const threads = this.getThreadsByRootLabel(labelId);
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);

    threads.forEach(thread => {
      const lastMessageDate = new Date(
        parseInt(thread.messages[thread.messages.length - 1].internalDate)
      );

      if (lastMessageDate < retentionDate) {
        if (thread.messages.some(message => message
          .labelIds.some(labelId => !expectedLabels.includes(labelId))
        )) {
          Logger.log('exception:unexpected-labels');
        } else {
          this.GmailApi.setBatchRequest(
            this.GmailApi.getBatchRequest().concat(...methods.map(method => GmailApi.apiRequest[method.name](
              { userId: this.userId, id: thread.id },
              method.requestBody
            )))
          )
        }
      }
    });
  }

  /**
   * Patch labels by root label.
   * 
   * - Inclusive of the root label
   */
  patchLabelByRootLabel({ labelId, requestBody }) {
    const rootLabelName = this.getLabelName(labelId);
    this.GmailApi.setBatchRequest(this.GmailApi.getBatchRequest()
      .concat(...this.getLabels().labels
        .filter(label =>
          label.name === rootLabelName || label.name.startsWith(`${rootLabelName}/`)
        ).map(label => GmailApi.apiRequest['gmail.users.labels.patch'](
          { userId: this.userId, id: label.id },
          requestBody
        ))
      )
    );
  }
}

/**
 * User-friendly interface for GmailPolicy.
 * 
 * Feaures:
 * - Comprehensive/intuitive label handling (created passively)
 * 
 * @class
 */
class GmailPolicyUI {
  /**
   * Constructs a new GmailPolicyUI instance.
   *
   * @constructor
   * @param {string} [userId='me'] - The user's ID for Gmail.
   */
  constructor(userId = 'me') {
    this.userId = userId;
    this.GmailPolicy = new GmailPolicy(this.userId);
  }

  _getMethod({ name, requestBody, pathParameters, queryParameters }) {
    switch (name) {
      case 'modify':
        return {
          name: 'gmail.users.threads.modify',
          requestBody: {
            "addLabelIds": requestBody.addLabelNames.map(labelName => {
              let labelId = this.GmailPolicy.getLabelId(labelName);
              if (!labelId) {
                this.GmailPolicy.GmailApi.setBatchRequest(
                  this.GmailPolicy.GmailApi.getBatchRequest().concat(
                    GmailApi.apiRequest['gmail.users.labels.create'](
                      { userId: this.GmailPolicy.userId },
                      { name: labelName }
                    )
                  )
                );
                const label = this.GmailPolicy.GmailApi.executeBatchRequest().pop();
                this.GmailPolicy.setLabels({
                  labels: this.GmailPolicy.getLabels().labels.concat(label)
                });

                labelId = label.id;
              }

              return labelId;
            }).filter(item => item !== null),
            "removeLabelIds": requestBody.removeLabelNames.map(labelName =>
              this.GmailPolicy.getLabelId(labelName)
            ).filter(item => item !== null)
          }
        };
      case 'delete':
        return {
          name: 'gmail.users.threads.delete'
        };
      case 'trash':
        return {
          name: 'gmail.users.threads.trash'
        };
      default:
        return null;
    }
  }

  /**
   * Execute a batch request using Gmail REST API through GmailPolicy.
   *
   * @returns {Object} - The response of the batch request.
   */
  executeBatchRequest() {
    return this.GmailPolicy.GmailApi.executeBatchRequest();
  }

  /**
   * Define a retention policy.
   *
   * @param {object} policy - The retention policy.
   * @param {string} policy.labelName - The label name.
   * @param {number} policy.retentionDays - The number of days to retain threads.
   * @param {Array} [policy.methods=[]] - An array of methods to apply to threads.
   */
  retention({ labelName, retentionDays, methods = [], expectedLabels = [] }) {
    this.GmailPolicy.retention({
      labelId: this.GmailPolicy.getLabelId(labelName),
      retentionDays: retentionDays,
      methods: methods.map(uiMethod => this._getMethod(uiMethod)),
      expectedLabels: expectedLabels.map(labelName => this.GmailPolicy.getLabelId(labelName))
    }); /** todo  move modify labels features to GmailPolicy.apiMethod() */
  }

  patchLabelByRootLabel({ labelName, requestBody }) {
    this.GmailPolicy.patchLabelByRootLabel({
      labelId: this.GmailPolicy.getLabelId(labelName),
      requestBody: requestBody
    });
  }

  // todo add support for dynamic label generation using days remaining
  //
  // - IMPORTANT  should be as a param in the policy {object}
  //
}
