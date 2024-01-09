/**
 * A lazy interface for the Gmail RESTful API.
 * 
 * @class
 */
class GmailUtil {
    /**
     * Constructs a new GmailUtil instance.
     *
     * @constructor
     * @param userId - The user's ID for Gmail.
     * @param initialQuery - The initial query for Gmail threads.
     */
    constructor({ userId = 'me', initialQuery = '' }) {
        this.userId = userId;
        this.initialQuery = initialQuery;

        this.GmailApi = new GmailApi();

        this.GmailApi.setBatchRequest([
            GmailApi.getRequest({
                name: 'users.labels.list',
                parameters: {
                    pathParameters: { userId: this.userId }
                }
            }),
            ...(() => {
                var threads = [];
                var nextPageToken;
                do {
                    this.GmailApi.setBatchRequest([
                        GmailApi.getRequest({
                            name: 'users.threads.list',
                            parameters: {
                                pathParameters: { userId: this.userId },
                                queryParameters: {
                                    maxResults: 500,
                                    ...(nextPageToken && { pageToken: nextPageToken }),
                                    q: this.initialQuery,
                                    includeSpamTrash: true
                                }
                            }
                        })
                    ]);
                    const res = this.GmailApi.executeBatchRequest()[0];
                    threads = threads.concat(res.threads);
                    nextPageToken = res.nextPageToken;
                } while (nextPageToken);
                return threads.filter(thread => thread !== undefined);
            })().map(thread => GmailApi.getRequest({
                name: 'users.threads.get',
                parameters: {
                    pathParameters: { userId: this.userId, id: thread.id },
                    queryParameters: { format: 'minimal' }
                }
            })),
        ]);
        [this.labels, ...this.threads] = this.GmailApi.executeBatchRequest();

        this.labels = new Labels(
            this.labels
                .labels
                .map(label => new Label(label))
        );
        this.threads = new Threads(
            this.threads
                .map(thread => new Thread(thread))
        );
        this.threads.getThreadsByRootLabel = (label) => {
            return this.labels.getLabelsByRootLabel(label)
                .flatMap(label => this.threads.getThreadsByLabel(label));
        }
    }
}

class Message {
    constructor({ labelIds = [], internalDate }) {
        this.labelIds = labelIds;
        this.internalDate = internalDate;
    }

    getLabelIds() {
        return this.labelIds;
    }

    getInternalDate() {
        return new Date(parseInt(this.internalDate));
    }
}

class Messages {
    constructor(messages) {
        this.setMessages(messages);
    }

    setMessages(messages = []) {
        this.messages = messages;
    }

    getMessages() {
        return this.messages;
    }

    getLatestMessage() {
        return this.getMessages()
            .reduce((accumulator, message) =>
                accumulator.getInternalDate() > message.getInternalDate()
                    ? accumulator
                    : message
            );
    }
}

class Label {
    constructor({ name, id }) {
        this.name = name;
        this.id = id;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }
}

class Labels {
    constructor(labels) {
        this.setLabels(labels);
    }

    setLabels(labels = []) {
        this.labels = labels;
    }

    getLabels() {
        return this.labels;
    }

    getLabelByName(labelName) {
        return this.getLabels()
            .find(label => label.getName() === labelName);
    }

    getLabelsByRootLabel(label) {
        const labelName = label.getName();
        return this.getLabels()
            .filter(label =>
                label.getName() === labelName ||
                label.getName()
                    .startsWith(`${labelName}/`)
            );
    }
}

class Thread {
    constructor({ id, messages = [] }) {
        this.id = id;
        this.messages = new Messages(
            messages
                .map(message => new Message(message))
        );
    }

    getId() {
        return this.id;
    }
}

class Threads {
    constructor(threads) {
        this.setThreads(threads);
    }

    setThreads(threads = []) {
        this.threads = threads;
    }

    getThreads() {
        return this.threads;
    }

    getThreadsByLabel(label) {
        const labelId = label.getId();
        return this.getThreads()
            .filter(thread => thread.messages.getMessages()
                .some(message =>
                    message.getLabelIds()
                        .includes(labelId)
                )
            );
    }
}
