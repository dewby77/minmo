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

require_once("../models/config.php");

if (!securePage(__FILE__)){
  // Forward to index page
  addAlert("danger", "Whoops, looks like you don't have permission to view that page.");
  header("Location: index.php");
  exit();
}

setReferralPage(getAbsoluteDocumentPath(__FILE__));

?>

<!DOCTYPE html>
<html lang="en">
  <?php
  	echo renderAccountPageHeader(array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE, "#PAGE_TITLE#" => "Account Settings"));
  ?>

  <body>
    <div id="wrapper">

      <!-- Sidebar -->
        <?php
          echo renderAccountMenu("settings");
        ?>  

      <div id="page-wrapper">
	  	<div class="row">
          <div id='display-alerts' class="col-lg-12">

          </div>
        </div>
		<h1>Account Settings</h1>
		<div class="row">
		  <div class="col-lg-6">
		  <form class="form-horizontal" role="form" name="updateAccount" action="update_user.php" method="post">
		  <div class="form-group">
			<label class="col-sm-4 control-label">Display Name</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="Display Name" name='display_name' value=''>
			</div>
		  </div>                      
		  <div class="form-group">
			<label class="col-sm-4 control-label">Email</label>
			<div class="col-sm-8">
			  <input type="email" class="form-control" placeholder="Email" name='email' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Address Line 1</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="Address" name='addr_line_1' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Address Line 2</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="PO Box, Suite, Apt" name='addr_line_2' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">City</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="City" name='city' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">State</label>
			<div class="col-sm-8">
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
		  <div class="form-group">
			<label class="col-sm-4 control-label">Zip</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="Zip" name='zip' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Cell Phone</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="Cell Phone" name='cell_phone' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Office Phone</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="Office Phone" name='office_phone' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Fax</label>
			<div class="col-sm-8">
			  <input type="text" class="form-control" placeholder="Fax" name='fax' value=''>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Current Password</label>
			<div class="col-sm-8">
			  <input type="password" class="form-control" placeholder="Current Password" name='passwordcheck'>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">New Password</label>
			<div class="col-sm-8">
			  <input type="password" class="form-control" placeholder="New Password" name='password'>
			</div>
		  </div>
		  <div class="form-group">
			<label class="col-sm-4 control-label">Confirm New Password</label>
			<div class="col-sm-8">
			  <input type="password" class="form-control" placeholder="Confirm New Password" name='passwordc'>
			</div>
		  </div>
		  
		  <div class="form-group">
			<div class="col-sm-offset-4 col-sm-8">
			  <button type="submit" class="btn btn-success submit" value='Update'>Update</button>
			</div>
		  </div>
		  <input type="hidden" name="csrf_token" value="<?php echo $loggedInUser->csrf_token; ?>" />
		  <input type="hidden" name="user_id" value="0" />
		  </form>
		  </div>
		</div>
	  </div>
	</div>
	
	<script>
        $(document).ready(function() {
          // Get id of the logged in user to determine how to render this page.
          var user = loadCurrentUser();
          var user_id = user['user_id'];
          
		  alertWidget('display-alerts');

		  // Set default form field values
		  $('form[name="updateAccount"] input[name="email"]').val(user['email']);
                  $('form[name="updateAccount"] input[name="display_name"]').val(user['display_name']);
                  $('form[name="updateAccount"] input[name="addr_line_1"]').val(user['addr_line_1']);
                  $('form[name="updateAccount"] input[name="addr_line_2"]').val(user['addr_line_2']);
                  $('form[name="updateAccount"] input[name="city"]').val(user['city']);
                  $('form[name="updateAccount"] select[name="state"]').val(user['state']);
                  $('form[name="updateAccount"] input[name="zip"]').val(user['zip']);
                  $('form[name="updateAccount"] input[name="cell_phone"]').val(user['cell_phone']);
                  $('form[name="updateAccount"] input[name="office_phone"]').val(user['office_phone']);
                  $('form[name="updateAccount"] input[name="fax"]').val(user['fax']);

		  var request;
		  $("form[name='updateAccount']").submit(function(event){
			var url = APIPATH + 'update_user.php';
			// abort any pending request
			if (request) {
				request.abort();
			}
			var $form = $(this);
			var $inputs = $form.find("input");
			// post to the backend script in ajax mode
			var serializedData = $form.serialize() + '&ajaxMode=true';
			// Disable the inputs for the duration of the ajax request
			$inputs.prop("disabled", true);
		
			// fire off the request
			request = $.ajax({
				url: url,
				type: "post",
				data: serializedData
			})
			.done(function (result, textStatus, jqXHR){
				var resultJSON = processJSONResult(result);
				// Render alerts
				alertWidget('display-alerts');
				
				// Clear password input fields on success
				if (resultJSON['successes'] > 0) {
				  $form.find("input[name='password']").val("");
				  $form.find("input[name='passwordc']").val("");
				  $form.find("input[name='passwordcheck']").val("");
				}
			}).fail(function (jqXHR, textStatus, errorThrown){
				// log the error to the console
				console.error(
					"The following error occured: "+
					textStatus, errorThrown
				);
			}).always(function () {
				// reenable the inputs
				$inputs.prop("disabled", false);
			});
		
			// prevent default posting of form
			event.preventDefault();  
		  });

		});
	</script>
  </body>
</html>
