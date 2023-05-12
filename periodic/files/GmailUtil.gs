class GmailUtil {
  constructor(preferences) {
    this.preferences = preferences;
    this.now = new Date();
    this.labels = null;
    this.gmailApiLabels = null;
    this.threads = null;
    this.gmailApiThreads = null;
  }

  getThreads(interfaceName) {
    switch (interfaceName) {
      case ('GmailApp'):
        if (this.threads === null) {
          this.threads = GmailApp.search('is:all');
        }
        return this.threads;
      case ('Gmail'):
        if (this.gmailApiThreads === null) {
          this.gmailApiThreads = Gmail.Users.Threads.list(this.preferences.userId).threads;
        }
        return this.gmailApiThreads;
      default:
        return this.getThreads('GmailApp');
    }
  }

  refreshThreads(interfaceName) {
    switch (interfaceName) {
      case ('GmailApp'):
        return this.gmailApiLabels = Gmail.Users.Threads.list(this.preferences.userId).threads;
      case ('Gmail'):
        return this.threads = GmailApp.search('is:all');
      default:
        return this.refreshThreads('GmailApp');
    }
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

  refreshLabels(interfaceName) {
    switch (interfaceName) {
      case ('GmailApp'):
        return this.labels = GmailApp.getUserLabels();
      case ('Gmail'):
        return this.gmailApiLabels = Gmail.Users.Labels.list(this.preferences.userId).labels;
      default:
        return this.refreshLabels('GmailApp');
    }
  }

  createLabel(labelName) {
    const {
      userId,
      genericLabelResource
    } = this.preferences;

    this.refreshLabels('Gmail');

    const labels = this.getLabels('Gmail');
    var label = labels.find(label => label.name === labelName);
    if (!label) {
      genericLabelResource.name = labelName;
      label = Gmail.Users.Labels.create(
        genericLabelResource,
        userId
      );
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

  updateLabel(resource, label) {
    const {
      userId
    } = this.preferences;

    label = Object.assign(label, resource);
    
    Gmail.Users.Labels.update(label, userId, label.id);
  }

  sublabelUpdater() {
    const {
      sublabelUpdater: {
        targetLabelNames
      }
    } = this.preferences;

    const parentLabelNames = Object.keys(targetLabelNames);

    const labels = this.getLabels('Gmail');

    for (const parentLabelName of parentLabelNames) {
      const subLabels = labels.filter(label => label.getName().startsWith(parentLabelName));

      for (const subLabel of subLabels) {
        try {
          const subLabelTextColor = subLabel.color.textColor;
          const subLabelBackgroundColor = subLabel.color.backgroundColor;
        } catch (e) {
          if (subLabel.type === 'user') {
            this.updateLabel(targetLabelNames[parentLabelName], subLabel);
          }
        }
      }
    }
  }

  sublabelCleaner() {
    const {
      sublabelCleaner: {
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
