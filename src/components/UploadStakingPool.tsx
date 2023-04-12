//--------------------------------------
import Image from 'next/image';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Assets, UTxO } from 'lucid-cardano';
import 'react-loading-skeleton/dist/skeleton.css';
import { splitUTxOs } from "../stakePool/endPoints - others";
import { apiGetTokenMetadata, getEstadoDeployAPI, apiCreateStakingPool } from "../stakePool/apis";
import { ADA_Decimals, ADA_UI, maxMasters } from '../types/constantes';
import { StakingPoolDBInterface } from '../types/stakePoolDBModel';
import { pushSucessNotification } from "../utils/pushNotification";
import { useStoreState } from '../utils/walletProvider';
import ActionModalBtn from './ActionWithInputModalBtn';
import LoadingSpinner from "./LoadingSpinner";
import { AssetClass, EUTxO } from '../types';
import { newTransaction } from '../utils/cardano-helpersTx';
import { toJson } from '../utils/utils';
import { getDecimalsInMetadata } from '../utils/cardano-helpers';
import JSZip from 'jszip';
import { saveAs } from "file-saver";

import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import UploadZip from './UploadZip/UploadZip';


//--------------------------------------

export default function UpdateStakingPool( ) {

	const [stakingPoolCreated, setStakingPoolCreated] = useState<StakingPoolDBInterface | undefined>(undefined)

	//--------------------------------------

	const IniciarPoolAction = async (poolInfo?: StakingPoolDBInterface, eUTxOs_Selected?: EUTxO[] | undefined, assets?: Assets) => {

		console.log("CreateStakingPool - Iniciar Pool Action")

		window.location.href = "/admin#" + poolInfo!.name;
	}

	const createNewPoolAction = async () => {

		console.log("CreateStakingPool - Create New StakingPool Files")

		setStakingPoolCreated(undefined)
	}


	//--------------------------------------
	
	return (
		<>
			{stakingPoolCreated ?
				<div >
					
					<br></br>
					<button className="btn btnStakingPool"
						onClick={(e) => {
								e.preventDefault()
								IniciarPoolAction(stakingPoolCreated)
							}
						}
					>Prepare Pool
					</button>
					<br></br>
					<div>

					<li className="info">Prepare your newly created Pool immediately.</li>
					<li className="info">Avoid making other Transactions as the Contract is dependent on a specific UTxO to mint the PoolID NFT that should not be consumed before.</li>
					</div>
					<br></br>

					<button className="btn btnStakingPool"
						onClick={(e) => {
							e.preventDefault()
							createNewPoolAction()
						}
						}
					>New Staking Pool
					</button>

				</div>
				:
				<>
					<div className="section__text pool">

						<div className="pool__data">
							<div className="pool__image pool__data_item">
								<Image width={126} height={126} src={process.env.NEXT_PUBLIC_DEFAULT_POOL_IMAGE!} />
							</div>

							<div className="pool__action_card pool__data_item">

								<div className="pool__flex_gap"></div>
								<div className="pool__stat">



									<div className="pool__stat-actions">

										<form>
											<h3 className="pool__stat-title">Staking Pool</h3>
											<br></br>
											
											<UploadZip setStakingPoolCreated={setStakingPoolCreated} />

										</form>

									</div>
								</div>
							</div>
						</div>
					</div>
				</>

			}
		</>
	)
}


