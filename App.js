import React, { Component, useState, useEffect } from 'react';
import { Form, Item, Input, Content, Container, Header, Left, Body, Picker, Right, Title, Card, CardItem, Text, Button } from 'native-base';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import Modal from "react-native-modal";
import { Col, Row, Grid } from 'react-native-easy-grid';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryScatter, VictoryVoronoiContainer, VictoryTooltip, VictoryAxis } from "victory-native";
import Svg from 'react-native-svg';
import _ from 'lodash';
import json from './public/data/assignments.json';
const week = 1;


const Nav = () => (
    <View>
      <Header>
        <Left/>
        <Body>
          <Title>Study Stats</Title>
        </Body>
        <Right />
      </Header>
    </View>
);

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: 20,
  },
  fixToText: {
    flexDirection: 'row',
    marginHorizontal: 140
  },
  recommendation: {
    fontWeight: "bold",
    color: "#FF0000",
  },
  addClass: {
    backgroundColor: "#007bff",
  },
});

//This is the component that included the Upcoming Week section
const UpcomingWeek = () => {
  return (
    <React.Fragment>
      <CardItem header>
        <Text>Upcoming Week </Text>
      </CardItem>
      {/* <CardItem>
          <Picker placeholder="Select Chart Types" mode="dropdown">
            <Picker.Item onValueChange={() => setBar(true)} label="Median Times" value="key0"/>
            <Picker.Item onValueChange={() => setBar(false)} label="Individual Times" value="key1"/>
          </Picker>
      </CardItem> */}
    </React.Fragment>
  )
}
const CurrClasses = ({classes, allClasses}) => {
  // tracks whether assignment completion modal is shown or not

  const [showLog, setShowLog] = useState(false);

  // tracks the assignment that is clicked for completion
  // logItem = [currentClass, currentAssignment]
  const [logItem, setLogItem] = useState([{id: "", title: "", assignments: []}, {id: "", title: "", completed: "", responses: []}]);

  const handleClose = () => setShowLog(false);

  // when you submit an assignment, the new assignment list buttons include all previous assignments
  // minus the one submitted
  const handleSubmit = (currInfo) => {
    let newClasses = [];
    let i = 0;
    for (i; i < classes.classes.length; i += 1) {
      if (!_.isEqual(classes.classes[i], currInfo[0])) {
        newClasses.push(classes.classes[i])
      }
      else {
        let newAssignments = [];
        let j = 0;
        for (j; j < classes.classes[i].assignments.length; j += 1) {
          if (!_.isEqual(currInfo[1], classes.classes[i].assignments[j])) {
            newAssignments.push(classes.classes[i].assignments[j])
          }
        }
        newClasses.push({id: classes.classes[i].id, title: classes.classes[i].title, assignments: newAssignments});
      }
    }
    classes.setClasses(newClasses);
    setShowLog(false);
  }

  // when assignment button is clicked, bring up modal and track which class/assignment it is
  const handleShow = (currClass, currAssignment) => {
    setLogItem([currClass, currAssignment]);
    setShowLog(true);
  };

  return (
      <Card border="light">
        <CardItem header>
          <Text>Upcoming Assignments</Text>
        </CardItem>
        <CardItem>
          <Body>
                {classes.classes.map(currClass => 
                currClass.assignments.map(currAssignment => 
                <React.Fragment key={currAssignment.title}>
                  <Card>
                  <CardItem button onPress={() => handleShow(currClass, currAssignment)}><Text>{currClass.title} - {currAssignment.title}</Text></CardItem>
                  </Card>
                </React.Fragment>))}
                <Text>{"\n"}</Text>
                <View>
                <AddClasses classes={classes} allClasses={allClasses}/>
                </View>
                <View>
                  <Modal avoidKeyboard={true} keyboardShouldPersistTaps={'handled'} onBackdropPress={() => handleClose()} isVisible={showLog} onPress={handleClose}>
                    <View>
                      <Card>
                      <Form>
                        <Item>
                          <Input placeholder="Hours Spent"/>
                        </Item>
                        <Item last>
                          <Input placeholder="Comments on Assignment"/>
                        </Item>
                      </Form>
                      </Card>
                      <View style={styles.fixToText}>
                      <Button onPress={() => handleSubmit(logItem)} primary><Text>Submit</Text></Button>
                      </View>
                    </View>
                  </Modal>
                </View>
          </Body>
        </CardItem>
      </Card>
  );
};

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

