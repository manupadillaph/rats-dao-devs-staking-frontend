import { NextApiHandler } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import { toJson } from '../../../utils/utils';

export const config = {
    api: {
      bodyParser: false,
      externalResolver: true
    },
  }
  
const blockfrostProxy: NextApiHandler = async (req, res) => {
	const target = process.env.NEXT_PUBLIC_BLOCKFROST_URL 
	const PROJECT_ID = process.env.BLOCKFROST_KEY 

	try {
		if (!target || !PROJECT_ID) throw new Error("Invalid target or project id")
		
		//console.log("Blockfrost proxy url: " + toJson(req.url))
		
		const response = await httpProxyMiddleware(req, res, {
		  target,
			
		  headers: {
		    "Content-Type": req.headers['content-type']? req.headers['content-type'] : "text/plain",
		    'project_id': PROJECT_ID,
		  },

		  changeOrigin: true,

		  pathRewrite: [
		    {
		      patternStr: "^/api/blockfrost",
		      replaceStr: "",
		    }
		  ],

          onProxyInit(httpProxy) {
              
            httpProxy.on('proxyReq', (proxyReq, req, res) => {
                //console.log ("proxyReq")
            });
          },
		})

		
		
	} catch (e) {
		console.error("Blockfrost proxy error", e)

		// NOTE(Alan): Not sure if this is compatible with Lucid / the Blockfrost provider
		return res.status(400).end()
	}
}

export default blockfrostProxy