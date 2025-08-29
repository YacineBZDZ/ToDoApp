import { StatusBar } from 'expo-status-bar';
import { Keyboard, KeyboardAvoidingView, TouchableOpacity, WriteTaskWrapper,Platform, StyleSheet, Text, View, TextInput } from 'react-native';
import Task from './components/task';
import React, {useState} from 'react';


      {/*TODO:Basic Todo list (frontend)
         TODO:Basic login (backend)
         TODO:Todo list implementation in the backend (backend)
         TODO:Link Todo list Frontend to Backend
         TODO:link login to frontend
         TODO:Integration of JWT 
         TODO:Encryption of user data when registering*/}



export default function App() {
  const [task, setTask] = useState();
  const [taskItems, setTaskItems] = useState([]);


  const handleAddTask = () => {
    // Add task to the list
    Keyboard.dismiss();
    setTaskItems([...taskItems, task])
    setTask(null);
    console.log(task);
  };

  const completeTask = (index) => {
    let itemsCopy = [...taskItems];
    itemsCopy.splice(index, 1);
    setTaskItems(itemsCopy);
  }

  return (
    <View style={styles.container}>

    


      {/*Task Title Component*/}
      <View style={styles.taskListContainer}>

          <Text style={styles.sectionTitle}>Today's Tasks</Text>

          <View style={styles.items}>
           {taskItems.map((item, index) => {
              return (
                <TouchableOpacity onPress={() => completeTask(index)}>
                  <Task key={index} text={item} />
                </TouchableOpacity>
              )
            })
            }
           
           {/*This is where the tasks will go!*/}
          </View>

          <StatusBar style="auto" />
       </View>
      {/*Task Input*/}
      <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      style={styles.WriteTaskWrapper}
      >
       <TextInput style={styles.input} placeholder={"Write a task"} value={task} onChangeText={text => setTask(text)}></TextInput>
       <TouchableOpacity onPress={() => handleAddTask()}>
        <View style={styles.addWrapper}>
                   <Text style={styles.addText}>+</Text>
        </View>

       </TouchableOpacity>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B1E2F0',
  },
  taskListContainer: {
    padding: 80,
    paddingHorizontal: 20, 
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  items: {
    marginTop: 30,
  },
  WriteTaskWrapper: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    borderRadius: 60,
    backgroundColor: '#FFF',
    borderColor: '#55BCF6',
    borderWidth: 1,
    width: '80%',
    height: 60,
    marginBottom: 10,
    marginRight: 20,
  },
  addWrapper: {
    backgroundColor: '#55BCF6',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 40,
    
  },
  addText: {
    color: '#FFF',
    fontSize: 24,
  },
});
