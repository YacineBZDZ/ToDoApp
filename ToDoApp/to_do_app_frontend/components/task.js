import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";

const Task = (props) => {
    return(
        <View style={styles.item}>
            <View style={styles.itemLeft}>
            <TouchableOpacity 
                style={[
                    styles.square, 
                    props.isCompleting && styles.squareCompleting
                ]} 
                onPress={props.onComplete}
            >
                {props.isCompleting && (
                    <Text style={styles.checkmark}>✓</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.itemText}>{props.text}</Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
},
itemLeft : {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
},
square: {
    width: 24,
    height: 24,
    backgroundColor: '#55BCF6',
    opacity: 0.4,
    borderRadius: 5,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#55BCF6',
},
squareCompleting: {
    backgroundColor: '#4CAF50',
    opacity: 1,
    borderColor: '#4CAF50',
},
itemText: {
    maxWidth: '80%',
    flex: 1,
},
checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
},
});
export default Task;