var config = {
    apiKey: "AIzaSyDc1xFqGHHyQG2ejeMgY5r1SIIJ-CpIFc4",
    authDomain: "https://rpsgame-d57aa.firebaseapp.com",
    databaseURL: "https://rpsgame-d57aa.firebaseio.com/",
    storageBucket: "rpsgame-d57aa.appspot.com"
  };
  
  firebase.initializeApp(config);
  
  var database = firebase.database();
  var chatData = database.ref("/chat");
  var playersRef = database.ref("players");
  var currentTurnRef = database.ref("turn");
  var username = "Guest";
  var currentPlayers = null;
  var currentTurn = null;
  var playerNum = false;
  var playerOneExists = false;
  var playerTwoExists = false;
  var playerOneData = null;
  var playerTwoData = null;
  
  $("#start").click(function() {
    if ($("#username").val() !== "") {
      username = capitalize($("#username").val());
      getInGame();
    }
  });
  
  $("#username").keypress(function(e) {
    if (e.which === 13 && $("#username").val() !== "") {
      username = capitalize($("#username").val());
      getInGame();
    }
  });
  
  function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  

  $("#chat-send").click(function() {
  
    if ($("#chat-input").val() !== "") {
  
      var message = $("#chat-input").val();
  
      chatData.push({
        name: username,
        message: message,
        time: firebase.database.ServerValue.TIMESTAMP,
        idNum: playerNum
      });
  
      $("#chat-input").val("");
    }
  });
  
  
  $("#chat-input").keypress(function(e) {
  
    if (e.which === 13 && $("#chat-input").val() !== "") {
  
      var message = $("#chat-input").val();
  
      chatData.push({
        name: username,
        message: message,
        time: firebase.database.ServerValue.TIMESTAMP,
        idNum: playerNum
      });
  
      $("#chat-input").val("");
    }
  });
  
  $(document).on("click", "li", function() {
  
    console.log("click");
  
    var clickChoice = $(this).text();
    console.log(playerRef);
  
    playerRef.child("choice").set(clickChoice);
  
    $("#player" + playerNum + " ul").empty();
    $("#player" + playerNum + "chosen").text(clickChoice);
  
  
    currentTurnRef.transaction(function(turn) {
      return turn + 1;
    });
  });
  
  chatData.orderByChild("time").on("child_added", function(snapshot) {
 
    if (snapshot.val().idNum === 0) {
      $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
      + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    }
    else {
      $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
      + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    }
  
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
  });
  
  playersRef.on("value", function(snapshot) {
  
    currentPlayers = snapshot.numChildren();
  
    playerOneExists = snapshot.child("1").exists();
    playerTwoExists = snapshot.child("2").exists();
  
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();
  
    if (playerOneExists) {
      $("#player1-name").text(playerOneData.name);
      $("#player1-wins").text("Wins: " + playerOneData.wins);
      $("#player1-losses").text("Losses: " + playerOneData.losses);
    }
    else {
  
      $("#player1-name").text("Waiting for Player 1");
      $("#player1-wins").empty();
      $("#player1-losses").empty();
    }
  
    if (playerTwoExists) {
      $("#player2-name").text(playerTwoData.name);
      $("#player2-wins").text("Wins: " + playerTwoData.wins);
      $("#player2-losses").text("Losses: " + playerTwoData.losses);
    }
    else {
  
      $("#player2-name").text("Waiting for Player 2");
      $("#player2-wins").empty();
      $("#player2-losses").empty();
    }
  });
  
  currentTurnRef.on("value", function(snapshot) {
  
    currentTurn = snapshot.val();
  
    if (playerNum) {
  
      if (currentTurn === 1) {
  
        if (currentTurn === playerNum) {
          $("#current-turn").html("<h2>It's Your Turn!</h2>");
          $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
        }
        else {
  
          $("#current-turn").html("<h2>Waiting for " + playerOneData.name + " to choose.</h2>");
        }
  
        $("#player1").css("border", "2px solid yellow");
        $("#player2").css("border", "1px solid black");
      }
  
      else if (currentTurn === 2) {
  
        if (currentTurn === playerNum) {
          $("#current-turn").html("<h2>It's Your Turn!</h2>");
          $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
        }
        else {
  
          $("#current-turn").html("<h2>Waiting for " + playerTwoData.name + " to choose.</h2>");
  
        }
  
        $("#player2").css("border", "2px solid yellow");
        $("#player1").css("border", "1px solid black");
      }
  
      else if (currentTurn === 3) {
  
        gameLogic(playerOneData.choice, playerTwoData.choice);
  
        $("#player1-chosen").text(playerOneData.choice);
        $("#player2-chosen").text(playerTwoData.choice);
  
        var moveOn = function() {
  
          $("#player1-chosen").empty();
          $("#player2-chosen").empty();
          $("#result").empty();
  
          if (playerOneExists && playerTwoExists) {
            currentTurnRef.set(1);
          }
        };
  
        setTimeout(moveOn, 4000);
      }
  
      else {
  
        $("#player1 ul").empty();
        $("#player2 ul").empty();
        $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
        $("#player2").css("border", "1px solid black");
        $("#player1").css("border", "1px solid black");
      }
    }
  });
  
  playersRef.on("child_added", function(snapshot) {
  
    if (currentPlayers === 1) {
  
      currentTurnRef.set(1);
    }
  });
  
  function getInGame() {
  
    
    var chatDataDisc = database.ref("/chat/" + Date.now());
  
  
    if (currentPlayers < 2) {
  
      if (playerOneExists) {
        playerNum = 2;
      }
      else {
        playerNum = 1;
      }
  
      playerRef = database.ref("/players/" + playerNum);
  
      playerRef.set({
        name: username,
        wins: 0,
        losses: 0,
        choice: null
      });
  
      playerRef.onDisconnect().remove();
  
      currentTurnRef.onDisconnect().remove();
  
      chatDataDisc.onDisconnect().set({
        name: username,
        time: firebase.database.ServerValue.TIMESTAMP,
        message: "has disconnected.",
        idNum: 0
      });
  
      $("#swap-zone").html("<h2>Hi " + username + "! You are Player " + playerNum + "</h2>");
    }
    else {
  
      alert("Sorry, Game Full! Try Again Later!");
    }
  }
  
  function gameLogic(player1choice, player2choice) {
  
    var playerOneWon = function() {
      $("#result").html("<h2>" + playerOneData.name + "</h2><h2>Wins!</h2>");
      if (playerNum === 1) {
        playersRef.child("1").child("wins").set(playerOneData.wins + 1);
        playersRef.child("2").child("losses").set(playerTwoData.losses + 1);
      }
    };
  
    var playerTwoWon = function() {
      $("#result").html("<h2>" + playerTwoData.name + "</h2><h2>Wins!</h2>");
      if (playerNum === 2) {
        playersRef.child("2").child("wins").set(playerTwoData.wins + 1);
        playersRef.child("1").child("losses").set(playerOneData.losses + 1);
      }
    };
  
    var tie = function() {
      $("#result").html("<h2>Tie Game!</h2>");
    };
  
    if (player1choice === "Rock" && player2choice === "Rock") {
      tie();
    }
    else if (player1choice === "Paper" && player2choice === "Paper") {
      tie();
    }
    else if (player1choice === "Scissors" && player2choice === "Scissors") {
      tie();
    }
    else if (player1choice === "Rock" && player2choice === "Paper") {
      playerTwoWon();
    }
    else if (player1choice === "Rock" && player2choice === "Scissors") {
      playerOneWon();
    }
    else if (player1choice === "Paper" && player2choice === "Rock") {
      playerOneWon();
    }
    else if (player1choice === "Paper" && player2choice === "Scissors") {
      playerTwoWon();
    }
    else if (player1choice === "Scissors" && player2choice === "Rock") {
      playerTwoWon();
    }
    else if (player1choice === "Scissors" && player2choice === "Paper") {
      playerOneWon();
    }
  }
  