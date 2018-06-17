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

setReferralPage(getAbsoluteDocumentPath(__FILE__));

if (!userIdExists('1')){
	addAlert("danger", lang("MASTER_ACCOUNT_NOT_EXISTS"));
	header("Location: install/wizard_root_user.php");
	exit();
}

// If registration is disabled, send them back to the home page with an error message
if (!$can_register){
	addAlert("danger", lang("ACCOUNT_REGISTRATION_DISABLED"));
	header("Location: login.php");
	exit();
}

//Prevent the user visiting the logged in page if he/she is already logged in
if(isUserLoggedIn()) {
	addAlert("danger", "I'm sorry, you cannot register for an account while logged in.  Please log out first.");
	apiReturnError(false, SITE_ROOT);
}

?>

<!DOCTYPE html>
<html lang="en">
  <?php
	echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE, "#PAGE_TITLE#" => "Register"));
  ?>

  <body>
    <?php
        echo renderPublicMainMenu("register");
    ?>    
      
    <div class="container text-container">
        <div class="row">
              <div id='display-alerts' class="col-lg-12">
              </div>
        </div>
        <h3>New User Registration</h3>
        <form name='newUser' id='newUser' class='form-horizontal' role='form' action='api/create_user.php' method='post'>		
          <div class="row form-group">
                <label class="col-sm-4 control-label">Username</label>
                <div class="col-sm-8">
                    <div class="input-group">
            <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                                <input type="text" class="form-control" placeholder="Username" name = 'user_name' value='' data-validate='{"minLength": 1, "maxLength": 25, "label": "Username" }'>
                        </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Display Name</label>
                <div class="col-sm-8">
                        <div class="input-group">
                                <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                                <input type="text" class="form-control" placeholder="Display Name" name='display_name' data-validate='{"minLength": 1, "maxLength": 50, "label": "Display Name" }'>
                        </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Email</label>
                <div class="col-sm-8">
                        <div class="input-group">
                                <span class='input-group-addon'><i class='fa fa-envelope'></i></span>
                                <input type="email" class="form-control" placeholder="Email" name='email' data-validate='{"email": true, "minLength": 1, "maxLength": 150, "label": "Email" }'>
                        </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Address Line 1</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="Address" name = 'addr_line_1' value='' data-validate='{"minLength": 1, "maxLength": 225, "label": "Address Line 1" }'>
                    </div>
                </div>
          </div>            
          <div class="row form-group">
                <label class="col-sm-4 control-label">Address Line 2</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="PO Box, Suite, Apt" name = 'addr_line_2' value='' data-validate='{"minLength": 0, "maxLength": 225, "label": "Address Line 2" }'>
                    </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">City</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="City" name = 'city' value='' data-validate='{"minLength": 1, "maxLength": 150, "label": "City" }'>
                    </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">State</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <select name="state" size="1" class="form-control" data-validate='{"minLength": 2, "maxLength": 2, "label": "State" }'>
                          <option value="" selected>Select a State</option>  
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="DC">Dist of Columbia</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="IN">Indiana</option>
                          <option value="IA">Iowa</option>
                          <option value="KS">Kansas</option>
                          <option value="KY">Kentucky</option>
                          <option value="LA">Louisiana</option>
                          <option value="ME">Maine</option>
                          <option value="MD">Maryland</option>
                          <option value="MA">Massachusetts</option>
                          <option value="MI">Michigan</option>
                          <option value="MN">Minnesota</option>
                          <option value="MS">Mississippi</option>
                          <option value="MO">Missouri</option>
                          <option value="MT">Montana</option>
                          <option value="NE">Nebraska</option>
                          <option value="NV">Nevada</option>
                          <option value="NH">New Hampshire</option>
                          <option value="NJ">New Jersey</option>
                          <option value="NM">New Mexico</option>
                          <option value="NY">New York</option>
                          <option value="NC">North Carolina</option>
                          <option value="ND">North Dakota</option>
                          <option value="OH">Ohio</option>
                          <option value="OK">Oklahoma</option>
                          <option value="OR">Oregon</option>
                          <option value="PA">Pennsylvania</option>
                          <option value="RI">Rhode Island</option>
                          <option value="SC">South Carolina</option>
                          <option value="SD">South Dakota</option>
                          <option value="TN">Tennessee</option>
                          <option value="TX">Texas</option>
                          <option value="UT">Utah</option>
                          <option value="VT">Vermont</option>
                          <option value="VA">Virginia</option>
                          <option value="WA">Washington</option>
                          <option value="WV">West Virginia</option>
                          <option value="WI">Wisconsin</option>
                          <option value="WY">Wyoming</option>
                        </select>                        
                    </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Zip</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="Zip" name = 'zip' value='' data-validate='{"minLength": 5, "maxLength": 5, "label": "Zip" }'>
                    </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Cell Phone</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="Cell Phone" name = 'cell_phone' value='' data-validate='{"minLength": 10, "maxLength": 10, "label": "Cell Phone" }'>
                    </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Office Phone</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="Office Phone" name = 'office_phone' value='' data-validate='{"minLength": 0, "maxLength": 10, "label": "Office Phone" }'>
                    </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Fax</label>
                <div class="col-sm-8">
                    <div class="input-group">
                        <span class='input-group-addon'><i class='fa fa-edit'></i></span>
                        <input type="text" class="form-control" placeholder="Fax" name = 'fax' value='' data-validate='{"minLength": 0, "maxLength": 10, "label": "Fax" }'>
                    </div>
                </div>
          </div> 
          <div class="row form-group">
                <label class="col-sm-4 control-label">Password</label>
                <div class="col-sm-8">
                        <div class="input-group">
                                <span class='input-group-addon'><i class='fa fa-lock'></i></span>
                                <input type="password" class="form-control" placeholder="Password" name='password' data-validate='{"minLength": 8, "maxLength": 50, "passwordMatch": "passwordc", "label": "Password" }'>
                        </div>
                </div>
          </div>
          <div class="row form-group">
                <label class="col-sm-4 control-label">Confirm Password</label>
                <div class="col-sm-8">
                        <div class="input-group">
                                <span class='input-group-addon'><i class='fa fa-lock'></i></span>
                                <input type="password" class="form-control" placeholder="Confirm Password" name='passwordc' data-validate='{"minLength": 8, "maxLength": 50, "label": "Confirm Password" }'>
                        </div>
                </div>
          </div>
          <div class="form-group">
                <label class="col-sm-4 control-label">Confirm Security Code</label>
                <div class="col-sm-4">
                        <div class="input-group">
                                <span class='input-group-addon'><i class='fa fa-eye'></i></span>
                                <input type="text" class="form-control" name='captcha' data-validate='{"minLength": 1, "maxLength": 50, "label": "Confirm Security Code" }'>
                        </div>
                </div>
                <div class="col-sm-4">
                  <img src='models/captcha.php' id="captcha">
                </div>
          </div>
          <br>
          <div class="form-group pull-right">
                <div class="col-sm-12">
                  <button type="submit" class="btn btn-primary submit" value='Register'>Register</button>
                  <a href="login.php" class="btn btn-negative" value="Cancel">Cancel</a>
                </div>
          </div>
        </form>        
    </div> <!-- /container -->
    
  <?php
	echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
  ?>

