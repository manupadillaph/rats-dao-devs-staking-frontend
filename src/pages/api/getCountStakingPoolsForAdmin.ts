
import type { NextApiRequest, NextApiResponse } from 'next'

import { connect } from '../../utils/dbConnect'

import { toJson } from '../../utils/utils';

import { getCountStakingPoolsForAdminFromDB } from '../../types/stakePoolDBModel';

type Data = {
    msg: string
    count? : number
}

export default async function handler( req: NextApiRequest, res: NextApiResponse<Data | string>) {

    //--------------------------------
    // const session = await getSession({ req })
	// if (!session) {
	// 	console.error("/api/getCountStakingPoolsForAdmin - Must Connect to your Wallet"); 
    //     res.status(400).json({ msg: "Must Connect to your Wallet" , stakingPool: undefined})
    //     return 
    // }
    // const sesionPkh = session?.user.pkh
    //--------------------------------
    
    const pkh = req.body.pkh

    await connect();

    console.log("/api/getCountStakingPoolsForAdmin - Request: " + toJson(req.body));

    try {
        const count = await getCountStakingPoolsForAdminFromDB (pkh)
        res.status(200).json({ msg: "StakingPool counted", count : count})
        return

    } catch (error) {
        console.error("/api/getCountStakingPoolsForAdmin - Can't get count - Error: " + error);
        res.status(400).json({ msg: "Can't get count - Error:" + error})
        return 
    }
  
}
