import ApiBase from './apiBase';
import { PrismaClient } from '@prisma/client';
import { Contract } from './strategies/contract';
import SignalSrategy from './strategies/signal.strategy';
import moment from 'moment';
import PumpingProcessing from './strategies/pumpingProcessing.strategy';
import Telegram, { Telegram_ParseModes } from './telegram';
import PumpingDumpingProcessing from './strategies/pumpingDumpingProcessing.strategy';
import TurnUp from './strategies/turnUp.strategy';

const prisma = new PrismaClient();
const apiKey = process.env.BINANCE_APIKEY;
const apiSecret = process.env.BINANCE_APISECRET;
const baseURL = process.env.BINANCE_APIURL;
const client = new ApiBase({ apiKey, apiSecret, baseURL });

const bot = new Telegram(process.env.BOT_TOKEN);
const chatId = `@${process.env.CHAT_ID}`;

class App {
	client: ApiBase;

	constructor() {
		this.init();
		this.showNewPairs();
		// this.TurnUpSignal();
		this.GetPumpingDumping();

		setInterval(() => {
			// this.TurnUpSignal();
			this.GetPumpingDumping();
		}, 60000);

		setInterval(() => {
			this.init();
			this.showNewPairs();
		}, 600000);
	}

	async init() {
		try {
			await client.publicRequest('GET', '/api/v3/ticker/price').then(async (res) => {
				let responseData: any = res.data.filter(
					(item: { symbol: string | string[] }) =>
						item.symbol.includes('EUR') || item.symbol.includes('BUSD') || item.symbol.includes('USDT')
				);

				responseData.forEach(async (item: { symbol: string | string[] }) => {
					let newPair: string = item.symbol.toString();

					await prisma.pairs.upsert({
						where: {
							Pair: newPair,
						},
						update: {},
						create: {
							Pair: newPair,
							CreatedAt: new Date(moment().format('YYYY-MM-DD HH:mm:ss')),
						},
					});
				});
			});
		} catch (error) {
			console.log(error);
		}

		// try {
		//     await  client.protectedRequest('GET', '/api/v3/account').then(res => {
		//         console.log(res.data);
		//     });
		// } catch (error) {
		//     console.log(error);
		// }
	}

	async init2() {
		try {
			await client.publicRequest('GET', '/api/v3/exchangeInfo').then(async (res) => {
				console.log(res.data);
			});
		} catch (error) {
			console.log(error);
		}

		// try {
		//     await  client.protectedRequest('GET', '/api/v3/account').then(res => {
		//         console.log(res.data);
		//     });
		// } catch (error) {
		//     console.log(error);
		// }
	}

	async showNewPairs() {
		const today = new Date(moment().subtract(10, 'minute').format('YYYY-MM-DD HH:mm:00'));
		try {
			const newPairs = await prisma.pairs.findMany({
				where: {
					CreatedAt: {
						gt: today,
					},
				},
			});

			newPairs.forEach((value: any) => {
				bot.send(chatId, `${value.Pair} => new pair`);
			});
		} catch (error) {
			console.log(error);
		}
	}

	async savePrice() {
		try {
			await client.publicRequest('GET', '/api/v3/ticker/price').then(async (res) => {
				let responseData: any = res.data.filter(
					(item: { symbol: string | string[] }) =>
						item.symbol.includes('EUR') || item.symbol.includes('BUSD') || item.symbol.includes('USDT')
				);

				responseData.forEach(async (item: { symbol: string | string[]; price: number }) => {
					let pair: string = item.symbol.toString();
					let price: number = Number(item.price);

					await prisma.tickerPrice.create({
						data: {
							Pair: pair,
							Price: price,
							CreatedAt: new Date(moment().format('YYYY-MM-DD HH:mm:00')),
						},
					});
				});
			});
		} catch (error) {
			console.log(error);
		}
	}

	async GetPumpingDumping() {
		try {
			const pairs = (await prisma.pairs.findMany()).map((row: { Pair: any }) => {
				return row.Pair;
			});

			const contract: Contract = new Contract(new PumpingDumpingProcessing(5, 5, -1, pairs));
			// const contract: Contract = new Contract(new PumpingProcessing(pairs));
			contract.executeStrategy();
		} catch (error) {
			console.log(error);
		}
	}

	async TurnUpSignal() {
		try {
			const pairs = (await prisma.pairs.findMany()).map((row: { Pair: any }) => {
				return row.Pair;
			});

			const contract: Contract = new Contract(new TurnUp(pairs));
			contract.executeStrategy();
		} catch (error) {
			console.log(error);
		}
	}

	async doSignalStrategy() {
		try {
			const pairs = (await prisma.pairs.findMany()).map((row) => {
				return row.Pair;
			});

			const contract: Contract = new Contract(new SignalSrategy(pairs));
			contract.executeStrategy();
		} catch (error) {
			console.log(error);
		}
	}
}

export default App;
