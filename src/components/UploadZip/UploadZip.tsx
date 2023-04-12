import React, { useState } from "react";
import DropZone from "./DropZone";
import styles from "./UploadZip.module.css";
import JSZip from 'jszip';
import { toJson } from "../../utils/utils";
import ActionModalBtn from "../ActionWithInputModalBtn";
import { StakingPoolDBInterface } from "../../types/stakePoolDBModel";
import { apiUploadStakingPool } from "../../stakePool/apis";

//based in https://github.com/gisioraelvis/nextjs-dnd-fileupload-code

const UploadZip = ({setStakingPoolCreated}:{setStakingPoolCreated: any}) => {

    const [isWorking, setIsWorking] = useState("")
	const [actionMessage, setActionMessage] = useState("")
	const [actionHash, setActionHash] = useState("")
	const handleSetIsWorking = async (isWorking: string) => {
		console.log("CreateStakingPool - handleCallback isWorking: ", isWorking)
		setIsWorking(isWorking)
		return isWorking
	}
    
    const [fileOk, setFileOk] = React.useState(false)
    const [nombrePool, setNombrePool] = React.useState("RATS")
    // const [stakingPoolCreated, setStakingPoolCreated] = useState<StakingPoolDBInterface | undefined>(undefined)
    
    // reducer function to handle state changes
    const reducer = (state: any, action: { type: any; inDropZone?: any; file?: any; }) => {
        switch (action.type) {
        case "SET_IN_DROP_ZONE":
            return { ...state, inDropZone: action.inDropZone };
        case "SET_FILE":
            const file = action.file;
            var new_zip = new JSZip();
            new_zip.loadAsync(file)
                .then(function(zip) {
                    // console.log("SET_FILE: " + toJson(zip))
                    const mainJsonFile = zip.file("main.json")
                    if (mainJsonFile){
                        mainJsonFile.async("string")
                            .then(function (data) {
                                console.log (data)
                                setFileOk(true)
                                const parseJson = JSON.parse(data)
                                setNombrePool(parseJson.nombrePool)
                            })
                            .catch((err) => {
                                console.log (err)
                            });
                    }else{
                        // console.log ("main.json file not found")
                        setFileOk(false)
                    }
                    
                })
                .catch((err) => {
                    // console.log ("main.json file not found")
                    // console.log (err)
                });
            return { ...state, file: action.file };
        default:
            return state;
        }
    };

    // destructuring state and dispatch, initializing fileList to empty array
    const [data, dispatch] = React.useReducer(reducer, {
        inDropZone: false,
        file: undefined,
    });

    const uploadPoolFilesAction = async () => {

        console.log("UploadPoolFilesAction - Upload StakingPool Files")

		setActionMessage("Uploading Smart Contracts, please wait...")

        try {

            const formData = new FormData();
            
            formData.append("nombrePool", nombrePool)
            formData.append("file", data.file)

            // console.log ("FILE: " + toJson(data.file))
            // console.log ("FILEname: " + data.file.name)

            // let data_ = {
			// 	nombrePool: nombrePool,
            //     file: formData
            // }

            const stakingPool = await apiUploadStakingPool(formData)

            setActionMessage("Smart Contracts uploaded!")

			if(stakingPool ){
				setTimeout(setStakingPoolCreated, 3000, stakingPool);
				setIsWorking("")
				return "Redirecting page...";
			}

            setIsWorking("")
			return "Smart Contracts uploaded!";
		} catch (error) {
			setIsWorking("")
			throw error
		}
    };

    return (
        <div >
            <DropZone dispatch={dispatch} />
            <br></br>
           
            {data.file && (
                fileOk?
                <>
                    <h4 className="pool__stat-title">File</h4>
                    <div key={data.file.name} className={styles.fileName}>
                        {data.file.name}
                    </div>
                    <br></br>
                    <h4 className="pool__stat-title">Name</h4>
                    <input name='nombrePool' value={nombrePool} style={{ width: 400, fontSize: 12 }} onChange={(event) => setNombrePool(event.target.value)}  ></input>
                    <br></br>
                </>
                :
                <>
                    <h4 className="pool__stat-title">File</h4>
                    <div key={data.file.name} className={styles.fileName}>
                        Can't read file
                    </div>
                    
                </>
            )}

            <ActionModalBtn 
                action={uploadPoolFilesAction} 
                postActionSuccess={undefined}
                postActionError={undefined}
                setIsWorking={handleSetIsWorking} 
                actionName="Upload Zip and Create Pool" actionIdx="1" messageFromParent={actionMessage} hashFromParent={actionHash} isWorking={isWorking} 
                description={'<li className="info">Upload files and create the Staking Pool in the Portal.</li>\
                <li className="info">Remember to prepare your newly created Pool immediately.</li>\
                <li className="info">Avoid making other Transactions as the Contract is dependent on a specific UTxO to mint the PoolID NFT that should not be consumed before.</li>'}
                swEnabledBtnOpenModal={true} 
                swEnabledBtnAction={data.file && fileOk}
                swShow={true}
                swHash={false} 
                />
           

            
        </div>							
    );
};

export default UploadZip;


