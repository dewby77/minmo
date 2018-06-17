<?php
require_once("../../models/config.php");

if($loggedInUser == null) {
    header("Location: ../../404.php");
    exit();    
}

if (!securePage(__FILE__)) {
    // Forward to index page
    addAlert("danger", "Whoops, looks like you don't have permission to view that page.");
    header("Location: ../../404.php");
    exit();
}

setReferralPage(getAbsoluteDocumentPath(__FILE__));
?>

<!DOCTYPE html>
<html lang="en">
    <?php
        echo renderTemplate("head.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
    ?>

    <body>

        <?php
            echo renderLoggedInMenu("dashboard");
        ?>

        <div class="container">
            <ul class="breadcrumb">
                <li><a href="../../index.php" class="btn btn-primary">Dashboard</a></li>
                <li class="active">Product List</li>
            </ul>
            <h1>Product Listing</h1>
            
            <div id='display-alerts' class="col-lg-12">
            </div> 
            
            <div class="row">
                <a href="product.php" class="btn btn-primary pull-right" name="AddNew">Add New</a>
            </div>
            <div class="scrollable">
                <!--define the table using the proper table tags, leaving the tbody tag empty -->
               <table id="grid-data" class="table table-condensed table-hover table-striped" data-toggle="bootgrid" data-ajax="true" style="min-width:450px">
                   <thead>
                       <tr>
                           <th data-column-id="product_id" data-type="numeric" data-header-css-class="col-sm-1" data-identifier="true" data-visible="false">ID</th>
                           <th data-column-id="product_name" data-formatter="link">Product Name</th>
                           <th data-column-id="product_number">Product Number</th>
                           <th data-column-id="product_img">Product Img</th>
                           <th data-column-id="product_status">Product Status</th>
                           <th data-column-id="commands" data-header-css-class="col-md-2" data-formatter="commands" data-sortable="false"></th>
                       </tr>
                   </thead>
               </table>                 
            </div> 
        </div>
    </body>
    <div class="modal fade" id="confirm-delete" tabindex="-1" role="dialog" aria-labelledby="confirmDeleteModal" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Delete</h3>
                </div>
                <div class="modal-body" id="modal-body">
                </div>
                <div class="modal-footer">
                    <button type="button" id="delete" class="btn btn-danger btn-ok">Delete</button>
                    <button type="button" class="btn btn-custom" data-dismiss="modal">Cancel</button>                
                </div>
                <input id="delProdId" type="hidden" name="delProdId" value="">
                <input type="hidden" id="csrf_token" name="csrf_token" value="<?php echo $loggedInUser->csrf_token; ?>" />
            </div>
        </div>
    </div>
    <?php
    echo renderTemplate("footer.html", array("#SITE_ROOT#" => SITE_ROOT, "#SITE_TITLE#" => SITE_TITLE));
    ?>

    <script>
        $(document).ready(function () {
            var grid = $("#grid-data").bootgrid(
            {
                url: APIPATH + "product/load_products_table.php",
                requestHandler: function (request) {
                                    request.csrf_token = "<?php echo $loggedInUser->csrf_token; ?>";
                                    return request;
                                },
                caseSensitive: false, /* make search case insensitive */
                searchSettings: {
                    delay: 200,
                    characters: 1
                },
                formatters: {
                    "commands": function (column, row)
                    {
                        return "<button type=\"button\" title=\"Select\" class=\"btn btn-xs btn-default command-select\" data-row-id=\"" + row.product_id + "\"><span class=\"fa fa-home\"></span></button> " +
                                "<button type=\"button\" title=\"Edit\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"" + row.product_id + "\"><span class=\"fa fa-pencil\"></span></button> " +
                                "<button type=\"button\" title=\"Delete\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.product_id + "\" data-row-name=\"" + row.product_name + "\"  data-target=\"#confirm-delete\"><span class=\"fa fa-trash-o\"></span></button>";
                    },
                    "link": function (column, row) {
                        return "<a href=\"product.php?product_id=" + row.product_id + "\">" + row.product_name + "</a>";
                    }
                }
            }).on("loaded.rs.jquery.bootgrid", function ()
            {
                /* Executes after data is loaded and rendered */
                grid.find(".command-select").on("click", function (e)
                {
                    //there is really no difference between edit or select at this point - we could make it view only on select
                    var hrefString = "product.php?product_id=" + $(this).data("row-id");
                    location.href = hrefString;
                }).end().find(".command-edit").on("click", function (e)
                {
                    var hrefString = "product.php?product_id=" + $(this).data("row-id");
                    location.href = hrefString;
                }).end().find(".command-delete").on("click", function (e)
                {
                    var product_id = $(this).data('row-id');
                    var product_name = $(this).data('row-name');
                    
                    var confirmDelete = document.createElement('p');
                    confirmDelete.innerHTML = "You are about to delete '" + product_name + "'. Press Delete to confirm.";
                    document.getElementById('modal-body').appendChild(confirmDelete);
                    
                    $("#delProdId").val(product_id);
                    
                    $('#confirm-delete').modal('show');

                    $('#delete').click(function () {
                        var request;

                        //abort any pending request
                        if (request) {
                            request.abort();
                        }

                        var url = APIPATH + 'product/delete_product.php';
                        var product_id = $("#delProdId").val();

                        //Fire off the request
                        request = $.ajax({
                            url: url,
                            type: "POST",
                            data: {product_id: product_id, csrf_token: $('input[name="csrf_token"]').val(), ajaxMode: "true"}
                        }).done(function (result, textStatus, jqXHR) {
                            //var resultJSON = processJSONResult(result);
                            // Render alerts
                            alertWidget('display-alerts');
                            location.href = "product_list.php";
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            // log the error to the console
                            console.error(
                                "The following error occured: " + textStatus, errorThrown
                            );
                        });
                        $('#confirm-delete').modal('hide');
                    });
                });
            });

            scrollTable();
            
            alertWidget('display-alerts');
        });
        
        //determine what the minimum size for the table should be before scrolling if window is resized
        $(window).resize( function(){
            scrollTable(".scrollable",465);
        });
    </script>
</body>
</html>
