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
          name: 'users.threads.modify',
          requestBody: {
            "addLabelIds": requestBody.addLabelNames.map(labelName => {
              let labelId = this.GmailPolicy.getLabelId(labelName);
              if (!labelId) {
                this.GmailPolicy.GmailApi.setBatchRequest(
                  this.GmailPolicy.GmailApi.getBatchRequest().concat(
                    GmailApi.apiRequest['users.labels.create'](
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
          name: 'users.threads.delete'
        };
      case 'trash':
        return {
          name: 'users.threads.trash'
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
