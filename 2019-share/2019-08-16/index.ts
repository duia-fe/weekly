
interface Cai {
	taste(): void;
}

// 还是有一道麻婆豆腐
class Tofu implements Cai {
	name: string;
	constructor() {
		this.name = '麻婆豆腐';
	}
	taste() {
		console.log(`${this.name}尝起来是麻辣的豆腐`);
	}
}
// 还是有一道土豆丝
class PotatoSilk implements Cai {
	name: string;
	constructor() {
		this.name = '青椒土豆丝';
	}
	taste() {
		console.log(`${this.name}尝起来是土豆的味道`);
	}
}
// 然后还是有一道回锅肉
class TwiceCookedPork implements Cai {
	name: string;
	constructor() {
		this.name = '回锅肉';
	}
	taste() {
		console.log(`${this.name}尝起来是甜甜的，猪肉的味道，可能还是得了猪瘟的`);
	}
}
// 然后还是有一道泡脚鸡杂
class HickenGiblets implements Cai {
	name: string;
	constructor() {
		this.name = '泡脚鸡杂';
	}
	taste() {
		console.log(`${this.name}尝起来是酸酸的味道，脆脆的鸡郡肝、鸡肠`);
	}
}

interface CookFactory {
	cook(name: string): Cai
}

// 然后有会炒素菜的厨师
class VegetableCookFactory implements CookFactory {
	cook(name: string): Cai {
		switch (name) {
			case 'tofu':
				return new Tofu();
			case 'potatoSilk':
				return new PotatoSilk();
		}
	}
}

// 然后有会炒荤菜的厨师
class MeatDishesCookFactory implements CookFactory {
	cook(name: string): Cai {
		switch (name) {
			case 'twiceCookedPork':
				return new TwiceCookedPork();
			case 'hickenGiblets':
				return new HickenGiblets();
		}
	}
}

let cookFactory1: CookFactory = new MeatDishesCookFactory(); // 一个炒素菜的厨师
let cookFactory2: CookFactory = new VegetableCookFactory(); // 一个炒荤菜的厨师

//荤菜的厨师先炒肉
let cai1: Cai = cookFactory1.cook('twiceCookedPork'); //荤菜厨师炒了一个回锅肉
let cai2: Cai = cookFactory1.cook('hickenGiblets'); // 荤菜厨师又炒了一个泡脚鸡杂

//上了一个回锅肉，开始尝尝
cai1.taste(); //回锅肉尝起来是甜甜的，猪肉的味道，可能还是得了猪瘟的
//又上了一个泡脚鸡杂，开始尝尝
cai2.taste(); //泡脚鸡杂尝起来是酸酸的味道，脆脆的鸡郡肝、鸡肠

//素菜厨师也接着炒
let cai3: Cai = cookFactory2.cook('tofu'); //素菜厨师炒了一个你们要的麻婆豆腐
let cai4: Cai = cookFactory2.cook('potatoSilk'); // 素菜厨师又炒了一个土豆丝

//上了一个麻婆豆腐，开始尝尝
cai3.taste(); //麻婆豆腐尝起来是麻辣的豆腐
//又上了一个土豆丝，开始尝尝
cai4.taste(); //青椒土豆丝尝起来是土豆的味道

//https://www.tslang.cn/play/index.html