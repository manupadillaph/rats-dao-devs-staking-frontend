
import type { NextApiRequest, NextApiResponse } from 'next'

import { connect } from '../../utils/dbConnect'

import { toJson } from '../../utils/utils';
import { getStakingPoolWithTxCountFromDBByName } from '../../types/stakePoolDBModel';

type Data = {
    msg: string
    count? : number
}

export default async function handler( req: NextApiRequest, res: NextApiResponse<Data | string>) {

    //--------------------------------
    // const session = await getSession({ req })
	// if (!session) {
	// 	console.error("/api/getTxCountStakingPool - Must Connect to your Wallet"); 
    //     res.status(400).json({ msg: "Must Connect to your Wallet" , stakingPool: undefined})
    //     return 
    // }
    // const sesionPkh = session?.user.pkh
    //--------------------------------
    
    const nombrePool = req.body.nombrePool

    await connect();

    console.log("/api/getTxCountStakingPool - Request: " + toJson(req.body));

    try {

        const stakingPoolWithTxCount = await getStakingPoolWithTxCountFromDBByName (nombrePool)

        if (stakingPoolWithTxCount.length === 0 ){
            console.error("/api/getTxCountStakingPool - Can't get StakingPool with TxCount in Database - Error: StakingPool not Exist: " + nombrePool); 
            res.status(400).json({ msg: "Can't get StakingPool in Database - Error: StakingPool not Exist: " + nombrePool})
            return 
        } else if (stakingPoolWithTxCount.length > 1 ){
            console.error("/api/getTxCountStakingPool - Can't get StakingPool with TxCount in Database - Error: StakingPool twice: " + nombrePool); 
            res.status(400).json({ msg: "Can't get StakingPool in Database - Error: StakingPool twice " + nombrePool})
            return 
        } else {
            const stakingPool = stakingPoolWithTxCount[0]
            res.status(200).json({ msg: "StakingPool with TxCount found", count : stakingPool.tx_count})
            return
        }
    } catch (error) {
        console.error("/api/getTxCountStakingPool - Can't get StakingPool with TxCount in Database - Error: " + error);
        res.status(400).json({ msg: "Can't get StakingPool with TxCount in Database - Error:" + error})
        return 
    }
  
}
