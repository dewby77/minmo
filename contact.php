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

if(isUserLoggedIn()) {
	addAlert("warning", "You're already logged in!");
	header("Location: secure");
	exit();
}

//if (!securePage($_SERVER['PHP_SELF'])){die();}

$your_email = "becky.mccrea07@gmail.com";// <<=== update to your email address

//session_start();
$errors = '';
$name = '';
$visitor_email = '';
$user_message = '';

if(isset($_POST['submit']))
{
    $name = $_POST['name'];
    $visitor_email = $_POST['email'];
    $user_message = $_POST['message'];
    
    ///------------Do Validations-------------
    if(empty($name)||empty($visitor_email))
    {
        $errors .= "\n Name and Email are required fields. ";	
    }
    if(IsInjected($visitor_email))
    {
        $errors .= "\n Bad email value!";
    }
    if(IsInjected($user_message))
    {
        $errors .= "\n This message contains characters not allowed!";
    }
    if(empty($_SESSION['6_letters_code'] ) ||
      strcasecmp($_SESSION['6_letters_code'], $_POST['6_letters_code']) != 0)
    {
    //Note: the captcha code is compared case insensitively.
    //if you want case sensitive match, update the check above to
    // strcmp()
        $errors .= "\n The captcha code does not match!";
    }

    if(empty($errors))
    {
        //send the email
        $to = $your_email;
        $subject= $website." Contact Form Submission";
        $from = $your_email;
        $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';

        $body = "A user  $name submitted the contact form:\n".
        "Name: $name\n".
        "Email: $visitor_email \n".
        "Message: \n ".
        "$user_message\n".
        "IP: $ip\n";	

        $headers = "From: $from \r\n";
        $headers .= "Reply-To: $visitor_email \r\n";

        mail($to, $subject, $body,$headers);

        header('Location: thankyou.php');
    }
}

// Function to validate against any email injection attempts
function IsInjected($str)
{
    $injections = array('(\n+)',
                        '(\r+)',
                        '(\t+)',
                        '(%0A+)',
                        '(%0D+)',
                        '(%08+)',
                        '(%09+)'
                        );
    $inject = join('|', $injections);
    $inject = "/$inject/i";
    if(preg_match($inject,$str))
    {
        return true;
    }
    else
    {
        return false;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
  <?php
	echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE, "#PAGE_TITLE#" => "Contact"));
  ?>

  <body>
      
    <?php
        echo renderPublicMainMenu("contact");
    ?>
      
    <div class="container text-container">
        <div class="row">
            <div id='display-alerts' class="col-lg-12">
            </div>
        </div>

        <div class="row">
            <h1>Contact Us!</h1>
            <?php
                if(!empty($errors)){
                    //mccrea - this is janky, come back and fix later
                    echo "<div class='alert alert-danger'>".nl2br($errors)."</div>";
                }
            ?>
            <div id='contact_form_errorloc' class='err'></div>
            <form method="POST" name="contact_form" action="<?php echo htmlentities($_SERVER['PHP_SELF']); ?>"> 
                <p>
                    <label for='name'>Name: </label><br>
                    <input type="text" name="name" value='<?php echo htmlentities($name) ?>' placeholder="First and Last Name" class="form-control">
                </p>
                <p>
                    <label for='email'>Email: </label><br>
                    <input type="text" name="email" value='<?php echo htmlentities($visitor_email) ?>' placeholder="Email" class="form-control">
                </p>
                <p>
                    <label for='message'>Message:</label> <br>
                    <textarea name="message" rows='8' cols='30' placeholder="Message" class="form-control"><?php echo htmlentities($user_message) ?></textarea>
                </p>
                <p>
                    <img src="captcha_code_file.php?rand=<?php echo rand(); ?>" id='captchaimg' ><br>
                    <label for='message'>Enter the code above here :</label><br>
                    <input id="6_letters_code" name="6_letters_code" type="text"><br>
                    <small>Can't read the image? click <a href='javascript: refreshCaptcha();'>here</a> to refresh</small>
                </p>
                <div class="form-group pull-right">
                    <div class="col-md-12">
                        <button type="submit" name='submit' class="btn btn-primary btn-custom btn-lg" style="margin-bottom:10px;">Submit</button>
                    </div>
                </div>
            </form>
        </div>

    </div> <!-- /container -->
    <?php
	echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
    ?>

    <script>
        $(document).ready(function() {          
            $(".navbar-nav .navitem-contact").addClass('active');
            alertWidget('display-alerts');  
	});
        
        function refreshCaptcha()
        {
            var img = document.images['captchaimg'];
            img.src = img.src.substring(0,img.src.lastIndexOf("?"))+"?rand="+Math.random()*1000;
        }        
    </script>
    <!-- <? php echo $analytics ?> -->
  </body>
</html>