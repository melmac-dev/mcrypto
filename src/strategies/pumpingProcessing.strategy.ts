/**
 * @author Vadym Melnyk
 * @email [vadym.melnyk@picard.de]
 * @create date 2022-06-27 13:23:42
 * @modify date 2022-06-27 13:23:42
 * @desc [description]
 */

import ApiBase from '../apiBase';
import { Strategy } from '../types';
// import { PrismaClient } from '@prisma/client';
import Telegram, { Telegram_ParseModes } from '../telegram';
import inPercent from '../helpers/inPercent';

const apiKey = process.env.BINANCE_APIKEY;
const apiSecret = process.env.BINANCE_APISECRET;
const baseURL = process.env.BINANCE_APIURL;
const client = new ApiBase({ apiKey, apiSecret, baseURL });

const bot = new Telegram(process.env.BOT_TOKEN);
const chatId = `@${process.env.CHAT_ID}`;

// const prisma = new PrismaClient();

export class PumpingProcessing implements Strategy {
	private data: any[];

	constructor(data: any[]) {
		this.data = data;
	}

	public async execute() {
		const minutesToAdd = 5;

		for (let i = 0; i < this.data.length; i++) {
			const currentDate = new Date();
			const fiveMinutesAgo = new Date(currentDate.getTime() - minutesToAdd * 60000);
			const currentDateMs = currentDate.getTime();
			const fiveMinutesAgoMs = fiveMinutesAgo.getTime();

			let item = this.data[i];
			try {
				await client
					.publicRequest(
						'GET',
						`/api/v3/klines?symbol=${item}&interval=1m&startTime=${fiveMinutesAgoMs}&endTime=${currentDateMs}`
					)
					.then(async (res) => {
						if (res.data.length > 0) {
							const oneMinuteAgo = (parseFloat(res.data[4][1]) + parseFloat(res.data[4][4])) / 2;
							const twoMinutesAgo = (parseFloat(res.data[3][1]) + parseFloat(res.data[3][4])) / 2;
							const treeMinutesAgo = (parseFloat(res.data[2][1]) + parseFloat(res.data[2][4])) / 2;
							const fourMinutesAgo = (parseFloat(res.data[1][1]) + parseFloat(res.data[1][4])) / 2;
							const fiveMinutesAgo = (parseFloat(res.data[0][1]) + parseFloat(res.data[0][4])) / 2;

							if (fiveMinutesAgo) {
								const checkPercent = inPercent(fiveMinutesAgo, oneMinuteAgo);

								if (Math.sign(checkPercent) === 1 && checkPercent >= 3) {
									if (
										oneMinuteAgo > twoMinutesAgo &&
										twoMinutesAgo > treeMinutesAgo &&
										treeMinutesAgo > fourMinutesAgo &&
										fourMinutesAgo > fiveMinutesAgo
									) {
										bot.send(
											chatId,
											`${item} => is on the rise\n
										[
									    	${oneMinuteAgo},
									    	${twoMinutesAgo},
									    	${treeMinutesAgo},
									    	${fourMinutesAgo},
									    	${fiveMinutesAgo}
										]`
										);
									}
								}
							} else {
								const checkPercent = inPercent(fourMinutesAgo, oneMinuteAgo);

								if (Math.sign(checkPercent) === 1 && checkPercent >= 3) {
									if (
										oneMinuteAgo > twoMinutesAgo &&
										twoMinutesAgo > treeMinutesAgo &&
										treeMinutesAgo > fourMinutesAgo
									) {
										bot.send(
											chatId,
											`${item} => is on the rise\n
										[
									    	${oneMinuteAgo},
									    	${twoMinutesAgo},
									    	${treeMinutesAgo},
									    	${fourMinutesAgo}
										]`
										);
									}
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

export default PumpingProcessing;
