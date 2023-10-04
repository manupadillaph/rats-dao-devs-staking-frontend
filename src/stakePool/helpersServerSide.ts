import path from 'path';

import { CurrencySymbol, EUTxO, InterestRate, InterestRateV1, InterestRateV2, InterestRates, Maybe, PoolDatum, PoolParams, PoolParamsV1, PoolParamsV2, UserDatum } from '../types';
import { fundID_TN, poolDatum_ClaimedFund, poolID_TN, scriptID_Master_AddScripts_TN, scriptID_Master_ClosePool_TN, scriptID_Master_DeleteFund_TN, scriptID_Master_DeleteScripts_TN, scriptID_Master_FundAndMerge_TN, scriptID_Master_Fund_TN, scriptID_Master_SendBackDeposit_TN, scriptID_Master_SendBackFund_TN, scriptID_Master_SplitFund_TN, scriptID_Master_TerminatePool_TN, scriptID_User_Deposit_TN, scriptID_User_Harvest_TN, scriptID_User_Withdraw_TN, scriptID_Validator_TN, scriptID_TN, userID_TN, scriptID_Master_Emergency_TN, TIME_OUT_TRY_UPDATESTAKINGPOOL } from '../types/constantes';
import { deleteEUTxOsFromDBByAddress, deleteEUTxOsFromDBByTxHashAndIndex, deleteEUTxOsFromDBPreparingOrConsumingByAddress, getEUTxODBModel, getEUTxOFromDBByTxHashAndIndex, getEUTxOsFromDBByAddress, updateEUTxOsFromDBPreparingOrConsumingByAddress } from '../types/eUTxODBModel';
import { getStakingPoolDBModel, StakingPoolDBInterface } from '../types/stakePoolDBModel';

import { apiDeleteEUTxOsDBByStakingPool, apiSaveEUTxODB } from "./apis";
import { initializeLucid } from '../utils/initializeLucid';
import { isEqual, strToHex, toJson } from '../utils/utils';
import { getMissingEUTxOsInDB, getEUTxO_With_PoolDatum_InEUxTOList, getEUTxOs_With_FundDatum_InEUxTOList, getEUTxOs_With_UserDatum_InEUxTOList, getEUTxOs_With_UserDatum_InEUxTOList_OfUser, getEUTxO_With_ScriptDatum_InEUxTOList, eUTxODBParser, getExtraEUTxOsInDB, getEUTxO_With_AnyScriptDatum_InEUxTOList } from './helpersEUTxOs';
import { getTotalFundAmount, getTotalMastersMinAda_In_EUTxOs_With_UserDatum, sortFundDatum, getTotalAvailableFunds, getTotalFundAmountsRemains_ForMasters, getTotalCashedOut, getTotalStakedAmount, getTotalRewardsToPay_In_EUTxOs_With_UserDatum, getTotalUsersMinAda_In_EUTxOs_With_UserDatum, getIfUserRegistered, getUserStaked, getUserRewardsPaid, getUserRewardsToPay } from './helpersStakePool';
import { getScriptFromFile, getTextFromFile, mkdir, rmdir } from '../utils/utilsServerSide';
import { Lucid, MintingPolicy, SpendingValidator, UTxO } from 'lucid-cardano';
import JSZip from 'jszip';
import { getTxCountBlockchain } from '../utils/cardano-helpersTx';
//---------------------------------------------------------------
const fs = require('fs/promises');
//---------------------------------------------------------------

export async function crearFileListForZip (nombrePool: any, image: any, staking_UI: any, harvest_UI: any, staking_Decimals: any, harvest_Decimals: any) {
	try {
		
		const mainJsonFileName = 'main.json';

		//create a json with this field filled with the values:
		//nombrePool, image, staking_UI, harvest_UI, staking_Decimals, harvest_Decimals

		const mainJson = 
		{
			"nombrePool": nombrePool,
			"image": image,
			"staking_UI": staking_UI,
			"harvest_UI": harvest_UI,
			"staking_Decimals": staking_Decimals,
			"harvest_Decimals": harvest_Decimals
		}

		await createMainJsonFile (nombrePool + "/" + mainJsonFileName, mainJson);

		const pabPoolParamsJsonFileName = 'PABPoolParams-HEX.json';

		const stakePlusV2AddrFileName = process.env.NEXT_PUBLIC_USE_MAINNET === 'true' ? 'Validator-Mainnet.addr' : 'Validator-Testnet.addr';

		const stakePlusV2Plutus_FileName = 'Validator.plutus';

		// const stakePlusV2_Mint_PoolID_Symbol_FileName = 'Mint_PoolID.symbol';
		const stakePlusV2_Mint_PoolID_Plutus_FileName = 'Mint_PoolID.plutus';

		// const stakePlusV2_Mint_TxID_Master_Fund_Symbol_FileName = 'Mint_TxID_Master_Fund.symbol';
		const stakePlusV2_Mint_TxID_Master_Fund_Plutus_FileName = 'Mint_TxID_Master_Fund.plutus';

		// const stakePlusV2_Mint_TxID_Master_FundAndMerge_Symbol_FileName = 'Mint_TxID_Master_FundAndMerge.symbol';
		const stakePlusV2_Mint_TxID_Master_FundAndMerge_Plutus_FileName = 'Mint_TxID_Master_FundAndMerge.plutus';

		// const stakePlusV2_Mint_TxID_Master_SplitFund_Symbol_FileName = 'Mint_TxID_Master_SplitFund.symbol';
		const stakePlusV2_Mint_TxID_Master_SplitFund_Plutus_FileName = 'Mint_TxID_Master_SplitFund.plutus';

		// const stakePlusV2_Mint_TxID_Master_ClosePool_Symbol_FileName = 'Mint_TxID_Master_ClosePool.symbol';
		const stakePlusV2_Mint_TxID_Master_ClosePool_Plutus_FileName = 'Mint_TxID_Master_ClosePool.plutus';

		// const stakePlusV2_Mint_TxID_Master_TerminatePool_Symbol_FileName = 'Mint_TxID_Master_TerminatePool.symbol';
		const stakePlusV2_Mint_TxID_Master_TerminatePool_Plutus_FileName = 'Mint_TxID_Master_TerminatePool.plutus';

		// const stakePlusV2_Mint_TxID_Master_Emergency_Symbol_FileName = 'Mint_TxID_Master_Emergency.symbol';
		const stakePlusV2_Mint_TxID_Master_Emergency_Plutus_FileName = 'Mint_TxID_Master_Emergency.plutus';

		// const stakePlusV2_Mint_TxID_Master_DeleteFund_Symbol_FileName = 'Mint_TxID_Master_DeleteFund.symbol';
		const stakePlusV2_Mint_TxID_Master_DeleteFund_Plutus_FileName = 'Mint_TxID_Master_DeleteFund.plutus';

		// const stakePlusV2_Mint_TxID_Master_SendBackFund_Symbol_FileName = 'Mint_TxID_Master_SendBackFund.symbol';
		const stakePlusV2_Mint_TxID_Master_SendBackFund_Plutus_FileName = 'Mint_TxID_Master_SendBackFund.plutus';

		// const stakePlusV2_Mint_TxID_Master_SendBackDeposit_Symbol_FileName = 'Mint_TxID_Master_SendBackDeposit.symbol';
		const stakePlusV2_Mint_TxID_Master_SendBackDeposit_Plutus_FileName = 'Mint_TxID_Master_SendBackDeposit.plutus';

		// const stakePlusV2_Mint_TxID_Master_AddScripts_Symbol_FileName = 'Mint_TxID_Master_AddScripts.symbol';
		const stakePlusV2_Mint_TxID_Master_AddScripts_Plutus_FileName = 'Mint_TxID_Master_AddScripts.plutus';

		// const stakePlusV2_Mint_TxID_Master_DeleteScripts_Symbol_FileName = 'Mint_TxID_Master_DeleteScripts.symbol';
		const stakePlusV2_Mint_TxID_Master_DeleteScripts_Plutus_FileName = 'Mint_TxID_Master_DeleteScripts.plutus';

		// const stakePlusV2_Mint_TxID_User_Deposit_Symbol_FileName = 'Mint_TxID_User_Deposit.symbol';
		const stakePlusV2_Mint_TxID_User_Deposit_Plutus_FileName = 'Mint_TxID_User_Deposit.plutus';

		// const stakePlusV2_Mint_TxID_User_Harvest_Symbol_FileName = 'Mint_TxID_User_Harvest.symbol';
		const stakePlusV2_Mint_TxID_User_Harvest_Plutus_FileName = 'Mint_TxID_User_Harvest.plutus';

		// const stakePlusV2_Mint_TxID_User_Withdraw_Symbol_FileName = 'Mint_TxID_User_Withdraw.symbol';
		const stakePlusV2_Mint_TxID_User_Withdraw_Plutus_FileName = 'Mint_TxID_User_Withdraw.plutus';

		//add all the files to an array
		const files = [

			mainJsonFileName,

			pabPoolParamsJsonFileName,
			stakePlusV2AddrFileName,
			stakePlusV2Plutus_FileName,
			// stakePlusV2_Mint_PoolID_Symbol_FileName,
			stakePlusV2_Mint_PoolID_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_Fund_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_Fund_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_FundAndMerge_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_FundAndMerge_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_SplitFund_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_SplitFund_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_ClosePool_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_ClosePool_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_TerminatePool_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_TerminatePool_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_Emergency_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_Emergency_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_DeleteFund_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_DeleteFund_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_SendBackFund_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_SendBackFund_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_SendBackDeposit_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_SendBackDeposit_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_AddScripts_Symbol_FileName,
			stakePlusV2_Mint_TxID_Master_AddScripts_Plutus_FileName,
			// stakePlusV2_Mint_TxID_Master_DeleteScripts_Symbol_FileName
			stakePlusV2_Mint_TxID_Master_DeleteScripts_Plutus_FileName,
			// stakePlusV2_Mint_TxID_User_Deposit_Symbol_FileName,
			stakePlusV2_Mint_TxID_User_Deposit_Plutus_FileName,
			// stakePlusV2_Mint_TxID_User_Harvest_Symbol_FileName,
			stakePlusV2_Mint_TxID_User_Harvest_Plutus_FileName,
			// stakePlusV2_Mint_TxID_User_Withdraw_Symbol_FileName,
			stakePlusV2_Mint_TxID_User_Withdraw_Plutus_FileName
		];

		const filesData = files.map((file) => {
			const fileData = {
				name: file,
				url: process.env.NEXT_PUBLIC_REACT_SERVER_URL! + "/scripts/" + nombrePool + "/" + file,
				type: file.split(".")[1],
			};

			return fileData;
		});

		// console.log("crearFileListForZip - StakingPool File list for Zip created!");
		return filesData;

	} catch (error) {
		throw "Can't create StakingPool File list for Zip - Error: " + error
	}
}

