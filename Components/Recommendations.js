import React from 'react';
import { Body, Card, CardItem, Text } from 'native-base';
import { StyleSheet } from 'react-native';
import _ from 'lodash';

const styles = StyleSheet.create({
    recommendation: {
      fontWeight: "bold",
      color: "#FF0000",
    }
  });

// given an assignment JSON, outputs median time for that assignment
const median_time = assignment => {
    const times = assignment.responses.map(response => response.time)
                  .sort((a, b) => a - b);
    const mid = _.floor(times.length / 2);
    return _.isEqual(times.length%2, 0) ? _.mean([times[mid-1], times[mid]]) : times[mid];
  }
  
  const Recommendations = ({state}) => {
    // the recommendation is to work on the assignment that takes the most time
    let maxHours = 0;
    let cardText = "";
    if (state.classes[0].assignments.length === 0) {
      cardText = "Congrats! You have no more assignments."
    }
    let hardest_class;
    let hardest_assignment;
    for (let i = 0; i < state.classes.length; i += 1) {
      for (let j = 0; j < state.classes[i].assignments.length; j += 1) {
        median_time_spent = median_time(state.classes[i].assignments[j]);
        if (median_time_spent > maxHours) {
          maxHours = median_time_spent;
          hardest_class = state.classes[i].title;
          hardest_assignment = state.classes[i].assignments[j].title;
          cardText = "Past students have spent " + median_time_spent + " hours on " + state.classes[i].title + " - " + state.classes[i].assignments[j].title + ". We recommend you start this one first!";
        }
      }
    }
    return (
      <Card border="light">
        <CardItem header>
          <Text>Recommendation</Text>
        </CardItem>
        <CardItem>
          <Body>
            <Text>Past students have spent
            <Text style={styles.recommendation}> {maxHours} </Text>
            hours on
            <Text style={styles.recommendation}> {hardest_class} - {hardest_assignment}. </Text>
            We recommend you start this one first!
            </Text>
          </Body>
        </CardItem>
      </Card>
    )
};

export default Recommendations;