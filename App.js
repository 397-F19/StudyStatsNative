import React, { Component, useState, useEffect } from 'react';
import { Form, Item, Input, Content, Container, Picker, Header, Left, Body, Right, Title, Card, CardItem, Text, Button } from 'native-base';
import { StyleSheet, View, Modal, Dimensions, ScrollView } from 'react-native';
import Constants from 'expo-constants';
//import Modal from "react-native-modal";
import { Col, Row, Grid } from 'react-native-easy-grid';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
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
  }
});

//This is the component that included the Upcoming Week section
const UpcomingWeek = () => {
  return (
    <CardItem>
      <CardItem header>
        <Text>Upcoming Week </Text>
      </CardItem>
      {/* <CardItem>
          <Picker placeholder="Select Chart Types" mode="dropdown">
            <Picker.Item onValueChange={() => setBar(true)} label="Median Times" value="key0"/>
            <Picker.Item onValueChange={() => setBar(false)} label="Individual Times" value="key1"/>
          </Picker>
      </CardItem> */}
    </CardItem>
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
                <AddClasses classes={classes} allClasses={allClasses}/>
                <View>
                  <Modal visible={showLog} onRequestClose={handleClose} animationType="slide">
                    <View>
                      <Text>Did it update</Text>
                    </View>
                  
                  {/* <Form>
                    <Item>
                      <Input placeholder="Hours"/>
                    </Item>
                    <Item last>
                      <Input placeholder="Comment"/>
                    </Item>
                  </Form> */}
                </Modal>
                </View>
          </Body>
        </CardItem>

        
          {/* <Card.Text>

            <Modal show={showLog} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Enter hours spent to complete this assignment:</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Control as="textarea" rows="2" />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => handleSubmit(logItem)} variant="success">
                  Submit
                </Button>
              </Modal.Footer>
            </Modal>
          </Card.Text> */}
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
  for (let i = 0; i < state.classes.length; i += 1) {
    for (let j = 0; j < state.classes[i].assignments.length; j += 1) {
      let median_time_spent = median_time(state.classes[i].assignments[j]);
      if (median_time_spent > maxHours) {
        maxHours = median_time_spent;
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
          <Text>{cardText}</Text>
        </Body>
      </CardItem>
    </Card>
  )
};

const getAssignmentNamesHours = classes => {
  let assignmentNames = [];
  let assignmentMedianHours = [];
  classes.forEach(course => {
    course.assignments.forEach(assignment => {
      assignmentNames.push(course.id + " " + assignment.title);
      assignmentMedianHours.push(median_time(assignment));
    })
  });

  // complains when it's empty so give it dummy stuff, should update right away
  if (assignmentNames.length == 0) {
    assignmentNames.push("a");
    assignmentMedianHours.push(0);
  }
  return { assignmentNames, assignmentMedianHours };
}

const getBarData = (data, state) => {
  let dueSoon = "";
  let maxHours = 0;
  const options = {
    title: "This Week's Assignments",
    legend: {position: 'none'},
    vAxis: {
      title: "Median Hours",
      titleTextStyle: {
        italic: false
      }
    }
  };
  for (let i = 0; i < state.classes.length; i += 1) {
    const assignments = state.classes[i].assignments;
    for (let j = 0; j < assignments.length; j += 1) {
      const assignment = assignments[j];
      const median_time_spent = median_time(assignment);
      if (_.isEqual(assignment.week, week)) {
        if (median_time_spent > maxHours){
          maxHours = median_time_spent;
          dueSoon = state.classes[i].title + " " + assignment.title;
        }
        data.push([state.classes[i].title + " " + assignment.title, median_time_spent, ''])
      }
    }
  }
  for (let i = 0; i < data.length; i += 1){
    if (_.isEqual(data[i][0], dueSoon)) {
      data[i][2] = 'red';
    }
  }
  return [data, options];
}

const getScatterData = (data, state) => {
  let ticks = [];
  let count = 0;
  for (let i = 0; i < state.classes.length; i += 1) {
    let assignment;
    const assignments = state.classes[i].assignments;
    for (let j = 0; j < assignments.length; j += 1) {
      let responses = [];
      assignment = assignments[j];

      for(let k = 0; k < assignment.responses.length; k++){
        let response = assignment.responses[k];
        data.push([{v: count, f: (state.classes[i].title + " " + assignment.title)}, response.time, response.comment, '' ])
      }
      ticks.push({v: count, f:(state.classes[i].title + " " + assignment.title)})
      count++;
    }
  }
  const options = {
    title: "This Week's Assignments",
    legend: {position: 'none'},
    hAxis: {ticks : ticks },
    vAxis: {
      title: "Hours Spent",
      titleTextStyle: {
        italic: false
      }
    }
  };
  return [data, options];
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
      <Button>
      <Picker placeholder="Add Classes" mode="dropdown">
        <Picker.Item onValueChange={() => setBar(true)} label="Data Structures" value="key0"/>
      </Picker>
      </Button>
    )
};

const Graph = ({ state }) => {
  let { assignmentNames, assignmentMedianHours } = getAssignmentNamesHours(state.classes);

  return (
    <Card>
      <UpcomingWeek />
      <View>
        <Text>Median Hours Bar Graph</Text>
        <BarChart
          data={{
            labels: assignmentNames,
            datasets: [
              {
                data: assignmentMedianHours
              }
            ]
          }}
          fromZero={true}
          width={Dimensions.get("window").width * .90} // from react-native
          height={Dimensions.get("window").height * .80}
          yAxisSuffix={" hrs"}
          verticalLabelRotation={90}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
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
    <ScrollView style={styles.scrollView} contentContainerStyle={{flexGrow:1}}>
    <React.Fragment>
      <Nav/>
      <Container>
        <CurrClasses key={classes.title} classes={{classes, setClasses}} allClasses={{allClasses, setAllClasses}}/>
        {/* <Graph key={classes.title} state={{classes, setClasses}}/> */}
        <Recommendations state={{classes, setClasses}}/>
        <Recommendations state={{classes, setClasses}}/>
        <Recommendations state={{classes, setClasses}}/>
        <Recommendations state={{classes, setClasses}}/>
        <Recommendations state={{classes, setClasses}}/>
      </Container>
    </React.Fragment>
    </ScrollView>
    </Content>
  );
};

export default App;