import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { AccountInfo } from '@polkadot/types/interfaces';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
dotenv.config();

interface Instruction {
    type: "Swap" | "XcTransfer";
    swap?: Swap;
    xcTransfer?: XcTransfer;
}
interface Swap {
    initialAsset: any;
    initialAmount: any;
    finalAsset: any;
    finalAmount: any;
}
interface XcTransfer {
    initialAsset: any;
    initialChain: any;
    finalAsset: any;
    finalChain: any;
    transferAmount: any;
}

const lenny = "GXeHEVY5SSJFQqcFmANaY3mTsRpcE9EUVzDcGpowbbe41ZZ"
const lennyAccountId32 = "0xaee65bf22cdf1f98c91b6c176854d8072f1328e027d2e84d23607b517b1b9429"
const evmWallet = "0xae8da4a9792503f1ec97ed035e35133a9e65a61f"
const transferAmount = "1,000,000,000"
const bifrost = 2001;
const karura = 2000;
const basalisk = 2090;
const heiko = 2085;
const mangata = 2110;
const moonriver = 2023;
const shiden = 2007;
const statemine = 1000;

async function grabTestRoutes() {
    const directoryPath = path.join(__dirname, '../test2/arb-dot-2/arb_handler/result_log_data/2023-11-05');
    let fileNames = await fs.readdirSync(directoryPath);
    let routes: any[] = []
    fileNames.map((fileName: any) => {
        let filePath = path.join(directoryPath, fileName);
        let route = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        routes.push(route);
    })
    return routes;

}

async function run() {
    const routes = await grabTestRoutes();
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, './allAssets.json'), 'utf8'));

    routes.forEach(async (route: any) => {
        route.forEach((asset: any) => {
            const validated = checkRegistryForAsset(asset.node_key, registry);
            if (!validated) {
                console.log("Asset not found");
                throw new Error("Asset not found");
            } 
        })
        // let instructionSet = await analyzeRoute(route, registry);
        
    })
    let instructionSet = await analyzeRoute(routes[0], registry);
}

async function buildXcTransferInstruction(instruction: Instruction) {
    if(!instruction.xcTransfer) {
        throw new Error("Instruction is not an XcTransfer");
    }
    const { initialAsset, initialChain, finalAsset, finalChain, transferAmount } = instruction.xcTransfer;
    let tokenMultiAssetLocation = initialAsset.tokenLocation;
    if (!tokenMultiAssetLocation) {
        throw new Error("Asset does not have location");
    }
    let parachain = findValueByKey(tokenMultiAssetLocation, "Parachain");
    if (parachain == 'here') {
        //token is KSM

    } else if (parachain == finalChain) {

    } else {
        //XCM to origin chain then target chain

    }

}
async function constructPolkadotXcmTransfer(assetMultiLocation: any, targetChain: any, amount: any) {
    const dest = { V3: { parents: 1, interior: { X1: { Parachain: targetChain } } } }
    const ben = { V3: { parents: 1, interior: { X1: { AccountId32: { network: null, id: lennyAccountId32 } } } } }
    const assets = { V3: [{ id: { Concrete: { interior: assetMultiLocation, parents: 1 } }, fun: { Fungible: amount } }] }
    const fee = 0;
    const weight = {Unlimited: null}
}
async function checkAssetLocations() {
    
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, './allAssets.json'), 'utf8'));
    await registry.forEach((asset: any) => {
        if (asset.hasLocation) {
            let parachain = findValueByKey(asset.tokenLocation, "Parachain");
            if (!parachain) {
                console.log("Asset has location but no parachain");
                console.log(asset)
            }
        }
    })
}

function findValueByKey(obj: any, targetKey: any): any {
    if (typeof obj !== 'object' || obj === null) {
        return null;
    }
    for (let key in obj) {
        if (key === targetKey) {
            return obj[key];
        }

        let foundValue: any = findValueByKey(obj[key], targetKey);
        if (foundValue !== null) {
            return foundValue;
        }
    }
    return null;
}
async function getAllAssetInstances() {
    const nodeKey = "{\"NativeAssetId\":{\"Token\":\"LKSM\"}}";
    const nodeParachainId = 2000;
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, './allAssets.json'), 'utf8'));
    const matchedAsset = registry.find((asset: any) => {
        if (asset.tokenData.chain == nodeParachainId && JSON.stringify(asset.tokenData.localId) == nodeKey) {
            return true
        }
    })
    let assetInstances = registry.map((asset: any) => {
        if (asset.hasLocation) {
            if(JSON.stringify(asset.tokenLocation) == JSON.stringify(matchedAsset.tokenLocation)) {
                return asset
            }
        }
    }).filter((asset: any) => asset != undefined)
    console.log(assetInstances)
}
// getAllAssetInstances()

