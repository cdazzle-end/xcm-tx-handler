import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const bifrost = 2001;

async function bifrostToKusama() {
    const provider = new WsProvider('wss://bifrost-parachain.api.onfinality.io/public-ws');
    const api = await ApiPromise.create({ provider: provider });
}

async function transferToTargetChain(assetKey: string, targetChain: string) {
    const provider = new WsProvider('wss://bifrost-parachain.api.onfinality.io/public-ws');
    const api = await ApiPromise.create({ provider: provider });

    const mnemonic = process.env.WALLET4;
    if (!mnemonic) {
        throw new Error('Mnemonic is not set in .env file');
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);

    await api.disconnect();
}

async function bncXcTransaction(instruction: any) {
    const provider = new WsProvider('wss://bifrost-parachain.api.onfinality.io/public-ws');
    const api = await ApiPromise.create({ provider: provider });

    const mnemonic = process.env.WALLET4;
    if (!mnemonic) {
        throw new Error('Mnemonic is not set in .env file');
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);

    const { initialAsset, initialChain, finalAsset, finalChain, transferAmount } = instruction.xcTransfer;
    if (initialChain == 2001 && finalChain == 2000) {
        const nonce = await api.rpc.system.accountNextIndex(account.address);
        
        // const transfer = api.tx.xGatewayBitcoin.transfer(finalAsset, transferAmount, nonce);
        // const hash = await transfer.signAndSend(account);
        // console.log(`Transfer sent with hash ${hash}`);
    }
}

async function checkRegistryForAsset(assetKey: any) {
    // const provider = new WsProvider('wss://bifrost-parachain.api.onfinality.io/public-ws');
    // const api = await ApiPromise.create({ provider: provider });

    const registry = fs.readFileSync(path.join(__dirname, '../test2/arb-dot-2/assets/bnc/asset_registry.json'), 'utf8');
    const registryJson = JSON.parse(registry);
    console.log(assetKey)

    let matchedAsset = registryJson.find((asset: any) => {
        const assetIdString = JSON.stringify(asset.tokenData.localId);
        console.log(assetIdString)
        if (assetKey == assetIdString) {
            console.log(asset);
            return true;
        }
    })
    if (!matchedAsset) {
        console.log("Asset not found");  
        return false;
    } else {
        console.log("Asset found");
        console.log(matchedAsset);
        return true;
    }
}

checkRegistryForAsset("{\"Token\":\"KSM\"}")