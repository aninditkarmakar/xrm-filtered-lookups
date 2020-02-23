import { IConfigItem } from "./IConfigItem";
import { ConfigGraph, ConfigNode } from "./Graph";
import { EventOrchestrator } from "./EventOrchestrator";
import { LookupField } from "./LookupField";
import { ConfigurationBuilder } from "./ConfigurationBuilder";

export class LookupFilter {
	private config: IConfigItem[];
	private graph: ConfigGraph;
	private eventBus: EventOrchestrator;
	private formContext: Xrm.FormContext;

	public constructor(formContext: Xrm.FormContext) {
		this.config = [];
		this.formContext = formContext;
		this.graph = new ConfigGraph();
		this.eventBus = new EventOrchestrator();
	}

	private buildGraph() {
		for (var configItem of this.config) {
			var node: ConfigNode = new ConfigNode(configItem);
			this.graph.AddNode(node);
		}

		for (var configItem of this.config) {
			var parents: string[] = configItem.parents;
			if (parents.length === 0) {
				this.graph.AddLink(this.graph.ROOT_NAME, configItem.fieldName);
			}
			else {
				for (var parent of configItem.parents) {
					this.graph.AddLink(parent, configItem.fieldName);
				}
			}
		}
	}

	private setupSubscriptions() {
		for (let configItem of this.config) {
			if (configItem.formField !== undefined) {
				var formContext = this.formContext;

				this.eventBus.Subscribe("fieldChange", (function () {
					return function (changedField: string) {
						configItem.formField?.onAnyFieldChange(formContext, configItem.formField, changedField);
					}
				})());

				this.eventBus.Subscribe("allInitDone", (data: any) => {
					configItem.formField?.onAllInitComplete(formContext, configItem.formField);
				});
			}
		}
	}

	private attachOnChangeFormHandlers() {
		for (var configItem of this.config) {
			this.formContext.getAttribute(configItem.fieldName.toLowerCase()).addOnChange((ctx) => {
				this.eventBus.Publish("fieldChange", (ctx.getEventSource() as Xrm.Attributes.Attribute).getName().toLowerCase());
			});
		}
	}

	private buildConfigArray(json: string) {
		var builder = new ConfigurationBuilder(this.formContext);
		this.config = builder.BuildConfigFromJsonString(json);
	}

	private fireInitDone() {
		this.eventBus.Publish("allInitDone", null);
	}

	public Initialize(json: string): void{
		this.buildConfigArray(json);
		this.buildGraph();
		this.setupSubscriptions();
		this.attachOnChangeFormHandlers();
		this.fireInitDone();
	}
}