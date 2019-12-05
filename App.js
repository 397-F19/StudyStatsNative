import React, { useState, useEffect } from 'react';
import { Content, Header, Left, Body, Right, Title } from 'native-base';
import { View, ScrollView } from 'react-native';
import _ from 'lodash';
import CurrClasses from './Components/CurrClasses.js';
import Graph from './Components/Graph.js';
import Recommendations from './Components/Recommendations.js';
import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyCxr2r7s6EoUToxqRQXl8FQKD2hO3C-MeU",
    authDomain: "studystats-dc89b.firebaseapp.com",
    databaseURL: "https://studystats-dc89b.firebaseio.com",
    projectId: "studystats-dc89b",
    storageBucket: "studystats-dc89b.appspot.com",
    messagingSenderId: "375239972113",
    appId: "1:375239972113:web:7a682f5d73ed5bd33628b0"
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.database();

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

function App() {
  // list of classes with assignments you have yet to complete
  const [classes, setClasses] = useState([{id: "", title: "", assignments: []}])
  const [allClasses, setAllClasses] = useState([{id: "", title: "", assignments: []}])

  useEffect(() => {
    db.ref('/').on('value', (snapshot) => {
      const data = snapshot.val();
      setAllClasses(data.courses);
      const userCourses = data.users[0].courses;
      setClasses(data.courses.filter(course =>
        userCourses.includes(course.id)));
    })
  }, []);
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