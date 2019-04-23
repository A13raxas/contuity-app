import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AllJotsScreen from './AllJotsScreen';
import PeopleScreen from './PeopleScreen';
import { h3 } from '../../assets/style/common.style';

import jotUnselectedIcon from '../resources/jots.png';
import spacesUnselectedIcon from '../resources/spaces.png';
import peopleUnselectedIcon from '../resources/people.png';

// TODO: update these with the correct images
import jotSelectedIcon from '../resources/jots.png';
import spacesSelectedIcon from '../resources/spaces.png';
import peopleSelectedIcon from '../resources/people.png';

let showingPage = {
  JOTS: 'jots',
  SPACES: 'spaces',
  PEOPLE: 'people',
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showingPage: showingPage.JOTS,
    };

    this.jotSelected = this.jotSelected.bind(this);
    this.spacesSelected = this.spacesSelected.bind(this);
    this.peopleSelected = this.peopleSelected.bind(this);
  }

  jotSelected() {
    this.setState({
      showingPage: showingPage.JOTS,
    });
  }

  spacesSelected() {
    this.setState({
      showingPage: showingPage.SPACES,
    });
  }

  peopleSelected() {
    this.setState({
      showingPage: showingPage.PEOPLE,
    });
  }

  getButton(src, text, onPress) {
    let leftButton = {
      flex: 1,
      flexDirection: 'row',
      padding: 'auto',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    };

    let imageStyle = {
      margin: 'auto',
    };

    let middleContainer = {
      justifyContent: 'center',
      alignItems: 'center',
    };

    let iconSubtitleText = {
      ...h3,
      color: 'white',
      fontSize: 14,
      lineHeight: 21,
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <TouchableOpacity style={leftButton} onPress={onPress}>
        <View style={middleContainer}>
          <Image source={src} style={imageStyle} />
          <Text style={iconSubtitleText}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    let viewStyle = {
      flex: 1,
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    };

    let navBarStyle = {
      height: 72,
      flexDirection: 'row',
      width: '100%',
      backgroundColor: 'rgba(54, 50, 60, 0.82)',
      backdropFilter: 'blur(4px)',
      zIndex: -1,
    };

    let contentView = {
      height: '90%',
      position: 'relative',
      flex: 1,
    };

    let currentPage = null;

    // Figure out which icons to use and which page to show.
    let jotIcon;
    if (this.state.showingPage == showingPage.JOTS) {
      jotIcon = jotSelectedIcon;
      currentPage = <AllJotsScreen user={this.state.user} />;
    } else {
      jotIcon = jotUnselectedIcon;
    }

    let spacesIcon;
    if (this.state.showingPage == showingPage.SPACES) {
      spacesIcon = spacesSelectedIcon;
    } else {
      spacesIcon = spacesUnselectedIcon;
    }

    let peopleIcon;
    if (this.state.showingPage == showingPage.PEOPLE) {
      peopleIcon = peopleSelectedIcon;
      currentPage = <PeopleScreen />;
    } else {
      peopleIcon = peopleUnselectedIcon;
    }

    return (
      <View style={viewStyle}>
        <View style={contentView}>{currentPage}</View>
        <View style={navBarStyle}>
          {this.getButton(jotIcon, 'Jots', this.jotSelected)}
          {this.getButton(spacesIcon, 'Spaces', this.spacesSelected)}
          {this.getButton(peopleIcon, 'People', this.peopleSelected)}
        </View>
      </View>
    );
  }
}

export default NavBar;