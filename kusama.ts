import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { AccountInfo } from '@polkadot/types/interfaces';
import dotenv from 'dotenv';

dotenv.config();
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

async function kusamaToTargetChain(targetChain: number) {
    if (targetChain == karura || targetChain == bifrost || targetChain == basalisk || targetChain == heiko) {
        limitedReserveTransferAssetsUnlimited(targetChain)
    } else if (targetChain == mangata) {
        limitedReserveTransferAssets(targetChain)
    } else if (targetChain == statemine) {
        limitedTeleportAssets(targetChain)
    } else if (targetChain == moonriver) {
        limitedReserveTransferAssetsEvm(targetChain)
    }
}

//Works for bnc, kar, bsx, hko
async function limitedReserveTransferAssetsUnlimited(targetChain: number) {
    const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });

    const mnemonic = process.env.WALLET4;
    if (!mnemonic) {
        throw new Error('Mnemonic is not set in .env file');
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    const txAmountNumber = Number(transferAmount.replace(/,/g, ''));

    let dest = { V3: { parents: 0, interior: { X1: { Parachain: targetChain } } } }
    let ben = { V3: { parents: 0, interior: { X1: { AccountId32: { network: null, id: lennyAccountId32 } } } } }
    let assets = { V3: [{ id: { Concrete: { interior: 'Here', parents: 0 } }, fun: { Fungible: txAmountNumber } }] }
    let weightLimit = { Unlimited: null }

    let xcmDest = await api.createType('XcmVersionedMultiLocation', dest)
    let xcmBen = await api.createType('XcmVersionedMultiLocation', ben)
    let xcmAssets = await api.createType('XcmVersionedMultiAssets', assets)
    let xcmWeightLimit = await api.createType('XcmV3WeightLimit', weightLimit)

    const xcmMessage = api.tx.xcmPallet.limitedReserveTransferAssets(xcmDest, xcmBen, xcmAssets, 0, xcmWeightLimit)
    const hash = await xcmMessage.signAndSend(account);
    console.log(`Transaction sent with hash ${hash.toHex()}`);

    await api.disconnect();
}

//works for mgx
async function limitedReserveTransferAssets(targetChain: number) {
    const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });

    const mnemonic = process.env.WALLET4;
    if (!mnemonic) {
        throw new Error('Mnemonic is not set in .env file');
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    const txAmountNumber = Number(transferAmount.replace(/,/g, ''));

    let dest = { V3: { parents: 0, interior: { X1: { Parachain: targetChain } } } }
    let ben = { V3: { parents: 0, interior: { X1: { AccountId32: { network: null, id: lennyAccountId32 } } } } }
    let assets = { V3: [{ id: { Concrete: { interior: 'Here', parents: 0 } }, fun: { Fungible: txAmountNumber } }] }
    let weightLimit = { Limited: { proof_size: 0, ref_time: 300000000 } }

    let xcmDest = await api.createType('XcmVersionedMultiLocation', dest)
    let xcmBen = await api.createType('XcmVersionedMultiLocation', ben)
    let xcmAssets = await api.createType('XcmVersionedMultiAssets', assets)
    let xcmWeightLimit = await api.createType('XcmV3WeightLimit', weightLimit)

    const xcmMessage = api.tx.xcmPallet.limitedReserveTransferAssets(xcmDest, xcmBen, xcmAssets, 0, xcmWeightLimit)
    const hash = await xcmMessage.signAndSend(account);
    console.log(`Transaction sent with hash ${hash.toHex()}`);

    await api.disconnect();   
}

//works for statemine
async function limitedTeleportAssets(targetChain: number) {
    const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });

    const mnemonic = process.env.WALLET4;
    if (!mnemonic) {
        throw new Error('Mnemonic is not set in .env file');
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    const txAmountNumber = Number(transferAmount.replace(/,/g, ''));
    
    let dest = { V3: { parents: 0, interior: { X1: { Parachain: targetChain } } } }
    let ben = { V3: { parents: 0, interior: { X1: { AccountId32: { network: null, id: lennyAccountId32 } } } } }
    let assets = { V3: [{ id: { Concrete: { interior: 'Here', parents: 0 } }, fun: { Fungible: txAmountNumber } }] }
    let weightLimit = { Unlimited: null }

    let xcmDest = await api.createType('XcmVersionedMultiLocation', dest)
    let xcmBen = await api.createType('XcmVersionedMultiLocation', ben)
    let xcmAssets = await api.createType('XcmVersionedMultiAssets', assets)
    let xcmWeightLimit = await api.createType('XcmV3WeightLimit', weightLimit)

    const xcmMessage = api.tx.xcmPallet.limitedTeleportAssets(xcmDest, xcmBen, xcmAssets, 0, xcmWeightLimit)
    const hash = await xcmMessage.signAndSend(account);
    console.log(`Transaction sent with hash ${hash.toHex()}`);

    await api.disconnect();

}

//works for movr
async function limitedReserveTransferAssetsEvm(targetChain: number) {
    const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });

    const mnemonic = process.env.WALLET4;
    if (!mnemonic) {
        throw new Error('Mnemonic is not set in .env file');
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    const txAmountNumber = Number(transferAmount.replace(/,/g, ''));

    let dest = { V3: { parents: 0, interior: { X1: { Parachain: targetChain } } } }
    let ben = { V3: { parents: 0, interior: { X1: { AccountKey20: { network: null, key: evmWallet } } } } }
    let assets = { V3: [{ id: { Concrete: { interior: 'Here', parents: 0 } }, fun: { Fungible: txAmountNumber } }] }
    let weightLimit = { Unlimited: null }

    let xcmDest = await api.createType('XcmVersionedMultiLocation', dest)
    let xcmBen = await api.createType('XcmVersionedMultiLocation', ben)
    let xcmAssets = await api.createType('XcmVersionedMultiAssets', assets)
    let xcmWeightLimit = await api.createType('XcmV3WeightLimit', weightLimit)

    const xcmMessage = api.tx.xcmPallet.limitedReserveTransferAssets(xcmDest, xcmBen, xcmAssets, 0, xcmWeightLimit)
    const hash = await xcmMessage.signAndSend(account);
    console.log(`Transaction sent with hash ${hash.toHex()}`);

    await api.disconnect();
}

// limitedReserveTransferAssetsEvm(shiden)
// limitedReserveTransferAssetsUnlimited(heiko)
// KusamaToKarura();
// kusamaToTargetChain(bifrost);
// limitedTeleportAssets(statemine)