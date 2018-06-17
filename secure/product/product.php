<?php
require_once("../../models/config.php");

if($loggedInUser == null) {
    header("Location: ../../404.php");
    exit();    
}

if (!securePage(__FILE__)) {
    // Forward to index page
    addAlert("danger", "Whoops,  looks like you don't have permission to view that page.");
    header("Location: ../../404.php");
    exit();
}

setReferralPage(getAbsoluteDocumentPath(__FILE__));

$product_id = isset($_GET['product_id']) ? $_GET['product_id'] : 0;
?>

<!DOCTYPE html>
<html lang="en">
    <?php
    echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
    ?>
    
    <body>
        <?php
        echo renderSecureMainMenuNoNav('main')
        ?>
        
        <div class="container">
            <h1 class="dynamic-header"></h1>

            <div id='display-alerts' class="col-lg-12">
            </div> 
            <br>
            
            <div class="col-md-12">
                <form action="#" name="product_details" method="POST" class="validate-form form-horizontal" role="form" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="product_name" class="col-sm-2 control-label">* Product Name:</label>
                        <div class="col-sm-6">
                            <div class="input-group">
                                <span class="input-group-addon"><i class="fa fa-edit"></i></span>
                                <input class="form-control" type="text" name="product_name" placeholder="Enter Product Name">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="product_number" class="col-sm-2 control-label">Product Number:</label>
                        <div class="col-sm-6">
                            <div class="input-group">
                                <span class="input-group-addon"><i class="fa fa-edit"></i></span>
                                <input class="form-control" type="text" name="product_number" placeholder="Enter Product Number">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="product_desc" class="col-sm-2 control-label">* Product Description:</label>
                        <div class="col-sm-6">
                            <div class="input-group">
                                <span class="input-group-addon"><i class="fa fa-edit"></i></span>
                                <textarea class="form-control" name="product_desc" placeholder="Enter Product Description" rows="8" cols="30"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="product_status" class="col-sm-2 control-label">* Product Status:</label>
                        <div class="col-sm-6">
                            <div class="input-group status_list">
                                
                            </div>
                        </div>
                    </div>                  

                    <?php if($product_id > 0){ ?>
                    <div class="form-group">
                        <label class="col-sm-2 control-label"> Existing Image:</label>
                        <div class="col-lg-2">
                            <a href="#" id="pop">
                                <img id="existing_img" src="../../img/no-image.png" alt="existing_img" style="width:150px;height:150px;" />
                                Click to Enlarge
                            </a>
                        </div>                            
                    </div>
                    <?php } ?>
                    <div class="form-group">
                        <label class="col-sm-2 control-label"> Image:</label>
                        <div class="col-sm-6">
                            <input id="item_image" type="file" class="file-loading" name="product_image">
                        </div>
                    </div>                      
                     
                    <div class="row">
                        <div class="pull-right">
                            <button type="submit" class="btn btn-primary submit" name="SaveButton">Save</button>                            
                            <a href='product_list.php' class='btn btn-danger'>Cancel</a>
                        </div>
                    </div>
                    <input type="hidden" name="csrf_token" value="<?php echo $loggedInUser->csrf_token; ?>" />
                    <input type="hidden" name="MAX_FILE_SIZE" value="100000000" />
                    <input type="hidden" id="hidden_product_img" name="hidden_product_img" value="" />
                </form>
            </div>
        </div>
        <!-- Creates the bootstrap modal where the image will appear -->
        <div class="modal fade" id="imagemodal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                <h4 class="modal-title" id="myModalLabel">Image preview</h4>
              </div>
              <div class="modal-body">
                <img class="img img-responsive" src="" id="imagepreview">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div> 
