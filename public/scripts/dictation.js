
function dictate() {
   if (window.hasOwnProperty('webkitSpeechRecognition')) {
     var recognition = new webkitSpeechRecognition();
     recognition.continuous = false;
     recognition.interimResults = false;
     recognition.lang = "en-US";
     recognition.start();

     recognition.onresult = function(e) {
       document.getElementById('virginiain').value
                                = e.results[0][0].transcript;
       recognition.stop();
     };

     recognition.onerror = function(e) {
       recognition.stop();
     }
   }
};
