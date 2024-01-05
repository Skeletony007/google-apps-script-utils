/**
 * Retention policy class.
 *
 * @class
 */
class GmailPolicy extends GmailUtil {
  constructor(userId = 'me') {
    super(userId);
  }

  retention({ labelId, retentionDays, methods = [], expectedLabels = [] }) { // only use 'users.threads' methods here
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);
    this.GmailApi.setBatchRequest(
      this.getThreadsByRootLabel(labelId)
        .filter(thread =>
          new Date(parseInt(thread.messages[thread.messages.length - 1].internalDate)) < retentionDate
          && thread.messages.every(message => message.labelIds.every(labelId => expectedLabels.includes(labelId)))
        )
        .flatMap(thread =>
          methods.map(method => GmailApi.apiRequest[method.name](
            { userId: this.userId, id: thread.id },
            method.requestBody
          ))
        )
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
        ).map(label => GmailApi.apiRequest['users.labels.patch'](
          { userId: this.userId, id: label.id },
          requestBody
        ))
      )
    );
  }
}