export async function createStakingPoolFilesFromZip (nombrePool: string, zip: JSZip){
	try{
		const filepath = process.env.REACT_SERVER_PATH_FOR_SCRIPTS! + "/" + nombrePool + "/" 
		await rmdir (filepath)
		await mkdir (filepath)
		const keys = Object.keys(zip.files)
		for (let index = 0; index < keys.length; index++) {
			const filename = keys[index];
			const fileInZIp =  zip.file(filename)
			if (fileInZIp){
				const content = await fileInZIp.async('nodebuffer')
				await fs.writeFile(path.join(filepath, filename), content, 'utf8', function (error: any) {
					if (error) {
						throw "Can't save file "+filename+" - Error: " + error
					}
				});
				// console.log("File "+filename+" has been saved.");

			}else{
				throw "File "+filename+" not found"
			}
		}
	} catch (error) {
		throw "Can't create files - Error: " + error
	}

}

export async function crearStakingPoolFromFiles(nombrePool: any, image: any, staking_UI: any, harvest_UI: any, staking_Decimals: any, harvest_Decimals: any) {
	
    try{

        console.log("crearStakingPoolFromFiles - stakingPoolDB: " + toJson(nombrePool));

        const pabPoolParamsJsonFileName = nombrePool + "/" + 'PABPoolParams-HEX.json';

        const stakePlusV2AddrFileName = process.env.NEXT_PUBLIC_USE_MAINNET === 'true' ? nombrePool + "/" + 'Validator-Mainnet.addr' : nombrePool + "/" + 'Validator-Testnet.addr';

        const stakePlusV2Plutus_FileName = nombrePool + "/" + 'Validator.plutus';

        // const stakePlusV2_Mint_PoolID_Symbol_FileName = nombrePool + "/" + 'Mint_PoolID.symbol';
        const stakePlusV2_Mint_PoolID_Plutus_FileName = nombrePool + "/" + 'Mint_PoolID.plutus';

        // const stakePlusV2_Mint_TxID_Master_Fund_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_Fund.symbol';
        const stakePlusV2_Mint_TxID_Master_Fund_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_Fund.plutus';

        // const stakePlusV2_Mint_TxID_Master_FundAndMerge_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_FundAndMerge.symbol';
        const stakePlusV2_Mint_TxID_Master_FundAndMerge_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_FundAndMerge.plutus';

        // const stakePlusV2_Mint_TxID_Master_SplitFund_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_SplitFund.symbol';
        const stakePlusV2_Mint_TxID_Master_SplitFund_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_SplitFund.plutus';

        // const stakePlusV2_Mint_TxID_Master_ClosePool_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_ClosePool.symbol';
        const stakePlusV2_Mint_TxID_Master_ClosePool_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_ClosePool.plutus';

        // const stakePlusV2_Mint_TxID_Master_TerminatePool_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_TerminatePool.symbol';
        const stakePlusV2_Mint_TxID_Master_TerminatePool_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_TerminatePool.plutus';

        // const stakePlusV2_Mint_TxID_Master_Emergency_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_Emergency.symbol';
        const stakePlusV2_Mint_TxID_Master_Emergency_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_Emergency.plutus';

        // const stakePlusV2_Mint_TxID_Master_DeleteFund_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_DeleteFund.symbol';
        const stakePlusV2_Mint_TxID_Master_DeleteFund_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_DeleteFund.plutus';

        // const stakePlusV2_Mint_TxID_Master_SendBackFund_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_SendBackFund.symbol';
        const stakePlusV2_Mint_TxID_Master_SendBackFund_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_SendBackFund.plutus';

        // const stakePlusV2_Mint_TxID_Master_SendBackDeposit_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_SendBackDeposit.symbol';
        const stakePlusV2_Mint_TxID_Master_SendBackDeposit_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_SendBackDeposit.plutus';

        // const stakePlusV2_Mint_TxID_Master_AddScripts_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_AddScripts.symbol';
        const stakePlusV2_Mint_TxID_Master_AddScripts_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_AddScripts.plutus';

        // const stakePlusV2_Mint_TxID_Master_DeleteScripts_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_Master_DeleteScripts.symbol';
        const stakePlusV2_Mint_TxID_Master_DeleteScripts_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_Master_DeleteScripts.plutus';

        // const stakePlusV2_Mint_TxID_User_Deposit_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_User_Deposit.symbol';
        const stakePlusV2_Mint_TxID_User_Deposit_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_User_Deposit.plutus';

        // const stakePlusV2_Mint_TxID_User_Harvest_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_User_Harvest.symbol';
        const stakePlusV2_Mint_TxID_User_Harvest_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_User_Harvest.plutus';

        // const stakePlusV2_Mint_TxID_User_Withdraw_Symbol_FileName = nombrePool + "/" + 'Mint_TxID_User_Withdraw.symbol';
        const stakePlusV2_Mint_TxID_User_Withdraw_Plutus_FileName = nombrePool + "/" + 'Mint_TxID_User_Withdraw.plutus';

        var pabPoolParams: any;

        var stakePlusV2Addr: string;
        var stakePlusV2Script: SpendingValidator;

        var poolID_CS: CurrencySymbol;
        var poolID_Script: MintingPolicy;

        var txID_Master_Fund_CS: CurrencySymbol;
        var txID_Master_Fund_Script: MintingPolicy;

        var txID_Master_FundAndMerge_CS: CurrencySymbol;
        var txID_Master_FundAndMerge_Script: MintingPolicy;

        var txID_Master_SplitFund_CS: CurrencySymbol;
        var txID_Master_SplitFund_Script: MintingPolicy;

        var txID_Master_ClosePool_CS: CurrencySymbol;
        var txID_Master_ClosePool_Script: MintingPolicy;

        var txID_Master_TerminatePool_CS: CurrencySymbol;
        var txID_Master_TerminatePool_Script: MintingPolicy;

        var txID_Master_Emergency_CS: CurrencySymbol;
        var txID_Master_Emergency_Script: MintingPolicy;

        var txID_Master_DeleteFund_CS: CurrencySymbol;
        var txID_Master_DeleteFund_Script: MintingPolicy;

        var txID_Master_SendBackFund_CS: CurrencySymbol;
        var txID_Master_SendBackFund_Script: MintingPolicy;

        var txID_Master_SendBackDeposit_CS: CurrencySymbol;
        var txID_Master_SendBackDeposit_Script: MintingPolicy;

        var txID_Master_AddScripts_CS: CurrencySymbol;
        var txID_Master_AddScripts_Script: MintingPolicy;

        var txID_Master_DeleteScripts_CS: CurrencySymbol;
        var txID_Master_DeleteScripts_Script: MintingPolicy;

        var txID_User_Deposit_CS: CurrencySymbol;
        var txID_User_Deposit_Script: MintingPolicy;

        var txID_User_Harvest_CS: CurrencySymbol;
        var txID_User_Harvest_Script: MintingPolicy;

        var txID_User_Withdraw_CS: CurrencySymbol;
        var txID_User_Withdraw_Script: MintingPolicy;

        pabPoolParams = await getPABPoolParamsFromFile(pabPoolParamsJsonFileName);
        
        stakePlusV2Addr = await getTextFromFile(stakePlusV2AddrFileName);
        stakePlusV2Script = await getScriptFromFile(stakePlusV2Plutus_FileName);

        // poolID_CS = await getSymbolFromFile(stakePlusV2_Mint_PoolID_Symbol_FileName);
        poolID_Script = await getScriptFromFile(stakePlusV2_Mint_PoolID_Plutus_FileName);

        // txID_Master_Fund_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_Fund_Symbol_FileName);
        txID_Master_Fund_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_Fund_Plutus_FileName);

        // txID_Master_FundAndMerge_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_FundAndMerge_Symbol_FileName);
        txID_Master_FundAndMerge_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_FundAndMerge_Plutus_FileName);

        // txID_Master_SplitFund_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_SplitFund_Symbol_FileName);
        txID_Master_SplitFund_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_SplitFund_Plutus_FileName);

        // txID_Master_ClosePool_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_ClosePool_Symbol_FileName);
        txID_Master_ClosePool_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_ClosePool_Plutus_FileName);

        // txID_Master_TerminatePool_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_TerminatePool_Symbol_FileName);
        txID_Master_TerminatePool_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_TerminatePool_Plutus_FileName);

        // txID_Master_Emergency_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_Emergency_Symbol_FileName);
        txID_Master_Emergency_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_Emergency_Plutus_FileName);

        // txID_Master_DeleteFund_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_DeleteFund_Symbol_FileName);
        txID_Master_DeleteFund_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_DeleteFund_Plutus_FileName);

        // txID_Master_SendBackFund_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_SendBackFund_Symbol_FileName);
        txID_Master_SendBackFund_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_SendBackFund_Plutus_FileName);

        // txID_Master_SendBackDeposit_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_SendBackDeposit_Symbol_FileName);
        txID_Master_SendBackDeposit_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_SendBackDeposit_Plutus_FileName);

        // txID_Master_AddScripts_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_AddScripts_Symbol_FileName);
        txID_Master_AddScripts_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_AddScripts_Plutus_FileName);

        // txID_Master_DeleteScripts_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_Master_DeleteScripts_Symbol_FileName);
        txID_Master_DeleteScripts_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_Master_DeleteScripts_Plutus_FileName);

        // txID_User_Deposit_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_User_Deposit_Symbol_FileName);
        txID_User_Deposit_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_User_Deposit_Plutus_FileName);

        // txID_User_Harvest_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_User_Harvest_Symbol_FileName);
        txID_User_Harvest_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_User_Harvest_Plutus_FileName);

        // txID_User_Withdraw_CS = await getSymbolFromFile(stakePlusV2_Mint_TxID_User_Withdraw_Symbol_FileName);
        txID_User_Withdraw_Script = await getScriptFromFile(stakePlusV2_Mint_TxID_User_Withdraw_Plutus_FileName);

        // poolID_Script = pabPoolParams.ppolicy_PoolID;
        // txID_Master_Fund_Script = pabPoolParams.ppolicy_TxID_Master_Fund;
        // txID_Master_FundAndMerge_Script = pabPoolParams.ppolicy_TxID_Master_FundAndMerge;
        // txID_Master_SplitFund_Script = pabPoolParams.ppolicy_TxID_Master_SplitFund;
        // txID_Master_ClosePool_Script = pabPoolParams.ppolicy_TxID_Master_ClosePool;
        // txID_Master_TerminatePool_Script = pabPoolParams.ppolicy_TxID_Master_TerminatePool;
        // txID_Master_Emergency_Script = pabPoolParams.ppolicy_TxID_Master_Emergency;
        // txID_Master_DeleteFund_Script = pabPoolParams.ppolicy_TxID_Master_DeleteFund;
        // txID_Master_SendBackFund_Script = pabPoolParams.ppolicy_TxID_Master_SendBackFund;
        // txID_Master_SendBackDeposit_Script = pabPoolParams.ppolicy_TxID_Master_SendBackDeposit;
        // txID_Master_AddScripts_Script = pabPoolParams.ppolicy_TxID_Master_AddScripts;
        // txID_Master_DeleteScripts_Script = pabPoolParams.ppolicy_TxID_Master_DeleteScripts;
        // txID_User_Deposit_Script = pabPoolParams.ppolicy_TxID_User_Deposit;
        // txID_User_Harvest_Script = pabPoolParams.ppolicy_TxID_User_Withdraw;
        // txID_User_Withdraw_Script = pabPoolParams.ppolicy_TxID_User_Harvest;

        poolID_CS = pabPoolParams.poolID_CS;
        txID_Master_Fund_CS = pabPoolParams.txID_Master_Fund_CS;
        txID_Master_FundAndMerge_CS = pabPoolParams.txID_Master_FundAndMerge_CS;
        txID_Master_SplitFund_CS = pabPoolParams.txID_Master_SplitFund_CS;
        txID_Master_ClosePool_CS = pabPoolParams.txID_Master_ClosePool_CS;
        txID_Master_TerminatePool_CS = pabPoolParams.txID_Master_TerminatePool_CS;
        txID_Master_Emergency_CS = pabPoolParams.txID_Master_Emergency_CS;
        txID_Master_DeleteFund_CS = pabPoolParams.txID_Master_DeleteFund_CS;
        txID_Master_SendBackFund_CS = pabPoolParams.txID_Master_SendBackFund_CS;
        txID_Master_SendBackDeposit_CS = pabPoolParams.txID_Master_SendBackDeposit_CS;
        txID_Master_AddScripts_CS = pabPoolParams.txID_Master_AddScripts_CS;
        txID_Master_DeleteScripts_CS = pabPoolParams.txID_Master_DeleteScripts_CS;
        txID_User_Deposit_CS = pabPoolParams.txID_User_Deposit_CS;
        txID_User_Harvest_CS = pabPoolParams.txID_User_Harvest_CS;
        txID_User_Withdraw_CS = pabPoolParams.txID_User_Withdraw_CS;

        let poolParams: PoolParams;

        switch (pabPoolParams.version) {
            case 2:
                poolParams = {
                    ppPoolID_CS: pabPoolParams.poolID_CS,
                    ppMasters: pabPoolParams.masters,
                    ppBegintAt: pabPoolParams.beginAt,
                    ppDeadline: pabPoolParams.deadline,
                    ppGraceTime: pabPoolParams.graceTime,
                    ppStaking_CS: pabPoolParams.ppStaking_CS,
                    ppStaking_TN: pabPoolParams.ppStaking_TN,
                    ppHarvest_CS: pabPoolParams.ppHarvest_CS,
                    ppHarvest_TN: pabPoolParams.ppHarvest_TN,
                    ppInterestRates: pabPoolParams.interestRates
                } as PoolParamsV2;
                break;

            default:
                poolParams = {
                    ppPoolID_CS: pabPoolParams.poolID_CS,
                    ppMasters: pabPoolParams.masters,
                    ppBegintAt: pabPoolParams.beginAt,
                    ppDeadline: pabPoolParams.deadline,
                    ppGraceTime: pabPoolParams.graceTime,
                    ppStaking_CS: pabPoolParams.ppStaking_CS,
                    ppStaking_TN: pabPoolParams.ppStaking_TN,
                    ppHarvest_CS: pabPoolParams.ppHarvest_CS,
                    ppHarvest_TN: pabPoolParams.ppHarvest_TN,
                    ppInterestRates: pabPoolParams.interestRates
                } as PoolParamsV1;
                break;
        }
        
        console.log("crearStakingPoolFromFiles - params: " + toJson(poolParams!));

        var StakingPoolDBModel = getStakingPoolDBModel();

        const newStakingPoolDB = new StakingPoolDBModel({
            name: nombrePool,

            version: pabPoolParams.version,

            imageSrc: image,

            swDelegate: false,

            swDeleted: false,

            swShowOnSite: true,

            swShowOnHome: true,

            swPreparado: false,

            swIniciado: false,
            swFunded: false,

            swClosed: false,

            closedAt: undefined,

            swTerminated: false,

            swZeroFunds: true,

            swPoolReadyForDeleteMasterAndUserScripts: true,
            swPoolReadyForDeleteMainScripts: true,
            swPoolReadyForDeletePoolInDB: true,

            beginAt: new Date(pabPoolParams.beginAt),
            deadline: new Date(pabPoolParams.deadline),
            graceTime: pabPoolParams.graceTime,

            masters: pabPoolParams.masters,

            eUTxO_With_ScriptDatum: undefined,

            eUTxO_With_Script_TxID_Master_Fund_Datum: undefined,
            eUTxO_With_Script_TxID_Master_FundAndMerge_Datum: undefined,
            eUTxO_With_Script_TxID_Master_SplitFund_Datum: undefined,
            eUTxO_With_Script_TxID_Master_ClosePool_Datum: undefined,
            eUTxO_With_Script_TxID_Master_TerminatePool_Datum: undefined,
            eUTxO_With_Script_TxID_Master_Emergency_Datum: undefined,
            eUTxO_With_Script_TxID_Master_DeleteFund_Datum: undefined,
            eUTxO_With_Script_TxID_Master_SendBackFund_Datum: undefined,
            eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum: undefined,
            eUTxO_With_Script_TxID_Master_AddScripts_Datum: undefined,
            eUTxO_With_Script_TxID_Master_DeleteScripts_Datum: undefined,

            eUTxO_With_Script_TxID_User_Deposit_Datum: undefined,
            eUTxO_With_Script_TxID_User_Harvest_Datum: undefined,
            eUTxO_With_Script_TxID_User_Withdraw_Datum: undefined,

            staking_Lucid: pabPoolParams.staking_Lucid,
            harvest_Lucid: pabPoolParams.harvest_Lucid,

            staking_UI: staking_UI,
            harvest_UI: harvest_UI,

            staking_Decimals: staking_Decimals,
            harvest_Decimals: harvest_Decimals,

            pParams: (poolParams),

            scriptAddress: stakePlusV2Addr,
            script: (stakePlusV2Script),
            tx_count: 0,

            poolID_TxOutRef: (pabPoolParams.poolID_TxOutRef),
            poolID_CS: poolID_CS,
            poolID_Script: (poolID_Script),

            txID_Master_Fund_CS: txID_Master_Fund_CS,
            txID_Master_Fund_Script: (txID_Master_Fund_Script),

            txID_Master_FundAndMerge_CS: txID_Master_FundAndMerge_CS,
            txID_Master_FundAndMerge_Script: (txID_Master_FundAndMerge_Script),

            txID_Master_SplitFund_CS: txID_Master_SplitFund_CS,
            txID_Master_SplitFund_Script: (txID_Master_SplitFund_Script),

            txID_Master_ClosePool_CS: txID_Master_ClosePool_CS,
            txID_Master_ClosePool_Script: (txID_Master_ClosePool_Script),

            txID_Master_TerminatePool_CS: txID_Master_TerminatePool_CS,
            txID_Master_TerminatePool_Script: (txID_Master_TerminatePool_Script),

            txID_Master_Emergency_CS: txID_Master_Emergency_CS,
            txID_Master_Emergency_Script: (txID_Master_Emergency_Script),

            txID_Master_DeleteFund_CS: txID_Master_DeleteFund_CS,
            txID_Master_DeleteFund_Script: (txID_Master_DeleteFund_Script),

            txID_Master_SendBackFund_CS: txID_Master_SendBackFund_CS,
            txID_Master_SendBackFund_Script: (txID_Master_SendBackFund_Script),

            txID_Master_SendBackDeposit_CS: txID_Master_SendBackDeposit_CS,
            txID_Master_SendBackDeposit_Script: (txID_Master_SendBackDeposit_Script),

            txID_Master_AddScripts_CS: txID_Master_AddScripts_CS,
            txID_Master_AddScripts_Script: (txID_Master_AddScripts_Script),

            txID_Master_DeleteScripts_CS: txID_Master_DeleteScripts_CS,
            txID_Master_DeleteScripts_Script: (txID_Master_DeleteScripts_Script),

            txID_User_Deposit_CS: txID_User_Deposit_CS,
            txID_User_Deposit_Script: (txID_User_Deposit_Script),

            txID_User_Harvest_CS: txID_User_Harvest_CS,
            txID_User_Harvest_Script: (txID_User_Harvest_Script),

            txID_User_Withdraw_CS: txID_User_Withdraw_CS,
            txID_User_Withdraw_Script: (txID_User_Withdraw_Script),

        });

        await newStakingPoolDB.save()

        return newStakingPoolDB

    } catch (error) {
		throw "Can't create StakingPool From Files - Error: " + error
	}
}

