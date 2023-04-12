import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {

    export interface User  {
        pkh?: string,
        swRatsDAOAdmin?: boolean; 
        swRatsDAOCreator?: boolean;
        swPortalAdmin?: boolean; 
        swPortalUploader?: boolean;
        walletName?: string;
        swEnviarPorBlockfrost?: boolean;
        isWalletFromSeedletName?: boolean;
    }

    export interface JWT  {
        pkh?: string,
        swRatsDAOAdmin?: boolean; 
        swRatsDAOCreator?: boolean;
        swPortalAdmin?: boolean; 
        swPortalUploader?: boolean;
        walletName?: string;
        swEnviarPorBlockfrost?: boolean;
        isWalletFromSeedletName?: boolean;
    }

    export interface Session {
        user: {
            pkh?: string,
            swRatsDAOAdmin?: boolean; 
            swRatsDAOCreator?: boolean;
            swPortalAdmin?: boolean; 
            swPortalUploader?: boolean;
            walletName?: string;
            swEnviarPorBlockfrost?: boolean;
            isWalletFromSeedletName?: boolean;
        }
    }

}