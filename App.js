import React, { Component, useState, useEffect } from 'react';
// import { AppLoading } from 'expo';
import { Form, Item, Input, Container,Picker, Header, Left, Body, Right, Title, Card, CardItem, Text, Button } from 'native-base';
// import * as Font from 'expo-font';
// import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Modal } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import _ from 'lodash';
//import './App.css';
import json from './public/data/assignments.json';
const week = 1;

const Nav = () => (
    <Container>
      <Header>
        <Left/>
        <Body>
          <Title>Study Stats</Title>
        </Body>
        <Right />
      </Header>
    </Container>
);

//This is the component that included the Upcoming Week section
//But it technically goes in the graph component.
const UpcomingWeek = () => {
  return (
    <CardItem>
      <CardItem header>
        <Text>Upcoming Week </Text>
      </CardItem>
      <CardItem>
        {/* <Button> */}
          <Picker placeholder="Select Chart Types" mode="dropdown">
            <Picker.Item onValueChange={() => setBar(true)} label="Median Times" value="key0"/>
            <Picker.Item onValueChange={() => setBar(false)} label="Individual Times" value="key1"/>
          </Picker>
        {/* </Button> */}
      </CardItem>
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
            {console.log(classes.classes)}
                {classes.classes.map(currClass => 
                currClass.assignments.map(currAssignment => 
                <React.Fragment key={currAssignment.title}>
                  <CardItem button onPress={() => handleShow(currClass, currAssignment)}>{currClass.title} - {currAssignment.title}</CardItem>
                </React.Fragment>))}
                <AddClasses classes={classes} allClasses={allClasses}/>
                <Modal transparent={false} visible={showLog} onRequestClose={handleClose}>
                  <Form>
                    <Item>
                      <Input placeholder="Hours"/>
                    </Item>
                    <Item last>
                      <Input placeholder="Comment"/>
                    </Item>
                  </Form>
                </Modal>
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

const Graph = ({state}) => {
  const [useBar, setBar] = useState(true);
  
  let data = [];
  let touple = [];
  let options = {};

  if (useBar) {
    data = [
      ['Assignment', 'Median Hours Spent', { role: 'style' }],
    ];
    touple = getBarData(data, state);
    data = touple[0]
    options = touple[1]
  }
  else {
    data = [
      ['Assignment', 'Hours Spent', {role: 'tooltip'}, {role: 'style'}],
    ];
    touple = getScatterData(data, state);
    data = touple[0]
    options = touple[1]
  }
  
  return (
    <UpcomingWeek />
  )
};

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
      <Button><Text>Hello</Text></Button>
      // <Picker  className="dropdownButton" title="Add Another Class">
      //   <Picker.Item className="addClassItem btn-primary" onValueChange={() => handleSubmit(classes, allClasses)}>Data Structures</Picker.Item>
      // </Picker>
    )
};

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
    <React.Fragment>
      <Nav/>
      <Container>
        <CurrClasses key={classes.title} classes={{classes, setClasses}} allClasses={{allClasses, setAllClasses}}/>
        <Graph key={classes.title} state={{classes, setClasses}}/>
        <Recommendations state={{classes, setClasses}}/>
      </Container>
    </React.Fragment>
  );
};

export default App;
