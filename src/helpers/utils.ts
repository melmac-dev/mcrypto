import axios from 'axios';
import { Console } from 'console';

const removeEmptyValue = (obj) => {
	if (!(obj instanceof Object)) return {};
	Object.keys(obj).forEach((key) => isEmptyValue(obj[key]) && delete obj[key]);
	return obj;
};

const isEmptyValue = (input: any) => {
	/**
	 * Scope of empty value: falsy value (except for false and 0),
	 * string with white space characters only, empty object, empty array
	 */
	return (
		(!input && input !== false && input !== 0) ||
		(typeof input === 'string' && /^\s+$/.test(input)) ||
		(input instanceof Object && !Object.keys(input).length) ||
		(Array.isArray(input) && !input.length)
	);
};

const buildQueryString = (params) => {
	if (!params) return '';
	return Object.entries(params).map(stringifyKeyValuePair).join('&');
};

const makeQueryString = (q) =>
	q
		? `${Object.keys(q)
				.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
				.join('&')}`
		: '';

/**
 * NOTE: The array conversion logic is different from usual query string.
 * E.g. symbols=["BTCUSDT","BNBBTC"] instead of symbols[]=BTCUSDT&symbols[]=BNBBTC
 */
const stringifyKeyValuePair = ([key, value]) => {
	const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value;
	return `${key}=${encodeURIComponent(valueString)}`;
};

const getRequestInstance = (config) => {
	return axios.create({
		...config,
	});
};

const createRequest = (config: { method: string; baseURL: string; url: string; apiKey: string }) => {
	const { baseURL, apiKey, method, url } = config;
	return getRequestInstance({
		baseURL,
		headers: {
			'Content-Type': 'application/json',
			'X-MBX-APIKEY': apiKey,
		},
	}).request({
		method,
		url,
	});
};

const isBoost = (data: number[]) => {
	let length = data.length;
	return data.every(function (value, index) {
		let nextIndex = index + 1;
		return nextIndex < length ? value >= data[nextIndex] : true;
	});
};

const isDowngrade = (data: number[]) => {
	let length = data.length;
	return data.every(function (value, index) {
		let nextIndex = index + 1;
		return nextIndex < length ? value <= data[nextIndex] : true;
	});
};

const isTurn = (data: number[]) => {
	let length = data.length;
	return data.every(function (value, index) {
		let nextIndex = index + 1;
		return nextIndex < length ? value >= data[nextIndex] : true;
	});
};

const defaultLogger = new Console({
	stdout: process.stdout,
	stderr: process.stderr,
});

export {
	removeEmptyValue,
	isEmptyValue,
	makeQueryString,
	getRequestInstance,
	createRequest,
	defaultLogger,
	isBoost,
	isDowngrade,
	isTurn,
};
