export interface IAPIparams {
	method: string;
	path: string;
	params: any;
}

export interface Strategy {
	execute(): void;
}
