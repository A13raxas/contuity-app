import React, { Component } from 'react';
import { Alert, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import moment from 'moment';
import JotService from '../database/services/JotService';
import JotList from '../components/JotList';
import JotDetailScreen from './JotDetailScreen';
import ContuityHeader from '../components/ContuityHeader';
import ContuityGradient from '../components/ContuityGradient';
import CreateJotButton from '../components/CreateJotButton';

import { link } from '../../assets/style/common.style';
import styleConstants from '../../assets/style/theme.style.js';

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
      allJots: JotService.findAll(),
      todaysJots: JotService.findAllCreatedToday(),
      yesterdaysJots: JotService.findAllCreatedYesterday(),
      thisWeeksJots: JotService.findAllCreatedThisWeek(),
      allOtherJots: JotService.findAllOtherJots(),
      selectedJots: [],
      listSelectionMode: false,
      // These variables keep track of how and when to show a Jot detail page.
      isShowingNewJotPage: false,
      startWithJot: null,
      startInEditMode: false,
    };
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

  updateJotSectionsInState() {
    this.setState({
      allJots: JotService.findAll(),
      todaysJots: JotService.findAllCreatedToday(),
      yesterdaysJots: JotService.findAllCreatedYesterday(),
      thisWeeksJots: JotService.findAllCreatedThisWeek(),
      allOtherJots: JotService.findAllOtherJots(),
    });
  }

  createNewJot() {
    this.setState({
      isShowingNewJotPage: true,
      startWithJot: null,
      startInEditMode: true,
    });

    this.props.setNavBarDisplay(false);
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
      JotService.deleteJots(this.state.allJots);
    } else {
      JotService.deleteJots(this.state.selectedJots);
    }

    this.updateJotSectionsInState();
    this.setState({
      selectedJots: [],
      listSelectionMode: false,
    });
    this.props.setNavBarDisplay(true);
  }

  onJotFinished(jot) {
    // New jot creation was cancelled
    this.props.setNavBarDisplay(true);

    if (jot == null) {
      this.setState({
        isShowingNewJotPage: false,
      });
      return;
    }

    this.updateJotSectionsInState();
    this.setState({
      isShowingNewJotPage: false,
    });
  }

  onJotPress(jot) {
    this.setState({
      isShowingNewJotPage: true,
      startWithJot: jot,
      startInEditMode: false,
    });
    this.props.setNavBarDisplay(false);
  }

  onJotSelect(jot) {
    // un-select jot if jot is already selected
    let newSelected = this.state.selectedJots.filter(selectedJot => {
      return selectedJot.id !== jot.id;
    });

    if (newSelected.length < this.state.selectedJots.length) {
      this.setState({ selectedJots: newSelected });
    } else {
      this.setState({ selectedJots: [...this.state.selectedJots, jot] });
    }
  }

  onCancelJotSelect() {
    this.setState({ selectedJots: [], listSelectionMode: false });
    this.props.setNavBarDisplay(true);
  }

  getSections() {
    let sections = [];
    const todayDate = moment().format('dddd, M/D');
    const yesterdayDate = moment()
      .subtract(1, 'days')
      .format('dddd, M/D');

    if (this.state.todaysJots.length > 0) {
      sections.push({
        title: `Today: ${todayDate}`,
        data: this.state.todaysJots,
      });
    }
    if (this.state.yesterdaysJots.length > 0) {
      sections.push({
        title: `Yesterday: ${yesterdayDate}`,
        data: this.state.yesterdaysJots,
      });
    }
    if (this.state.thisWeeksJots.length > 0) {
      sections.push({ title: 'This week', data: this.state.thisWeeksJots });
    }
    return sections.concat(this.getAllOtherJotsByMonth());
  }

  getAllOtherJotsByMonth() {
    let monthToJots = {};

    this.state.allOtherJots.forEach(jot => {
      let key = moment(jot.findAllCreatedThisWeek).format('MMMM YYYY');

      if (!monthToJots[key]) {
        monthToJots[key] = [jot];
      } else {
        monthToJots[key] = [...monthToJots[key], jot];
      }
    });

    let sections = [];
    Object.keys(monthToJots).forEach(key => {
      sections.push({ title: key, data: monthToJots[key] });
    });

    return sections;
  }

  render() {
    let leftButtonConfig, rightButtonConfig, header;

    if (this.state.listSelectionMode) {
      leftButtonConfig = {
        title: 'Cancel',
        onPress: this.onCancelJotSelect,
      };
      rightButtonConfig = {
        title: 'Delete',
        onPress: this.triggerDeleteJotsAlert,
        disabled: this.state.selectedJots.length === 0,
      };
    } else {
      rightButtonConfig = {
        onPress: () => this.setState({ listSelectionMode: true }),
      };
    }

    if (this.state.listSelectionMode) {
      header = (
        <ContuityHeader
          title="Tap jots to delete"
          titleType="INSTRUCTION"
          leftButtonConfig={leftButtonConfig}
          rightButtonConfig={rightButtonConfig}
          rightButtonType="DELETE"
          tintColor="white"
        />
      );
    } else {
      header = (
        <ContuityHeader
          leftButtonConfig={leftButtonConfig}
          rightButtonConfig={rightButtonConfig}
          rightButtonType="TRASH"
        />
      );
    }

    if (this.state.isShowingNewJotPage) {
      return (
        <JotDetailScreen
          onJotFinished={this.onJotFinished}
          isEditing={this.state.startInEditMode}
          jot={this.state.startWithJot}
        />
      );
    }

    return (
      <ContuityGradient>
        <SafeAreaView style={styles.container}>
          {header}
          <ScrollView style={styles.scrollContainer}>
            <JotList
              listSelectionMode={this.state.listSelectionMode}
              sections={this.getSections()}
              onJotPress={this.onJotPress}
              onJotSelect={this.onJotSelect}
            />
          </ScrollView>
          <CreateJotButton onPress={this.createNewJot} />
        </SafeAreaView>
      </ContuityGradient>
    );
  }
}

export default AllJotsScreen;

const styles = StyleSheet.create({
  //TODO: Remove extra space for title
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  link: {
    ...link,
    fontSize: styleConstants.fontSizeXSmall,
  },
});
