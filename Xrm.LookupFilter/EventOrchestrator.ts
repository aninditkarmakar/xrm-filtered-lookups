const uuidv4 = require('uuid/v4');

export interface IEventSubscription {
	[id: string] : (fieldName: string) => void
}

export interface IEventSubscriptionResult {
	Unsubscribe(): void;
}

export class EventOrchestrator {
	private subscriptions: {
		[eventType: string]: IEventSubscription
	}

	public constructor() {
		this.subscriptions = {};
	}

	public Subscribe(eventName: string, callback: (fieldName: string) => void): IEventSubscriptionResult {
		const id = uuidv4();

		if (!this.subscriptions[eventName]) {
			this.subscriptions[eventName] = {};
		}

		this.subscriptions[eventName][id] = callback;

		return {
			Unsubscribe: () => {
				delete this.subscriptions[eventName][id];
				if (Object.keys(this.subscriptions[eventName]).length === 0) {
					delete this.subscriptions[eventName];
				}
			}
		}
	}

	public Publish(eventName: string, data: any) {
		if (!this.subscriptions[eventName])
			return;

		for (var id of Object.keys(this.subscriptions[eventName])) {
			this.subscriptions[eventName][id](data);
		}
	}
}