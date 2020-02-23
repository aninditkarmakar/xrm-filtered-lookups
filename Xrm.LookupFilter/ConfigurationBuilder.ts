import { IConfigItem, ConfigItem } from "./IConfigItem";

export class ConfigurationBuilder {
	private formContext: Xrm.FormContext;

	public constructor(ctx: Xrm.FormContext) {
		this.formContext = ctx;
	}

	public BuildConfigFromJsonString(json: string): IConfigItem[] {
		var obj: IConfigItem[] = JSON.parse(json);
		var configArr: IConfigItem[] = [];
		for (var item of obj) {
			var configItem = new ConfigItem(this.formContext, item);
			configArr.push(configItem);
		}

		return configArr;
	}
}