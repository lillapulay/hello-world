/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-console */
// Importing dependencies
import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
// For asking the user for permission
import * as Permissions from 'expo-permissions';
// For accessing the device's camera/camera roll
import * as ImagePicker from 'expo-image-picker';
// For accessing the user's location
import * as Location from 'expo-location';

// Storage for images
const firebase = require('firebase');
require('firebase/firestore');

/**
* @class CustomActions
* @requires react
* @requires prop-types
* @requires react-native
* @requires expo-permissions
* @requires expo-image-picker
* @requires expo-location
* @requires firebase
* @requires firestore
*/

// Creating the '+' button on the bottom for more actions
export default class CustomActions extends React.Component {
  /**
  * For choosing a picture from the device's library (camera roll)
  * Asks user for permission
  * @async
  * @function pickImage
  */

  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    // Only grant access if user accepts
    try {
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.log(error));
        // Checks if user cancelled
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
  * For taking a new image with the device's camera
  * Asks user for permission
  * @async
  * @function takePhoto
  */

  takePhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    // Only access if user grants permission
    try {
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.log(error));
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
  * For accessing the user's location data
  * Asks user for permission
  * @async
  * @function getLocation
  */

  getLocation = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        if (location) {
          this.props.onSend({
            location: {
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
  * Uploads image to storage as blob
  * Manages XMLHttpRequest
  * Defines respons type
  * Creates file name
  * @async
  * @function uploadImage
  */

  uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      // New XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      // Defines response type
      xhr.responseType = 'blob';
      // Opens connection + get method
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    // For creating file name
    const uriParts = uri.split('/');
    const imageName = uriParts[uriParts.length - 1];
    // Referencing files
    const ref = firebase.storage().ref().child(`${imageName}`);
    const snapshot = await ref.put(blob);
    // Closes connection
    blob.close();
    const imageUrl = await snapshot.ref.getDownloadURL();
    return imageUrl;
  }

  /**
  * Defines the functionality for the '+' button
  * Tapping '+' calls actionSheet
  * @function onActionPress
  * @returns {actionSheet} - choose from library/take photo/send location/cancel
  */

  onActionPress = () => {
    const options = [
      'Choose Image From Library',
      'Take Picture',
      'Share Location',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log('user wants to pick an image');
            return this.pickImage();
          case 1:
            console.log('user wants to take a picture');
            return this.takePhoto();
          case 2:
            console.log('user wants to get location');
            return this.getLocation();
          default:
        }
      },
    );
  };

  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Click here for more options"
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>
            +
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

/**
* Creating styling
*/

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