const getBarData = classes => {
  let data = [];
  let maxMedianHours = 0;
  let recommendedClass = "";

  classes.forEach(course => {
    course.assignments.forEach(assignment => {
      let name = course.id + " " + assignment.title;
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
        let name = course.id + " " + assignment.title;

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

const AddClasses = ({classes, allClasses}) => {
  // when you add a class, the new class list include all previous classes
  // plus the one submitted
  const handleSubmit = (classes, allClasses) => {
    let newClasses = [];
    for (let i = 0; i < classes.classes.length; i += 1) {
        newClasses.push(classes.classes[i])
    }
    for (let i = 0; i < allClasses.allClasses.length; i += 1) {
        if (allClasses.allClasses[i].title == "Data Structures") {
          newClasses.push(allClasses.allClasses[i])
        }
    }
    classes.setClasses(newClasses);
  };
  // when assignment button is clicked, bring up modal and track which class/assignment it is
    return (
      <Picker placeholderStyle={{ color: "#fff" }} style={styles.addClass} onValueChange={() => handleSubmit(classes, allClasses)} placeholder="Add Classes" mode="dropdown">
        <Picker.Item label="Data Structures" value="key0"/>
        <Picker.Item label="Artificial Intelligence" value="key1"/>
        <Picker.Item label="Introduction to Material Science" value="key2"/>
        <Picker.Item label="Fundamentals of Computer Programming" value="key3"/>
      </Picker>
    )
};

const Graph = ({ state }) => {
  let scatterData = getScatterData(state.classes)
  let barData = getBarData(state.classes)

  return (
    <Card>
      <UpcomingWeek />
      <CardItem>
      <View style={styles.container}>
        <VictoryChart width={350} height={500}
          containerComponent={<VictoryVoronoiContainer/>}>
            <VictoryScatter
            style={{
              data: {fill: "purple"}, labels: {fill: "purple"}
            }}
            size={({active }) => active ? 20 : 10}
            labels={({ datum }) => datum.y}
            labelComponent={<VictoryTooltip constrainToVisibleArea/>}
            animate={{duration: 1500}}
            data={scatterData} x="assignmentName" y="time" />
          </VictoryChart>
      </View>
      </CardItem>
      <CardItem>
      <View style={styles.container}>
          <VictoryChart width={350}>
            <VictoryBar data={barData} x="assignmentName" y="assignmentMedianHours"
                    style={{
                      data: {
                        fill: ({ datum }) => datum.fill,
                      }
                    }} />
          </VictoryChart>
        </View>
      </CardItem>
    </Card>
  );
}

function App() {
  // list of classes with assignments you have yet to complete
  const [classes, setClasses] = useState([{id: "", title: "", assignments: []}])
  const [allClasses, setAllClasses] = useState([{id: "", title: "", assignments: []}])
  const url = '/data/assignments.json';

  useEffect(() => {
    const fetchClasses= async () => {
      setAllClasses(json.courses);
      let userCourses = json.users[0].courses;
      setClasses(json.courses.filter(course => 
        userCourses.includes(course.id)));

    }
    fetchClasses();
  }, [])
  return (
    <Content>
    <ScrollView>
      <Nav/>
        <CurrClasses key={classes.title} classes={{classes, setClasses}} allClasses={{allClasses, setAllClasses}}/>
        <Graph key={classes.title} state={{classes, setClasses}}/>
        <Recommendations state={{classes, setClasses}}/>
    </ScrollView>
    </Content>
  );
};

export default App;