//---------------------------------------------------------------

export async function getPABPoolParamsFromFile(filename: string) {

    try {

        const pathToFile = path.join(process.env.REACT_SERVER_PATH_FOR_SCRIPTS!, filename);

        const data = await fs.readFile(pathToFile, { encoding: 'utf8' });
        //console.log(data);
        let jsonFile = JSON.parse(data);

        var version = jsonFile!.pppVersion? jsonFile!.pppVersion : 1;

        var staking_Lucid;
        var staking_UI = jsonFile!.pppStaking_UI;
        var staking_CS;
        var staking_TN_Hex;

        if (jsonFile!.pppPoolParams.ppStaking_CS.unCurrencySymbol === "") {
            staking_CS = "";
            staking_TN_Hex = "";
            staking_Lucid = "lovelace";
        } else {
            // ppStaking_CS = hexToStr(jsonFile!.pppPoolParams.ppStaking_CS)
            staking_CS = jsonFile!.pppPoolParams.ppStaking_CS.unCurrencySymbol;
            staking_TN_Hex = strToHex(jsonFile!.pppPoolParams.ppStaking_TN.unTokenName);
            staking_Lucid = staking_CS + staking_TN_Hex;
        }

        console.log("Staking Lucid: " + staking_Lucid);
        console.log("Staking UI: " + toJson(staking_UI));
        console.log("Staking CS: " + toJson(staking_CS));
        console.log("Staking TN Hex: " + toJson(staking_TN_Hex));

        var harvest_Lucid;
        // var ppHarvestUnit : AssetClass
        var harvest_UI = jsonFile!.pppHarvest_UI;
        var harvest_CS;
        var harvest_TN_Hex;

        if (jsonFile!.pppPoolParams.ppHarvest_CS.unCurrencySymbol === "") {
            harvest_CS = "";
            harvest_TN_Hex = "";
            harvest_Lucid = "lovelace";
        } else {
            // ppHarvest_CS = hexToStr(jsonFile!.pppPoolParams.ppHarvest_CS)
            harvest_CS = jsonFile!.pppPoolParams.ppHarvest_CS.unCurrencySymbol;
            harvest_TN_Hex = strToHex(jsonFile!.pppPoolParams.ppHarvest_TN.unTokenName);
            harvest_Lucid = harvest_CS + harvest_TN_Hex;
        }

        console.log("Harvest Lucid: " + harvest_Lucid);
        console.log("Harvest UI: " + toJson(harvest_UI));
        console.log("Harvest CS: " + toJson(harvest_CS));
        console.log("Harvest TN Hex: " + toJson(harvest_TN_Hex));

        const poolID_CS = (jsonFile!.pppCurSymbol_PoolID.unCurrencySymbol);
        console.log("PoolID CS: " + toJson(poolID_CS));

        let interestRates : InterestRates
        switch (version) {
            case 2:
                interestRates =  jsonFile!.pppPoolParams.ppInterestRates.map((item: any) => { return new InterestRateV2(new Maybe<number>(item.iMinDays), item.iStaking, item.iHarvest); }) as InterestRateV2[] 
                break;
            default:
                interestRates = jsonFile!.pppPoolParams.ppInterestRates.map((item: any) => { return new InterestRateV1(new Maybe<number>(item.iMinDays), item.iPercentage); }) as InterestRateV1[] 
                break;
        }

        const pabPoolParams = {

            version: version,

            poolID_TxOutRef: { txHash: jsonFile!.pppPoolID_TxOutRef.txOutRefId.getTxId, outputIndex: jsonFile!.pppPoolID_TxOutRef.txOutRefIdx },

            // ppMasters:           jsonFile!.pppPoolParams.ppMasters.map ((item: any) => { return hexToStr(item) }),  
            masters: jsonFile!.pppPoolParams.ppMasters.map((item: any) => { return (item.getPubKeyHash); }),
            beginAt: jsonFile!.pppPoolParams.ppBeginAt,
            deadline: jsonFile!.pppPoolParams.ppDeadline,
            graceTime: jsonFile!.pppPoolParams.ppGraceTime,

            staking_UI: staking_UI,
            staking_CS: staking_CS,
            staking_TN: staking_TN_Hex,

            harvest_UI: harvest_UI,
            harvest_CS: harvest_CS,
            harvest_TN: harvest_TN_Hex,

            staking_Lucid: staking_Lucid,
            harvest_Lucid: harvest_Lucid,

            interestRates: interestRates,

            // pppPolicy_PoolID : createScriptFromHEXCBOR(jsonFile!.pppPolicy_PoolID.getMintingPolicy),
            // pppPolicy_TxID_Master_Fund : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_Fund.getMintingPolicy),
            // pppPolicy_TxID_Master_FundAndMerge : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_FundAndMerge.getMintingPolicy),
            // pppPolicy_TxID_Master_SplitFund : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_SplitFund.getMintingPolicy),
            // pppPolicy_TxID_Master_ClosePool : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_ClosePool.getMintingPolicy),
            // pppPolicy_TxID_Master_TerminatePool : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_TerminatePool.getMintingPolicy),
            // pppPolicy_TxID_Master_Emergency : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_Emergency.getMintingPolicy),
            // pppPolicy_TxID_Master_DeleteFund : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_DeleteFund.getMintingPolicy),
            // pppPolicy_TxID_Master_SendBackFund : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_SendBackFund.getMintingPolicy),
            // pppPolicy_TxID_Master_SendBackDeposit : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_SendBackDeposit.getMintingPolicy),
            // pppPolicy_TxID_Master_AddScripts : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_AddScripts.getMintingPolicy),
            // pppPolicy_TxID_Master_DeleteScripts : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_Master_DeleteScripts.getMintingPolicy),
            // pppPolicy_TxID_User_Deposit : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_User_Deposit.getMintingPolicy),
            // pppPolicy_TxID_User_Harvest : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_User_Harvest.getMintingPolicy),
            // pppPolicy_TxID_User_Withdraw : createScriptFromHEXCBOR(jsonFile!.pppPolicy_TxID_User_Withdraw.getMintingPolicy),
            poolID_CS: poolID_CS,
            txID_Master_Fund_CS: jsonFile!.pppCurSymbol_TxID_Master_Fund.unCurrencySymbol,
            txID_Master_FundAndMerge_CS: jsonFile!.pppCurSymbol_TxID_Master_FundAndMerge.unCurrencySymbol,
            txID_Master_SplitFund_CS: jsonFile!.pppCurSymbol_TxID_Master_SplitFund.unCurrencySymbol,
            txID_Master_ClosePool_CS: jsonFile!.pppCurSymbol_TxID_Master_ClosePool.unCurrencySymbol,
            txID_Master_TerminatePool_CS: jsonFile!.pppCurSymbol_TxID_Master_TerminatePool.unCurrencySymbol,
            txID_Master_Emergency_CS: jsonFile!.pppCurSymbol_TxID_Master_Emergency.unCurrencySymbol,
            txID_Master_DeleteFund_CS: jsonFile!.pppCurSymbol_TxID_Master_DeleteFund.unCurrencySymbol,
            txID_Master_SendBackFund_CS: jsonFile!.pppCurSymbol_TxID_Master_SendBackFund.unCurrencySymbol,
            txID_Master_SendBackDeposit_CS: jsonFile!.pppCurSymbol_TxID_Master_SendBackDeposit.unCurrencySymbol,
            txID_Master_AddScripts_CS: jsonFile!.pppCurSymbol_TxID_Master_AddScripts.unCurrencySymbol,
            txID_Master_DeleteScripts_CS: jsonFile!.pppCurSymbol_TxID_Master_DeleteScripts.unCurrencySymbol,
            txID_User_Deposit_CS: jsonFile!.pppCurSymbol_TxID_User_Deposit.unCurrencySymbol,
            txID_User_Harvest_CS: jsonFile!.pppCurSymbol_TxID_User_Harvest.unCurrencySymbol,
            txID_User_Withdraw_CS: jsonFile!.pppCurSymbol_TxID_User_Withdraw.unCurrencySymbol,
        };
        return pabPoolParams;
    } catch (error: any) {
        console.error("Error reading: " + filename + " " + error);
        throw "Error reading: " + filename + " " + error;
    }
}

