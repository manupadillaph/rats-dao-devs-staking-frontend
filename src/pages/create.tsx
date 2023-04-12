//--------------------------------------
import type { InferGetServerSidePropsType, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import CreateStakingPool from '../components/CreateStakingPool';
import Layout from '../components/Layout';
import Message from '../components/Message';
import { toJson } from '../utils/utils';
//--------------------------------------
const Create : NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({query} : InferGetServerSidePropsType<typeof getServerSideProps>) =>  {
	
	const { data: session, status } = useSession()

	return (
		<Layout>
		{
			(status == "loading")? 
				<Message message={"Loading Page..."} />
			:
				(status === "unauthenticated")? 
						<Message message={"Connect you wallet to Create a Staking Pool"} />
					:
						session?.user.swRatsDAOCreator? 
							(typeof window !== 'undefined' && <CreateStakingPool query={query}/>)
						:
							<Message message={"Create Staking Pool is restricted to especific Wallets"} />
		}
		</Layout>
	)
}

export async function getServerSideProps(context : any) { 

	return {
		props: { 
			query : context.query
		}
	};
}

export default Create
