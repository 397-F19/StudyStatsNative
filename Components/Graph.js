import React, { useState } from 'react';
import { Container, Card, CardItem, Text, Button } from 'native-base';
import { StyleSheet, View } from 'react-native';
import { VictoryBar, VictoryChart, VictoryScatter, VictoryVoronoiContainer, VictoryTooltip, VictoryLabel } from "victory-native";
import _ from 'lodash';

const styles = StyleSheet.create({
    Button: {
      marginLeft: 3,
      marginRight: 3
    },
    container: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between'
    },
    mainContainer: {
        height: 450
    }
  });
  
  //This is the component that included the Upcoming Week section
  const UpcomingWeek = () => {
    return (
      <React.Fragment>
        <CardItem header>
          <Text>Upcoming Week </Text>
        </CardItem>
      </React.Fragment>
    )
  }
  
  
  // given an assignment JSON, outputs median time for that assignment
  const median_time = assignment => {
    const times = assignment.responses.map(response => response.time)
                  .sort((a, b) => a - b);
    const mid = _.floor(times.length / 2);
    return _.isEqual(times.length%2, 0) ? _.mean([times[mid-1], times[mid]]) : times[mid];
  }

const getBarData = classes => {
    let data = [];
    let maxMedianHours = 0;
    let recommendedClass = "";
  
    classes.forEach(course => {
      course.assignments.forEach(assignment => {
        let name = course.id + "\n" + assignment.title;
        let medianHours = median_time(assignment);
  
        if (medianHours > maxMedianHours) {
          maxMedianHours = medianHours;
          recommendedClass = name;
        }
  
        let datum = {
          assignmentName: name,
          assignmentMedianHours: medianHours
        };
        data.push(datum);
      });
    });
  
    // complains when it's empty so give it dummy stuff, should update right away
    if (data.length === 0) {
      data.push({ assignmentName: "a", assignmentMedianHours: 0 });
    }
  
    // color one with most time
    data.forEach(datum => {
      datum.fill = datum.assignmentName === recommendedClass ? 'red' : 'black';
    });
  
    return data;
  }
  
  const getScatterData = classes => {
    let data = [];
  
    classes.forEach(course => {
      course.assignments.forEach(assignment => {
        assignment.responses.forEach(response => {
          let name = course.id + "\n" + assignment.title;
  
          let datum = {
            assignmentName: name,
            time: response.time,
            label: tooltip_comment_wrapper(response.comment)
          };
          data.push(datum);
        });
      });
    });
  
    // if empty, give dummy stuff, should update right away.
    if (data.length === 0) {
      data.push({assignmentName: "a", time: 0, comment: "b" });
    }
  
    return data;
  }
  
  const tooltip_comment_wrapper = comment => {
    let result = "";
    const words = comment.split(' ');
  
    for (let i = 0; i < words.length; i += 1) {
      result = result + " " + words[i];
      if (i % 5 == 0 && i != 0) {
        result = result + "\n";
      }
    }
  
    return result;
  }
  
  const Graph = ({ state }) => {
    const [useBar, setBar] = useState(true);
    let scatterData = getScatterData(state.classes)
    let barData = getBarData(state.classes)
  
  
  
    return (
      <Card>
        <UpcomingWeek />
        <View style={styles.container}>
          <Button style={styles.Button} disabled={useBar} onPress={() => setBar(true)}><Text>View Median Times</Text></Button>
          <Button style={styles.Button} disabled={!useBar} onPress={() => setBar(false) } ><Text>View Comments</Text></Button>
        </View>
        <Container style={styles.mainContainer} className={"my-pretty-chart-container"}>
          { useBar ?
            <CardItem>
            <View style={styles.container}>
              <VictoryChart height={400} width={350} domainPadding={30}>
                <VictoryBar data={barData } x="assignmentName" y="assignmentMedianHours"
                  style={{
                    data: {
                      fill: ({ datum }) => datum.fill,
                    }
                  }} />
              </VictoryChart>
            </View>
          </CardItem>
           :
          <CardItem>
          <View style={styles.container}>
            <VictoryChart width={350} height={400} domainPadding={30}
              containerComponent={<VictoryVoronoiContainer/>}>
                <VictoryLabel text="Hover over points to view past students' comments!" x={175} y={20} textAnchor="middle"/>
                <VictoryScatter
                style={{
                  data: {fill: "purple"}, labels: {fill: "purple"}
                }}
                size={({active }) => active ? 20 : 10}
                labels={({ datum }) => datum.y}
                labelComponent={<VictoryTooltip constrainToVisibleArea/>}
                animate={{duration: 1500}}
                data={scatterData } x="assignmentName" y="time" />
              </VictoryChart>
          </View>
          </CardItem>
          }
        </Container>
      </Card>
    );
}

export default Graph;