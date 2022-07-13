require('dotenv').config();
import crypto from 'crypto';
import { createRequest, makeQueryString, removeEmptyValue } from './helpers/utils';

class ApiBase {
    apiKey: string;
    apiSecret: string;
    baseURL: string;

    constructor(options: { apiKey: string; apiSecret: string; baseURL: string; }) {
        const { apiKey, apiSecret, baseURL } = options;

        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseURL = baseURL;
    }

    publicRequest(method: string, path: string, params: any = {}) {
		params = removeEmptyValue(params);
		params = makeQueryString(params);
		if (params !== '') {
			path = `${path}?${params}`;
		}
		return createRequest({
			method,
			baseURL: this.baseURL,
			url: path,
			apiKey: this.apiKey,
		});
	}

    protectedRequest(method: string, path: string, params: any = {}) {
		params = removeEmptyValue(params);
		const timestamp = Date.now();
		const queryString = makeQueryString({ ...params, timestamp });
        const signature = crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');

		return createRequest({
			method,
			baseURL: this.baseURL,
			url: `${path}?${queryString}&signature=${signature}`,
			apiKey: this.apiKey,
		});
    }
}

export default ApiBase;
