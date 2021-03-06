import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  View,
} from 'react-native';
import moment from 'moment';
import { Button } from 'react-native-elements';
import JotService from '../database/services/JotService';
import PersonService from '../database/services/PersonService';
import Jot from '../database/models/Jot';
import SelectPersonScreen from './SelectPersonScreen';
import PersonPill from '../components/PersonPill';
import ContuityHeader from '../components/ContuityHeader';

import { h2, h3, jotText } from '../../assets/style/common.style';
import styleConstants from '../../assets/style/theme.style';

class JotDetailScreen extends Component {
  constructor(props) {
    super(props);
    this.onJotTitleChange = this.onJotTitleChange.bind(this);
    this.onContentChange = this.onContentChange.bind(this);
    this.onCancelPress = this.onCancelPress.bind(this);
    this.onRightButtonPress = this.onRightButtonPress.bind(this);
    this.onAddPersonPress = this.onAddPersonPress.bind(this);
    this.addJotToPeople = this.addJotToPeople.bind(this);
    this.removeJotFromPeople = this.removeJotFromPeople.bind(this);
    this.updatePeopleToRemove = this.updatePeopleToRemove.bind(this);
    this.onSelectPersonFinished = this.onSelectPersonFinished.bind(this);

    let content = '';
    let title = '';
    let id = null;

    if (props.jot) {
      content = props.jot.content;
      id = props.jot.id;
      title = props.jot.title;
    }

    // If we started with a jot, just edit it and return it... ?
    // this violates react...
    // TODO: create a new jot with the same ID
    let jot = this.props.jot;

    this.state = {
      // Keep track of the jot, in case we are creating a new jot and it goes (null -> Jot)
      // id: id
      jot: jot,
      title: title,
      content: content,
      peopleToAdd: [],
      peopleToRemove: [],
      isEditing: props.isEditing,
      isShowingSelectPeopleScreen: false,
    };
  }

  onJotTitleChange(event) {
    this.setState({
      title: event,
    });
  }

  onContentChange(event) {
    this.setState({
      content: event,
    });
  }

  saveJot() {
    // If the user didn't enter anything, don't save anything
    if (this.state.content == null || this.state.content === '') {
      return null;
    }

    // TODO: fix - we shouldn't be editing objects on the state
    let jot = this.state.jot;
    let newAttrs = {};
    if (jot) {
      newAttrs.content = this.state.content;
      newAttrs.title = this.state.title;
    } else {
      // Make a new jot
      jot = new Jot(this.state.title, this.state.content);
    }

    let newJot = JotService.save(jot, newAttrs);
    this.removeJotFromPeople(newJot);
    this.addJotToPeople(newJot);

    return jot;
  }

  addJotToPeople(jot) {
    let people = this.state.peopleToAdd;

    if (people.length > 0) {
      let personAttr = {};
      people.forEach(person => {
        personAttr = { jots: [...person.jots, jot] };
        PersonService.save(person, personAttr);
      });
    }

    this.setState({ peopleToAdd: [] });
  }

  removeJotFromPeople(jot) {
    let people = this.state.peopleToRemove;

    people.forEach(person => {
      PersonService.removePersonFromJot(person, jot);
    });

    this.setState({ peopleToRemove: [] });
  }

  onCancelPress() {
    if (this.state.isEditing && this.state.jot) {
      this.setState({ isEditing: false, peopleToAdd: [] });
    } else {
      this.props.onJotFinished(this.state.jot);
    }
  }

  onRightButtonPress() {
    if (this.state.isEditing) {
      // Save the jot and go to view jot mode
      let jot = this.saveJot();
      this.setState({
        jot: jot,
        isEditing: false,
      });
    } else {
      // Edit the existing Jot
      this.setState({
        isEditing: true,
      });
    }
  }

  onAddPersonPress() {
    this.setState({ isShowingSelectPeopleScreen: true });
  }

  updatePeopleToRemove(person) {
    let peopleToAdd = this.state.peopleToAdd;
    peopleToAdd = peopleToAdd.filter(p => p.id !== person.id);

    this.setState({
      peopleToAdd,
      peopleToRemove: [...this.state.peopleToRemove, person],
    });
  }

