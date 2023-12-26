/**
 * A lazy interface for the Gmail REST API.
 * 
 * @class
 */
class GmailUtil {
  /**
   * Constructs a new GmailUtil instance.
   *
   * @constructor
   * @param {string} [userId='me'] - The user's ID for Gmail.
   * @param {string} [initialQuery=''] - The initial query for Gmail threads.
   */
  constructor(userId = 'me', initialQuery = '') {
    this.initialQuery = initialQuery;
    this.userId = userId;

    this.setBatchRequest(Gmail.Users.Threads.list(userId, {
      q: initialQuery,
      maxResults: 500,  /** todo LIMITED to processing only the 500 most recent emails implement while loop */
      includeSpamTrash: true
    }).threads.map(thread => this._getRequest({
      name: 'gmail.users.threads.get',
      pathParameters: {
        userId: this.userId,
        id: thread.id
      },
      queryParamaters: {format: 'minimal'}
    })).concat(this._getRequest({
      name: 'gmail.users.labels.list',
      pathParameters: {userId: this.userId}
    })));  [this.labels, ...this.threads] = this.executeBatchRequest().reverse();
  }

  _getRequest({name, requestBody, pathParameters, queryParamaters}) {
    switch (name) {
      case 'gmail.users.labels.create':
        return {
          method: 'POST',
          endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels`,
          requestBody: requestBody
        };
      case 'gmail.users.labels.list':
        return {
          method: 'GET',
          endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels`
        };
      case 'gmail.users.labels.patch':
        return {
          method: 'PATCH',
          endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/labels/${pathParameters.id}`,
          requestBody: requestBody
        };
      case `gmail.users.threads.get`:
        return {
          method: 'GET',
          endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}?format=${queryParamaters.format}`
        };
      case 'gmail.users.threads.delete': /** This operation CANNOT BE UNDONE. Prefer `threads.trash` instead */
        return {
          //method: 'DELETE',
          //endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/trash`
        };
      case 'gmail.users.threads.modify':
        return {
          method: 'POST',
          endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/modify`,
          requestBody: requestBody
        };
      case 'gmail.users.threads.trash':
        return {
          method: 'POST',
          endpoint: `https://gmail.googleapis.com/gmail/v1/users/${pathParameters.userId}/threads/${pathParameters.id}/trash`
        };
      default:
        return null;
    }
  }

  getBatchRequest() {
    return this.batchRequest;
  }

  setBatchRequest(batchRequest) {
    this.batchRequest = batchRequest;
  }

  /**
   * (NOT IMPLEMENTED) Logical Analysis Stage of Compilation.
   * 
   * Reduces redundant requests using `_getRequest()` identifiers
   */
  _compileBatchRequests() {
    return;  /** todo complete this method */
  }

  /**
   * Execute the batch API request using Gmail REST API (v1).
   *
   * @returns {Object|null} - The response of the batch request.
   */
  executeBatchRequest() {
    this._compileBatchRequests();

    let res;
    try {
      res = new BatchRequest({
        batchPath: 'batch/gmail/v1',
        requests: this.batchRequest
      }).EDo();
    } catch (error) {
      console.error('Error in executeBatchRequest:', error);
      return null;
    }

    this.setBatchRequest([]);
    return res;
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

  retention({labelId, retentionDays, methods = [], expectedLabels = []}) {  /** only use 'gmail.users.threads' methods here */
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
          this.setBatchRequest(this.getBatchRequest().concat(...methods.map(
            method => this._getRequest({
              name: method.name,
              requestBody: method.requestBody,
              pathParameters: {
                userId: this.userId,
                id: thread.id
              }
            })
          )))
        }
      }
    })
  }

  /**
   * Patch labels by root label.
   * 
   * - Inclusive of the root label
   */
  patchLabelByRootLabel({labelId, requestBody}) {
    const rootLabelName = this.getLabelName(labelId);
    this.setBatchRequest(this.getBatchRequest()
      .concat(...this.getLabels().labels
        .filter(label =>
          label.name === rootLabelName || label.name.startsWith(`${rootLabelName}/`)
        ).map(label => this._getRequest({
          name: 'gmail.users.labels.patch',
          requestBody: requestBody,
          pathParameters: {
            userId: this.userId,
            id: label.id
          }
        }))
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

  _getMethod({name, requestBody, pathParameters, queryParameters}) {
    switch (name) {
      case 'modify':
        return {
          name: 'gmail.users.threads.modify',
          requestBody: {
            "addLabelIds": requestBody.addLabelNames.map(labelName => {
              let labelId = this.GmailPolicy.getLabelId(labelName);
              if (!labelId) {
                this.GmailPolicy.setBatchRequest(
                  this.GmailPolicy.getBatchRequest().concat(
                    this.GmailPolicy._getRequest({
                      name: 'gmail.users.labels.create',
                      requestBody: { name: labelName },
                      pathParameters: { userId: this.GmailPolicy.userId },
                    })
                  )
                );
                const label = this.GmailPolicy.executeBatchRequest().pop();
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
    return this.GmailPolicy.executeBatchRequest();
  }

  /**
   * Define a retention policy.
   *
   * @param {object} policy - The retention policy.
   * @param {string} policy.labelName - The label name.
   * @param {number} policy.retentionDays - The number of days to retain threads.
   * @param {Array} [policy.methods=[]] - An array of methods to apply to threads.
   */
  retention({labelName, retentionDays, methods = [], expectedLabels = []}) {
    this.GmailPolicy.retention({
      labelId: this.GmailPolicy.getLabelId(labelName),
      retentionDays: retentionDays,
      methods: methods.map(uiMethod => this._getMethod(uiMethod)),
      expectedLabels: expectedLabels.map(labelName => this.GmailPolicy.getLabelId(labelName))
    }); /** todo  move modify labels features to GmailPolicy._getRequest() */
  }

  patchLabelByRootLabel({labelName, requestBody}) {
    this.GmailPolicy.patchLabelByRootLabel({
      labelId: this.GmailPolicy.getLabelId(labelName),
      requestBody: requestBody
    });
  }

  /** todo add support for dynamic label generation using days remaining
   * - IMPORTANT  should be as a param in the policy {object}
   */
}
