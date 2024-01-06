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
    this.GmailPolicy = new GmailPolicy(userId);
  }

  /**
   * Adds non-functional SIDE EFFECTS to methods
   *
   */
  DoMethod(method) {
    switch (method.name) {
      case 'users.threads.modify':
        method.parameters.requestBody.addLabelNames
          .filter(labelName => !this.GmailPolicy.getLabelId(labelName))
          .forEach(labelName => {
            this.GmailPolicy.GmailApi.setBatchRequest([
              ...this.GmailPolicy.GmailApi.getBatchRequest(),
              GmailApi.getRequest({
                name: 'users.labels.create',
                parameters: {
                  pathParameters: { userId: this.GmailPolicy.userId },
                  requestBody: { name: labelName }
                }
              })
            ]);

            // dupicate THIS function IN `compileBatchRequest()`
            //  -- *this* is required for addLabelIds.
            this.GmailPolicy.setLabels({
              ...this.GmailPolicy.getLabels(),
              labels: this.GmailPolicy.getLabels().labels.concat(
                this.GmailPolicy.GmailApi.executeBatchRequest().pop()
              )
            });
          });
        return {
          ...method,
          parameters: {
            requestBody: {
              ...(method.parameters.requestBody.addLabelNames
                ? {
                  addLabelIds: method.parameters.requestBody.addLabelNames
                    .map(labelName => this.GmailPolicy.getLabelId(labelName)),
                }
                : {}),
              ...(method.parameters.requestBody.removeLabelNames
                ? {
                  removeLabelIds: method.parameters.requestBody.removeLabelNames
                    .map(labelName => this.GmailPolicy.getLabelId(labelName))
                }
                : {})
            }
          }
        };
      default:
        return method;
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
  retention({ labelName, retentionDays, methods = null, unexpectedLabelNames = null, expectedLabelNames = null }) {
    this.GmailPolicy.retention({
      labelId: this.GmailPolicy.getLabelId(labelName),
      retentionDays: retentionDays,
      ...(methods ? { methods: methods.map(method => this.DoMethod(method)) } : {}),
      ...(unexpectedLabelNames
        ? { unexpectedLabelIds: expectedLabelNames.map(labelName => this.GmailPolicy.getLabelId(labelName)) }
        : {}
      ),
      ...(expectedLabelNames
        ? { expectedLabelIds: expectedLabelNames.map(labelName => this.GmailPolicy.getLabelId(labelName)) }
        : {}
      )
    });
  }

  patchLabelByRootLabelName({ labelName, requestBody }) {
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
