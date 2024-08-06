/**
 * Gmail policy class.
 *
 * Controls retention policies with minimal side effects.
 */
class GmailPolicy extends GmailUtil {
  constructor(userId = 'me') {
    super(userId);
  }

  /**
   * Retention method.
   *
   */
  retention({labelName, retentionDays, methods = [], unexpectedLabelIds = null, expectedLabelIds = null}) {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);
    this.GmailApi.setBatchRequest([
      ...this.GmailApi.getBatchRequest(),
      ...this.threads
        .getThreadsByRootLabel(this.labels.getLabelByName(labelName))
        .filter(
          thread =>
            thread.messages.getLatestMessage().getInternalDate() < retentionDate &&
            (unexpectedLabelIds
              ? !thread.messages
                  .getMessages()
                  .some(message => message.getLabelIds().some(labelId => unexpectedLabelIds.includes(labelId)))
              : true) &&
            (expectedLabelIds
              ? thread.messages
                  .getMessages()
                  .every(message => message.getLabelIds().every(labelId => expectedLabelIds.includes(labelId)))
              : true)
        )
        .flatMap(thread =>
          methods.map(method =>
            GmailApi.getRequest({
              ...method,
              parameters: {
                ...method.parameters,
                pathParameters: {userId: this.userId, id: thread.id},
              },
            })
          )
        ),
    ]);
  }

  patchLabelByName({labelName, requestBody}) {
    this.GmailApi.setBatchRequest([
      ...this.GmailApi.getBatchRequest(),
      GmailApi.getRequest({
        name: 'users.labels.patch',
        parameters: {
          pathParameters: {
            userId: this.userId,
            id: this.labels.getLabelByName(labelName).getId(),
          },
          requestBody: requestBody,
        },
      }),
    ]);
  }

  patchLabelsByRootLabelName({labelName, requestBody}) {
    this.labels.getLabelsByRootLabel(this.labels.getLabelByName(labelName)).forEach(label =>
      this.patchLabelByName({
        labelName: label.getName(),
        requestBody: requestBody,
      })
    );
  }
}
