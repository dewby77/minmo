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

if($loggedInUser == null) {
    header("Location: ../404.php");
    exit();    
}

if (!securePage(__FILE__)){
  // Forward to index page
  addAlert("danger", "Whoops, looks like you don't have permission to view that page.");
  header("Location: ../404.php");
  exit();
}

setReferralPage(getAbsoluteDocumentPath(__FILE__));

?>

<!DOCTYPE html>
<html lang="en">
  <?php
	echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE, "#PAGE_TITLE#" => "Dashboard"));
  ?>

  <body>
      
    <?php
        echo renderLoggedInMenu("dashboard");
    ?>
      
        <div class="container">
            <div id='display-alerts' class="col-lg-12">
            </div> 
            
            <div class="row row-centered">
                <div class="col-md-4 text-center">
                    <!--Dashboard Item 2-->
                    <a href="product/product_list.php">
                        <span class="fa-stack fa-3x">
                            <i class="fa fa-circle-purple fa-stack-2x"></i>
                            <i class="fa fa-dollar fa-stack-1x fa-inverse"></i>
                        </span>
                        <h3>Products</h3>
                    </a>
                </div>                
                <div class="col-md-4 text-center">
                    <a href="#">
                        <span class="fa-stack fa-3x">
                            <i class="fa fa-circle-purple fa-stack-2x"></i>
                            <i class="fa fa-binoculars fa-stack-1x fa-inverse"></i>
                        </span>
                        <h3>Prospects</h3>
                    </a>
                </div>
                <div class="col-md-4 text-center">
                    <!--Dashboard Item 3-->
                    <a href="#">
                        <span class="fa-stack fa-3x">
                            <i class="fa fa-circle-purple fa-stack-2x"></i>
                            <i class="fa fa-users fa-stack-1x fa-inverse"></i>
                        </span>
                        <h3>Customers</h3>
                    </a>
                </div> 
            </div>
            <div class="row row-centered">
                <div class="col-md-4 text-center">
                    <a href="#">
                        <span class="fa-stack fa-3x">
                            <i class="fa fa-circle-purple fa-stack-2x"></i>
                            <i class="fa fa-briefcase fa-stack-1x fa-inverse"></i>
                        </span>
                        <h3>Business Management</h3>                        
                    </a>
                </div>
                <div class="col-md-4 text-center">
                    <a href="#">
                        <span class="fa-stack fa-3x">
                            <i class="fa fa-circle-purple fa-stack-2x"></i>
                            <i class="fa fa-desktop fa-stack-1x fa-inverse"></i>
                        </span>
                        <h3>Social Media</h3>                        
                    </a>
                </div>  
                <div class="col-md-4 text-center">
                    <a href="#">
                        <span class="fa-stack fa-3x">
                            <i class="fa fa-circle-purple fa-stack-2x"></i>
                            <i class="fa fa-bar-chart fa-stack-1x fa-inverse"></i>
                        </span>
                        <h3>Reports</h3>
                    </a>
                </div>
            </div>
        </div> <!-- /container -->
  <?php
	echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
  ?>

	<script>
        $(document).ready(function() {          
            $(".navbar-nav .navitem-dashboard").addClass('active');
            alertWidget('display-alerts');  
	});
	</script>
  </body>
</html>