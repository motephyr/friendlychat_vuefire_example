<template>
  <div id="app">
    <div class="demo-layout mdl-layout mdl-js-layout mdl-layout--fixed-header">
  <!-- Header section containing logo -->
  <header class="mdl-layout__header mdl-color-text--white mdl-color--light-blue-700">
    <div class="mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-grid">
      <div class="mdl-layout__header-row mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
        <h3><i class="material-icons">chat_bubble_outline</i> Friendly Chat</h3>
      </div>
      <div id="user-container">
        <div id="user-pic" ref="userPic"></div>
        <div id="user-name" ref="userName"></div>
        <button ref="signOutButton" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--white" @click="signOut">
          Sign-out
        </button>
        <button ref="signInButton" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--white" @click="signIn">
          <i class="material-icons">account_circle</i>Sign-in with Facebook
        </button>
      </div>
    </div>
  </header>
  <main class="mdl-layout__content mdl-color--grey-100">
    <div id="messages-card-container" class="mdl-cell mdl-cell--12-col mdl-grid">

      <!-- Messages container -->
      <div id="messages-card" class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--6-col-tablet mdl-cell--6-col-desktop">
        <div class="mdl-card__supporting-text mdl-color-text--grey-600">
          <div v-for="message in messages">
            <div class="message-container visible" id="-KY-batuod0GHl885r7x">
              <div class="spacing">
                <div class="pic" :style="{backgroundImage: 'url(' + message.photoUrl + ')'}"></div>
              </div>
              <div class="message">
                <div v-if="message.text">
                  {{message.text}}
                </div>
                <div v-else-if="message.imageUrl">
                  <img :src="message.imageUrl" />
                </div>
              </div>
                <button v-if="auth" class="mdl-button mdl-js-button mdl-button--raised" style="float:right;" @click="removeMessage(message)">X</button>
              <div class="name">{{message.name}}</div>
            </div>
          </div>
          <form id="message-form" action="#">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="text" id="message" v-model.trim="newTodoText" @keyup.enter="addMessage">
              <label class="mdl-textfield__label" for="message">Message...</label>
            </div>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" @click="addMessage" >
              Send
            </button>
          </form>
          <form id="image-form" ref="imageForm" action="#">
            <input id="mediaCapture" ref="mediaCapture" type="file" accept="image/*,capture=camera" @change="saveImageMessage">
            <button id="submitImage" title="Add an image" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--amber-400 mdl-color-text--white" @click="mediaCaptureClick">
              <i class="material-icons">image</i>
            </button>
          </form>
        </div>
      </div>

      <div ref="signInSnackbar" class="mdl-js-snackbar mdl-snackbar">
        <div class="mdl-snackbar__text"></div>
        <button class="mdl-snackbar__action" type="button"></button>
      </div>

    </div>
  </main>
</div>
  </div>
</template>

<script>
import Vue      from 'vue'
import VueFire  from 'vuefire'
import Firebase from 'firebase'
import firebaseApp from './firebaseApp'

// explicit installation required in module environments
Vue.use(VueFire)

var auth = firebaseApp.auth()
var db = firebaseApp.database()
var storage = firebaseApp.storage()
var messagesRef = db.ref('messages')
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif'

export default {
  name: 'app',
  data () {
    return {
      newTodoText: '',
      messages: [],
      auth: false
    }
  },
  methods: {
    addMessage () {
      if (this.newTodoText) {
        var currentUser = auth.currentUser
        messagesRef.push({
          name: currentUser.displayName,
          text: this.newTodoText,
          photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
        })
        this.newTodoText = ''
      }
    },
    updateMessageText: function (todo, newText) {
      if (auth.currentUser) {
        messagesRef.child(todo['.key']).child('text').set(newText)
      }
      // @input="updateMessageText(message, event.target.value)"
    },
    removeMessage: function (todo) {
      if (auth.currentUser) {
        messagesRef.child(todo['.key']).remove()
      }
      // @click="removeMessage(message)
    },
    signIn () {
      var provider = new Firebase.auth.FacebookAuthProvider()
      auth.signInWithPopup(provider)
    },
    signOut () {
      auth.signOut()
    },
    mediaCaptureClick () {
      this.$refs.mediaCapture.click()
    },
    checkSignedInWithMessage () {
      // Return true if the user is signed in Firebase
      if (auth.currentUser) {
        return true
      }

      // Display a message to the user using a Toast.
      var data = {
        message: 'You must sign-in first',
        timeout: 2000
      }
      this.$refs.signInSnackbar.MaterialSnackbar.showSnackbar(data)
      return false
    },
    saveImageMessage (event) {
      var file = event.target.files[0]

      // Clear the selection in the file picker input.
      this.$refs.imageForm.reset()

      // Check if the file is an image.
      if (!file.type.match('image.*')) {
        var data = {
          message: 'You can only share images',
          timeout: 2000
        }
        this.$refs.signInSnackbar.MaterialSnackbar.showSnackbar(data)
        return
      }

      // Check if the user is signed-in
      if (this.checkSignedInWithMessage()) {
        // We add a message with a loading icon that will get updated with the shared image.
        var currentUser = auth.currentUser
        messagesRef.push({
          name: currentUser.displayName,
          imageUrl: LOADING_IMAGE_URL,
          photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
        }).then((data) => {
          // Upload the image to Firebase Storage.
          storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
              .put(file, {contentType: file.type})
              .then((snapshot) => {
                // Get the file's Storage URI and update the chat message placeholder.
                var filePath = snapshot.metadata.fullPath
                return storage.ref(filePath).getDownloadURL()
              }).then((url) => {
                data.update({imageUrl: url})
              }).catch((error) => {
                console.error('There was an error uploading a file to Firebase Storage:', error)
              })
        })
      }
    }
  },
  beforeCreate () {
    auth.onAuthStateChanged((user) => {
      this.auth = user
      this.$bindAsArray('messages', messagesRef.limitToLast(25))
      if (user) { // User is signed in!
        // Get profile pic and user's name from the Firebase user object.
        var profilePicUrl = user.photoURL
        var userName = user.displayName
        // Set the user's profile pic and name.
        this.$refs.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')'
        this.$refs.userName.textContent = userName

        // Show user's profile and sign-out button.
        this.$refs.userName.removeAttribute('hidden')
        this.$refs.userPic.removeAttribute('hidden')
        this.$refs.signOutButton.removeAttribute('hidden')

        // Hide sign-in button.
        this.$refs.signInButton.setAttribute('hidden', 'true')

        // We load currently existing chant messages.
        // this.loadMessages()
      } else { // User is signed out!
        // Hide user's profile and sign-out button.
        this.$refs.userName.setAttribute('hidden', 'true')
        this.$refs.userPic.setAttribute('hidden', 'true')
        this.$refs.signOutButton.setAttribute('hidden', 'true')

        // Show sign-in button.
        this.$refs.signInButton.removeAttribute('hidden')
      }
    })
  }
}
</script>

<style>
#app {
}
</style>
