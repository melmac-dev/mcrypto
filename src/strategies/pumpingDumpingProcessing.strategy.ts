/**
 * @author Vadym Melnyk
 * @email [vadym.melnyk@picard.de]
 * @create date 2022-06-27 13:23:42
 * @modify date 2022-06-27 13:23:42
 * @desc [description]
 */

import ApiBase from '../apiBase';
import { Strategy } from '../types';
import Telegram from '../telegram';
import inPercent from '../helpers/inPercent';
import { isBoost, isDowngrade } from '../helpers/utils';

const apiKey = process.env.BINANCE_APIKEY;
const apiSecret = process.env.BINANCE_APISECRET;
const baseURL = process.env.BINANCE_APIURL;
const client = new ApiBase({ apiKey, apiSecret, baseURL });

const bot = new Telegram(process.env.BOT_TOKEN);
const chatId = `@${process.env.CHAT_ID}`;

export class PumpingDumpingProcessing implements Strategy {
	private minutesAgo: number;
	private positivePercent: number;
	private negativePercent: number;
	private data: any[];

	constructor(minutesAgo: number, positivePercent: number, negativePercent: number, data: any[]) {
		this.minutesAgo = minutesAgo;
		this.positivePercent = positivePercent;
		this.negativePercent = negativePercent;
		this.data = data;
	}

	public async execute() {
		for (let i = 0; i < this.data.length; i++) {
			const currentDate = new Date();
			const specifiedMinutesAgo = new Date(currentDate.getTime() - this.minutesAgo * 60000);
			const currentDateMs = currentDate.getTime();
			const specifiedMinutesAgoMs = specifiedMinutesAgo.getTime();

			let item = this.data[i];

			try {
				await client
					.publicRequest(
						'GET',
						`/api/v3/klines?symbol=${item}&interval=1m&startTime=${specifiedMinutesAgoMs}&endTime=${currentDateMs}`
					)
					.then(async (res) => {
						if (res.data.length > 0) {
							// console.log(res.data);
							let minutesArray = [];
							for (let index = 0; index < res.data.length; index++) {
								const open = res.data[index][1];
								const close = res.data[index][4];
								const summe = parseFloat(open) + parseFloat(close) / 2;

								minutesArray.unshift(summe);
							}

							// console.log('minutesArray', minutesArray);

							const checkPercent = inPercent(minutesArray[0], minutesArray[minutesArray.length - 1]);

							let sendMessage = minutesArray.join('\r\n');

							if (Math.sign(checkPercent) === 1) {
								// if (isBoost(minutesArray) === true) {
								if (checkPercent >= 3) {
									bot.send(
										chatId,
										`${item} => is on the rise\r\n
										${checkPercent.toFixed(2)}%\r\n
										${sendMessage}`
									);
								}
							}

							if (Math.sign(checkPercent) === -1) {
								// if (isDowngrade(minutesArray) === true) {
								if (checkPercent <= -1) {
									bot.send(
										chatId,
										`${item} => is on the way down\r\n
										${checkPercent.toFixed(2)}%\r\n
										${sendMessage}`
									);
								}
							}
						}
					});
			} catch (error) {
				console.log(error);
			}
		}
	}
}

export default PumpingDumpingProcessing;
