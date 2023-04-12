import { Action, action, computed, Computed, createStore, createTypedHooks, Thunk, thunk } from 'easy-peasy';
import { Lucid, PaymentKeyHash, UTxO, WalletApi } from "lucid-cardano";
import { apiGetCountStakingPoolsForAdminFromDB } from '../stakePool/apis';
import { BIGINT } from "../types";
import { getCountStakingPoolsForAdminFromDB } from '../types/stakePoolDBModel';
import { getTotalOfUnitInWallet } from './cardano-helpers';
import { connect } from './dbConnect';

//------------------------------------

export interface Wallet {
	connected: boolean, 
	name: string, 
	walletApi: WalletApi | undefined,
	pkh: PaymentKeyHash | undefined,
	lucid: Lucid | undefined,
	swEnviarPorBlockfrost: boolean, 
	protocolParameters: any

}

interface AppStoreModel {
		wallet: Wallet,
		setWallet: Action<AppStoreModel, Wallet>,

		loadWalletData: Thunk<AppStoreModel, Wallet>,

		isWalletDataLoaded: boolean,
		setIsWalletDataLoaded: Action<AppStoreModel, boolean>,

		uTxOsAtWallet: UTxO [] ,
		setUTxOsAtWallet: Action<AppStoreModel, UTxO []>,

		swWalletIsAdminOfSomePool: Boolean
		setSwWalletIsAdminOfSomePool: Action<AppStoreModel, Boolean>

		walletGetTotalOfUnit: Computed<AppStoreModel, (unit: string) => BIGINT>

}

export const storeWallet = createStore<AppStoreModel> (({ 

	wallet : {connected: false, name: '', walletApi: undefined, pkh : "", lucid: undefined, swEnviarPorBlockfrost: false, protocolParameters: undefined},

	setWallet: action((state, newWallet) => {
		// console.log("storeWallet - setWallet: " + toJson(newWallet.name))

		state.wallet = newWallet 
		state.isWalletDataLoaded = false 
		state.uTxOsAtWallet = []
		state.swWalletIsAdminOfSomePool = false
	}),

	isWalletDataLoaded: false,
	setIsWalletDataLoaded: action((state, isLoaded) => { 
		state.isWalletDataLoaded = isLoaded 
	}),

	uTxOsAtWallet: [],
	setUTxOsAtWallet: action((state, newUTxOs) => {
		state.uTxOsAtWallet = newUTxOs
	}),

	swWalletIsAdminOfSomePool: false,
	setSwWalletIsAdminOfSomePool: action((state, swWalletIsAdminOfSomePool) => {
		state.swWalletIsAdminOfSomePool = swWalletIsAdminOfSomePool
	}),
	
	loadWalletData: thunk(async (actions, wallet) => {

		// console.log("storeWallet - loadWalletData - state.wallet.walletApi: " + toJson(wallet.walletApi))

		actions.setIsWalletDataLoaded(false)

		const lucid = wallet.lucid
		
		const utxosAtWallet = await lucid!.wallet?.getUtxos();
		actions.setUTxOsAtWallet(utxosAtWallet!) 
		//console.log("storeWallet - loadWalletData - state.uTxOsAtWallet length: " + utxosAtWallet.length)
		if (utxosAtWallet.length == 0) {
			console.log("storeWallet - loadWalletData: There are no UTxOs available in your Wallet");
		}
		
		const countAdminStakingPool  = await apiGetCountStakingPoolsForAdminFromDB(wallet.pkh!)
		const swStakingPoolAdmin = countAdminStakingPool > 0
		actions.setSwWalletIsAdminOfSomePool(swStakingPoolAdmin)

		actions.setIsWalletDataLoaded(true)

	}),

	walletGetTotalOfUnit: computed(state => (unit: string) => {
		return getTotalOfUnitInWallet(unit, state.uTxOsAtWallet);
	}),
	
}))

const { useStoreActions, useStoreState, useStoreDispatch, useStore } = createTypedHooks<AppStoreModel>()

export {
	useStoreActions,
	useStoreState,
	useStoreDispatch,
	useStore
};


//------------------------------------

