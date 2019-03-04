import React from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet, View, Text, TouchableOpacity,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { uniq } from 'lodash';

import Colors from '../constants/Colors';
import { deleteExpense } from '../redux/actions';
import Summary from '../components/Summary';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerNone: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerNone__text: {
    color: 'grey',
    fontStyle: 'italic',
  },
  headerTotal: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.greyDark,
  },
  headerTotal__text: {
    color: 'white',
  },
  headerTotal__total: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterBtns: {
    backgroundColor: Colors.greyDark,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingLeft: 10,
    paddingRight: 10,
  },
  filterBtn: {
    paddingRight: 10,
  },
  filterBtn__label: {
    color: 'white',
    fontWeight: 'bold',
    paddingRight: 10,
  },
  filterBtn__text: {
    color: 'white',
  },
});

class SummaryScreen extends React.Component {
  static navigationOptions = {
    title: 'Summary',
  };

  state = {
    list: 'categories',
    fromDate: null,
    toDate: null,
    total: 0,
    currency: this.props.state.entities.settings.mainCurrency,
  }

  computeSimpleDate = (timestamp) => {
    const date = new Date(timestamp);
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}.${mm}.${dd}`;
  }

  computeSectionsByDate = () => {
    const expenseArr = Object.values(this.props.state.entities.expenses)
      .filter(expense => (expense.date >= this.state.fromDate
        && expense.date <= this.state.toDate));

    if (expenseArr.length > 0) {
      let total = 0;
      const dates = uniq(expenseArr.map(expense => expense.date)).sort((a, b) => a < b);
      const sectionObj = dates.reduce((acc, date) => {
        acc[date] = { title: date, data: [] };
        return acc;
      }, {});
      expenseArr.forEach((expense) => {
        sectionObj[expense.date].data.push(expense);
        total = (total * 100 + expense.inMainCurrency * 100) / 100;
      });
      return Object.values(sectionObj);
    }
    return [];
  }

  computeSectionsByCategory = () => {
    const expenseArr = Object.values(this.props.state.entities.expenses)
      .filter(expense => (expense.date >= this.state.fromDate
        && expense.date <= this.state.toDate));

    if (expenseArr.length > 0) {
      let total = 0;
      const categoryTotals = expenseArr
        .reduce((acc, el) => {
          acc[el.category] = acc[el.category]
            ? (acc[el.category] * 100 + el.inMainCurrency * 100) / 100
            : el.inMainCurrency;
          total = (total * 100 + el.inMainCurrency * 100) / 100;
          return acc;
        }, {});

      const sortedCategories = Object.keys(categoryTotals)
        .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

      const sectionObj = sortedCategories.reduce((acc, category) => {
        acc[category] = { title: category, data: [] };
        return acc;
      }, {});

      expenseArr.forEach((expense) => {
        sectionObj[expense.category].data.push(expense);
      });

      return Object.values(sectionObj);
    }
    return [];
  }

  computeTotal = (sections) => {
    const res = sections
      .map(section => section.data
        .reduce((acc, el) => (acc * 100 + el.inMainCurrency * 100) / 100, 0))
      .reduce((acc, el) => (acc * 100 + el * 100) / 100, 0);
    return res;
  }

  onFocus = () => {
    const timestamp = new Date().toISOString();
    const toDate = this.computeSimpleDate(timestamp);
    const fromDate = `${toDate.substring(0, toDate.length - 2)}01`;
    this.setState({ fromDate, toDate });
  }

  onDelete = (expenseId) => {
    this.props.deleteExpense(expenseId);
  }

  onPressHistory = () => {
    this.setState({ list: 'history' });
  }

  onPressCategories = () => {
    this.setState({ list: 'categories' });
  }

  render() {
    let sections;
    if (this.state.list === 'history') {
      sections = this.computeSectionsByDate();
    } else if (this.state.list === 'categories') {
      sections = this.computeSectionsByCategory();
    }

    const header = () => {
      if (sections.length === 0) {
        return (
          <View style={styles.headerNone}>
            <Text style={styles.headerNone__text}>There are no expenses for this period.</Text>
          </View>
        );
      }
      return (
        <View style={styles.headerTotal}>
          <Text style={styles.headerTotal__text}>Total: </Text>
          <Text style={styles.headerTotal__total}>
            {this.computeTotal(sections)} {this.state.currency}
          </Text>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <NavigationEvents onWillFocus={this.onFocus} />
          {header(sections)}
        <Summary sections={sections} onDelete={this.onDelete} list={this.state.list} />
        <View style={styles.filterBtns}>
          <Text style={styles.filterBtn__label}>Filter dates:</Text>
          <TouchableOpacity style={styles.filterBtn} underlayColor="white" onPress={this.onPressHistory}>
            <Text style={styles.filterBtn__text}>From: {this.state.fromDate}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} underlayColor="white" onPress={this.onPressHistory}>
            <Text style={styles.filterBtn__text}>To: {this.state.toDate}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterBtns}>
          <Text style={styles.filterBtn__label}>Group by:</Text>
          <TouchableOpacity style={styles.filterBtn} underlayColor="white" onPress={this.onPressHistory}>
            <Text style={styles.filterBtn__text}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} underlayColor="white" onPress={this.onPressCategories}>
            <Text style={styles.filterBtn__text}>Categories</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({ state });

const mapDispatchToProps = dispatch => ({
  deleteExpense: expenseId => dispatch(deleteExpense(expenseId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryScreen);
