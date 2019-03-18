import React, { Component } from 'react';
import { Button } from 'react-native-elements';
import {
  Alert,
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import JotService from '../database/services/JotService';
import JotList from '../components/JotList';
import JotPage from './JotPage';

class AllJotsScreen extends Component {
  constructor(props) {
    super(props);
    this.createNewJot = this.createNewJot.bind(this);
    this.triggerDeleteJotsAlert = this.triggerDeleteJotsAlert.bind(this);
    this.deleteSelectedJots = this.deleteSelectedJots.bind(this);
    this.onJotFinished = this.onJotFinished.bind(this);
    this.onJotPress = this.onJotPress.bind(this);
    this.onJotSelect = this.onJotSelect.bind(this);
    this.onCancelJotSelect = this.onCancelJotSelect.bind(this);

    this.state = {
      allJots: [],
      todaysJots: [],
      thisWeeksJots: [],
      selectedJots: [],
      // These variables keep track of how and when to show a Jot detail page.
      isShowingNewJotPage: false,
      startWithJot: null,
      startInEditMode: false,
      listSelectionMode: false,
    };
  }

  componentWillMount() {
    this.setState({
      allJots: JotService.findAll(),
      todaysJots: JotService.findAllCreatedToday(),
      thisWeeksJots: JotService.findAllCreatedThisWeek(),
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state === nextState) {
      return false;
    }

    // do not re-render if when selecting multiple jots
    if (!this.state.listSelectionMode || !nextState.listSelectionMode) {
      return true;
    }

    if (
      this.state.selectedJots.length === 0 &&
      nextState.selectedJots.length !== 1
    ) {
      return false;
    }

    if (
      this.state.selectedJots.length === 1 &&
      nextState.selectedJots.length !== 0
    ) {
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.allJots != this.state.allJots) {
      this.setState({
        allJots: JotService.findAll(),
        todaysJots: JotService.findAllCreatedToday(),
        thisWeeksJots: JotService.findAllCreatedThisWeek(),
      });
    }
  }

  createNewJot() {
    this.setState({
      isShowingNewJotPage: true,
      startWithJot: null,
      startInEditMode: true,
    });
  }

  triggerDeleteJotsAlert() {
    let msg;
    if (this.state.selectedJots.length === 0) {
      msg = `Delete all ${this.state.allJots.length} jots?`;
    } else if (this.state.selectedJots.length === 1) {
      msg = `Delete 1 jot?`;
    } else {
      msg = `Delete ${this.state.selectedJots.length} jots?`;
    }

    Alert.alert(
      'Are you sure?',
      msg,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Delete', onPress: this.deleteSelectedJots },
      ],
      { cancelable: true }
    );
  }

  deleteSelectedJots() {
    if (this.state.selectedJots.length === 0) {
      JotService.deleteJots(this.allJots);
    } else {
      JotService.deleteJots(this.state.selectedJots);
    }

    this.setState({ selectedJots: [], listSelectionMode: false });
  }

  onJotFinished(jot) {
    // New jot creation was cancelled
    if (jot == null) {
      this.setState({
        isShowingNewJotPage: false,
      });
      return;
    }

    let newJots = this.state.todaysJots.slice();
    if (!newJots.includes(jot)) {
      newJots.push(jot);
    }

    this.setState({
      todaysJots: newJots,
      isShowingNewJotPage: false,
    });
  }

  onJotPress(jot) {
    this.setState({
      isShowingNewJotPage: true,
      startWithJot: jot,
      startInEditMode: false,
    });
  }

  onJotSelect(jot) {
    // un-select jot if jot is already selected
    let newSelected = this.state.selectedJots.filter(
      selectedJot => selectedJot.id !== jot.id
    );

    if (newSelected.length < this.state.selectedJots.length) {
      this.setState({ selectedJots: newSelected });
    } else {
      this.setState({ selectedJots: [...this.state.selectedJots, jot] });
    }
  }

  onCancelJotSelect() {
    this.setState({ selectedJots: [], listSelectionMode: false });
  }

  getSections() {
    return [
      { title: 'Today', data: this.state.todaysJots },
      { title: 'This week', data: this.state.thisWeeksJots },
      // TODO: Group all other jots by month
      // { title: 'This month', data: this.state.allJots },
    ];
  }

  render() {
    let topRightBtn;
    let bottomRightBtn;

    if (this.state.listSelectionMode) {
      topRightBtn = (
        <Button title="Cancel" type="clear" onPress={this.onCancelJotSelect} />
      );
      bottomRightBtn = (
        <Button
          style={styles.deleteJotsBtn}
          title={this.state.selectedJots.length === 0 ? 'Delete All' : 'Delete'}
          icon={{
            name: 'delete',
            type: 'material-community',
            size: 18,
            color: '#2089dc',
          }}
          type="clear"
          onPress={this.triggerDeleteJotsAlert}
        />
      );
    } else {
      topRightBtn = (
        <Button
          title="Edit"
          type="clear"
          onPress={() => this.setState({ listSelectionMode: true })}
        />
      );
      bottomRightBtn = (
        <Button
          style={styles.createJotBtn}
          icon={{
            name: 'pencil',
            type: 'material-community',
            size: 36,
            color: '#2089dc',
          }}
          type="clear"
          onPress={this.createNewJot}
        />
      );
    }

    if (this.state.isShowingNewJotPage) {
      return (
        <JotPage
          onJotFinished={this.onJotFinished}
          isEditing={this.state.startInEditMode}
          jot={this.state.startWithJot}
        />
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.topBtnRow}>{topRightBtn}</View>
          <JotList
            listSelectionMode={this.state.listSelectionMode}
            sections={this.getSections()}
            onJotPress={this.onJotPress}
            onJotSelect={this.onJotSelect}
          />
        </ScrollView>
        {bottomRightBtn}
      </SafeAreaView>
    );
  }
}

export default AllJotsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  topBtnRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  createJotBtn: {
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 20,
    borderWidth: 1.5,
    borderColor: '#2089dc',
    borderRadius: 70,
  },
  deleteJotsBtn: {
    width: 150,
    height: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 20,
    borderWidth: 1.5,
    borderColor: '#2089dc',
    borderRadius: 10,
  },
});
