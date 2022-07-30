import { ChangeEvent, Component, MouseEvent } from "react"
import styles from '../styles/Home.module.css'

interface SimpleUIState {
    chainID: string
    denom: string
    myAddress: string
    myBalance: string
    toSend: string
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
            myBalance: "",
            toSend: "0",
            toAddress: ""
        }
    }

    // Store changed token amount to state
    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toSend: e.currentTarget.value
    })

    // Store changed toAddress amount to state
      onToAddressChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toAddress: e.currentTarget.value
    })

    // When the user clicks the "Send" button
    onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        alert("TODO")
    }

    // When the user clicks the "Connect Wallet" button
    onKeplrClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        alert("TODO")
    }

    // The render function that draws the component at init and at state change
    render() {
        const { chainID, denom, myAddress, myBalance, toSend, toAddress } = this.state
        // The web page structure itself
        return <div>
            <fieldset className={styles.card}>
                <legend>Chain ID</legend>
                <p>{chainID}</p>
            </fieldset>
            <fieldset className={styles.card}>
                <legend>Your Wallet</legend>
                <p>Address: {myAddress}</p>
                <p>Balance: {myBalance}</p>
            </fieldset>
            <fieldset className={styles.card}>
                <legend>Send Tokens</legend>
                <input value={toAddress} type="text" onChange={this.onToAddressChanged}/> address
                <input value={toSend} type="number" onChange={this.onToSendChanged}/> {denom}
                <button onClick={this.onSendClicked}>Send</button>
            </fieldset>
            <fieldset className={styles.card}>
                <button onClick={this.onKeplrClicked}>Connect Wallet</button>
            </fieldset>
        </div>
    }
}