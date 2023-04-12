
import type { NextApiRequest, NextApiResponse } from 'next'

import { connect } from '../../utils/dbConnect'

import { toJson } from '../../utils/utils';

import { getStakingPoolWithScriptsFromDBByName, StakingPoolDBInterface } from '../../types/stakePoolDBModel';

type Data = {
    msg: string
    stakingPool ? : StakingPoolDBInterface
}

export default async function handler( req: NextApiRequest, res: NextApiResponse<Data | string>) {

    //--------------------------------
    // const session = await getSession({ req })
	// if (!session) {
	// 	console.error("/api/getStakingPoolScript - Must Connect to your Wallet"); 
    //     res.status(400).json({ msg: "Must Connect to your Wallet" , stakingPool: undefined})
    //     return 
    // }
    // const sesionPkh = session?.user.pkh
    //--------------------------------
    
    const nombrePool = req.body.nombrePool
    const scripts = req.body.scripts

    await connect();

    console.log("/api/getStakingPoolScript - Request: " + toJson(req.body));

    try {

        const stakingPoolWithScripts = await getStakingPoolWithScriptsFromDBByName (nombrePool, scripts)

        if (stakingPoolWithScripts.length === 0 ){
            console.error("/api/getStakingPool - Can't get StakingPool with Scripts in Database - Error: StakingPool not Exist: " + nombrePool); 
            res.status(400).json({ msg: "Can't get StakingPool in Database - Error: StakingPool not Exist: " + nombrePool, stakingPool: undefined})
            return 
        } else if (stakingPoolWithScripts.length > 1 ){
            console.error("/api/getStakingPool - Can't get StakingPool with Scripts in Database - Error: StakingPool twice: " + nombrePool); 
            res.status(400).json({ msg: "Can't get StakingPool in Database - Error: StakingPool twice " + nombrePool, stakingPool: undefined})
            return 
        } else {
            const stakingPool = stakingPoolWithScripts[0]
            res.status(200).json({ msg: "StakingPool with Scripts found", stakingPool : stakingPool})
            return
        }
    } catch (error) {
        console.error("/api/getStakingPoolScript - Can't get StakingPool with Scripts in Database - Error: " + error);
        res.status(400).json({ msg: "Can't get StakingPool with Scripts in Database - Error:" + error})
        return 
    }
  
}
