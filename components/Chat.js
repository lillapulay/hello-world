// Importing dependencies
import React from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

export default class Chat extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: []
    }
  }

  // Testing app with static messages
  componentDidMount() {
    this.setState({
      // Messages must follow a certain format because of the GiftedChat library
      messages: [
        {
          _id: 1,
          text: 'Hello, developer!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: this.props.route.params.userName + ' has joined the chat.',
          createdAt: new Date(),
          system: true,
        },
        {
          _id: 3,
          text: 'Hello, chat!',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: this.props.route.params.userName,
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

  // Changing the color of the right side chat bubble
  renderBubble(props) {
    return (
      <Bubble{...props}
        wrapperStyle={{
          right: {
            backgroundColor: 'grey'
          }
        }}
      />
    )
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
          renderBubble={this.renderBubble.bind(this)}
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