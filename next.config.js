/** @type {import('next').NextConfig} */
const {join} = require('path')
const {access, symlink} = require('fs/promises')
module.exports = {
  reactStrictMode: false,
  images : {
    domains: ['ratsdao.io','upload.wikimedia.org']
  },
  webpack: (config, { isServer }) =>  
  // {
  //   if (isServer) {
  //     config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
  //   } else {
  //     config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
  //   }
  //   config.experiments = { 
  //     asyncWebAssembly: true, 
  //     topLevelAwait: true, 
  //     layers: true 
  //   };
  //   config.optimization.moduleIds = 'named';
  //   return config;
  // },
  
  {
    config.experiments = { 
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true
    }

    config.plugins.push(
      new (class {
        apply(compiler) {
          compiler.hooks.afterEmit.tapPromise(
            'SymlinkWebpackPlugin',
            async (compiler) => {
              if (isServer) {
                const from = join(compiler.options.output.path, '../static');
                const to = join(compiler.options.output.path, 'static');
    
                try {
                  await access(from);
                  console.log(`${from} already exists`);
                  return;
                } catch (error) {
                  if (error.code === 'ENOENT') {
                    // No link exists
                  } else {
                    throw error;
                  }
                }
    
                await symlink(to, from, 'junction');
                console.log(`created symlink ${from} -> ${to}`);
              }
            },
          );
        }
      })(),
    );
    return config
  }
}





// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   webpack(config, { isServer }) {
//     if (isServer) {
//       config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
//     } else {
//       config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
//     }
//     config.experiments = { 
//       asyncWebAssembly: true, 
//       topLevelAwait: true, 
//       layers: true  
//     };
//     config.optimization.moduleIds = 'named';

//     return config;
//   },
// };

// module.exports = nextConfig;

