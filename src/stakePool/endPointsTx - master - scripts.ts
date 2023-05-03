import { Address, Assets, Lucid, Script, UTxO } from 'lucid-cardano';
import { EUTxO, PoolDatum, Redeemer_Burn_TxID, Redeemer_Master_DeleteScripts, Redeemer_Mint_TxID, ScriptDatum } from '../types';
import { StakingPoolDBInterface } from '../types/stakePoolDBModel';
import { addAssets } from '../utils/cardano-helpers';
import { createTx, fixTx } from '../utils/cardano-helpersTx';
import { getHexFrom_Redeemer_TxID, getHexFrom_Validator_Datum_And_SaveDB, getHexFrom_Validator_Redeemer_And_SaveDB } from "./helpersDatumsAndRedeemers";
import { apiGetStakingPoolWithScriptsDB } from './apis';

//--------------------------------------

export async function masterAddScriptsTx(
    lucid: Lucid, protocolParameters: any, poolInfo: StakingPoolDBInterface, poolInfoWithScripts: StakingPoolDBInterface, addressWallet: Address,
    eUTxO_With_Script_TxID_Master_AddScripts_Datum: EUTxO | undefined,
    utxoAtScript_With_PoolDatum: UTxO,
    redeemer_For_Mint_TxID_Master_AddScripts: Redeemer_Mint_TxID, value_For_Mint_TxID_Master_AddScripts: Assets,
    script_Datum: ScriptDatum, scriptRef: Script
) {
    //------------------
    const functionName = "EndPoint Tx Master - Add Scripts";
    //------------------
    const scriptAddress: Address = poolInfo.scriptAddress;
    //------------------
    const script_Datum_Hex = await getHexFrom_Validator_Datum_And_SaveDB(script_Datum, true);
    //------------------
    const redeemer_For_Mint_TxID_Master_AddScripts_Hex = await getHexFrom_Redeemer_TxID(redeemer_For_Mint_TxID_Master_AddScripts, true);
    //------------------
    // const now = Math.floor(Date.now())
    // console.log(functionName + " - now: " + now)
    // const from = now - (5 * 60 * 1000)
    // const until = now + (validTimeRange) - (5 * 60 * 1000) 
    //------------------
    var tx = lucid.newTx();
    var tx_Building = createTx(lucid, protocolParameters, tx);
    //------------------
    if (eUTxO_With_Script_TxID_Master_AddScripts_Datum) {
        tx_Building = await tx_Building.readFrom([eUTxO_With_Script_TxID_Master_AddScripts_Datum.uTxO]);
    } else {
        tx_Building = await tx_Building.attachMintingPolicy(poolInfoWithScripts.txID_Master_AddScripts_Script);
    }
    //------------------
    const minAda_For_ScriptDatum = 10000000n
    // va a poner el valor que realmente necesite. Generalmente entre 25 y 35 ada
    const value_MinAda_For_ScriptDatum: Assets = { lovelace: minAda_For_ScriptDatum }
    const value_For_ScriptDatum = addAssets(value_MinAda_For_ScriptDatum, value_For_Mint_TxID_Master_AddScripts);
    //------------------
    tx_Building = await tx_Building
        .mintAssets(value_For_Mint_TxID_Master_AddScripts, redeemer_For_Mint_TxID_Master_AddScripts_Hex)
        .readFrom([utxoAtScript_With_PoolDatum])
        .payToContract(scriptAddress, {
            inline: script_Datum_Hex,
            scriptRef: scriptRef,
        }, value_For_ScriptDatum)
        .addSigner(addressWallet);
    // .validFrom(from)
    // .validTo(until)
    //------------------
    const txComplete_FIXED = await fixTx(tx_Building, lucid, protocolParameters);
    return txComplete_FIXED;
}

//--------------------------------------

