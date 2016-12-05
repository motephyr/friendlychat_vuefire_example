var Firebase = require('firebase')
// explicit installation required in module environments
var config = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: ''
}
var firebaseApp = Firebase.initializeApp(config)

module.exports = firebaseApp
