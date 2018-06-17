<?php
/*

UserFrosting Version: 0.2.1 (beta)
By Alex Weissman
Copyright (c) 2014

Based on the UserCake user management system, v2.0.2.
Copyright (c) 2009-2012

UserFrosting, like UserCake, is 100% free and open-source.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

require_once("models/config.php");

if(isUserLoggedIn()) {
	addAlert("warning", "You're already logged in!");
	header("Location: secure");
	exit();
}

// Public page

setReferralPage(getAbsoluteDocumentPath(__FILE__));

//Forward the user to their default page if he/she is already logged in
if(isUserLoggedIn()) {
	addAlert("warning", "You're already logged in!");
	header("Location: secure");
	exit();
}
global $email_login;

if ($email_login == 1) {
    $user_email_placeholder = 'Username or Email';
}else{
    $user_email_placeholder = 'Username';
}
?>

<!DOCTYPE html>
<html lang="en">
  <?php
	echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE, "#PAGE_TITLE#" => "Login"));
  ?>

  <body>
    <?php
        echo renderPublicMainMenu("login");
    ?>  
      
    <div class="container text-container">
        <div class="row">
              <div id='display-alerts' class="col-lg-12">
              </div>
        </div>
        <h1>Login</h1>
        <form class='form-horizontal validate-form' role='form' name='login' action='api/process_login.php' method='post'>

          <div class="form-group">
                <div class="col-md-offset-3 col-md-6">
                  <input type="text" class="form-control" id="inputUserName" placeholder="<?php echo $user_email_placeholder; ?>" name='username' value=''>
                </div>
          </div>
          <div class="form-group">
                <div class="col-md-offset-3 col-md-6">
                  <input type="password" class="form-control" id="inputPassword" placeholder="Password" name='password'>
                </div>
          </div>
          <div class="form-group pull-right">
                <div class="col-md-12">
                  <a href='forgot_password.php' class='btn btn-link' role='button' value='Forgot Password'>Forgot your password?</a>
                  <button type="submit" class="btn btn-primary submit" value='Login'>Login</button>
                </div>
          </div>
		  
        </form>
        
          <div style="padding-right: 0px;" class="container registration-links pull-right">
          </div>        
        
    </div> <!-- /container -->
    
  <?php
	echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
  ?>

	<script>
        $(document).ready(function() {     
            $(".navbar-nav .navitem-login").addClass('active');
            
            // Load registration links
            $(".registration-links").load("registration_links.php");

            alertWidget('display-alerts');

            $(".validate-form")
                .formValidation({
                    framework: 'bootstrap',
                    fields: {
                        username: {
                            row: '.col-md-6',
                            validators: {
                                notEmpty: {
                                    message: 'Username is required'
                                }
                            }
                        },
                        password: {
                            row: '.col-md-6',
                            validators: {
                                notEmpty: {
                                    message: 'Password is required'
                                }
                            }
                        }                            
                    }
                })
                .on('success.form.fv', function(e) {
                    // Prevent form submission
                    e.preventDefault();

                    var $form = $(e.target),
                        fv    = $form.data('formValidation');

                    // Use Ajax to submit form data
                    $.ajax({
                        url: 'api/process_login.php',
                        type: 'POST',
                        data: $form.serialize() + "&ajaxMode=true",
                        success: function(result) {
                            var resultJSON = processJSONResult(result);
                            if (resultJSON['errors'] && resultJSON['errors'] > 0){
                              alertWidget('display-alerts');
                            } else {
                              window.location.replace("secure");
                            }
                        }
                    });
                });
		  
        });
	</script>
  </body>
</html>