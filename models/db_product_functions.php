<?php

function dbFetchAllProductStatus(){
    try {
      global $db_table_prefix;
      
      $results = array();
      $db = pdoConnect();

      $query = "SELECT product_status_id, product_status FROM ".$db_table_prefix."product_status_dm";
      
      $stmt = $db->prepare($query);
      $stmt->execute();
 
      if (!($results = $stmt->fetchAll(PDO::FETCH_ASSOC))){
          addAlert("danger", "Product Status Listing Not Found");
          return false;
      }
    
      return $results;
      
    } catch (PDOException $e) {
      //addAlert("danger", "Oops, looks like our database encountered an error.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1062");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      //addAlert("danger", "Oops, looks like our server might have goofed.  If you're an admin, please check the PHP error logs.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1062");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    }
}

function dbInsertProduct($product){
    try {
        global $db_table_prefix;
        
        $sqlVars = array();
        $db = pdoConnect();
            
        $query = "INSERT INTO ".$db_table_prefix."product (
            product_number,
            product_name,
            product_img,
            product_status_id
            )
            VALUES (
            :product_number,
            :product_name,
            :product_img,
            :product_status_id
            )";
    
        $sqlVars = array(
            ':product_number' => $product->product_number,
            ':product_name' => $product->product_name,
            ':product_img' => $product->product_img,
            ':product_status_id' => $product->product_status_id
        );  
    
        $stmt = $db->prepare($query);
    
        if (!$stmt->execute($sqlVars)){
            return false;
        }
        
        $inserted_id = $db->lastInsertId();
    
        return $inserted_id;

    } catch (PDOException $e) {
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1063");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1063");
      return false;
    }
}

