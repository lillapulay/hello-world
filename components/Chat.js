/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable no-empty */
/* eslint-disable consistent-return */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-console */
// Importing dependencies
import React from 'react';
import {
  StyleSheet, View, Image, Platform,
  KeyboardAvoidingView, AsyncStorage, YellowBox,
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
// NetInfo checks user's network status
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

// Importing Firebase
const firebase = require('firebase');
require('firebase/firestore');

/**
* @class Chat
* @requires React
* @requires React-native
* @requires react-native-gifted-chat
* @requires react-native-gifted-chat/netinfo
* @requires CustomActions from './CustomActions'
* @requires firebase
* @requires firestore
*/

// Creating the Chat component
export default class Chat extends React.Component {
  constructor() {
    super();

    /**
    * Firestore credentials
    * @param {string} apiKey
    * @param {string} authDomain
    * @param {string} databaseURL
    * @param {string} projectId
    * @param {string} storageBucket
    * @param {string} messageSenderId
    * @param {string} appId
    */

    // Referencing the Firestore database
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyD0yL0SygG1pjOiFqLDozzxYjCu-lE4mmk',
        authDomain: 'helloworld-6f253.firebaseapp.com',
        databaseURL: 'https://helloworld-6f253.firebaseio.com',
        projectId: 'helloworld-6f253',
        storageBucket: 'helloworld-6f253.appspot.com',
        messagingSenderId: '661855186321',
        appId: '1:661855186321:web:5029ec1ce4cbab0fd73e30',
      });
    }

    // Referencing the "messages" collection of the database
    this.referenceMessages = firebase.firestore().collection('messages');

    // Initializing state for messages, user, user ID, image and location
    this.state = {
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      uid: 0,
      isConnected: false,
    };
  }

  /**
  * @function componentDidMount
  * NetInfo checks whether user is online
  * Then sets state accordingly
  * Uses Firebase anonymous authentication
  * Subscribes authenticated user to Firestore collection
  * Retrieves user's messages from Firestore
  */

  // Upon loading the app
  componentDidMount() {
    // Checking if user is online
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await firebase.auth().signInAnonymously();
            } catch (error) {
              console.log(error.message);
            }
          }
          this.setState({
            isConnected: true,
            user: {
              _id: user.uid,
              name: this.props.route.params.user,
            },
            messages: [],
          });
          // Fixing the order of messages
          this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc')
            .onSnapshot(this.onCollectionUpdate);
        });
        // If user is offline
      } else {
        this.setState({
          isConnected: false,
        });
        this.getMessages();
      }
    });
    // Resolves timer-related warnings
    YellowBox.ignoreWarnings(['Setting a timer', 'Animated']);
  }

  /**
   * @function componentWillUnmount
   * Stops listening to authentication and collection changes
  */

  // Upon closing the app
  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  /**
  * @function onSend
  * @param {*} messages - type: {message/image/location}
  * @returns {state} - updates state with new message
  */

  // Function called upon sending a message
  onSend(messages = []) {
    // "previousState" references the component's state at the time the change is applied
    this.setState(
      (previousState) => ({
        // Appends the new messages to the messages object/state
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      },
    );
  }

  /**
  * Retrieves messages from async storage
  * Parses messages
  * @function getMessages
  * @return messages
  */

  getMessages = async () => {
    let messages = '';
    try {
      // GETs messages from AsyncStorage
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
  * Saves messages to asyncStorage
  * Stringifies messages
  * @function saveMessages
  * @async
  * @return {Promise<string>} - Messages from asyncStorage
  */

  saveMessages = async () => {
    try {
      await AsyncStorage.setItem(
        'messages',
        JSON.stringify(this.state.messages),
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Deletes messages from asyncStorage
   * @function deleteMessages
   * @async
  */

  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
  * Updates state with new message
  * @function onCollectionUpdate
  * @param {string} _id
  * @param {string} text
  * @param {string} image - uri of image
  * @param {number} location - coordinates
  * @param {string} user
  * @param {date} createdAt
  */

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Maps through all documents for data
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || '',
        location: data.location || '',
      });
    });
    this.setState({
      messages,
    });
  };

  /**
   * Adds the message object to the collection
   * @function addMessage
   * @param {number} _id
   * @param {string} text
   * @param {date} createdAt
   * @param {string} user
   * @param {image} image
   * @param {number} geo - coordinates
   */

  addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      uid: this.state.uid,
      image: message.image || '',
      location: message.location || '',
    });
  }

  /**
  * Changes bubble color
  * @function renderBubble
  * @param {*} props
  * @returns {Bubble}
  */

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#008B8B',
          },
          left: {
            backgroundColor: 'white',
          },
        }}
      />
    );
  }

  /**
  * Doesn't render inputToolbar if user is offline
  * @function renderInputToolbar
  * @param {*} props
  * @returns {InputToolbar}
  */

  renderInputToolbar = (props) => {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  };

  /**
  * Rendering the '+' button
  * @function renderCustomActions
  * @param {*} props
  * @returns {CustomActions}
  */

  renderCustomActions = (props) => <CustomActions {...props} />;

  /**
  * Renders MapView if message has coords
  * @function renderCustomView
  * @param {*} props
  * @returns {MapView}
  */

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150, height: 100, borderRadius: 13, margin: 3,
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    // Defining variables from SplashScreen
    let { user, backgroundColor } = this.props.route.params;

    // Setting default username in case the user didn't enter one
    if (!user || user === '') user = 'User';

    // Displaying username on the navbar in place of the title
    this.props.navigation.setOptions({ title: user });

    return (
      // Rendering chat layout
      <View style={[styles.chatBackground, { backgroundColor }]}>
        {this.state.image && (
          <Image
            source={{ uri: this.state.image.uri }}
            style={{ width: 200, height: 200 }}
          />
        )}

        <GiftedChat
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderBubble={this.renderBubble.bind(this)}
          renderActions={this.renderCustomActions.bind(this)}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={this.state.user}
        />
        {/* If the device OS is Android, adjust height when the keyboard pops up */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  }
}

/**
* Creating styling
*/

const styles = StyleSheet.create({
  chatBackground: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
