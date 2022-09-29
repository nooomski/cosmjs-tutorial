# Building a Frontend for your Cosmos Chain

## Welcome!
Hi, I'm Noam Cohen, a developer, a coordinator and a musician! I work at Interchain as the Developer Relations Lead, some projects I work on:  
- The [Developer Portal](https://developers.cosmos.network/)
- The [Interchain Developer Academy](https://academy.cosmos.network/)
- The [Cosmos Hub](https://hub.cosmos.network/)
- Several frontend applications that I coordinate with other teams

My main goal at Interchain is to get more people exited about using the Cosmos Stack; both users and devs.
  
  
## Some context
There are cool things being built with the Cosmos Stack.

Most recently:
- Authz & Feegrant Module
- Groups Module
- Interchain Accounts

These are powerful tools, but not many people are using them in the wild. The thing that's missing in order to make these tools successful is:  

**GREAT UX** 

*The Cosmos does not thrive in the CLI*

How do we achieve this?  
We **build good apps** using CosmJS and related libraries  
  
  
## What are we going to build?
This is an introduction on how to build a basic frontend application for Cosmos chains. After this tutorial, you should have a basic next.js app setup that you can easily expand on to cover all your needs.  

These are the steps we're going to take:

1. Set up a next.js app
2. Import CosmJS
3. Connect to the Cosmos Hub testnet
4. Get some testnet ATOM
5. Connect to Keplr
6. Query and display your wallet's balance
7. Send tokens to another address

Disclaimer: I am by no means a typescript wizard, I'm just trying to get you familiar with the Cosmos aspect of frontend development.

## What do we need to get started?
- VScode or something similar
- npm / npx installed
- A public endpoint to query data from and submit transactions to
- The [Keplr browser extension](https://www.keplr.app/) and a wallet address
- A discord account so you can request testnet tokens in the [Cosmos Network Discord](https://discord.com/invite/cosmosnetwork).


# Tutorial

## Step 1. Setting up a Next.js App

Let's create a next.js app and check if it's all running:
```shell
cd code/tutorials
npx create-next-app@latest --typescript
cool-cosmos-app

cd cool-cosmos-app
npm run dev
```

Go to http://localhost:3000/. If you're seeing *"Welcome to Next.js!"* you're good to go.

### A Basic UI
Let's not spend too much time on doing any markup work. Just [take the code directly](https://github.com/nooomski/cosmjs-tutorial/blob/f609f711ee76ca858db4b524836438d89c57bdcc/components/SimpleUI.tsx). Or clone the entire repo and checkout the right commit:

```shell
git clone https://github.com/nooomski/cosmjs-tutorial
cd cosmjs-tutorial
git checkout f609f711ee
```

This should have created a new `components` folder in your working directory. Now let's get rid of the `Next.js` landing page and replace it with this UI. Remove all the code in `pages/index.ts` and replace it with the following:

```typescript
import type { NextPage } from 'next'
import { SimpleUI } from '../components/SimpleUI'

const Home: NextPage = () => {
  return <SimpleUI
    rpcUrl="" />
}

export default Home
```

Go to http://localhost:3000/. You should now see a simple UI.


## Step 2. CosmJS
Let's begin with some context, what does CosmJS do?

- Cosmos SDK modules have messages and queries that are defined in protobuf. Every module has specific messages that contain types that need to be encoded and decoded. In order for CosmJS to be able to do this, it needs to understand what these protofiles mean and convert them to Typescript types. Most of the types are already generated for you, but if you build your own SDK module, or create new queries or messages inside existing ones, you'll need to generate the types for that yourself! (more on that later)

- CosmJS is modular. Some take care of signing messages for you, some take care of encoding, cryptography, CosmWasm, etc. A full overview is available [here](https://www.npmjs.com/org/cosmjs).

- One of the main modules you'll be using is `@cosmjs/stargate`. This is the module that contains a client that's responsible for signign the messages you'll be sending to the blockchain. It's called Stargate because that was a very important update to the Cosmos Hub that enabled a lot of important features back in 2020. Another imporant one is `@cosmjs/encoding`, which, as the name suggests, handles all the encoding so your app can understand the data, and the chain can understand the data you broadcast to it.

### Importing the Right Modules
Let's install the CosmJS Stargate module from the root of our working folder:

```shell
npm install @cosmjs/stargate cosmjs-types --save
```

Now let's import them in `components/SimpleUI.tsx` at the top of the file:

```typescript
import { Coin, StargateClient, SigningStargateClient } from "@cosmjs/stargate"
```

## Step 3. Connecting to the Cosmos Hub Testnet
Newcomers to the space always ask, how can I connect to the blockchain? For that you'll need a node.

### What is a node?
A node is just a server running the binary that runs the chain. A node carries the data that sits on the blockchain and stays in sync with the chain block by block.  

Important to note is that nodes are often **pruned**, otherwise they would be very large and expensive to maintain (up to several terrabytes for some chains!). This means that they generally don't contain a lot of historical data, but only the most recent state of the blockchain. Practically, this means you generally can't ask things like "what was the balance of this address at blockheight xxx?", but you can always ask it what the current balance is, for example.  

### Where can I find these nodes?
For the Cosmos Hub testnet you'll need to connect to one of [these nodes](https://github.com/cosmos/testnets/tree/master/v7-theta/public-testnet#endpoints). I'll be using `https://rpc.sentry-02.theta-testnet.polypore.xyz`. 

There are public nodes available for most chains, there's a nice overview over at the [Chain Registry](https://github.com/cosmos/chain-registry/), but please note these are for development purposes only. If too many people use these nodes, they will likely get congested and taken down. App developers are expected to take care of their own infrastructure needs by either running a node yourself or renting on from a node provider.

### Setting up the RPC client in CosmJS
Add your endpoint as the `rpcUrl` in `index.tsx`:  

```typescript
rpcUrl="https://rpc.sentry-02.theta-testnet.polypore.xyz" />
```

Let's fetch some data to display by adding a request for the `ChainId` to `components/SimpleUI.tsx`. Add the following code below the constructor:

```typescript
init = async() => this.getChainID(await StargateClient.connect(this.props.rpcUrl))

// Get the ChainID
getChainID = async(client: StargateClient) => {
    const c = await client.getChainId()
    this.setState({
        chainID: c
    })
}
```

At `init`, the `getChainID` function gets called after the `StargateClient` connects to the node. The function then requests the `ChainId` from the client and sets this to state, which then gets rendered by React.

We should also add a timeout to our constructor:

```typescript
...
        toAddress: ""
    }
    setTimeout(this.init, 500)
}
```

Check your browser, you should now see `theta-testnet-001` show up under Chain Name!


## Step 4. Get some testnet ATOM
This one is relatively easy. Make sure you have [Keplr](https://www.keplr.app/) installed and have an [address created](https://help.keplr.app/getting-started/creating-a-new-keplr-account). You also need to be a member of the [Cosmos Network Discord](https://discord.com/invite/cosmosnetwork) to request testnet tokens.

Copy your address from Keplr and go to the `#testnet-faucet` channel on Discord. Run the following command:

```
$request [YOUR ADDRESS] theta
```

You should get a confirmation in Discord. Keplr doesn't have all chains installed by default. In order to see your balance in Keplr, you need to add the testnet to the app. An easy way to do this is via this [Chain Registry tool](https://chain-registry.netlify). Select the Theta chain in the top right, click `Add to Keplr` and confirm the pop-up. After this, open the Keplr app and and select the `Theta Testnet` from the list of chains.


## Step 5. Connecting to Keplr
Let's make that `Connect Wallet` button work. Let's install and import Keplr first. In your terminal:

```shell
npm i @keplr-wallet/types
```

Add the import line and the global declaration at the top of `components/SimpleUI.tsx`:

```typescript
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types"

declare global {
    interface Window extends KeplrWindow {}
}
```

Now we need to add the metadata that Keplr needs to actually connect to the blockchain and understand its tokens and features. Add this function below the `onKeplrClicked` function:

```typescript
getTestnetChainInfo = (): ChainInfo => ({
    chainId: "theta-testnet-001",
    chainName: "theta-testnet-001",
    rpc: "https://rpc.sentry-02.theta-testnet.polypore.xyz/",
    rest: "https://rest.sentry-02.theta-testnet.polypore.xyz/",
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmos" + "pub",
        bech32PrefixValAddr: "cosmos" + "valoper",
        bech32PrefixValPub: "cosmos" + "valoperpub",
        bech32PrefixConsAddr: "cosmos" + "valcons",
        bech32PrefixConsPub: "cosmos" + "valconspub",
    },
    currencies: [
        {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
        {
            coinDenom: "THETA",
            coinMinimalDenom: "theta",
            coinDecimals: 0,
        },
        {
            coinDenom: "LAMBDA",
            coinMinimalDenom: "lambda",
            coinDecimals: 0,
        },
        {
            coinDenom: "RHO",
            coinMinimalDenom: "rho",
            coinDecimals: 0,
        },
        {
            coinDenom: "EPSILON",
            coinMinimalDenom: "epsilon",
            coinDecimals: 0,
        },
    ],
    feeCurrencies: [
        {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
    ],
    stakeCurrency: {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
    },
    coinType: 118,
    gasPriceStep: {
        low: 1,
        average: 1,
        high: 1,
    },
    features: ["ibc-transfer"],
})
```

Finally, we need to connect the wallet when the user requests it, and add the chain to Keplr in case it's not already added. Replace `onKeplrClicked` with this:

```typescript
onKeplrClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    const { keplr } = window
    if (!keplr) {
        alert("You need to install Keplr")
        return
    }
    // Add the chain to Keplr in case it's not already added
    await keplr.experimentalSuggestChain(this.getTestnetChainInfo())
}
```

## Step 6. Query and display your wallet's balance
The button should now request users to add the Testnet chain, but we still need to actually request the user's balance. Add this below the `experimentalSuggestChain`:

```typescript
// Create the signing client
const offlineSigner: OfflineSigner =
window.getOfflineSigner!("theta-testnet-001")
const signingClient = await SigningStargateClient.connectWithSigner(
    this.props.rpcUrl,
    offlineSigner,
)

// Get the address and balance of your user
const account: AccountData = (await offlineSigner.getAccounts())[0]
this.setState({
    myAddress: account.address,
    myBalance: (await signingClient.getBalance(account.address, "uatom")).amount,
})
```

You'll need to import `AccountData` and `OfflineSigner` to make that work:

```typescript
import { AccountData, OfflineSigner } from "@cosmjs/proto-signing"
```

Have a look at the browser and try clicking the `Connect Wallet` button now! Your wallet and its balance should show up.

## Step 7. Sending Tokens to an Address
We're going to replace the `onSendClicked` function to do the following things:

1. Get the current state of the form and our address
2. Create the `OfflineSigner` and `signingClient`
3. Get the `AccountData`
4. Submit the transaction
5. Update the balance in the UI

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    // Get the current state and amount of tokens that we want to transfer
    const { denom, toSend, toAddress, myAddress } = this.state

    // Create the signing client
    const offlineSigner: OfflineSigner =
    window.getOfflineSigner!("theta-testnet-001")
    const signingClient = await SigningStargateClient.connectWithSigner(
        this.props.rpcUrl,
        offlineSigner,
    )
    
    // Get the accountdata
    const account: AccountData = (await offlineSigner.getAccounts())[0]
    
    // Submit the transaction to send tokens to the faucet
    const sendResult = await signingClient.sendTokens(
        account.address,
        toAddress,
        [
            {
                denom: denom,
                amount: toSend,
            },
        ],
        {
            amount: [{ denom: "uatom", amount: "500" }],
            gas: "200000",
        },
    )

    // Print the result to the console
    console.log(sendResult)
    // Update the balance in the user interface
    this.setState({
        myBalance: (await signingClient.getBalance(account.address, denom)).amount
    })
}
```

Try connecting with the wallet now, and sending an amount of tokens to another address. If you don't know which address to send to, feel free to send the tokens back to the faucet. The faucet address is `cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he`.

We're currently not doing any error catching, so if you try to send tokens without connecting to a wallet first, everything will break. It's not the cleanest setup, but I just wanted to get you familiar with the basics.


## Final Thoughts
You now have a next.js application that is able to query data from a chain, display a balance and send tokens to someone.


### What's Next?
You made it! If you didn't get this far, the final outcome of this tutorial is available [here](https://github.com/nooomski/cosmjs-tutorial). You now have a few options depending on what you're going to be building:

1. If you are using CosmWasm, you will want to import CosmWasm.js to be able to start interacting with smart contracts. This is basically just a wrapper of several CosmJS modules to make it easier for your to work with CosmWasm. The [repo is here](https://github.com/CosmWasm/CosmWasmJS).

2. If you are building your own SDK module, you will need to create custom types for your queries and messages. There are several ways to do this. The easiest tool available at the moment is [Telescope](https://github.com/osmosis-labs/telescope). We also have a tutorial for an alternative method up on the [Developer Portal](https://tutorials.cosmos.network/academy/5-cosmjs/create-custom.html).

And finally, if you really like this stuff, we have a free 7 week training program called the Interchain Developer Program. You will learn everything about Cosmos like building your own chain, running a validator, the Inter Blockchain Communication protocol and CosmJS. We run several of these throughout the year, and I highly recommend you [sign up here](https://academy.cosmos.network/)!

You can follow me on twitter [@Gnomeskiii](https://twitter.com/Gnomeskiii)
