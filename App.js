import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import Expo, { DangerZone } from 'expo';
import { NativeModules } from 'react-native';
import Button from './components/Button'
import testID from './utils/testID'

const { Payments } = DangerZone;
Payments.initialize({
  publishableKey: 'YOUR_KEY'
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instruction: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  switch: {
    marginBottom: 10,
  },
  hintContainer: {
    marginTop: 10,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    color: 'gray',
  },
});

export default class App extends React.Component {

  state = {
    loading: false,
    allowed: false,
    complete: true,
    status: null,
    token: null,
  }

  async componentWillMount() {
    const allowed = await Payments.deviceSupportsApplePayAsync()
    this.setState({ allowed })
  }

  handleCompleteChange = (complete) => (
    this.setState({ complete })
  )

  handleApplePayPress = async () => {
    try {
      this.setState({
        loading: true,
        status: null,
        token: null,
      })
      const token = await Payments.paymentRequestWithApplePayAsync([{
        label: 'Item 1',
        amount: '200.00',
      }, {
        label: 'Item 2',
        amount: '60.00',
      }, {
        label: 'Expo, Inc',
        amount: '260.00',
      }], {
        shippingMethods: [{
          id: 'fedex',
          label: 'FedEX',
          detail: 'Test @ 10',
          amount: '10.00',
        }],
      })

      console.log('Result:', token)
      this.setState({ loading: false, token })

      if (this.state.complete) {
        var testVar = await Payments.completeApplePayRequestAsync()
        console.log('Apple Pay payment completed')
        this.setState({ status: 'Apple Pay payment completed'})
      } else {
        var testVar = await Payments.cancelApplePayRequestAsync()
        console.log('Apple Pay payment cenceled')
        this.setState({ status: 'Apple Pay payment cenceled'})
      }
    } catch (error) {
      console.log('Error:', error)
      this.setState({ loading: false, status: `Error: ${error.message}` })
    }
  }

  handleSetupApplePayPress = () => (
    Payments.openApplePaySetup()
  )

  render() {
    const { loading, allowed, complete, status, token } = this.state

    return (
      <View style={styles.container}>
        <Text style={styles.header}>
          Apple Pay Example with Expo
        </Text>
        <Text style={styles.instruction}>
          Click button to show Apple Pay dialog.
        </Text>
        <Button
          text="Pay with Pay"
          disabledText="Not supported"
          loading={loading}
          disabled={!allowed}
          onPress={this.handleApplePayPress}
          {...testID('applePayButton')}
        />
        <Text style={styles.instruction}>
          Complete the operation on tokent
        </Text>
        <Switch
          style={styles.switch}
          value={complete}
          onValueChange={this.handleCompleteChange}
          {...testID('applePaySwitch')}
        />
        <View>
          {token &&
            <Text
              style={styles.instruction}
              {...testID('applePayToken')}>
              Token: {token.tokenId}
            </Text>
          }
          {status &&
            <Text
              style={styles.instruction}
              {...testID('applePayStatus')}>
              {status}
            </Text>
          }
        </View>
        <View style={styles.hintContainer}>
          <Button
            text="Setup Pay"
            disabledText="Not supported"
            disabled={!allowed}
            onPress={this.handleSetupApplePayPress}
            {...testID('setupApplePayButton')}
          />
          <Text style={styles.hint}>
            ('Setup Pay' works only on real device)
          </Text>
        </View>
      </View>
    )
  }
}
