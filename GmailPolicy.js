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
    const threads = this.getThreadsByRootLabel(labelId);
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);

    threads.forEach(thread => {
      const lastMessageDate = new Date(parseInt(thread.messages[thread.messages.length - 1].internalDate));

      if (lastMessageDate < retentionDate) {
        if (thread.messages.some(message => message.labelIds.some(labelId => !expectedLabels.includes(labelId)))) {
          console.log('exception:unexpected-labels');
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
        ).map(label => GmailApi.apiRequest['users.labels.patch'](
          { userId: this.userId, id: label.id },
          requestBody
        ))
      )
    );
  }
}
