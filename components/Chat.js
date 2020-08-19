// Importing dependencies
import React, { Component } from 'react';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

export default class Chat extends React.Component {

  constructor() {
    super();
    this.state = {
      messages: []
    }
  }

  // Testing app with a static message
  componentDidMount() {
    this.setState({
      // Messages must follow a certain format because of the GiftedChat library
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ],
    })
  }

  // Function called upon sending a message
  onSend(messages = []) {
    // "previousState" references the component's state at the time the change is applied
    this.setState(previousState => ({
      // Appends the new messages to the messages object/state
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  render() {

    // Defining variables from SplashScreen
    let { userName, backgroundColor } = this.props.route.params;

    // Setting default username in case the user didn't enter one
    if (!userName || userName === '') userName = 'User'

    // Displaying username on the navbar in place of the title
    this.props.navigation.setOptions({ title: userName });

    return (
      // Rendering chat layout
      <View style={[styles.chatBackground, { backgroundColor: backgroundColor }]}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {/* If the device OS is Android, adjust height when the keyboard pops up */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  }
};

// Creating styling
const styles = StyleSheet.create({
  chatBackground: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
})