export function StringFormat(formatString: string, replacements: string[]): string {
	return formatString.replace(/{(\d+)}/g, function (match, number) {
		return typeof replacements[number] != 'undefined'
			? replacements[number]
			: match
			;
	});
}