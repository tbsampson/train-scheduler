    // Initial Values
    var database = firebase.database();
    var name = "";
    var destination = "";
    var time = "";
    var frequency = 0;
    
    $(document).on("click", '#remove-train', removeTrain);

    // remove train
    function removeTrain() {
        event.preventDefault();
        let key = $(this).attr('data-id')
        $key = '.' + key
        $($key).empty();
        console.log(key)
        firebase.database().ref(key).remove();
        
        // location.reload();
    };

    // Capture Button Click
    $("#add-train").on("click", function(event) {

    event.preventDefault();
    name = $("#name-input").val().trim();
    destination = $("#destination-input").val().trim();
    time = $("#time-input").val().trim();
    frequency = $("#frequency-input").val().trim();
    
        if (name.length > 0 && destination.length > 0 && time.length > 0 && frequency.length > 0) {
            // Code for the push
            database.ref().push({
                name: name,
                destination: destination,
                time: time,
                frequency: frequency,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
            $("#error-message").empty();
        } else {
            // tried to submit form with one or more blank fields
            $("#error-message").html("Error: empty field detected, please try again!");
        }
    });

    // Firebase watcher + initial loader
    database.ref().on("child_added", function(childSnapshot) {
      
      //Calculate firstArrival and MinutesAway
      var timeYesterday = moment(childSnapshot.val().time, "HH:mm").subtract(1, "days"); //Subtract 1 day to ensure time is in the past
      
      //Current Time
      var currentTime = moment();
      
      //Time Diff
      var diffTime = moment().diff(moment(timeYesterday), "minutes");

      //Time apart (remainder)
      var timeRemainder = diffTime % childSnapshot.val().frequency;

      //How many minutes until next train
      var minsTillTrain = childSnapshot.val().frequency - timeRemainder;

      //When will next train arrive
      var nextTrain = moment().add(minsTillTrain, "minutes");
      
      // Log everything that's coming out of snapshot
      console.log(timeYesterday)
      console.log(timeRemainder)
      console.log(minsTillTrain)
      console.log(nextTrain)
      console.log(currentTime)
      console.log(childSnapshot.val().name);
      console.log(childSnapshot.val().destination);
      console.log(childSnapshot.val().time);
      console.log(childSnapshot.val().frequency);
      console.log(childSnapshot.val().dateAdded);
      
      // full list of trains
      $("#train-list").append(`<tr class="${childSnapshot.key}">
                                <td><button data-id="${childSnapshot.key}" class="btn btn-danger p-0 pl-1 pr-1 pt-0" id="remove-train" type="submit">x</button></td>
                                <td>${childSnapshot.val().name}</td>
                                <td>${childSnapshot.val().destination}</td>
                                <td>${childSnapshot.val().frequency}</td>
                                <td>${nextTrain}</td>
                                <td>${minsTillTrain}</td>
                               </tr>`);
            
      // Handle the errors
    }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    });
    
    //Most recently added train
    database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
      // Change the HTML to reflect
      $("#name-display").text(snapshot.val().name);
      $("#destination-display").text(snapshot.val().destination);
      $("#time-display").text(snapshot.val().time);
      $("#frequency-display").text(snapshot.val().frequency);
    });