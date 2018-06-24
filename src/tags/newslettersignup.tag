<newsletter-modal>
<div class="ui modal small">
  <div class="header">
    Sign Up
  </div>
  <div class="content" id-="nws-signup-form">
    <p> As we develop this new concept, we would like to tell you the story of how we do it, as we do it. </p>
    <p>Please sign up for our Newsletter and Welcome Aboard </p>
    <form id="newsletter-sign" class="ui form">
      <div class="field">
        <label>First Name</label>
        <input name="first-name" placeholder="First Name" type="text">
      </div>
      <div class="field">
        <label>Last Name</label>
        <input name="last-name" placeholder="Last Name" type="text">
      </div>
      <div class="field">
        <label>Email</label>
        <input name="email" placeholder="Your Email" type="email">
      </div>
      <div id="wpp" class="field" style="display: none;">
        <label> Are you a Robot? </label>
        <input id="wp" name="website" type="text" value=""/>
      </div>
      <button class="ui button" type="submit">Sign Up</button>
    </form>
  </div>
  <div class="content" id="nws-success" style="display: none;">
    <h4>Thank you very much! You will hear from us soon.</h4>
    <button class="ui button">Close</button>
  </div>
</div>
<script>
this.on("mount",() => {
  $(".ui.form").form({
    on:"submit",
    fields:{
      email:{
        identifier: "email",
        rules:[{type:'email', prompt:'Please enter a valid email'}]
      }
    },
    });
  $("#nws-success > button").click((ev) => $(".ui.modal").modal("hide"));
  $( "#newsletter-sign" ).submit((ev) => {
    ev.preventDefault();
    if ($('input#wp').val().length != 0) return false;
    var fdata = $("#newsletter-sign").form("get values");
    var xx = {
      aname: fdata["first-name"],
      lname: fdata["last-name"],
      email: fdata.email
    }
    $.ajax({
    method: "POST",
    url: "/news/signup",
    data: JSON.stringify(xx), 
    contentType: "application/json",
    success: (data) => {
      toastr.info("Success!");
      $("#newsletter-sign").slideUp();
      $("#nws-success").slideDown();
    },
    error: (xhr,status,error) => {
      toastr.warning(xhr.responseText);
    }
    });
  });
});
</script>
</newsletter-modal>