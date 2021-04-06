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

var verboseToggle = function() {
   var toggle = document.getElementById("verbose-toggle");

   if (_Verbose) {
      _Verbose = false;
      toggle.style.borderColor = "#DB3A34";
   } else {
      _Verbose = true;
      toggle.style.borderColor = "#38B000";
   }
}