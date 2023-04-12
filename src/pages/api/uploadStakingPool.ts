import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from "next/server";
import { connect } from '../../utils/dbConnect';
import { exec } from 'child_process';
import { toJson } from '../../utils/utils';
import { MintingPolicy, SpendingValidator } from 'lucid-cardano';
import { getSession } from 'next-auth/react';
import { crearStakingPoolFromFiles, createMainJsonFile, createStakingPoolFilesFromZip, getEstadoDeployFromFile, getPABPoolParamsFromFile } from "../../stakePool/helpersServerSide";
import { CurrencySymbol, PoolParams } from '../../types';
import { maxMasters } from '../../types/constantes';
import { getStakingPoolDBModel, getStakingPoolFromDBByName, StakingPoolDBInterface } from '../../types/stakePoolDBModel';
import { getScriptFromFile, getTextFromFile, mkdir, rmdir } from '../../utils/utilsServerSide';
import path from 'path';
import formidable from "formidable";
import { setLocale } from 'yup';
import * as yup from "yup";
import JSZip from 'jszip';

const fs = require('fs/promises');

export const config = {
		api: {
			bodyParser: false,
		},
	};

setLocale({
	mixed: {
		notType: '${label} is not a valid ${type}',
	},
});

let formSchema = yup.object().shape({
	nombrePool: yup.string().required().label("Pool Name"),
});


type Data = {
	msg: string
	stakingPool?: StakingPoolDBInterface | undefined
}


export default async function handler( req: NextApiRequest, res: NextApiResponse<Data | string>) {

	try{

		//--------------------------------
		const session = await getSession({ req })
		if (!session) {
			throw "Must Connect to your Wallet" 
		}
		const sesionPkh = session?.user.pkh
		//--------------------------------
		if (!(session?.user.swPortalUploader)){
			throw "You Can't Upload a Staking Pool" 
		}
		//--------------------------------

		const form = formidable({ multiples: false });

		const formData = new Promise <[formidable.Fields, formidable.File]> ((resolve, reject) => {
			form.parse(req, async (error, fields, files) => {
				if (error) {
					reject("error");
				}
				if (Array.isArray(files.file)) {
					resolve([ fields, files.file[0] ]);
				}else{
					resolve([ fields, files.file ]);
				}
			});
		});

		const [fields, file ] = await formData;

		try {
			await formSchema.validate(fields);
		} catch (error) {
			throw error 
		}

		const nombrePool = Array.isArray(fields.nombrePool)? fields.nombrePool[0] : fields.nombrePool;

		console.log("/api/uploadStakingPool - file: " + toJson(file)); 
		console.log("/api/uploadStakingPool - nombrePool: " + nombrePool); 
		
		await connect();

		const stakingPoolWithSameName = await getStakingPoolFromDBByName (nombrePool)
		
		if (stakingPoolWithSameName.length> 0 ){
			throw "Can't create Pool with existing name"
		}

		try {

			const fileData = await fs.readFile(file.filepath);

			var new_zip = new JSZip();
			new_zip.loadAsync(fileData)
				.then(async function(zip) {
					const mainJsonFile = zip.file("main.json")
					if (mainJsonFile){
						mainJsonFile.async("string")
							.then(async function (data) {
								//console.log (data)
								const parseJson = JSON.parse(data)
						
								const image = parseJson.image
								const staking_UI = parseJson.staking_UI
								const harvest_UI = parseJson.harvest_UI
								const staking_Decimals = parseJson.staking_Decimals
								const harvest_Decimals = parseJson.harvest_Decimals
								
								await createStakingPoolFilesFromZip (nombrePool, zip)

								console.log("/api/uploadStakingPool - files created")
										
								let newStakingPoolDB = undefined

								newStakingPoolDB = await crearStakingPoolFromFiles(nombrePool, image, staking_UI, harvest_UI, staking_Decimals, harvest_Decimals)
								console.log("/api/createStakingPool - StakingPool saved in Database!");

								res.status(200).json({ msg: "Smart Contracts created!", stakingPool: newStakingPoolDB });
								return 

							})
							.catch((error) => {
								throw "Can't parse main.json file - Error: " + error
							});
					}else{
						throw "main.json file not found"	
					}
				})
				.catch((error) => {
					throw "Can't parse zip file - Error: " + error
				});
		} catch (error) {
			throw "Can't read zip file - Error: " + error	
		}
	
	} catch (error: any) {
		console.error("/api/uploadStakingPool - Error: " + error);
		res.status(400).json({ msg: error})
		return 
	}
}