<?php
echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
?>
        <script>    
            var product_id = getParameterByName('product_id');     
            var request;
          
            $(document).ready(function(){
                $("#product_name").focus();
                
                $("#pop").on("click", function() {
                   $('#imagepreview').attr('src', $('#existing_img').attr('src')); // here asign the image to the modal when the user click the enlarge link
                   $('#imagemodal').modal('show'); // imagemodal is the id attribute assigned to the bootstrap modal, then i use the show function
                });           

                $("#product_image").fileinput({
                    previewFileType: "image",
                    browseClass: "btn btn-success",
                    browseLabel: "Pick Image",
                    browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
                    showUpload: false,
                    allowedFileExtensions: ["jpg", "jpeg", "png"],
                    maxFileSize: 100000000 //2097152 //2mb
                });                  
                
                try {
                    var statusList = loadProductStatus();

                    $.each(statusList, function (key, data) {
                        var htmlStr = "<label class='radio-inline'><input type='radio' name='product_status' value='"+ data['product_status_id'] +"'>" + data['product_status'] + "</label>";
                        $('.status_list').append(htmlStr);
                    });             

                    // load the product details
                    if (product_id !== undefined && product_id !== null && product_id > 0) {
                        var product = loadProductById(product_id);
                        if (product !== undefined && product !== null) {
                            //set all of the values
                            $('input[name="product_name"]').val(product['product_name']);
                            $('input[name="product_number"]').val(product['product_number']);
                            //$('textarea[name="product_desc"]').val(item['product_desc']);
                            $('input:radio[name=product_status][value="' + product['product_status_id'] + '"]').prop('checked', true);

                            var product_img_name = product['product_img'];
                            $('input[name="hidden_product_img"]').val(product_img_name);

                            if(product['product_img'] !== null && product['product_img'].length > 0) {
                                $("#existing_img").attr("src","../../product_img/" + product_id + "/" + product["product_img"]);
                            } 
                        }
                    }
                } catch (ex){
                    //not good
                    alert("Something bad happened");
                }
                
                alertWidget('display-alerts');
            });
                
            $(".validate-form")
                .formValidation({
                    framework: 'bootstrap',
                    fields: {
                        product_name: {
                            row: '.col-sm-6',
                            validators: {
                                notEmpty: {
                                    message: 'Product Name is required'
                                },
                                stringLength: {
                                    min: 1,
                                    max: 250,
                                    message: 'Product Name must be more than 1 characters but less than 250 characters'
                                }
                            }
                        },
                        product_desc: {
                            row: '.col-sm-6',
                            validators: {
                                notEmpty: {
                                    message: 'Product Description is required'
                                },
                                stringLength: {
                                    min: 1,
                                    max: 500,
                                    message: 'Product Description must be more than 1 characters but less than 500 characters'
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

                    //abort any pending request
                    if (request) {
                        request.abort();
                    }

                    //Disable inputs for duration of AJAX request
                    var $inputs = $form.find("input");
                    $inputs.prop("disabled", true);
                    var $textAreas = $form.find("textarea");
                    $textAreas.prop("disabled", true);
                    
                    var selectedStatus = "";
                    var selected = $("input[name='product_status']:checked");
                    if (selected.length > 0) {
                        selectedStatus = selected.val();
                    } 

                    var url = APIPATH + 'product/add_product.php';
                    if (product_id !== undefined && product_id !== null && product_id > 0) {
                        url = APIPATH + 'product/update_product.php';
                    }
                    
                    //grab all form data  
                    var formData = new FormData();
                    formData.append('product_id', product_id);
                    formData.append('product_name', $form.find('input[name="product_name"]').val());
                    formData.append('product_number', $form.find('input[name="product_number"]').val());
                    formData.append('product_desc', $form.find('textarea[name="product_desc"]').val());
                    formData.append('product_status_id', selectedStatus);
                    formData.append('hidden_product_img', $form.find('input[name="hidden_product_img"]').val());
                    formData.append('product_image', $('input[type=file]')[0].files[0]);
                    formData.append('csrf_token', $('input[name="csrf_token"]').val());
                    formData.append('ajaxMode', "true");        

                    //Fire off the request
                    request = $.ajax({
                        url: url,
                        type: "POST",
                        data: formData,
                        async: false,
                        cache: false,
                        contentType: false,
                        processData: false
                    }).done(function (result, textStatus, jqXHR) {
                        var resultJSON = processJSONResult(result);

                        if (resultJSON['errors'] && resultJSON['errors'] > 0){
                            //something did not work out
                            
                        } else {
                            location.href = "product_list.php";                          
                        }
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        alertWidget('display-alerts');
                        
                        // log the error to the console
                        console.error(
                            "The following error occured: " +
                            textStatus, errorThrown
                        );
                    }).always(function () {

                        // reenable the inputs
                        //$inputs.prop("disabled", false);
                        var elems = $('input:disabled:not(".dyn-item")');
                        elems.prop("disabled", false);
                        elems = $('textarea:disabled');
                        elems.prop("disabled", false);
                        elems = $('button:disabled');
                        elems.prop("disabled", false);                            
                        $('button.disabled').removeClass("disabled");
                        
                        alertWidget('display-alerts');
                    });                        
                }).on('err.form.fv', function(e) {
                    //nothing yet
                });                  
        </script>    
    </body>
</html>
