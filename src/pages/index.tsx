//--------------------------------------
import type {
    InferGetStaticPropsType,
    InferGetServerSidePropsType,
    NextPage,
} from 'next'
import Layout from '../components/Layout'
import dynamic from 'next/dynamic'
import { toJson } from '../utils/utils'
import { connect } from '../utils/dbConnect'
import { useStoreState } from '../utils/walletProvider'
import {
    StakingPoolDBInterface,
    getStakingPools,
} from '../types/stakePoolDBModel'
import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { stakingPoolDBParser } from '../stakePool/helpersStakePool'
import { getSession, useSession } from 'next-auth/react'
import StakingPool from '../components/StakingPool'
import Message from '../components/Message'

//--------------------------------------

const Home: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
    pkh,
    stakingPools,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    //--------------------------------------
    const [isRefreshing, setIsRefreshing] = useState(true)
    //--------------------------------------
    const { data: session, status } = useSession()
    //--------------------------------------
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState<string>('')
    //--------------------------------------
    const handleSearch = (term: string) => {
        router.push({
            pathname: '/',
            query: { search: term },
        })
    }
    const clearSearch = () => {
        setSearchTerm('')
        router.push({
            pathname: '/',
            query: {}, // Remove the filterName query parameter
        })
    }
    //--------------------------------------
    const [stakingPoolsParsed, setStakingPoolsParsed] = useState<
        StakingPoolDBInterface[]
    >([])
    //--------------------------------------
    useEffect(() => {
        if (stakingPools) {
            for (let i = 0; i < stakingPools.length; i++) {
                stakingPools[i] = stakingPoolDBParser(stakingPools[i])
            }
            setStakingPoolsParsed(stakingPools)
        }
        setIsRefreshing(false)
    }, [stakingPools])
    //--------------------------------------
    return (
        <Layout>
            {status == 'loading' ? (
                <Message message={'Loading Page...'} />
            ) : isRefreshing ? (
                <Message message={'Loading Page...'} />
            ) : (
                <>
                    {/* <div>
                        <input
                            type="text"
                            value={searchTerm}
                            placeholder="Search by name"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={() => handleSearch(searchTerm)}>
                            Search
                        </button>
                        {searchTerm && <button onClick={clearSearch}>X</button>}
                    </div> */}

                    {stakingPoolsParsed.length > 0 ? (
                        stakingPoolsParsed.map(
                            (sp) =>
                                typeof window !== 'undefined' && (
                                    <StakingPool
                                        key={sp.name}
                                        stakingPoolInfo={sp}
                                    />
                                )
                        )
                    ) : (
                        <Message
                            message={"Can't find any Staking Pool available"}
                        />
                    )}
                </>
            )}
        </Layout>
    )
}

export async function getServerSideProps(context: any) {
    try {
        console.log('Home getServerSideProps -------------------------------')
        await connect()
        const session = await getSession(context)
        if (session) {
            console.log(
                'Home getServerSideProps - init - session:',
                toJson(session)
            )
        } else {
            //console.log ("Create getServerSideProps - init - session: undefined");
        }

        const filterName = context.query.search || undefined

        var rawDataStakingPools: StakingPoolDBInterface[]
        rawDataStakingPools = await getStakingPools(
            true,
            undefined,
            undefined,
            filterName
        )

        console.log(
            'Home getServerSideProps - stakingPool - length: ' +
                rawDataStakingPools.length
        )
        const stringifiedDataStakingPools = toJson(rawDataStakingPools)
        const dataStakingPools: StakingPoolDBInterface[] = JSON.parse(
            stringifiedDataStakingPools
        )
        return {
            props: {
                pkh: session?.user.pkh !== undefined ? session?.user.pkh : '',
                stakingPools: dataStakingPools,
            },
        }
    } catch (error) {
        console.error(error)
        const dataStakingPools: StakingPoolDBInterface[] = []
        return {
            props: {
                pkh: '',
                stakingPools: dataStakingPools,
            },
        }
    }
}

export default Home
