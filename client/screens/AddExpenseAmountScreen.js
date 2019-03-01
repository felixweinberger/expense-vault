import React from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationEvents } from 'react-navigation';

import Numpad from '../components/Numpad';
import AddAmount from '../components/AddAmount';
import { submitNewAmount } from '../redux/actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
});

class AddExpenseAmountScreen extends React.Component {
  static navigationOptions = {
    title: 'Add',
  };

  state = {
    amount: 0,
    pretty: '0.00',
    currency: '€ EUR',
    category: null,
    tags: [],
    timestamp: null,
    dateISO: null,
    date: null,
    comment: null,
  };

  updateState = (amount) => {
    const padded = amount.toString().padStart(3, '0');
    const preComma = padded.slice(0, padded.length - 2);
    const postComma = padded.slice(padded.length - 2);
    const pretty = `${preComma}.${postComma}`;
    this.setState({ amount, pretty });
  }

  onFocus = () => this.setState({ ...this.props.currentExpense });

  onNumpadPress = (value) => {
    if (typeof value === 'number') {
      const amount = Number(this.state.amount.toString() + value.toString());
      this.updateState(amount);
    } else if (value === '⇤') {
      const amountString = this.state.amount.toString();
      const amount = Number(amountString.slice(0, amountString.length - 1));
      this.updateState(amount);
    } else if (value === '↩︎') {
      this.props.submitNewAmount(this.state);
      this.props.navigation.navigate('AddDetails');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents onWillFocus={this.onFocus} />
        <AddAmount value={this.state.pretty} currency={this.state.currency} />
        <Numpad onNumpadPress={this.onNumpadPress}/>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  currentExpense: state.currentExpense,
});

const mapDispatchToProps = dispatch => ({
  submitNewAmount: expense => dispatch(submitNewAmount(expense)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddExpenseAmountScreen);
