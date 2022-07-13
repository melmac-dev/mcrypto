/**
 * @author Vadym Melnyk
 * @email [vadym.melnyk@picard.de]
 * @create date 2022-06-27 13:03:34
 * @modify date 2022-06-27 13:03:34
 * @desc [description]
 */

import { Strategy } from '../types';

export class Contract {
	private strategy: Strategy;

	constructor(strategy: Strategy) {
		this.strategy = strategy;
	}

	public executeStrategy(): void {
		this.strategy.execute();
	}
}