<script>	
        // Process submission
        $("form[name='newUser']").submit(function(e){
			e.preventDefault();
            var form = $(this);
            var errorMessages = validateFormFields('newUser');
			if (errorMessages.length > 0) {
				$('#display-alerts').html("");
				$.each(errorMessages, function (idx, msg) {
					$('#display-alerts').append("<div class='alert alert-danger'>" + msg + "</div>");
				});	
			} else {
                var url = APIPATH + 'create_user.php';
                $.ajax({  
                  type: "POST",  
                  url: url,  
                  data: {
					user_name: 		form.find('input[name="user_name"]' ).val(),
					display_name: 	        form.find('input[name="display_name"]' ).val(),
					email: 			form.find('input[name="email"]' ).val(),
                                        addr_line_1: 		form.find('input[name="addr_line_1"]' ).val(),
                                        addr_line_2: 		form.find('input[name="addr_line_2"]' ).val(),
                                        city: 		        form.find('input[name="city"]' ).val(),
                                        state: 		        form.find('select[name="state"]' ).val(),
                                        zip: 		        form.find('input[name="zip"]' ).val(),
                                        cell_phone: 		form.find('input[name="cell_phone"]' ).val(),
                                        office_phone: 		form.find('input[name="office_phone"]' ).val(),
                                        fax: 		        form.find('input[name="fax"]' ).val(),
					password: 		form.find('input[name="password"]' ).val(),
					passwordc: 		form.find('input[name="passwordc"]' ).val(),
					captcha: 		form.find('input[name="captcha"]' ).val(),
                    ajaxMode:		"true"
                  }		  
                }).done(function(result) {
                  var resultJSON = processJSONResult(result);
                  if (resultJSON['errors'] && resultJSON['errors'] > 0){
                        console.log("error");
						// Reload captcha
						var img_src = 'models/captcha.php?' + new Date().getTime();
						$('#captcha').attr('src', img_src);
						form.find('input[name="captcha"]' ).val("");
                        alertWidget('display-alerts');
                        return;
                  } else {
                    console.log("redirect");  
                    window.location.replace('login.php');
                  }
                });   
            }
	});
</script>
</body>
</html>