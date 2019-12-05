import React from 'react';
import { Picker } from 'native-base';
import { StyleSheet } from 'react-native';
import _ from 'lodash';

const styles = StyleSheet.create({
    addClass: {
      backgroundColor: "#007bff",
    }
  });

const AddClasses = ({classes, allClasses}) => {
    // when you add a class, the new class list include all previous classes
    // plus the one submitted
    const handleSubmit = (classes, allClasses, title) => {
      let newClasses = [];
      for (let i = 0; i < classes.classes.length; i += 1) {
          newClasses.push(classes.classes[i])
      }
      for (let i = 0; i < allClasses.allClasses.length; i += 1) {
          if (allClasses.allClasses[i].title == title) {
            newClasses.push(allClasses.allClasses[i])
          }
      }
      classes.setClasses(newClasses);
    };
    const avalClasses = allClasses.allClasses.filter(course =>
      !classes.classes.includes(course));
    // when assignment button is clicked, bring up modal and track which class/assignment it is
      return (
        <Picker placeholderStyle={{ color: "#fff" }} style={styles.addClass} onValueChange={(title) => handleSubmit(classes, allClasses, title)} placeholder="Add Classes" mode="dropdown">
            {avalClasses.map(avalClass =>
                <Picker.Item key={avalClass.id} label={avalClass.title} value={avalClass.title}/>)
            }
        </Picker>
      )
};

export default AddClasses;