function dbUpdateProduct($product) {
    try {
        global $db_table_prefix;

        $sqlVars = array();
        $db = pdoConnect();
            
        $query = "UPDATE ".$db_table_prefix."product SET
            product_number = :product_number,
            product_name = :product_name,
            product_img = :product_img,
            product_status_id = :product_status_id
            WHERE product_id = :product_id";
        
        $sqlVars = array(
            ':product_number' => $product->product_number,
            ':product_name' => $product->product_name,
            ':product_img' => $product->product_img,
            ':product_status_id' => $product->product_status_id,
            ':product_id' => $product->product_id
        );   
          
        $stmt = $db->prepare($query);
    
        if (!$stmt->execute($sqlVars)){
            // Error: column does not exist
            return false;
        }
        
        return true;

    } catch (PDOException $e) {
      //addAlert("danger", "Oops, looks like our database encountered an error.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1064");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      //addAlert("danger", "Oops, looks like our server might have goofed.  If you're an admin, please check the PHP error logs.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1064");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    }
}

function dbFetchProductById($user_id, $product_id){
    try {
      global $db_table_prefix;
      
      $results = array();
      $sqlVars = array();
      $db = pdoConnect();
      
      //we can check validity of user to product if we choose later on
      $query = "SELECT product_id, product_number, product_name, product_img, product_status_id FROM ".$db_table_prefix."product "
              . "WHERE product_id = :product_id LIMIT 1";
      
        $sqlVars = array(
            ':product_id' => $product_id
        );         
      
      $stmt = $db->prepare($query);
      if (!$stmt->execute($sqlVars)){
          // Error Code:  column does not exist
          return false;
      }
 
      if (!($results = $stmt->fetchAll(PDO::FETCH_CLASS, "Product"))){
          addAlert("danger", "Product Not Found");
          return false;
      }
      
      return $results[0];
      
    } catch (PDOException $e) {
      //addAlert("danger", "Oops, looks like our database encountered an error.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1065");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      //addAlert("danger", "Oops, looks like our server might have goofed.  If you're an admin, please check the PHP error logs.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1065");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    }
}

function dbFetchAllProducts(){
    try {
      global $db_table_prefix;
      
      $results = array();
      $db = pdoConnect();

      //TODO: need to fetch products by company id - this will work just as an example - will also need user id
      //currently excluding deleted products
      $query = "SELECT p.product_id, 
                       p.product_number, 
                       p.product_name, 
                       p.product_img, 
                       s.product_status
                       FROM ".$db_table_prefix."product p 
                       JOIN ".$db_table_prefix."product_status_dm s
                         ON s.product_status_id = p.product_status_id
                       WHERE p.product_status_id <> 3";
            
      $stmt = $db->prepare($query);
      $stmt->execute();
 
      if (!($results = $stmt->fetchAll(PDO::FETCH_CLASS, "Product"))){
          addAlert("danger", "Products Not Found");
          return false;
      }
      
      return $results;
      
    } catch (PDOException $e) {
      //addAlert("danger", "Oops, looks like our database encountered an error.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1066");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      //addAlert("danger", "Oops, looks like our server might have goofed.  If you're an admin, please check the PHP error logs.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1066");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    }
}

function dbDeleteProduct($product_id) {
    try {
        global $db_table_prefix;

        $results = array();
        $sqlVars = array();
        $db = pdoConnect();
        
        $query = "SELECT product_status_id FROM ".$db_table_prefix."product_status_dm WHERE product_status LIKE '%delete%' LIMIT 1'";
      
        $stmt = $db->prepare($query);
        $stmt->execute();
 
        if (!($results = $stmt->fetch(PDO::FETCH_ASSOC))){
            addAlert("danger", "Unable to delete product.");
            return false;
        }
      
        if($results == null){
            addAlert("danger", "Unable to delete product.");
            return false;            
        }
        
        $delete_status_id = $results["product_status_id"];
        
        $stmt = null;        
        $results = array();
        
        $query = "UPDATE ".$db_table_prefix."product SET
            product_status_id = :product_status_id
            WHERE product_id = :product_id";
        
        $sqlVars = array(
            ':product_status_id' => $delete_status_id,
            ':product_id' => $product_id
        );   
          
        $stmt = $db->prepare($query);
    
        if (!$stmt->execute($sqlVars)){
            // Error: column does not exist
            return false;
        }
    
        return true;

    } catch (PDOException $e) {
      //addAlert("danger", "Oops, looks like our database encountered an error.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1067");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      //addAlert("danger", "Oops, looks like our server might have goofed.  If you're an admin, please check the PHP error logs.");
      addAlert("danger", "Oops, looks like we've encountered an error! Error Code: 1067");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    }
}

function dbFetchAllProductsTableByCompanyIdForUser($user_id, $company_id, $current, $rowCount, $where_input, $order_by, $limit_input, $paramArray) {
    try {
        global $db_table_prefix;
        
        $results = array();
        $query = null;
        
        $db = pdoConnect();
        
        if(PermissionValidators::isLoggedInUserInGroup(PermissionValidators::$group_admin)) {
            //super admin does not have to be associated to a company to see everything - but the interesting part would be the ability to
            //login as a certain user... need this functionality
            $query = "SELECT p.product_id, 
                             p.product_number, 
                             p.product_name, 
                             p.product_img, 
                             s.product_status
                             FROM ".$db_table_prefix."product p 
                             JOIN ".$db_table_prefix."product_status_dm s
                               ON s.product_status_id = p.product_status_id
                             WHERE p.product_status_id <> 3";
        } else {
            //right now the query is the same as the admin query above, will want to join on some sort of user to company assoc table
            $query = "SELECT p.product_id, 
                             p.product_number, 
                             p.product_name, 
                             p.product_img, 
                             s.product_status
                             FROM ".$db_table_prefix."product p 
                             JOIN ".$db_table_prefix."product_status_dm s
                               ON s.product_status_id = p.product_status_id
                             WHERE p.product_status_id <> 3";             
        }         
        
        $original_query = $query;
        
        if(!empty($where_input)){
            $query .= " AND ".$where_input;
        }
        
        if(!empty($order_by)){
            $query .= " ORDER BY ".$order_by;           
        }
        
        if(!empty($limit_input)){
            $query .= " LIMIT ".$limit_input;            
        }         
 
        $stmt = $db->prepare($query);
        
        if(PermissionValidators::isLoggedInUserInGroup(PermissionValidators::$group_admin)) {
            if(!$stmt->execute($paramArray)) {
                //Error 
                return $results_string = "{ \"current\": 1, \"rowCount\":0, \"rows\": [], \"total\": 0 }";
            }             
        } else {
            //$paramArray[":user_id"] = $user_id; -- once we have a user assoc table, we will need this
            if(!$stmt->execute($paramArray)) {
                //Error 
                return $results_string = "{ \"current\": 1, \"rowCount\":0, \"rows\": [], \"total\": 0 }";
            }            
        }
        
        $results=$stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $stmt = null;
        
        if(!empty($where_input)){
            $original_query .= " AND ".$where_input;
        }       
        
        $stmt = $db->prepare($original_query);
        
        if(PermissionValidators::isLoggedInUserInGroup(PermissionValidators::$group_admin)) {
            if(!$stmt->execute($paramArray)) {
                //Error 
            }             
        } else {
            //$paramArray[":user_id"] = $user_id; -- once we have a user assoc table, we will need this
            if(!$stmt->execute($paramArray)) {
                //Error
            }            
        }

        $count_results=$stmt->fetchAll(PDO::FETCH_ASSOC);        
        $nRows = sizeof($count_results); //have to run the second query because we limit the results on the original query
        
        $json=json_encode($results);
        
        $stmt = null;

      //not sure how I feel about returning JSON here, but it works
      $results_string = "{ \"current\": $current, \"rowCount\":$rowCount, \"rows\": ".$json.", \"total\": $nRows }";

      return $results_string;
      
    } catch (PDOException $e) {
      //addAlert("danger", "Oops, looks like our database encountered an error.");
      addAlert("danger", "Database error occured: 1068");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    } catch (ErrorException $e) {
      //addAlert("danger", "Oops, looks like our server might have goofed.  If you're an admin, please check the PHP error logs.");
      addAlert("danger", "Database error occured: 1068");
      error_log("Error in " . $e->getFile() . " on line " . $e->getLine() . ": " . $e->getMessage());
      return false;
    }
}