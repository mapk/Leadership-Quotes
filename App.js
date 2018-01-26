import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableHighlight, Image } from 'react-native';

const REQUEST_URL_BASE  = 'https://leadershipquotes.mystagingwebsite.com/wp-json/';
const POSTS_URL_PATH    = 'wp/v2/media/';
const GET_MEDIA_IDS_PATH = 'media-ids/v1/get-all-media-ids';

const windowSize = Dimensions.get('window');

export default class LeadershipCards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    }
    this.fetchData = this.fetchData.bind(this);
  }

  getInitialState() {
    return {
      //card is initially set to null so that the loading message shows
      card: null,
      cardIDs: null,
      currentID: null
    };
  }

  componentDidMount() {
    this.getAllIDs();
  }

  getAllIDs() {
    fetch(REQUEST_URL_BASE + GET_MEDIA_IDS_PATH)
    .then((response) => response.json())
    .then((responseData) => {
        // this.setState() will cause the new data to be applied to the UI that is created by the `render` function below
        this.setState( {
            cardIDs: responseData
        } );
    })
    .then(this.fetchData)
    .done();
  }

  getRandID() {
    let currentID = this.state.cardIDs[Math.floor(Math.random()*this.state.cardIDs.length)];
    if ( this.state.currentID == currentID ) {
        currentID = this.getRandID();
    } else {
        this.setState( {
            currentID: currentID
        });
    }
    return currentID;
  }

  // This is where the magic happens! Fetches the data from our API and updates the application state.
  fetchData() {
    let currentID = this.getRandID();
    this.setState({
      // we'll also set card to null when loading new cards so that the loading message shows
      card: null,
    });
    fetch(REQUEST_URL_BASE + POSTS_URL_PATH + currentID)
      .then((response) => response.json())
      .then((responseData) => {
        // this.setState() will cause the new data to be applied to the UI that is created by the `render` function below
        this.setState({
          card: { pic: responseData.guid.rendered, content: responseData.title.rendered }
        });
      })
      .done();
  }

  // instead of immediately rendering the template, we now check if there is data in the 'card' variable
  // and render a loading view if it's empty, or the 'card' template if there is data
  render() {
    if ( !this.state.card ) {
      return this.renderLoadingView();
    }
    return this.renderCard();
  }

  // the loading view template just shows the message "Loading cards..."
  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Wait for it...
        </Text>
      </View>
    );
  }

  // this is the original render function, now renamed to renderCard, which will render our main template 
  renderCard() {
    let quote = this.state.card.pic;
    return (
      <View style={styles.container}>
        
        <View style={styles.imageContainer}>
          <Image style={{width: windowSize.width, height: windowSize.height}} source={{uri: this.state.card.pic}}  />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableHighlight
            style={styles.button}
            underlayColor='#ccc'
            onPress={this.fetchData}
          >
            <Text style={styles.buttonText}>Next quote</Text>
          </TouchableHighlight>
        </View>

      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 18,
    paddingLeft: 20,
    paddingRight: 20,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    width: windowSize.width,
    height: windowSize.height,
  },
  buttonContainer: {
    bottom: 0,
    flex: .1,
    width: windowSize.width,
    backgroundColor: '#1488BC',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
});
