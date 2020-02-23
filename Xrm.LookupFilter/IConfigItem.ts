import { IConfigFilter } from "./IConfigFilter";
import { LookupField } from "./LookupField";

export interface IConfigItem {
	fieldName: string;
	parents: string[];
	filter?: IConfigFilter;
	formField?: LookupField
	config?: {
		overrideIfPreviouslyDisabled?: boolean
	}
}

export class ConfigItem implements IConfigItem {
	private formContext: Xrm.FormContext;

	public fieldName: string;
    public parents: string[];
    public filter: IConfigFilter;
	public formField: LookupField;
	public config?: {
		overrideIfPreviouslyDisabled?: boolean
	}

	public constructor(ctx: Xrm.FormContext, obj: IConfigItem) {
		this.parents = obj.parents;
		this.fieldName = obj.fieldName;
		this.config = obj.config;
		this.filter = {
			xml: obj.filter ? obj.filter.xml : '',
			inject_values: obj.filter ? obj.filter.inject_values : [],
		};
		this.formContext = ctx;
		this.formField = new LookupField(ctx, this);
	}
}