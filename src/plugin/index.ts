import { parse } from "./wrapper";

const printer = {
	print(path: any) {
		const node = path.getValue();
		return JSON.stringify(node, null, 2);
	}
};

export default {
	parsers: {
		deva: {
			parse,
			astFormat: "deva-ast"
		}
	},
	printers: {
		"deva-ast": printer
	}
};