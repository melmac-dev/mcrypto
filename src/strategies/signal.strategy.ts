/**
 * @author Vadym Melnyk
 * @email [vadym.melnyk@picard.de]
 * @create date 2022-06-27 13:23:42
 * @modify date 2022-06-27 13:23:42
 * @desc [description]
 */

import moment from 'moment';
import { Strategy } from '../types';
import { PrismaClient } from '@prisma/client';
import Telegram, { Telegram_ParseModes } from '../telegram';

const bot = new Telegram(process.env.BOT_TOKEN);
const chatId = `@${process.env.CHAT_ID}`;

const prisma = new PrismaClient();

export class SignalSrategy implements Strategy {
	private data: any[];

	constructor(data: any[]) {
		this.data = data;
	}

	public async execute() {
		const oneMinute = moment().subtract(1, 'minute').format('YYYY-MM-DD HH:mm:00');
		const twoMinutes = moment().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:00');
		const fiveMinutes = moment().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:00');
		const fifteenMinutes = moment().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:00');
		const thirtyMinutes = moment().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:00');
		const oneHour = moment().subtract(60, 'minute').format('YYYY-MM-DD HH:mm:00');

		for (const item of this.data) {
			await this.checkData(item, oneMinute, twoMinutes, fiveMinutes, fifteenMinutes, thirtyMinutes, oneHour).then(
				(marketData) => {
					if (
						(marketData[0] >= 5 && Math.sign(marketData[0]) === 1) ||
						(marketData[1] >= 5 && Math.sign(marketData[1]) === 1) ||
						(marketData[2] >= 5 && Math.sign(marketData[2]) === 1) ||
						(marketData[3] >= 5 && Math.sign(marketData[3]) === 1) ||
						(marketData[4] >= 5 && Math.sign(marketData[4]) === 1)
					) {
						let text = `${item} => \n
							2: [${marketData[0]}] \n
							5: [${marketData[1]}] \n
							15: [${marketData[2]}] \n
							30: [${marketData[3]}] \n
							60: [${marketData[4]}]`.toString();
						bot.send(chatId, text);
					}
				}
			);
		}
	}

	isWhatPercentOf(numA: any, numB: any) {
		return (numA / numB) * 100 - 100;
	}

	async checkData(
		pair: string,
		oneMinute: string | number | Date,
		twoMinutes: string | number | Date,
		fiveMinutes: string | number | Date,
		fifteenMinutes: string | number | Date,
		thirtyMinutes: string | number | Date,
		oneHour: string | number | Date
	) {
		let getDataForOneMinute = await prisma.tickerPrice.findMany({
			where: {
				Pair: { contains: pair },
				CreatedAt: {
					in: new Date(oneMinute),
				},
			},
		});

		let getDataForTwoMinutes = await prisma.tickerPrice.findMany({
			where: {
				Pair: { contains: pair },
				CreatedAt: {
					in: new Date(twoMinutes),
				},
			},
		});

		let getDataForFiveMinutes = await prisma.tickerPrice.findMany({
			where: {
				Pair: { contains: pair },
				CreatedAt: {
					in: new Date(fiveMinutes),
				},
			},
		});

		let getDataForFifteenMinutes = await prisma.tickerPrice.findMany({
			where: {
				Pair: { contains: pair },
				CreatedAt: {
					in: new Date(fifteenMinutes),
				},
			},
		});

		let getDataForThirtyMinutes = await prisma.tickerPrice.findMany({
			where: {
				Pair: { contains: pair },
				CreatedAt: {
					in: new Date(thirtyMinutes),
				},
			},
		});

		let getDataForOneHour = await prisma.tickerPrice.findMany({
			where: {
				Pair: { contains: pair },
				CreatedAt: {
					in: new Date(oneHour),
				},
			},
		});

		let percentTwoMinutes = null;
		let percentFiveMinutes = null;
		let percentFifteenMinutes = null;
		let percentThirtyMinutes = null;
		let percentOneHour = null;

		if (getDataForOneMinute.length > 0) {
			percentTwoMinutes =
				getDataForTwoMinutes.length > 0
					? this.isWhatPercentOf(getDataForTwoMinutes[0].Price, getDataForOneMinute[0].Price)
					: null;
			percentFiveMinutes =
				getDataForFiveMinutes.length > 0
					? this.isWhatPercentOf(getDataForFiveMinutes[0].Price, getDataForOneMinute[0].Price)
					: null;
			percentFifteenMinutes =
				getDataForFifteenMinutes.length > 0
					? this.isWhatPercentOf(getDataForFifteenMinutes[0].Price, getDataForOneMinute[0].Price)
					: null;
			percentThirtyMinutes =
				getDataForThirtyMinutes.length > 0
					? this.isWhatPercentOf(getDataForThirtyMinutes[0].Price, getDataForOneMinute[0].Price)
					: null;
			percentOneHour =
				getDataForOneHour.length > 0
					? this.isWhatPercentOf(getDataForOneHour[0].Price, getDataForOneMinute[0].Price)
					: null;
		}

		return [percentTwoMinutes, percentFiveMinutes, percentFifteenMinutes, percentThirtyMinutes, percentOneHour];
	}
}

export default SignalSrategy;
