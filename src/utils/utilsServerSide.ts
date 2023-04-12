//--------------------------------------
import { constants } from 'fs';
import { Script } from 'lucid-cardano';
import path from 'path';
import { toJson } from './utils';
//---------------------------------------------------------------
const fs = require('fs/promises');
//---------------------------------------------------------------
export function createScriptFromHEXCBOR(hexCbor: string, type: string = "PlutusScriptV2") {
    const script: Script = {
        type: ((type == "PlutusScriptV1") ? "PlutusV1" : "PlutusV2"),
        script: "59084c" + hexCbor
    }
    return script
}

      
export async function getScriptFromFile(filename: string)  {
    try {
        const pathToFile = path.join(process.env.REACT_SERVER_PATH_FOR_SCRIPTS!, filename);
        const data = await fs.readFile(pathToFile, { encoding: 'utf8' });
        //console.log(data);
        let jsonFile = JSON.parse(data);
        const script: Script = {
            type: ((jsonFile.type == "PlutusScriptV1") ? "PlutusV1" : "PlutusV2"),
            script: jsonFile.cborHex
        }
        return script
    } catch (error: any) {
        console.error("Error reading: " + filename + " " + error);
        throw "Error reading: " + filename + " " + error;
    }
}

export async function getSymbolFromFile(filename: string)  {
    try {
        const pathToFile = path.join(process.env.REACT_SERVER_PATH_FOR_SCRIPTS!, filename);
        const data = await fs.readFile(pathToFile, { encoding: 'utf8' });
        //console.log(data);
        let jsonFile = JSON.parse(data);
        return jsonFile.bytes
    } catch (error: any) {
        console.error("Error reading: " + filename + " " + error);
        throw "Error reading: " + filename + " " + error;
    }
}

export async function getTextFromFile(filename: string)  { 
    try {
        const pathToFile = path.join(process.env.REACT_SERVER_PATH_FOR_SCRIPTS!, filename);
        const data = await fs.readFile(pathToFile, { encoding: 'utf8' });
        //console.log(data);
        return data
    } catch (error: any) {
        console.error("Error reading: " + filename + " " + error);
        throw "Error reading: " + filename + " " + error;
    }
}


export async function mkdir (dir: string) {

    try{
        console.log("Creating folder: " + dir);
        await fs.mkdir(dir);
        console.log("Created folder: " + dir);
    }catch (error: any) {
        console.log("Create folder error (maybe the folder already exist): " + error);
    }
}

export async function rmdir (dir: string) {

    try{
        console.log("Deleting folder: " + dir);
        await fs.rmdir(dir, { recursive: true});
        console.log("Deleted folder: " + dir);
    }catch (error: any) {
        console.log("Delete folder error (maybe the folder doesn't exist): " + error);
    }

    // console.log(fs);

    // fs.access(dir, constants.R_OK, (err: any) => {
    //     if (!err) {
    //         console.log(dir, 'directory already exists')
    //         fs.rmdir(dir, { recursive: true, }, (error: any) => {
    //             if (error) {
    //                 console.log(error);
    //             }
    //             else {
    //                 console.log("Recursive: Directories Deleted!");
    //             }
    //         });
    //     }
    // });
    // const data = await fs.access(dir);
    // console.log(data);

    // fs.exists('/etc/passwd', (exists: Boolean) => {
    //     console.log(exists ? 'Found' : 'Not Found!');
    //     // var list = fs.readdirSync(dir);
    //     // for(var i = 0; i < list.length; i++) {
    //     //     var filename = path.join(dir, list[i]);
    //     //     var stat = fs.statSync(filename);

    //     //     if(filename == "." || filename == "..") {
    //     //         // pass these files
    //     //     } else if(stat.isDirectory()) {
    //     //         // rmdir recursively
    //     //         rmdir(filename);
    //     //     } else {
    //     //         // rm fiilename
    //     //         fs.unlinkSync(filename);
    //     //     }
    //     // }
    //     // fs.rmdirSync(dir);
    //   });
      
    // if (fs.existsSync(dir)) {
    //     var list = fs.readdirSync(dir);
    //     for(var i = 0; i < list.length; i++) {
    //         var filename = path.join(dir, list[i]);
    //         var stat = fs.statSync(filename);

    //         if(filename == "." || filename == "..") {
    //             // pass these files
    //         } else if(stat.isDirectory()) {
    //             // rmdir recursively
    //             rmdir(filename);
    //         } else {
    //             // rm fiilename
    //             fs.unlinkSync(filename);
    //         }
    //     }
    //     fs.rmdirSync(dir);
    // }
};

//---------------------------------------------------------------

