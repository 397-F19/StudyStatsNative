import React, { useState } from 'react';
import { Form, Item, Input, Body, Card, CardItem, Text, Button } from 'native-base';
import { StyleSheet, View } from 'react-native';
import Modal from "react-native-modal";
import _ from 'lodash';
import AddClasses from './AddClasses.js';

const styles = StyleSheet.create({
    fixToText: {
      flexDirection: 'row',
      marginHorizontal: 140
    },
    submitButton: {
      width: 80,
    }
  });

const CurrClasses = ({classes, allClasses}) => {
    // tracks whether assignment completion modal is shown or not

    const [showLog, setShowLog] = useState(false);

    // tracks the assignment that is clicked for completion
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
                        <Button style={styles.submitButton} onPress={() => handleSubmit(logItem)} primary><Text>Submit</Text></Button>
                        </View>
                      </View>
                    </Modal>
                  </View>
            </Body>
          </CardItem>
        </Card>
    );
};

export default CurrClasses;
