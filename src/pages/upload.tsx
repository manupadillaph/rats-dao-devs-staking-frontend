//--------------------------------------
import type { InferGetServerSidePropsType, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import UploadStakingPool from '../components/UploadStakingPool';
import Layout from '../components/Layout';
import Message from '../components/Message';
//--------------------------------------
const Upload : NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({} : InferGetServerSidePropsType<typeof getServerSideProps>) =>  {
	
	const { data: session, status } = useSession()
	return (
		<Layout>
		{
			(status == "loading")? 
				<Message message={"Loading Page..."} />
			:
				(status === "unauthenticated")? 
						<Message message={"Connect you wallet to Upload a Staking Pool"} />
					:
						session?.user.swPortalUploader? 
							(typeof window !== 'undefined' && <UploadStakingPool/>)
						:
							<Message message={"Upload Staking Pool is restricted to especific Wallets"} />
		}
		</Layout>
	)
}

export async function getServerSideProps(context : any) { 

	return {
		props: { }
	};
}

export default Upload