  onSelectPersonFinished(people) {
    if (people) {
      this.setState({
        peopleToAdd: this.state.peopleToAdd.concat(people),
      });
    }

    this.setState({
      isShowingSelectPeopleScreen: false,
    });
  }

  getAllPeople() {
    let jot = this.state.jot;
    let allPeopleForJot = [];

    if (jot && jot.people) {
      allPeopleForJot = jot.people.slice(0);
    }

    if (this.state.isEditing) {
      // filter out all people that are going to be removed
      allPeopleForJot = allPeopleForJot.filter(
        p1 => !this.state.peopleToRemove.some(p2 => p2.id === p1.id)
      );

      allPeopleForJot = allPeopleForJot.concat(this.state.peopleToAdd);
    }

    return allPeopleForJot;
  }

  render() {
    if (this.state.isShowingSelectPeopleScreen) {
      return (
        <SelectPersonScreen
          existingPeople={this.getAllPeople()}
          onSelectPersonFinished={this.onSelectPersonFinished}
        />
      );
    }

    let headerTitle;
    const leftButtonConfig = {
      title: 'Back',
      onPress: this.onCancelPress,
    };
    const rightButtonConfig = {
      title: 'Edit',
      onPress: this.onRightButtonPress,
    };

    if (this.state.isEditing) {
      if (this.state.jot) {
        headerTitle = 'Edit Jot';
      } else {
        headerTitle = 'Create a Jot';
      }

      leftButtonConfig.title = 'Cancel';
      rightButtonConfig.title = 'Done';
      rightButtonConfig.disabled = !this.state.content;
    }

    let peopleComponent = (
      <View style={styles.peopleContainer}>
        {this.getAllPeople().map((person, index) => {
          return (
            <PersonPill
              key={index}
              person={person}
              onRemovePress={() => this.updatePeopleToRemove(person)}
              isEditing={this.state.isEditing}
            />
          );
        })}
      </View>
    );

    let actionButtons = (
      <View style={styles.actionBtnRow}>
        <Button
          title="Add People"
          titleStyle={styles.actionBtnText}
          icon={{
            name: 'account-outline',
            type: 'material-community',
            size: 36,
            color: 'white',
          }}
          type="clear"
          onPress={this.onAddPersonPress}
        />
      </View>
    );

    let content;
    if (this.state.isEditing) {
      content = (
        <View>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            placeholder="Optional"
            style={
              this.state.title.length <= 0
                ? styles.jotTitlePlaceholder
                : styles.jotTitle
            }
            onChangeText={this.onJotTitleChange}
            value={this.state.title}
          />
          <Text style={styles.inputLabel}>Jot</Text>
          <TextInput
            placeholder="What's on your mind?"
            style={styles.jotContent}
            onChangeText={this.onContentChange}
            value={this.state.content}
            multiline={true}
          />
          {peopleComponent}
        </View>
      );
    } else {
      content = (
        <View>
          <Text style={styles.jotTitle}>{this.state.title}</Text>
          <Text style={styles.jotContent}>{this.state.content}</Text>
          {this.state.jot.people && this.state.jot.people.length > 0 && (
            <Text style={styles.sectionsHeader}>People</Text>
          )}
          {peopleComponent}
          <Text style={styles.sectionsHeader}>{`Created ${moment(
            this.state.jot.dateCreated
          ).calendar()}`}</Text>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ContuityHeader
            title={headerTitle}
            leftButtonConfig={leftButtonConfig}
            rightButtonConfig={rightButtonConfig}
            leftButtonType={this.state.isEditing ? '' : 'BACK'}
            rightButtonType={this.state.isEditing ? 'DONE' : ''}
          />
          <ScrollView style={styles.scrollContainer}>{content}</ScrollView>
          {this.state.isEditing && actionButtons}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

export default JotDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  inputLabel: {
    ...h3,
    marginBottom: 3,
    color: 'black',
  },
  jotTitle: {
    ...jotText,
    fontFamily: styleConstants.assistantSB,
    marginBottom: 8,
  },
  jotTitlePlaceholder: {
    ...jotText,
    marginBottom: 8,
  },
  jotContent: {
    ...jotText,
    marginBottom: 24,
  },
  sectionsHeader: {
    ...h3,
    marginBottom: 8,
  },
  peopleContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#1E1E1E',
  },
  actionBtnText: {
    ...h2,
    color: 'white',
  },
});
