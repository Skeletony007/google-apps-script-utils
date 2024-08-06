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
   * @param [userId='me'] - The user's ID for Gmail.
   */
  constructor(userId = 'me') {
    this.GmailPolicy = new GmailPolicy(userId);
    this.patchLabelByName = patch => this.GmailPolicy.patchLabelByName(patch);
    this.patchLabelsByRootLabelName = patch => this.GmailPolicy.patchLabelsByRootLabelName(patch);
    this.executeBatchRequest = () => this.GmailPolicy.GmailApi.executeBatchRequest();
  }

  /**
   * Adds non-functional SIDE EFFECTS to methods
   *
   */
  DoMethod(method) {
    switch (method.name) {
      case 'users.threads.modify':
        if (method.parameters.requestBody.addLabelNames) {
          method.parameters.requestBody.addLabelNames
            .filter(labelName => !this.GmailPolicy.labels.getLabelByName(labelName))
            .forEach(labelName => {
              this.GmailPolicy.GmailApi.setBatchRequest([
                ...this.GmailPolicy.GmailApi.getBatchRequest(),
                GmailApi.getRequest({
                  name: 'users.labels.create',
                  parameters: {
                    pathParameters: {userId: this.GmailPolicy.userId},
                    requestBody: {name: labelName},
                  },
                }),
              ]);

              // duplicate THIS function IN `compileBatchRequest()`
              // -- *this* is required for addLabelIds.
              this.GmailPolicy.labels.setLabels([
                ...this.GmailPolicy.labels.getLabels(),
                new Label(this.GmailPolicy.GmailApi.executeBatchRequest().pop()),
              ]);
            });
        }
        return {
          ...method,
          parameters: {
            requestBody: {
              ...(method.parameters.requestBody.addLabelNames
                ? {
                    addLabelIds: method.parameters.requestBody.addLabelNames.map(labelName =>
                      this.GmailPolicy.labels.getLabelByName(labelName).getId()
                    ),
                  }
                : {}),
              ...(method.parameters.requestBody.removeLabelNames
                ? {
                    removeLabelIds: method.parameters.requestBody.removeLabelNames.map(labelName =>
                      this.GmailPolicy.labels.getLabelByName(labelName).getId()
                    ),
                  }
                : {}),
            },
          },
        };
      default:
        return method;
    }
  }

  /**
   * Define a retention policy.
   *
   * @param policy - The retention policy.
   * @param policy.labelName - The label name.
   * @param policy.retentionDays - The number of days to retain threads.
   * @param [policy.methods=[]] - An array of methods to apply to threads.
   */
  retention({labelName, retentionDays, methods = null, unexpectedLabelNames = null, expectedLabelNames = null}) {
    this.GmailPolicy.retention({
      labelName: labelName,
      retentionDays: retentionDays,
      ...(methods
        ? {
            methods: methods.map(method => this.DoMethod(method)),
          }
        : {}),
      ...(unexpectedLabelNames
        ? {
            unexpectedLabelIds: expectedLabelNames.map(labelName =>
              this.GmailPolicy.labels.getLabelByName(labelName).getId()
            ),
          }
        : {}),
      ...(expectedLabelNames
        ? {
            expectedLabelIds: expectedLabelNames.map(labelName =>
              this.GmailPolicy.labels.getLabelByName(labelName).getId()
            ),
          }
        : {}),
    });
  }

  // todo add support for dynamic label generation using days remaining
  //
  // - IMPORTANT should be as a param in the policy {object}
  //
}
