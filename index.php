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
?>

<!DOCTYPE html>
<html lang="en">
  <?php
	echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE, "#PAGE_TITLE#" => "Home"));
  ?>

  <body>
      
    <?php
        echo renderPublicMainMenu("home");
    ?>
      
    <div id="Container_Carousel">  
        <div class="rows">				
            <div class="col-lg-12  col-md-12 col-sm-12 col-xs-12" >
                <div id="carousel-example-generic" class="carousel slide">
                    <!-- Indicators -->
                    <ol class="carousel-indicators hidden-xs">
                        <li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li>
                        <li data-target="#carousel-example-generic" data-slide-to="1"></li>
                        <li data-target="#carousel-example-generic" data-slide-to="2"></li>
                    </ol>

                    <!-- Wrapper for slides -->
                    <div class="carousel-inner">
                        <div class="item active">
                            <img class="img-responsive img-full" src="img/slide1.jpg" alt="slide 1" />
                        </div>                                 

                        <div class="item">
                            <img class="img-responsive img-full" src="img/slide2.jpg" alt="slide 2" />
                        </div> 

                        <div class="item">
                            <img class="img-responsive img-full" src="img/slide3.jpg" alt="slide 3" />
                        </div> 
                    </div>

                    <!-- Controls -->
                    <a class="left carousel-control" href="#carousel-example-generic" data-slide="prev">
                        <span class="icon-prev"></span>
                    </a>
                    <a class="right carousel-control" href="#carousel-example-generic" data-slide="next">
                        <span class="icon-next"></span>
                    </a>
                </div>    
            </div>
        </div>
    </div>
    <br>
    <div class="container text-container">
        <div class="row">
            <div id='display-alerts' class="col-lg-12">
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <h1>Words Words</h1>
                <p>Beta Application ready to roll</p>                
            </div>
            <div class="col-md-6">
                <div class="pull-right">
                    <h1>More Words</h1>
                    <p>There should probably be really good words here</p>
                </div>
            </div>
        </div>

    </div> <!-- /container -->
    <div style="clear:both;"></div>
  <?php
	echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
  ?>

	<script>
        $(document).ready(function() {          
            $(".navbar-nav .navitem-home").addClass('active');
            alertWidget('display-alerts');  
            
            $(function() { $('.map').maphilight({
                    stroke : false
            }); });
        
            // Activates the Carousel
            $('.carousel').carousel({
                interval: 5000
            });        
        
	});
	</script>
        <script type="text/javascript" src="js/map-highlight.js"></script>
  </body>
</html>