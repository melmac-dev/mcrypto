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

const apiKey = process.env.BINANCE_APIKEY;
const apiSecret = process.env.BINANCE_APISECRET;
const baseURL = process.env.BINANCE_APIURL;
const client = new ApiBase({ apiKey, apiSecret, baseURL });

const bot = new Telegram(process.env.BOT_TOKEN);
const chatId = `@${process.env.CHAT_ID}`;

export class TurnUp implements Strategy {
	private data: any[];

	constructor(data: any[]) {
		this.data = data;
	}

	public async execute() {
		for (let i = 0; i < this.data.length; i++) {
			let item = this.data[i];

			try {
				await client
					.publicRequest('GET', `/api/v3/klines?symbol=${item}&interval=1m&limit=5`)
					.then(async (res) => {
						if (res.data.length > 0) {
							let priceArray = res.data.map((element: any, index: number) => {
								return (res.data[index] = (parseFloat(element[1]) + parseFloat(element[4])) / 2);
							});

							// let priceArray = [5, 4, 3, 1, 3];
							if (
								priceArray[0] > priceArray[2] &&
								priceArray[1] > priceArray[2] &&
								priceArray[3] > priceArray[2] &&
								priceArray[4] > priceArray[2]
							) {
								let sendMessage = priceArray.join('\r\n');
								bot.send(
									chatId,
									`${item} => TURN UP\r\n
										${sendMessage}`
								);
							}
						}
					});
			} catch (error) {
				console.log(error);
			}
		}
	}
}

export default TurnUp;
