<?php

require_once('../../models/config.php');

set_error_handler('logAllErrors');
$ajax = true;

// User must be logged in
apiSecurityCheck();

// GET Parameters
$validator = new Validator();

$search_phrase = $validator->optionalPostVar('searchPhrase');
$row_count = $validator->optionalPostVar('rowCount');
$current_request = $validator->optionalPostVar('current');
$company_id = isset($_GET["company_id"]) ? $_GET["company_id"] : 0;

if(!is_int(intval($company_id))) {
  addAlert("danger", "Unable to complete the request!  Invalid Parameters.");    
}

// Add alerts for any failed input validation
foreach ($validator->errors as $error){
  addAlert("danger", $error);
}

if (count($validator->errors) > 0){
    apiReturnError($ajax, getReferralPage());
}

//$where="company_id = ".$company_id; -- right now there is a where clause on the query I'm calling
$where="";
$order_by="p.product_name";
$rows=25;
$current=1;
$limit_l=($current * $rows) - ($rows);
$limit_h=$limit_l + $rows ;

//these are the only columns that the user should be sorting or searching on
$validCols = array("product_number", "product_name", "product_img", "product_status");
$validSort = array("asc", "desc");

//Handles Sort querystring sent from Bootgrid
if (isset($_REQUEST['sort']) && is_array($_REQUEST['sort']) )
{
    $order_by="";
    foreach($_REQUEST['sort'] as $key=> $value) {
        if (in_array($key, $validCols)) {
            if(in_array($value, $validSort)){
                //we have passed the injection tests by controlling the values in $key and $value
                
                //since there is a joiner on the table, have to be aware of alias - kind of sucks but works
                if($key == "product_status"){
                    $key = "s.".$key;
                } else {
                    $key = "p.".$key;
                }                 
                
                $order_by.=" $key $value";
            }
        } 
    }   
}

//Handles search querystring sent from Bootgrid
$paramArray = []; 
if (isset($_REQUEST['searchPhrase']) )
{
    //probably redundant trim - review later
    $search=trim($search_phrase);
    if(strlen($search) > 0) {
        $where .= " AND (p.product_number LIKE :search_one OR p.product_name LIKE :search_two OR p.product_img LIKE :search_three OR s.product_status LIKE :search_four) ";

        $paramArray = array(
            ":search_one" => "%".$search."%",
            ":search_two" => "%".$search."%",
            ":search_three" => "%".$search."%",
            ":search_four" => "%".$search."%"
        );
    }
}

//Handles determines where in the paging count this result set falls in
if (isset($_REQUEST['rowCount']) )
    $rows = $row_count;

//calculate the low and high limits for the SQL LIMIT x,y clause
if (isset($_REQUEST['current']) )
{
    $current = $current_request;
    $limit_l=($current * $rows) - ($rows);
    $limit_h=$rows ;
}

if ($rows==-1){
    $limit=""; //no limit
}
else{
    $limit = "$limit_l, $limit_h";
}

//company id set on where statement each time - will eventually pass in the user to ensure there is no tampering with company id: $loggedInUser->user_id
//and the specific user could have their own set of products so we probably need their id
if (!$results = fetchAllProductsTableByCompanyIdForUser($loggedInUser->user_id, $company_id, $current, $rows, $where, $order_by, $limit, $paramArray)) {
    //there could legitimately be no records...
}

restore_error_handler();
header('Content-Type: application/json'); //tell the broswer JSON is coming

echo $results;
?>