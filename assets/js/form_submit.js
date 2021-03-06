function fillFormDefaults() {
  if (localStorage.my_name && localStorage.my_email) {
    $('#name').val(localStorage.my_name);
    $('#email').val(localStorage.my_email);
    $('#forget-section').show();
    $('#remember-section').hide();
  } else {
    $('#forget-section').hide();
    $('#remember-section').show();
  }
}

$(function() {

  fillFormDefaults();

  $('#forget').click( function (e) {
    e.preventDefault();
    delete localStorage.my_name;
    delete localStorage.my_email;
    $('#name').val('');
    $('#email').val('');
    $('#forget-section').hide();
    $('#remember-section').show();
  });

  $("#submissionForm input,#submissionForm select").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function($form, event, errors) {
      // additional error messages or events
    },
    submitSuccess: function($form, event) {
      event.preventDefault(); // prevent default submit behaviour
      $this = $("#submitFormButton");
      $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages

      grecaptcha.ready(function() {
        grecaptcha.execute('6LfxHiYaAAAAANF3jXUmfC9M-SB7bhL0Mts7BQ_P', {action: 'submit'}).then(function(token) {
          var url = "https://script.google.com/macros/s/AKfycbywSwe_b9zM5_V9hdlf6lPYXUwgjZyhjtMKBdrKIh4Fkf-NYhSD/exec";
          const data = new FormData($form[0]);
          data.append('token', token);

          $.ajax({
            url: url,
            type: "POST",
            data: data,
            enctype: 'multipart/form-data',
            contentType: false,
            processData: false,
            cache: false,

            success: function(d) {
              var message = "";
              if (d.hasTeam) {
                message = "Your hill has been submitted for team "+d.team+"!";
              } else {
                message = "Welcome to team "+d.team+"! Your hill has been submitted.";
              }
              // Success message
              $('#success').html("<div class='alert alert-success'>");
              $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                .append("</button>");
              $('#success > .alert-success')
                .append("<strong>"+message+"</strong>");
              $('#success > .alert-success')
                .append('</div>');

              if ($('#remember').is(':checked')) {
                localStorage.my_name = data.get('Name');
                localStorage.my_email = data.get('Email');
              }

              //clear all fields
              $('#submissionForm').trigger("reset");
              fillFormDefaults();
            },

            error: function(e) {
              console.error(e);
              // Fail message
              $('#success').html("<div class='alert alert-danger'>");
              $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                .append("</button>");
              $('#success > .alert-danger').append($("<strong>").text("Something is wrong. Please try again later!"));
              $('#success > .alert-danger').append('</div>');
              //clear all fields
              $('#submissionForm').trigger("reset");
            },

            complete: function() {
              setTimeout(function() {
                $this.prop("disabled", false); // Re-enable submit button when AJAX call is complete
              }, 1000);
            }
          });

        });
      });
    },
    filter: function() {
      return $(this).is(":visible");
    },
  });

  $("a[data-toggle=\"tab\"]").click(function(e) {
    e.preventDefault();
    $(this).tab("show");
  });
});

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
  $('#success').html('');
});