async function analyzeRoute(route: any, registry: any) {
    let previousNodeParachainId: string;
    let previousNodeAssetId: string;
    let previousAsset: any;
    let previousNodeAmount: any;
    // console.log("Analyzing route")

    let instructionSet: Instruction[] = [];
    instructionSet = await Promise.all(route.map(async (node: any) => {
        const assetNodeKey = node.node_key;
        const nodeParachainId = assetNodeKey.substring(0, 4);
        const nodeAssetId = assetNodeKey.substring(4);
        const nodeAmount = node.path_value;
        let matchedAsset = await checkRegistryForAsset(assetNodeKey, registry);
        if (!matchedAsset) {
            throw new Error("Asset not found");
        }
        let instruction: Instruction ;
        if (previousNodeParachainId == nodeParachainId) {
            // console.log(`Making swap from ${previousNodeAssetId} to ${nodeAssetId} `);
            let swap: Swap = {
                initialAsset: previousAsset,
                initialAmount: previousNodeAmount,
                finalAsset: matchedAsset,
                finalAmount: nodeAmount
            }
            instruction = {
                type: "Swap",
                swap: swap
            }
            previousNodeParachainId = nodeParachainId;
            previousNodeAssetId = nodeAssetId;
            previousAsset = matchedAsset;
            previousNodeAmount = nodeAmount;
            // instructionSet.push(instruction);
            return instruction;
        } else if (previousNodeParachainId == undefined) {
            // console.log("First asset in route");
            previousNodeParachainId = nodeParachainId;
            previousNodeAssetId = nodeAssetId;
            previousAsset = matchedAsset;
            previousNodeAmount = nodeAmount;
        } else {
            // console.log(`Making xc transfer from ${previousNodeAssetId} ${previousNodeParachainId} to ${nodeAssetId} ${nodeParachainId} `);
            let xcTransfer: XcTransfer = {
                initialAsset: previousAsset,
                initialChain: previousNodeParachainId,
                finalAsset: matchedAsset,
                finalChain: nodeParachainId,
                transferAmount: previousNodeAmount
            }
            let instruction = {
                type: "XcTransfer",
                xcTransfer: xcTransfer
            }
            previousNodeParachainId = nodeParachainId;
            previousNodeAssetId = nodeAssetId;
            previousAsset = matchedAsset;
            previousNodeAmount = nodeAmount;
            // instructionSet.push(instruction);
            return instruction;
        }
    }))
    // console.log("Instruction set: ")
    // console.log(instructionSet);
    instructionSet = instructionSet.filter(instruction => instruction != undefined)
    // console.log(instructionSet);
    
    // console.log("----------------------")
    return instructionSet;
}
async function checkRegistryForAsset(assetNodeKey: any, assetRegistry: any) {
    const nodeParachainId = assetNodeKey.substring(0, 4);
    const nodeAssetId = assetNodeKey.substring(4);

    let matchedAsset = assetRegistry.find((asset: any) => {
        if (asset.tokenData.chain == nodeParachainId && JSON.stringify(asset.tokenData.localId) == nodeAssetId) {
            return true
        }
    })
    if (!matchedAsset) {
        console.log("Asset not found");
        return false;
    } else {
        // console.log("Asset found");
        // console.log(matchedAsset.tokenData.localId);
        return matchedAsset;
    }
}

async function buildAllAssetRegistry() {
    const bncAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/bnc/asset_registry.json', 'utf8'))
    const karAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/kar/asset_registry.json', 'utf8'))
    const hkoAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/hko/asset_registry.json', 'utf8'))
    const movrAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/movr/asset_registry.json', 'utf8'))
    const sdnAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/sdn/asset_registry.json', 'utf8'))
    const kucoinAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/kucoin/asset_registry.json', 'utf8'))
    const mgxAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/mgx/asset_registry.json', 'utf8'))
    const bsxAssets = JSON.parse(fs.readFileSync('../test2/arb-dot-2/assets/bsx/asset_registry.json', 'utf8'))
    let allAssets = bncAssets.concat(karAssets).concat(hkoAssets).concat(movrAssets).concat(sdnAssets).concat(kucoinAssets).concat(mgxAssets).concat(bsxAssets)
    fs.writeFileSync('./allAssets.json', JSON.stringify(allAssets, null, 2), 'utf8')
}
// grabTestRoutes();
// buildAllAssetRegistry();
// run()
checkAssetLocations()