export async function masterDeleteScriptsTx(
    lucid: Lucid, protocolParameters: any, poolInfo: StakingPoolDBInterface, addressWallet: Address,
    eUTxO_With_ScriptDatum: EUTxO | undefined,
    eUTxO_With_Script_TxID_Master_AddScripts_Datum: EUTxO | undefined,
    eUTxO_With_Script_TxID_Master_DeleteScripts_Datum: EUTxO | undefined,
    utxoAtScript_With_PoolDatum: UTxO, redeemer_For_Consuming_PoolDatum: Redeemer_Master_DeleteScripts,
    uTxOsWithScripts: UTxO[], redeemer_For_Consuming_Scripts_Datum: Redeemer_Master_DeleteScripts,
    poolDatum_Out: PoolDatum, value_For_PoolDatum: Assets,
    addrsAndValues_For_Masters_Wallets: { addr: string; value: Assets; }[],
    redeemer_For_Mint_TxID_Master_DeleteScripts: Redeemer_Mint_TxID, value_For_Mint_TxID_Master_DeleteScripts: Assets,
    redeemer_For_Burn_ScriptIDs: Redeemer_Burn_TxID, value_For_Burn_ScriptIDs: Assets
) {
    //------------------
    const functionName = "EndPoint Tx Master - Delete Scripts";
    //------------------
    console.log(functionName + " - init");
    //------------------
    const poolInfoWithScripts = await apiGetStakingPoolWithScriptsDB(poolInfo.name,["script", "txID_Master_AddScripts_Script", "txID_Master_DeleteScripts_Script"])
    //------------------
    const scriptAddress: Address = poolInfo.scriptAddress;
    //------------------
    const poolDatum_Out_Hex = await getHexFrom_Validator_Datum_And_SaveDB(poolDatum_Out, true);
    //------------------
    const redeemer_For_Consuming_PoolDatum_Hex = await getHexFrom_Validator_Redeemer_And_SaveDB(redeemer_For_Consuming_PoolDatum, true);
    const redeemer_For_Consuming_Scripts_Datum_Hex = await getHexFrom_Validator_Redeemer_And_SaveDB(redeemer_For_Consuming_Scripts_Datum, true);
    const redeemer_For_Mint_TxID_Master_DeleteScripts_Hex = await getHexFrom_Redeemer_TxID(redeemer_For_Mint_TxID_Master_DeleteScripts, true);
    const redeemer_For_Burn_ScriptIDs_Hex = await getHexFrom_Redeemer_TxID(redeemer_For_Burn_ScriptIDs, true);
    //------------------
    // const now = Math.floor(Date.now())
    // console.log(functionName + " - now: " + now)
    // const from = now - (5 * 60 * 1000)
    // const until = now + (validTimeRange) - (5 * 60 * 1000) 
    //------------------
    var tx = lucid.newTx();
    var tx_Building = createTx(lucid, protocolParameters, tx);
    //------------------
    if (eUTxO_With_ScriptDatum) {
        tx_Building = await tx_Building.readFrom([eUTxO_With_ScriptDatum.uTxO]);
    } else {
        tx_Building = await tx_Building.attachSpendingValidator(poolInfoWithScripts.script);
    }
    //------------------
    if (eUTxO_With_Script_TxID_Master_AddScripts_Datum) {
        tx_Building = await tx_Building.readFrom([eUTxO_With_Script_TxID_Master_AddScripts_Datum.uTxO]);
    } else {
        tx_Building = await tx_Building.attachMintingPolicy(poolInfoWithScripts.txID_Master_AddScripts_Script);
    }
    //------------------
    if (eUTxO_With_Script_TxID_Master_DeleteScripts_Datum) {
        tx_Building = await tx_Building.readFrom([eUTxO_With_Script_TxID_Master_DeleteScripts_Datum.uTxO]);
    } else {
        tx_Building = await tx_Building.attachMintingPolicy(poolInfoWithScripts.txID_Master_DeleteScripts_Script);
    }
    //------------------
    tx_Building = await tx_Building
        .mintAssets(value_For_Mint_TxID_Master_DeleteScripts, redeemer_For_Mint_TxID_Master_DeleteScripts_Hex)
        .mintAssets(value_For_Burn_ScriptIDs, redeemer_For_Burn_ScriptIDs_Hex)
        .collectFrom([utxoAtScript_With_PoolDatum], redeemer_For_Consuming_PoolDatum_Hex)
        .payToContract(scriptAddress, { inline: poolDatum_Out_Hex }, value_For_PoolDatum)
        .collectFrom(uTxOsWithScripts, redeemer_For_Consuming_Scripts_Datum_Hex);
    //------------------
    for (const addrAndValue_For_Masters_Wallets of addrsAndValues_For_Masters_Wallets) {
        tx_Building = await tx_Building
            .payToAddress(addrAndValue_For_Masters_Wallets.addr, addrAndValue_For_Masters_Wallets.value);
    }
    //------------------
    tx_Building = await tx_Building
        .addSigner(addressWallet);
    // .validFrom(from)
    // .validTo(until)
    //------------------
    const txComplete_FIXED = await fixTx(tx_Building, lucid, protocolParameters);
    return txComplete_FIXED;
}
