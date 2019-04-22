import React, { Component } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import JotCard from './JotCard';
import TwoColumnList from './TwoColumnList';
import { h1 } from '../../assets/style/common.style';

class JotList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let content = this.props.sections.map((section, index) => {
      return (
        <View key={index}>
          <Text style={styles.sectionHeader}>{section.title}</Text>
          <TwoColumnList
            section={section}
            renderItem={item => (
              <JotCard
                jot={item.item}
                onPress={this.props.onJotPress}
                onSelect={this.props.onJotSelect}
                selectionMode={this.props.listSelectionMode}
              />
            )}
          />
        </View>
      );
    });

    return <View>{content}</View>;
  }
}

const styles = StyleSheet.create({
  sectionHeader: {
    ...h1,
    marginLeft: 10,
  },
});

export default JotList;
