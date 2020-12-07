(function() {
  // get all data in form and return object
  function getFormData(form) {
    var elements = form.elements;
    var honeypot;

    var fields = Object.keys(elements).filter(function(k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function(k) {
      if (elements[k].name !== undefined) {
        return elements[k].name;
        // special case for Edge's html collection
      } else if (elements[k].length > 0) {
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function(name) {
      var element = elements[name];

      // singular form elements just have one value
      formData[name] = element.value;

      // when our element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });

    // add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default

    return {
      data: formData,
      honeypot: honeypot
    };
  }

  function handleFormSubmit(event) { // handles form submit without any jquery
    event.preventDefault(); // we are submitting via xhr below
    var form = event.target;
    var formData = getFormData(form);
    var data = formData.data;

    // If a honeypot field is filled, assume it was done so by a spam bot.
    if (formData.honeypot) {
      return false;
    }

    // var load = document.getElementById("loader");
    // load.style.display = "block";



    disableAllButtons(form);
    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    // xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var load = document.getElementById("loader");
    load.style.display = "block";
    xhr.onreadystatechange = function() {

      if (xhr.readyState === 4 && xhr.status === 200) {

        form.reset();
        var formElements = form.querySelector(".form-elements")
        if (formElements) {
          formElements.style.display = "none"; // hide form
        }

        // var thankYouMessage = form.querySelector(".thankyou_message");
        // if (thankYouMessage) {


          alert("Thanks for contacting us! We will get back to you soon!");
          window.location.reload();


          //thankYouMessage.style.display = "block";

          // setTimeout(function() {
          //   var opacity = 0;
          //   var intervalID = 0;
          //
          //   setInterval(hide, 150);
          //
          //   function hide() {
          //     var body = document.getElementById("thankyou_message");
          //     opacity =
          //       Number(window.getComputedStyle(body).getPropertyValue("opacity"))
          //
          //     if (opacity > 0) {
          //       opacity = opacity - 0.1;
          //       body.style.opacity = opacity
          //     } else {
          //       clearInterval(intervalID);
          //       thankYouMessage.style.display = "none";
          //     }
          //   }
          // }, 1000);
        // }
      } else if (xhr.status !== 200) {
        // var errorMessage = form.querySelector(".error_message");


        alert("Opps! Something went wrong, please try again.");
        window.location.reload();


        // errorMessage.style.display = "block";
        // setTimeout(function() {
        //   var opacity = 0;
        //   var intervalID = 0;
        //
        //   setInterval(hide, 150);
        //
        //   function hide() {
        //     var body = document.getElementById("error_message");
        //     opacity =
        //       Number(window.getComputedStyle(body).getPropertyValue("opacity"))
        //
        //     if (opacity > 0) {
        //       opacity = opacity - 0.1;
        //       body.style.opacity = opacity
        //     } else {
        //       clearInterval(intervalID);
        //       errorMessage.style.display = "none";
        //     }
        //   }
        // }, 1000);
      }

    };
    // url encode form data for sending as post data
    var encoded = Object.keys(data).map(function(k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');
    xhr.send(encoded);
  }

  function loaded() {
    // bind to the submit event of our form
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  };
  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }
})();
