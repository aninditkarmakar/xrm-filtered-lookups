import { IConfigItem } from "./IConfigItem";
import { StringFormat } from "./Helper";

interface ILookupFieldInitialState {
	disabled: boolean,
	visible: boolean,
	value: Xrm.LookupValue[]
}

export class LookupField {
	private formContext: Xrm.FormContext;
	private formFieldControl: Xrm.Controls.LookupControl;
	private formFieldAttribute: Xrm.Attributes.LookupAttribute;
	private configItem: IConfigItem;
	private customPreSearch: (() => void) | null;
	private initialState: ILookupFieldInitialState;

	public get InitialState(): ILookupFieldInitialState {
		return this.initialState;
	}

	public get ConfigItem(): IConfigItem {
		return this.configItem;
	}

	public get FormFieldControl(): Xrm.Controls.LookupControl {
		return this.formFieldControl;
	}

	public get FormFieldAttribute(): Xrm.Attributes.LookupAttribute {
		return this.formFieldAttribute;
	}

	public get CustomPreSearch(): (() => void) | null {
		return this.customPreSearch;
	}

	public set CustomPreSearch(val: (() => void) | null) {
		this.customPreSearch = val;
	}

	public constructor(ctx: Xrm.FormContext, cfgItem: IConfigItem) {
		this.formContext = ctx;
		this.configItem = cfgItem;
		this.formFieldControl = this.formContext.getControl(cfgItem.fieldName.toLowerCase());
		this.formFieldAttribute = this.formContext.getAttribute(cfgItem.fieldName.toLowerCase());
		this.customPreSearch = null;
		this.initialState = {
			disabled: this.formFieldControl.getDisabled(),
			visible: this.formFieldControl.getVisible(),
			value: this.formFieldAttribute.getValue()
		}
	}

	public onAllInitComplete = function (formContext: Xrm.FormContext, field: LookupField) {
		let flag = true;
		for (let parentField of field.configItem.parents) {
			if (formContext.getAttribute(parentField).getValue() === null) {
				flag = false;
				break;
			}
		}

		if (flag) {
			if (!field.InitialState.disabled === true || field.ConfigItem.config?.overrideIfPreviouslyDisabled === true) {
				field.FormFieldControl.setDisabled(false);
			}

			let customPreSearch = () => {
				var guids: string[] = [];

				if (field.ConfigItem.filter === undefined || field.ConfigItem.filter.xml.length === 0 || field.ConfigItem.filter.xml === null) {
					return;
				}

				for (var injection of field.ConfigItem.filter.inject_values) {
					var lookupAttr = formContext.getAttribute(injection) as Xrm.Attributes.LookupAttribute;
					var lookupValue = lookupAttr.getValue() as Xrm.LookupValue[];

					guids.push(lookupValue[0].id.replace("{", "").replace("}", ""));
				}

				var fetchXml = StringFormat(field.ConfigItem.filter.xml, guids);
				field.FormFieldControl.addCustomFilter(fetchXml);
			}

			if (field.CustomPreSearch !== null) {
				field.FormFieldControl.removePreSearch(field.CustomPreSearch);
			}

			field.CustomPreSearch = customPreSearch;
			field.FormFieldControl.addPreSearch(field.CustomPreSearch);
		}

		else {
			field.FormFieldControl.setDisabled(true);

			if (field.CustomPreSearch !== null) {
				field.FormFieldControl.removePreSearch(field.CustomPreSearch);
				field.CustomPreSearch = null;
			}
		}
	}

	public onAnyFieldChange = function (formContext: Xrm.FormContext, lookupField: LookupField, changedField: string) {
		// This handler is called on change of any of the fields in the 
		// dependency matrix.

		// else, check if all dependencies of the current field is met.
		var flag = true;
		for (var parentField of lookupField.ConfigItem.parents) {
			if (formContext.getAttribute(parentField).getValue() === null) {
				flag = false;
				break;
			}
		}

		// if all other dependencies are met,
		if (flag) {
			// enable the field 
			if (!lookupField.InitialState.disabled === true || lookupField.ConfigItem.config?.overrideIfPreviouslyDisabled === true) {
				lookupField.FormFieldControl.setDisabled(false);
			}
			

			// reconfigure the preFilter;
			var customPreSearch = () => {
				var guids: string[] = [];

				if (lookupField.ConfigItem.filter === undefined || lookupField.ConfigItem.filter.xml.length === 0 || lookupField.ConfigItem.filter.xml === null) {
					return;
				}

				for (var injection of lookupField.ConfigItem.filter.inject_values) {
					var lookupAttr = formContext.getAttribute(injection) as Xrm.Attributes.LookupAttribute;
					var lookupValue = lookupAttr.getValue() as Xrm.LookupValue[];

					guids.push(lookupValue[0].id.replace("{", "").replace("}", ""));
				}

				var fetchXml = StringFormat(lookupField.ConfigItem.filter.xml, guids);
				lookupField.FormFieldControl.addCustomFilter(fetchXml);
			}

			if (lookupField.CustomPreSearch !== null) {
				lookupField.FormFieldControl.removePreSearch(lookupField.CustomPreSearch);
			}

			lookupField.CustomPreSearch = customPreSearch;
			lookupField.FormFieldControl.addPreSearch(lookupField.CustomPreSearch);
		}
		// else
		else {
			// disable the field.
			lookupField.FormFieldControl.setDisabled(true);

			// remove the pre-search filter.
			if (lookupField.CustomPreSearch !== null) {
				lookupField.FormFieldControl.removePreSearch(lookupField.CustomPreSearch);
				lookupField.CustomPreSearch = null;
			}
		}
	}
}