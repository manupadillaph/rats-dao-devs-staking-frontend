//--------------------------------------
import type { InferGetServerSidePropsType, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { useState } from 'react';
import { pubKeyHashToAddress } from '../utils/cardano-utils';


//--------------------------------------
const PkhToAddress : NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({} : InferGetServerSidePropsType<typeof getServerSideProps>) =>  {
	const [file, setFile] = useState(null);
	const [csv, setCsv] = useState("");
	
	
	async function handleUpload(event: any) {
		const csv = await event.target.files[0].text();
		// const json = await parse(csv);
		setFile(event.target.files[0]);
		setCsv(csv);
	}
	
	async function handleDownload() {
		// const csv = await parseAsync(json);
		console.log (csv)

		let result = ""
		//get lines in file
		const lines = csv.split('\n');
		//process all the lines
		for (let i = 0; i < lines.length; i++) {
			//get all the fields
			const fields = lines[i].split(',');
			//get the first field
			const pkh = fields[0].trim();;
			//trim the field
			const user_To_SendBackAddr = pubKeyHashToAddress(1, pkh);
			result += pkh + "," + user_To_SendBackAddr + "\n"
		}

		const blob = new Blob([result!], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'result.csv');
		link.click();
	}

	return (
		<Layout >
		<div>
 	      <input type="file" onChange={handleUpload} />
 	      <button onClick={handleDownload} disabled={!csv}>
 	        Download result
 	      </button>
 	    </div>
		</Layout>
	)
}

export async function getServerSideProps(context : any) { 

	return {
		props: { }
	};
}

export default PkhToAddress




// import { useState } from 'react';
// import { parse } from 'csvtojson';
// import { parseAsync } from 'json2csv';

// export default function UploadForm() {
//   const [file, setFile] = useState(null);
//   const [json, setJson] = useState(null);

//   async function handleUpload(event) {
//     const csv = await event.target.files[0].text();
//     const json = await parse(csv);
//     setFile(event.target.files[0]);
//     setJson(json);
//   }

//   async function handleDownload() {
//     const csv = await parseAsync(json);
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', 'result.csv');
//     link.click();
//   }

//   return (
//     <div>
//       <input type="file" onChange={handleUpload} />
//       <button onClick={handleDownload} disabled={!json}>
//         Download result
//       </button>
//     </div>
//   );
// }