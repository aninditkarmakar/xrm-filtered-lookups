import { IConfigItem } from "./IConfigItem";

class Graph<T> {
	protected root: Node<T>;

	public constructor(rootNode: Node<T>) {
		if (rootNode === undefined) {
			throw "Cannot initiate graph without a root node.";
		}

		this.root = rootNode;
	}
}

class Node<T> {
	public Value: T;
	private NextNodes: Node<T>[];

	public constructor(val: T) {
		this.Value = val;
		this.NextNodes = [];
	}

	public AddChildNode(node: Node<T>) {
		this.NextNodes.push(node);
	}

	public GetChildren() : Node<T>[] {
		return this.NextNodes;
	}
}

export class ConfigNode extends Node<IConfigItem> {
	public ConfigItem: IConfigItem;

	public constructor(val: IConfigItem) {
		super(val);
		this.ConfigItem = val;
	}
}

export class ConfigGraph extends Graph<IConfigItem> {
	private nodeSet: {
		[propName: string]: ConfigNode
	};

	private root_name: string;

	get ROOT_NAME() {
		return this.root_name;
	}

	public constructor() {
		var rootFieldName: string = '*';
		var rootConfigItem: IConfigItem = {
			parents: [],
			fieldName: rootFieldName,
		};
		var rootNode = new ConfigNode(rootConfigItem);

		super(rootNode);

		this.root_name = rootFieldName;
		this.nodeSet = {};
		this.nodeSet[rootFieldName] = rootNode;
	}

	public AddLink(fromField: string, toField: string) {
		this.nodeSet[fromField].AddChildNode(this.nodeSet[toField]);
	}

	public AddNode(node: ConfigNode) {
		this.nodeSet[node.ConfigItem.fieldName] = node;
	}

	public GetNode(fieldName: string) {
		return this.nodeSet[fieldName];
	}
}