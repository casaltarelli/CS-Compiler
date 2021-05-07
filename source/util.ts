/* --------
   Utils.ts

   Utility functions.
-------- */

// Modal Functionality
var openModal = function() {
   document.getElementById("modal-overlay-").classList.add("modal-overlay-active");
   document.getElementById("modal-").classList.add("modal-active");
   document.getElementById("modal-tests-content-").classList.add("modal-tests-content-active");
   document.getElementById("modal-close-").classList.add("modal-close-active");
}
 
var closeModal = function() {
   document.getElementById("modal-overlay-").classList.remove("modal-overlay-active");
   document.getElementById("modal-").classList.remove("modal-active");
   document.getElementById("modal-tests-content-").classList.remove("modal-tests-content-active");
   document.getElementById("modal-close-").classList.remove("modal-close-active");
}

// Test Categories Functionality
var show = function(category) {
   console.log("Param Given: " + category);

   var categories = ["LEX", "PAR", "SMA"];

   for (var i = 0; i < categories.length; i++) {
      var id = categories[i] + "-cases";
      console.log(id);

      if (categories[i] == category) {
         document.getElementById(id).style.display = 'block';
         document.getElementById(categories[i]).style.color = "#000000";
         document.getElementById(categories[i]).style.borderBottom = "1px solid #FFBB5C";
      } else {
         document.getElementById(id).style.display = 'none';
         document.getElementById(categories[i]).style.color = "#606060";
         document.getElementById(categories[i]).style.borderBottom = "1px solid #F7F6FB";
      }
   }

}

// Verbose Mode Toggle
var verboseToggle = function() {
   var toggle = document.getElementById("verbose-toggle");

   if (_Verbose) {
      _Verbose = false;
      toggle.style.borderColor = '#DB3A34';
   } else {
      _Verbose = true;
      toggle.style.borderColor = '#38B000';
   }
}

// String Padding
var padEnd = function(s, targetLength, padString) {
   while (s.length < targetLength) {
      s += padString;
   }

   return s;
}