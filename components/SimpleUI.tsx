import { ChangeEvent, Component, MouseEvent } from "react"
import styles from '../styles/Home.module.css'
import { Coin, StargateClient, SigningStargateClient } from "@cosmjs/stargate"
import { AccountData, OfflineSigner } from "@cosmjs/proto-signing"
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types"

declare global {
    interface Window extends KeplrWindow {}
}

interface SimpleUIState {
    chainID: string
    denom: string
    myAddress: string
    myBalance: string
    toAmount: string
    toAddress: string
}

export interface SimpleUIProps {
    rpcUrl: string
}

export class SimpleUI extends Component<SimpleUIProps, SimpleUIState> {
    // Set the initial state
    constructor(props:SimpleUIProps) {
        super(props)
        this.state = {
            chainID: "",
            denom: "uatom",
            myAddress: "",
            myBalance: "...",
            toAmount: "0",
            toAddress: ""
        }
        setTimeout(this.init, 500)
    }

    init = async() => this.getChainID(await StargateClient.connect(this.props.rpcUrl))

    // Get the ChainID
    getChainID = async(client: StargateClient) => {
        const c = await client.getChainId()
        this.setState({
            chainID: c
        })
    }

    // Store changed token amount to state
    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toAmount: e.currentTarget.value
    })

    // Store changed toAddress amount to state
      onToAddressChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toAddress: e.currentTarget.value
    })

    // When the user clicks the "Send" button
    onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        // Get the current state and amount of tokens that we want to transfer
        const { denom, toAmount, toAddress, myAddress } = this.state

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
                    amount: toAmount,
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

    // When the user clicks the "Connect Wallet" button
    onKeplrClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        const { keplr } = window
        if (!keplr) {
            alert("You need to install Keplr")
            return
        }
        // Add the chain to Keplr in case it's not already added
        try {
            await keplr.experimentalSuggestChain(this.getTestnetChainInfo())
            console.log('Wallet connected!')
        }
        catch(err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('Unexpected error', err);
            }
        }

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
    }

    getTestnetChainInfo = (): ChainInfo => ({
        chainId: "theta-testnet-001",
        chainName: "theta-testnet-001",
        rpc: "https://rpc.sentry-01.theta-testnet.polypore.xyz/",
        rest: "https://rest.sentry-01.theta-testnet.polypore.xyz/",
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

    // The render function that draws the component at init and at state change
    render() {
        const { chainID, denom, myAddress, myBalance, toAmount, toAddress } = this.state
        // The web page structure itself
        return <div>
            <fieldset className={styles.card}>
                <legend>Chain ID</legend>
                <p>{chainID}</p>
            </fieldset>
            <fieldset className={styles.card}>
                <legend>Your Wallet</legend>
                <p>Address: {myAddress}</p>
                <p>Balance: {myBalance} {denom}</p>
            </fieldset>
            <fieldset className={styles.card}>
                <legend>Send Tokens</legend>
                <input value={toAddress} type="text" onChange={this.onToAddressChanged} /> address
                <input value={toAmount} type="number" onChange={this.onToSendChanged}/> {denom}
                <button onClick={this.onSendClicked}>Send</button>
            </fieldset>
            <fieldset className={styles.card}>
                <button onClick={this.onKeplrClicked}>Connect Wallet</button>
            </fieldset>
        </div>
    }
}