import { Topic } from 'roslib';

type TopicConstructorOptions<T> = ConstructorParameters<typeof Topic<T>>[0];

export class ManagedTopic<T> {
    private publishers = new Set<string>();
    topic: Topic<T>;

    constructor(topicSettings: TopicConstructorOptions<T>) {
        this.topic = new Topic<T>(topicSettings);
    }

    addPublisher = (uuid: string) => {
        this.publishers.add(uuid);
    };

    removePublisher = (uuid: string) => {
        this.publishers.delete(uuid);
        if (this.publishers.size === 0 && this.topic.isAdvertised) {
            this.topic.unadvertise();
        }
    };

    canBeRemoved = () => {
        return (
            !this.topic.hasListeners() &&
            !this.topic.isAdvertised &&
            this.publishers.size == 0
        );
    };

    get numPublishers(): number {
        return this.publishers.size;
    }
}
