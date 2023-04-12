//--------------------------------------
import type { InferGetServerSidePropsType, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import RequestStakingPool from '../components/RequestStakingPool';
import Layout from '../components/Layout';
import Message from '../components/Message';
//--------------------------------------
const Request : NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({} : InferGetServerSidePropsType<typeof getServerSideProps>) =>  {
	
	const { data: session, status } = useSession()
	return (
		<Layout >
		{
			(status == "loading")? 
				<Message message={"Loading Page..."} />
			:
				(status === "unauthenticated")? 
					<Message message={"Connect you wallet to Request the creation of a Staking Pool"} />
				:
					(typeof window !== 'undefined' && <RequestStakingPool/>)
		}
		</Layout>
	)
}

export async function getServerSideProps(context : any) { 

	return {
		props: { }
	};
}

export default Request
