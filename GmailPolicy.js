/**
 * Retention policy class.
 *
 * @class
 */
class GmailPolicy extends GmailUtil {
  constructor(userId = 'me') {
    super(userId);
  }

  retention({ labelId, retentionDays, methods = [], unexpectedLabelIds = null, expectedLabelIds = null }) {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);
    this.GmailApi.setBatchRequest(
      this.getThreadsByRootLabel(labelId)
        .filter(thread =>
          new Date(parseInt(thread.messages.pop().internalDate)) < retentionDate &&
          (unexpectedLabelIds
            ? !thread.messages.some(message => message.labelIds.some(labelId => unexpectedLabelIds.includes(labelId)))
            : true
          ) &&
          (expectedLabelIds
            ? thread.messages.every(message => message.labelIds.every(labelId => expectedLabelIds.includes(labelId)))
            : true
          )
        )
        .flatMap(thread => methods.map(method => GmailApi.getRequest({
          ...method,
          parameters: {
            ...method.parameters,
            pathParameters: { userId: this.userId, id: thread.id }
          }
        })))
    );
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
        ).map(label => GmailApi.getRequest({
          name: 'users.labels.patch',
          parameters: {
            pathParameters: { userId: this.userId, id: label.id },
            requestBody: requestBody
          }
        }))
      )
    );
  }
}
