class GmailUtil {
  constructor(preferences) {
    this.preferences = preferences;
    this.now = new Date();
    this.labels = null;
    this.gmailApiLabels = null;
  }

  getLabels(interfaceName) {
    switch (interfaceName) {
      case ('GmailApp'):
        if (this.labels === null) {
          this.labels = GmailApp.getUserLabels();
        }
        return this.labels;
      case ('Gmail'):
        if (this.gmailApiLabels === null) {
          this.gmailApiLabels = Gmail.Users.Labels.list(this.preferences.userId).labels;
        }
        return this.gmailApiLabels;
      default:
        return this.getLabels('GmailApp');
    }
  }

  refreshLabels() {
    this.labels = GmailApp.getUserLabels();
    this.gmailApiLabels = Gmail.Users.Labels.list(this.preferences.userId).labels;
  }

  createLabel(labelName) {
    const {
      userId,
      genericLabelResource
    } = this.preferences;
    const labels = this.getLabels('Gmail');
    var label = labels.find(label => label.name === labelName);
    if (!label) {
      genericLabelResource.name = labelName;
      label = Gmail.Users.Labels.create(
        genericLabelResource,
        userId
      );
      this.refreshLabels();
    }
    return label;
  }

  labelAs(labelName, thread) {
    const {userId} = this.preferences;
    const label = this.createLabel(labelName);
    const labelId = label.id;
    Gmail.Users.Messages.modify({
      "addLabelIds": [labelId]},
      userId,
      thread.getId()
    );
  }

  sublabelCleaner() {
    const {
      sublabelCleanerResource: {
        targetLabelNames,
        warningLabelName,
        warningLabelDay,
        deleteDay
      }
    } = this.preferences;

    const parentLabelNames = Object.keys(targetLabelNames);

    GmailApp.refreshMessages;

    const labels = this.getLabels();

    for (const label of labels)
      if (label.getName().startsWith(`${warningLabelName}/`))
        GmailApp.deleteLabel(label)

    this.createLabel(warningLabelName);

    for (const parentLabelName of parentLabelNames) {
      const subLabels = labels.filter(label => label.getName().startsWith(parentLabelName));

      for (const subLabel of subLabels) {
        targetLabelNames[parentLabelName].push(subLabel.getName());

        const threads = subLabel.getThreads();

        for (const thread of threads) {
          const threadDay = Math.floor((this.now.getTime() - thread.getLastMessageDate().getTime()) / 86400000);
          const threadLabels = thread.getLabels();
          var exception = false;

          if (threadDay < warningLabelDay || thread.isInTrash())
            continue
          if (threadLabels.some(label => !targetLabelNames[parentLabelName].includes(label.getName()))) {
            this.labelAs(`${warningLabelName}/exception:unexpected-labels`, thread);
            exception = true;
          }
          if (thread.hasStarredMessages()) {
            this.labelAs(`${warningLabelName}/exception:starred-messages`, thread);
            exception = true;
          }
          if (thread.isUnread()) {
            this.labelAs(`${warningLabelName}/exception:unread-messages`, thread);
            exception = true;
          }
          if (exception ===true)
            continue

          if (threadDay < deleteDay)
            this.labelAs(`${warningLabelName}/${deleteDay - threadDay} days left`, thread)
          else
            thread.moveToTrash()
        }

        targetLabelNames[parentLabelName] = targetLabelNames[parentLabelName]
          .filter(labelName => labelName !== subLabel.getName());
      }
    }
  }
}
