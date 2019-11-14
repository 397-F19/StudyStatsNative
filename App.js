import React, { useState , useEffect} from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import _ from 'lodash';
import json from './public/data/assignments.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// given an assignment JSON, outputs median time for that assignment
const median_time = assignment => {
  const times = assignment.responses.map(response => response.time)
                .sort((a, b) => a - b);
  const mid = _.floor(times.length / 2);
  return _.isEqual(times.length%2, 0) ? _.mean([times[mid-1], times[mid]]) : times[mid];
}

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

const Graph = ({ state }) => {
  let { assignmentNames, assignmentMedianHours } = getAssignmentNamesHours(state.classes);
  console.log(assignmentNames);
  console.log(assignmentMedianHours);

  return (
    <View style={styles.container}>
      <Text>Bezier Line Chart</Text>
      {/* TODO: CONVERT TO BAR, GET IT WORKING WITH OUR DATA */}
      <LineChart
        data={{
          labels: assignmentNames,
          datasets: [
            {
              data: assignmentMedianHours
            }
          ]
        }}
        width={Dimensions.get("window").width} // from react-native
        height={220}
        // yAxisLabel={"$"}
        yAxisSuffix={"hrs"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        // bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
}

export default function App() {
  const [classes, setClasses] = useState([{id: "", title: "", assignments: []}])
  const [allClasses, setAllClasses] = useState([{id: "", title: "", assignments: []}])
  const url = '/data/assignments.json';

  useEffect(() => {
    const fetchClasses= async () => {
      // const response = await fetch(url);
      // if (!response.ok) throw response;
      // const json = await response.json();
      setAllClasses(json.courses);
      let userCourses = json.users[0].courses;
      setClasses(json.courses.filter(course => userCourses.includes(course.id)));
    }
    fetchClasses();
  }, []);

  return (<Graph key={classes.title} state={{classes, setClasses}}></Graph>);
}