//---------------------------------------------------------------

export async function createMainJsonFile (filename: string, mainJson: any){
    var jsonContent = JSON.stringify(mainJson);
    console.log(jsonContent);
    
    await fs.writeFile(path.join(process.env.REACT_SERVER_PATH_FOR_SCRIPTS!, filename), jsonContent, 'utf8', function (err: any) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });
    console.log("JSON file has been saved.");
}

//---------------------------------------------------------------

export async function getEstadoDeployFromFile(filename: string) {
    try {

        //const pathToFile = path.join(process.cwd(), 'public', 'scripts', filename); 
        const pathToFile = path.join(process.env.REACT_SERVER_PATH_FOR_SCRIPTS!, filename);

        const data = await fs.readFile(pathToFile, { encoding: 'utf8' });
        let jsonFile = JSON.parse(data);

        const estado: string = jsonFile!.getEstado;

        return estado;

    } catch (error: any) {
        console.error("Error reading: " + filename + " " + error);
        throw "Error reading: " + filename + " " + error;
    }
}

//---------------------------------------------------------------

export async function serverSide_updateStakingPool (lucid: Lucid, poolInfo: StakingPoolDBInterface) {
    console.log("------------------------------")
    console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - INIT")
    try{
        //------------------
        var swUpdate = false
        //------------------
        const scriptAddress = poolInfo.scriptAddress
        //-----------------
        var tx_count = poolInfo.tx_count
        //-----------------
        var swPreparado = poolInfo.swPreparado
        var swIniciado = poolInfo.swIniciado
        var swFunded = poolInfo.swFunded
        var swClosed = poolInfo.swClosed
        var swTerminated = poolInfo.swTerminated
        var swZeroFunds = poolInfo.swZeroFunds
        var swPoolReadyForDeleteMasterAndUserScripts = poolInfo.swPoolReadyForDeleteMasterAndUserScripts
        var swPoolReadyForDeleteMainScripts = poolInfo.swPoolReadyForDeleteMainScripts
        var swPoolReadyForDeletePoolInDB = poolInfo.swPoolReadyForDeletePoolInDB
        var closedAt = poolInfo.closedAt
        //------------------
        const poolID_AC_Lucid = poolInfo.pParams.ppPoolID_CS + strToHex(poolID_TN);
        //------------------
        const fundID_CS = poolInfo.txID_Master_Fund_CS
        const fundID_AC_Lucid = fundID_CS + strToHex(fundID_TN);
        //------------------
        const userID_CS = poolInfo.txID_User_Deposit_CS
        // const userID_AC_Lucid = userID_CS + strToHex(userID_TN);
        //------------------
        const scriptID_CS = poolInfo.txID_Master_AddScripts_CS
        const scriptID_TN_Hex = strToHex(scriptID_TN)
        const scriptID_AC_Lucid = scriptID_CS + scriptID_TN_Hex;
        //------------------
        const scriptID_Validator_AC_Lucid = scriptID_CS + strToHex(scriptID_Validator_TN)
        const scriptID_Master_Fund_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_Fund_TN)
        const scriptID_Master_FundAndMerge_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_FundAndMerge_TN)
        const scriptID_Master_SplitFund_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_SplitFund_TN)
        const scriptID_Master_ClosePool_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_ClosePool_TN)
        const scriptID_Master_TerminatePool_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_TerminatePool_TN)
        const scriptID_Master_Emergency_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_Emergency_TN)
        const scriptID_Master_DeleteFund_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_DeleteFund_TN)
        const scriptID_Master_SendBackFund_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_SendBackFund_TN)
        const scriptID_Master_SendBackDeposit_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_SendBackDeposit_TN)
        const scriptID_Master_AddScripts_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_AddScripts_TN)
        const scriptID_Master_DeleteScripts_AC_Lucid = scriptID_CS + strToHex(scriptID_Master_DeleteScripts_TN)
        const scriptID_User_Deposit_AC_Lucid = scriptID_CS + strToHex(scriptID_User_Deposit_TN)
        const scriptID_User_Harvest_AC_Lucid = scriptID_CS + strToHex(scriptID_User_Harvest_TN)
        const scriptID_User_Withdraw_AC_Lucid = scriptID_CS + strToHex(scriptID_User_Withdraw_TN)
        //------------------
        var poolDatum: PoolDatum | undefined
        var eUTxOs_With_Datum : EUTxO [] = []
        //------------------
        var tx_count_blockchain: number | undefined = await getTxCountBlockchain(scriptAddress);
        if (tx_count_blockchain == undefined || Number.isNaN(tx_count_blockchain)) {
            console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - Error: Can't get tx_count from Blockfrost")	
            // throw "Error: Can't get tx_count from Blockfrost"
        }else{
            console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - tx_count from Blockfrost: "+tx_count_blockchain)
            //------------------
            // elimino todas las eutxos que estan en la base de datos marcadas como preparadas o consumidas y que paso el tiempo de espera
            // const count = await deleteEUTxOsFromDBPreparingOrConsumingByAddress(scriptAddress) 
            // console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs Delete in DB Preparing Or Consuming: "+count)
            // update: no quiero eliminarlas. el hecho de tener el tx count me asegura de que reviso todo cada vez que hay una tx nueva
            // eso va a eliminar todo lo que sea necesario.
            // la marca de en preparacion o en consumo sirve solo para evitar que dos quieran usarlas al mismo tiempo.
            if (tx_count_blockchain === 0 ) {
                // si no hay transacciones, no hay nada que hacer
                console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - No transactions Yet")
                tx_count = 0
                swUpdate = (tx_count !== tx_count_blockchain)  
            }else if (tx_count === 0) {
                // estoy revisando un pool que recien se cargo en la base de datos pero que en la red ya tiene transacciones
                // tambien puede ser el caso de que inicie el contador a zero de forma manual, para forzar la revisión de todas las transacciones
                // por lo tanto, tengo que revisar todas las transacciones que hay en la red
                console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - First time checking transactions")
                tx_count = tx_count_blockchain
                swUpdate = true
                //fuerzo la actualización de la base de datos
                await deleteEUTxOsFromDBByAddress(poolInfo!.scriptAddress) 
                //descargo todas las transacciones de la red
                const uTxOsAtScript = await lucid!.utxosAt(scriptAddress)      
                console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs At Script ("+uTxOsAtScript.length+") adding to db")
                var eUTxOs_With_Datum_Missing: EUTxO[] = await getMissingEUTxOsInDB(lucid!, uTxOsAtScript, eUTxOs_With_Datum);
                eUTxOs_With_Datum = await addScriptUTxOsToDB(lucid, eUTxOs_With_Datum_Missing, eUTxOs_With_Datum, poolInfo);
                console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs added (" + eUTxOs_With_Datum_Missing.length + ")");
            }else if (tx_count_blockchain == tx_count) {
                console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - No new transactions - tx_count_blockchain: " +  tx_count_blockchain + " == tx_count_db: " + tx_count)
                eUTxOs_With_Datum  = await getEUTxOsFromDBByAddress(scriptAddress);
                for (var i = 0; i < eUTxOs_With_Datum.length; i++) {
                    const eUTxO = eUTxOs_With_Datum[i]
                    const eUTxOParsed = eUTxODBParser(eUTxO);
                    if (eUTxOParsed) eUTxOs_With_Datum[i] = eUTxOParsed
                }
            }else{
                console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - New transactions - tx_count_blockchain: " +  tx_count_blockchain + " > tx_count_db: " + tx_count)
                //------------------
                eUTxOs_With_Datum  = await getEUTxOsFromDBByAddress(scriptAddress);
                for (var i = 0; i < eUTxOs_With_Datum.length; i++) {
                    const eUTxO = eUTxOs_With_Datum[i]
                    const eUTxOParsed = eUTxODBParser(eUTxO);
                    if (eUTxOParsed) eUTxOs_With_Datum[i] = eUTxOParsed
                }
                //------------------ 
                //hay nueva tx count, pero no se si aun tengo los datos de la nueva transaccion
                var countTry = 0;
                var maxTries = 2;
                while (true) {
                    console.log("ServerSide - Update StakingPool - Get new Transaction info" + (countTry>0?" - try (" + countTry + ")":"") )
                    //------------------
                    const uTxOsAtScript = await lucid!.utxosAt(scriptAddress)
                    //------------------
                    //elimino las que ya no estan en la blockchain
                    var eUTxOs_With_Datum_Extras : EUTxO [] = await getExtraEUTxOsInDB(lucid!, uTxOsAtScript, eUTxOs_With_Datum)   
                    for (let i = 0; i < eUTxOs_With_Datum_Extras.length; i++) {
                        const eUTxO = eUTxOs_With_Datum_Extras[i]
                        await deleteEUTxOsFromDBByTxHashAndIndex(eUTxO.uTxO.txHash, eUTxO.uTxO.outputIndex) 
                        eUTxOs_With_Datum = eUTxOs_With_Datum.filter(eUTxO_ => ! (eUTxO_.uTxO.txHash == eUTxO.uTxO.txHash && eUTxO_.uTxO.outputIndex == eUTxO.uTxO.outputIndex))
                    }
                    console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs Delete in db UTxOs that not exist in blockchain: " + eUTxOs_With_Datum_Extras.length)
                    //------------------
                    var eUTxOs_With_Datum_Missing: EUTxO[] = await getMissingEUTxOsInDB(lucid!, uTxOsAtScript, eUTxOs_With_Datum);
                    eUTxOs_With_Datum = await addScriptUTxOsToDB(lucid, eUTxOs_With_Datum_Missing, eUTxOs_With_Datum, poolInfo);
                    console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs added (" + eUTxOs_With_Datum_Missing.length + ")");
                    if (eUTxOs_With_Datum_Extras.length == 0 && eUTxOs_With_Datum_Missing.length == 0){
                        //hay nueva tx pero no puedo obtener aun nuevas utxos
                        //volvere a intentar otra vez
                        console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Error: can't get new tx info")
                        if (++countTry == maxTries) {
                            //ya intente 3 veces, no puedo obtener la info de la nueva transaccion
                            
                            //si hay cuenta de tx mayor a 0 la setea en -1, que significa que hubo algun error en intentar actualizar
                            //si vale negativo entonces prueba hasta tres veces
                            //si vale menos tres la setea a 0 que significa que va a borrar toda las utxos de la db
                            if (tx_count <= -2){
                                tx_count = 0
                            } else if (tx_count < 0){
                                tx_count = tx_count - 1
                            } else{
                                tx_count = -1
                            }
                            
                            swUpdate = true
                            break;
                        }
                        //dejo pasar un tiempo para volver a intentar
                        await new Promise(r => setTimeout(r, TIME_OUT_TRY_UPDATESTAKINGPOOL));
                    }else{
                        tx_count = tx_count_blockchain
                        swUpdate = true
                        break;
                    }
                }
            }
        }
        //------------------
        console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs final: " + eUTxOs_With_Datum.length  + " - tx_count_blockchain: " +  tx_count_blockchain + " - tx_count_db: " + tx_count)
        //------------------
        // desmarco aquellas reservadas y que ya paso el tiempo minimo de reserva
        // si fueron consumidas seran eliminadas luego, por que habrá nueva tx count y ahi se controlara todas las utxos que hay.
        // si no fueron consumidas, se marcaran como disponibles para ser usadas en nuevas transacciones
        const count = await updateEUTxOsFromDBPreparingOrConsumingByAddress(scriptAddress) 
        console.log ("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxOs Updated in DB Preparing Or Consuming: " + count)
        //------------------
        const now = new Date()
        console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - now: " + now.getTime() + " - " + now.toISOString() + "")
        //------------------
        var eUTxO_With_PoolDatum: EUTxO | undefined 
        try{
            eUTxO_With_PoolDatum = await getEUTxO_With_PoolDatum_InEUxTOList(poolInfo, poolID_AC_Lucid, eUTxOs_With_Datum, false)
        }catch(error){
        }
        if (!eUTxO_With_PoolDatum) {
            console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Can't find any UTxO with PoolDatum");
            swPreparado = false
        } else {
            console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - UTxO with PoolDatum: " + eUTxO_With_PoolDatum.uTxO.txHash + "#" + eUTxO_With_PoolDatum.uTxO.outputIndex)
            swPreparado = true
            //TODO : chekear que este andando bien el cierre y el terminate del fondo.
            // si la fecha del deadline ya paso, o hay closedAt en el poolDatum, entonces el pool debe estar closed
            // si la fecha del deadline ya paso, o hay closedAt en el poolDatum, y tambien el gracetime ya paso, entonces el pool debe estar terminated
            // si pdIsTerminated es true, entonces el pool debe estar terminated, significa que fue terminado forzado por el master
            poolDatum = eUTxO_With_PoolDatum.datum as PoolDatum
            if (poolDatum.pdIsTerminated === 1 ) {
                if (!swTerminated){
                    console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Dates: poolDatum.pdIsTerminated FOUND - setting forzed closed and forzed terminated")
                }    
                swClosed = true
                swTerminated = true
            } else {
                if (poolDatum.pdClosedAt.val !== undefined && poolDatum.pdClosedAt.val < BigInt(poolInfo.deadline.getTime()) && poolDatum.pdClosedAt.val < BigInt(now.getTime())) {
                    if (!swClosed){
                        console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Dates: poolDatum.pdClosedAt FOUND - setting forzed closed")
                        console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - pdClosedAt: " + poolDatum.pdClosedAt.val + " - " + new Date(parseInt(poolDatum.pdClosedAt.val.toString())).toISOString() + "")
                    }    
                    swClosed = true
                    closedAt = new Date(parseInt(poolDatum.pdClosedAt.val.toString()))
                    if (BigInt(closedAt.getTime()) + BigInt(poolInfo.graceTime) < BigInt(now.getTime())) {
                        if (!swTerminated){
                            console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Dates: forzed closedAt plus grace Time REACHED - setting terminated")
                        }
                        swTerminated = true
                    }
                }
            }
        }
        if (poolInfo.deadline < now) {
            if (!swClosed){
                console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Dates: deadline REACHED - setting closed")
            }
            swClosed = true
            closedAt = undefined
            if (BigInt(poolInfo.deadline.getTime()) + BigInt(poolInfo.graceTime) < BigInt(now.getTime())) {
                if (!swTerminated){
                    console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Dates: deadline plus grace Time REACHED - setting terminated")
                }
                swTerminated = true
            }
        }
        //------------------
        var eUTxOs_With_FundDatum: EUTxO[] = []
        if (eUTxO_With_PoolDatum) {
            eUTxOs_With_FundDatum = getEUTxOs_With_FundDatum_InEUxTOList(fundID_AC_Lucid, eUTxOs_With_Datum)
            if (eUTxOs_With_FundDatum.length === 0) {
                // console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Can't find any UTxO with FundDatum. Did you funded already?");
                swFunded = false
                swZeroFunds = true
            } else {
                //console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - UTxOs with FundDatum lenght: " + eUTxOs_With_FundDatum.length)
                swFunded = true
                swZeroFunds = false
            }
        }
        //------------------
        var eUTxOs_With_UserDatum: EUTxO[] = []
        if (eUTxO_With_PoolDatum) {
            const userID_CS = poolInfo.txID_User_Deposit_CS
            const userID_AC_Lucid = userID_CS + strToHex(userID_TN);
            eUTxOs_With_UserDatum = getEUTxOs_With_UserDatum_InEUxTOList(userID_AC_Lucid, eUTxOs_With_Datum)
            if (eUTxOs_With_UserDatum.length === 0) {
                // console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Can't find any UTxO with UserDatum.");
            } else {
                // console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - UTxOs with UserDatum lenght: " + eUTxOs_With_UserDatum.length)
            }
        }
        //------------------
        const eUTxOs_With_ScriptDatum = getEUTxO_With_AnyScriptDatum_InEUxTOList (scriptID_AC_Lucid, eUTxOs_With_Datum)
        //------------------
        var eUTxO_With_ScriptDatum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Validator_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_ScriptDatum, poolInfo.eUTxO_With_ScriptDatum)) {
            poolInfo.eUTxO_With_ScriptDatum = eUTxO_With_ScriptDatum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_Fund_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_Fund_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_Fund_Datum, poolInfo.eUTxO_With_Script_TxID_Master_Fund_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_Fund_Datum = eUTxO_With_Script_TxID_Master_Fund_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_FundAndMerge_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_FundAndMerge_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_FundAndMerge_Datum, poolInfo.eUTxO_With_Script_TxID_Master_FundAndMerge_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_FundAndMerge_Datum = eUTxO_With_Script_TxID_Master_FundAndMerge_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_SplitFund_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_SplitFund_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_SplitFund_Datum, poolInfo.eUTxO_With_Script_TxID_Master_SplitFund_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_SplitFund_Datum = eUTxO_With_Script_TxID_Master_SplitFund_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_ClosePool_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_ClosePool_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_ClosePool_Datum, poolInfo.eUTxO_With_Script_TxID_Master_ClosePool_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_ClosePool_Datum = eUTxO_With_Script_TxID_Master_ClosePool_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_TerminatePool_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_TerminatePool_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_TerminatePool_Datum, poolInfo.eUTxO_With_Script_TxID_Master_TerminatePool_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_TerminatePool_Datum = eUTxO_With_Script_TxID_Master_TerminatePool_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_Emergency_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_Emergency_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_Emergency_Datum, poolInfo.eUTxO_With_Script_TxID_Master_Emergency_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_Emergency_Datum = eUTxO_With_Script_TxID_Master_Emergency_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_DeleteFund_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_DeleteFund_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_DeleteFund_Datum, poolInfo.eUTxO_With_Script_TxID_Master_DeleteFund_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_DeleteFund_Datum = eUTxO_With_Script_TxID_Master_DeleteFund_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_SendBackFund_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_SendBackFund_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_SendBackFund_Datum, poolInfo.eUTxO_With_Script_TxID_Master_SendBackFund_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_SendBackFund_Datum = eUTxO_With_Script_TxID_Master_SendBackFund_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_SendBackDeposit_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum, poolInfo.eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum = eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_AddScripts_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_AddScripts_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_AddScripts_Datum, poolInfo.eUTxO_With_Script_TxID_Master_AddScripts_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_AddScripts_Datum = eUTxO_With_Script_TxID_Master_AddScripts_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_Master_DeleteScripts_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_Master_DeleteScripts_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_Master_DeleteScripts_Datum, poolInfo.eUTxO_With_Script_TxID_Master_DeleteScripts_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_Master_DeleteScripts_Datum = eUTxO_With_Script_TxID_Master_DeleteScripts_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_User_Deposit_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_User_Deposit_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_User_Deposit_Datum, poolInfo.eUTxO_With_Script_TxID_User_Deposit_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_User_Deposit_Datum = eUTxO_With_Script_TxID_User_Deposit_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_User_Harvest_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_User_Harvest_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_User_Harvest_Datum, poolInfo.eUTxO_With_Script_TxID_User_Harvest_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_User_Harvest_Datum = eUTxO_With_Script_TxID_User_Harvest_Datum
            swUpdate = true
        } 
        var eUTxO_With_Script_TxID_User_Withdraw_Datum: EUTxO | undefined = getEUTxO_With_ScriptDatum_InEUxTOList(scriptID_User_Withdraw_AC_Lucid, eUTxOs_With_ScriptDatum)
        if (!isEqual (eUTxO_With_Script_TxID_User_Withdraw_Datum, poolInfo.eUTxO_With_Script_TxID_User_Withdraw_Datum)) {
            poolInfo.eUTxO_With_Script_TxID_User_Withdraw_Datum = eUTxO_With_Script_TxID_User_Withdraw_Datum
            swUpdate = true
        } 
        //------------------
        if (eUTxO_With_PoolDatum === undefined || poolDatum === undefined) {
            swPoolReadyForDeleteMasterAndUserScripts = true
            swPoolReadyForDeleteMainScripts = true
            swPoolReadyForDeletePoolInDB = true
        }else{
            const masterFunders = poolDatum.pdMasterFunders
            var swAllMasterFundersClaimed = true
            masterFunders.forEach(mf => {
                if (mf.mfClaimedFund != poolDatum_ClaimedFund) {
                    swAllMasterFundersClaimed = false
                    return
                }
            });

            const swAnyScriptsMaster = (
                eUTxO_With_Script_TxID_Master_Fund_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_FundAndMerge_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_SplitFund_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_ClosePool_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_TerminatePool_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_Emergency_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_DeleteFund_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_SendBackFund_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum !== undefined)

            const swAnyScriptsUser = (
                eUTxO_With_Script_TxID_User_Deposit_Datum !== undefined ||
                eUTxO_With_Script_TxID_User_Withdraw_Datum !== undefined ||
                eUTxO_With_Script_TxID_User_Harvest_Datum !== undefined)

            const swAnyMainScript = (
                eUTxO_With_ScriptDatum !== undefined ||
                eUTxO_With_Script_TxID_Master_AddScripts_Datum !== undefined ||
                eUTxO_With_Script_TxID_Master_DeleteScripts_Datum !== undefined)    

            const swAnyScriptsAtAll = swAnyScriptsMaster || swAnyScriptsUser || swAnyMainScript
            
            swPoolReadyForDeleteMasterAndUserScripts = swAllMasterFundersClaimed && (eUTxOs_With_FundDatum.length === 0) && (eUTxOs_With_UserDatum.length === 0) && swTerminated
            swPoolReadyForDeleteMainScripts = swAllMasterFundersClaimed && (eUTxOs_With_FundDatum.length === 0) && (eUTxOs_With_UserDatum.length === 0) && !swAnyScriptsMaster && !swAnyScriptsUser && swTerminated
            swPoolReadyForDeletePoolInDB = swAllMasterFundersClaimed && (eUTxOs_With_FundDatum.length === 0) && (eUTxOs_With_UserDatum.length === 0) && !swAnyScriptsAtAll
        
            // console.log ("swAnyScriptsMasters: " + swAnyScriptsMaster)
            // console.log ("swAnyScriptsUser: " + swAnyScriptsUser)
            // console.log ("swAnyMainScript: " + swAnyMainScript)
            // console.log ("swAnyScriptsAtAll: " + swAnyScriptsAtAll)
            // console.log ("swAllMasterFundersClaimed: " + swAllMasterFundersClaimed)
            // console.log ("swPoolReadyForDeleteMasterAndUserScripts: " + swPoolReadyForDeleteMasterAndUserScripts)
            // console.log ("swPoolReadyForDeleteMainScripts: " + swPoolReadyForDeleteMainScripts)
            // console.log ("swPoolReadyForDeletePoolInDB: " + swPoolReadyForDeletePoolInDB)
            // console.log ("eUTxOs_With_Datum.length: " + eUTxOs_With_Datum.length)
            // console.log ("eUTxOs_With_FundDatum.length: " + eUTxOs_With_FundDatum.length)
            // console.log ("eUTxOs_With_UserDatum.length: " + eUTxOs_With_UserDatum.length)

        }

        if (poolInfo.beginAt < now) {
            swIniciado = true
        } else {
            swIniciado = false
        }

        if (poolInfo.swPreparado != swPreparado) {
            swUpdate = true
        }

        if (poolInfo.swIniciado != swIniciado) {
            swUpdate = true
        }

        if (poolInfo.swFunded != swFunded) {
            swUpdate = true
        }

        if (poolInfo.swClosed != swClosed) {
            swUpdate = true
        }

        if (poolInfo.closedAt?.getTime() != closedAt?.getTime()) {
            poolInfo.closedAt = closedAt
            swUpdate = true
        }

        if (poolInfo.swTerminated != swTerminated) {
            swUpdate = true
        }

        if (poolInfo.swZeroFunds != swZeroFunds) {
            swUpdate = true
        }

        if (poolInfo.swPoolReadyForDeleteMasterAndUserScripts != swPoolReadyForDeleteMasterAndUserScripts) {
            swUpdate = true
        }

        if (poolInfo.swPoolReadyForDeleteMainScripts != swPoolReadyForDeleteMainScripts) {
            swUpdate = true
        }

        if (poolInfo.swPoolReadyForDeletePoolInDB != swPoolReadyForDeletePoolInDB) {
            swUpdate = true
        }

        if (swUpdate) {
            console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - Saving StakingPool in DB")
            var StakingPoolDBModel = getStakingPoolDBModel()
            const filter = {name : poolInfo.name};
            const update = { 
                tx_count : tx_count,
                swPreparado: swPreparado, 
                swIniciado: swIniciado, 
                swFunded: swFunded,
                swClosed: swClosed,
                closedAt: closedAt != undefined? new Date(closedAt) : undefined,
                swTerminated: swTerminated,
                swZeroFunds: swZeroFunds,
                swPoolReadyForDeleteMasterAndUserScripts: swPoolReadyForDeleteMasterAndUserScripts,
                swPoolReadyForDeleteMainScripts: swPoolReadyForDeleteMainScripts,
                swPoolReadyForDeletePoolInDB: swPoolReadyForDeletePoolInDB,
                eUTxO_With_ScriptDatum: eUTxO_With_ScriptDatum? JSON.parse(toJson(eUTxO_With_ScriptDatum)) : undefined,
                eUTxO_With_Script_TxID_Master_Fund_Datum: eUTxO_With_Script_TxID_Master_Fund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_Fund_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_FundAndMerge_Datum: eUTxO_With_Script_TxID_Master_FundAndMerge_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_FundAndMerge_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_SplitFund_Datum: eUTxO_With_Script_TxID_Master_SplitFund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_SplitFund_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_ClosePool_Datum: eUTxO_With_Script_TxID_Master_ClosePool_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_ClosePool_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_TerminatePool_Datum: eUTxO_With_Script_TxID_Master_TerminatePool_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_TerminatePool_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_Emergency_Datum: eUTxO_With_Script_TxID_Master_Emergency_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_Emergency_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_DeleteFund_Datum: eUTxO_With_Script_TxID_Master_DeleteFund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_DeleteFund_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum: eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_SendBackFund_Datum: eUTxO_With_Script_TxID_Master_SendBackFund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_SendBackFund_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_AddScripts_Datum: eUTxO_With_Script_TxID_Master_AddScripts_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_AddScripts_Datum)) : undefined,
                eUTxO_With_Script_TxID_Master_DeleteScripts_Datum: eUTxO_With_Script_TxID_Master_DeleteScripts_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_DeleteScripts_Datum)) : undefined,
                eUTxO_With_Script_TxID_User_Deposit_Datum: eUTxO_With_Script_TxID_User_Deposit_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_User_Deposit_Datum)) : undefined,
                eUTxO_With_Script_TxID_User_Harvest_Datum: eUTxO_With_Script_TxID_User_Harvest_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_User_Harvest_Datum)) : undefined,
                eUTxO_With_Script_TxID_User_Withdraw_Datum: eUTxO_With_Script_TxID_User_Withdraw_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_User_Withdraw_Datum)) : undefined
            };

            var updateSet = {}
            var updateUnSet = {}
            for (var key in update) {
                if (update[key as keyof typeof update] == undefined) {
                    updateUnSet = {...updateUnSet, [key]: ""}
                }else{
                    updateSet = {...updateSet, [key]: update[key as keyof typeof update]}
                }
            }
            try{
                await StakingPoolDBModel.findOneAndUpdate(filter, { $set : updateSet , $unset : updateUnSet })
            }catch(error){
                console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - ERROR UPDATING POOL DATA: " + poolInfo.name)
                console.log(error)
            }
        }else{
            //console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - NO UPDATING POOL DATA")
        }
        poolInfo.tx_count = tx_count
        poolInfo.swPreparado = swPreparado
        poolInfo.swIniciado = swIniciado
        poolInfo.swFunded = swFunded
        poolInfo.swClosed = swClosed
        poolInfo.closedAt = closedAt != undefined? new Date(closedAt) : undefined,
        poolInfo.swTerminated = swTerminated,
        poolInfo.swZeroFunds = swZeroFunds,
        poolInfo.swPoolReadyForDeleteMasterAndUserScripts = swPoolReadyForDeleteMasterAndUserScripts,
        poolInfo.swPoolReadyForDeleteMainScripts = swPoolReadyForDeleteMainScripts,
        poolInfo.swPoolReadyForDeletePoolInDB = swPoolReadyForDeletePoolInDB,
        poolInfo.eUTxO_With_ScriptDatum = eUTxO_With_ScriptDatum? JSON.parse(toJson(eUTxO_With_ScriptDatum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_Fund_Datum = eUTxO_With_Script_TxID_Master_Fund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_Fund_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_FundAndMerge_Datum = eUTxO_With_Script_TxID_Master_FundAndMerge_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_FundAndMerge_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_SplitFund_Datum = eUTxO_With_Script_TxID_Master_SplitFund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_SplitFund_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_ClosePool_Datum = eUTxO_With_Script_TxID_Master_ClosePool_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_ClosePool_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_TerminatePool_Datum = eUTxO_With_Script_TxID_Master_TerminatePool_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_TerminatePool_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_Emergency_Datum = eUTxO_With_Script_TxID_Master_Emergency_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_Emergency_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_DeleteFund_Datum = eUTxO_With_Script_TxID_Master_DeleteFund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_DeleteFund_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum = eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_SendBackDeposit_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_SendBackFund_Datum = eUTxO_With_Script_TxID_Master_SendBackFund_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_SendBackFund_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_AddScripts_Datum = eUTxO_With_Script_TxID_Master_AddScripts_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_AddScripts_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_Master_DeleteScripts_Datum = eUTxO_With_Script_TxID_Master_DeleteScripts_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_Master_DeleteScripts_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_User_Deposit_Datum = eUTxO_With_Script_TxID_User_Deposit_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_User_Deposit_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_User_Harvest_Datum = eUTxO_With_Script_TxID_User_Harvest_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_User_Harvest_Datum)) : undefined,
        poolInfo.eUTxO_With_Script_TxID_User_Withdraw_Datum = eUTxO_With_Script_TxID_User_Withdraw_Datum? JSON.parse(toJson(eUTxO_With_Script_TxID_User_Withdraw_Datum)) : undefined
        console.log("------------------------------")
    }catch(error){
        console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - ERROR: " + error)
    }
    return poolInfo 
}



async function addScriptUTxOsToDB(lucid: Lucid, eUTxOs_With_Datum_Missing: EUTxO[], eUTxOs_With_Datum: EUTxO[], poolInfo: StakingPoolDBInterface): Promise<EUTxO[]> {
    for (let i = 0; i < eUTxOs_With_Datum_Missing.length; i++) {
        const eUTxO = eUTxOs_With_Datum_Missing[i];
        const eUTxO_ = await getEUTxOFromDBByTxHashAndIndex(eUTxO.uTxO.txHash, eUTxO.uTxO.outputIndex);
        if (eUTxO_.length == 0) {
            var EUTxODBModel = getEUTxODBModel();
            const newEUTxODB = new EUTxODBModel({
                eUTxO: JSON.parse(toJson(eUTxO))
            });
            try {
                await newEUTxODB.save();
                console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxO added");
            } catch (error) {
                console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxO Error saving in DB");
                console.log(error);
            }
        } else {
            console.log("ServerSide - Update StakingPool - " + poolInfo.name + " - eUTxO Error saving in DB, already there");
        }
    }
    eUTxOs_With_Datum = eUTxOs_With_Datum.concat(eUTxOs_With_Datum_Missing);
    return eUTxOs_With_Datum ;
}

