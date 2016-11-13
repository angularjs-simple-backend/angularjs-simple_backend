<?php
require_once ('db.php');

session_start();
require 'Slim/Slim.php';
$app = new Slim();
$app->post('/login', 'login');
$app->post('/logout', 'logout');
$app->post('/updateGeneral/:tablename', 'updateGeneral');
$app->post('/insertGeneral/:tablename', 'insertGeneral');
$app->get('/listGeneral', 'listGeneral');
$app->get('/getListLinkTable/:tablename', 'getListLinkTable');
$app->get('/searchGeneral', 'searchGeneral');
$app->post('/deleteGeneral/:tablename', 'deleteGeneral');
$app->get('/getTable', 'getTable');
$app->get('/getMenuItem', 'getMenuItem');
$app->get('/getColumn/:tablename', 'getColumn');
$app->post('/saveTable', 'saveTable');
$app->post('/saveColumn/:tablename', 'saveColumn');


$app->run();
global $uploaddir;






function getConnection() {

	return getDB();
}






function updateGeneral($tablename) {
	checkAuthentication();
	$data = json_decode(file_get_contents('php://input')); // should change to proper way in slim request
	
	
	
	try {
		 if (!is_null($data))
	{
		$item= $data->params->item;
		
		
			if (is_object($item))
			{
				
				$keyfield = getkeyfield($tablename); 
				if (!is_null($keyfield)){
					$primary_key=$item->{$keyfield};
					$set=array();
					foreach ($item as $key => $value) {
						 if ($key!=$keyfield)
							array_push($set,"`$key` = :$key");
						}
					
					$setstringstr = implode (",", $set);
					$sql = "UPDATE $tablename SET $setstringstr WHERE  `$keyfield`= :primary_key";
					$db = getConnection();
					$stmt = $db->prepare($sql); 
					$stmt->bindParam("primary_key", $primary_key);					
					foreach ($item as $key => &$value) {
						  if ($key!=$keyfield)
							$stmt->bindParam($key, $value);	
								}
					
					//$stmt->debugDumpParams();
					$stmt->execute();
					$db = null;
					EvenLog("Update","Update successfully", $sql);
					echo "updated";	
				}
			}
	}
			
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
		EvenLog("Update","Update unsuccessfully", $e->getMessage());
	}
}
function insertGeneral($tablename) {
	checkAuthentication();
$data = json_decode(file_get_contents('php://input')); // should change to proper way in slim request
	
	
	
	try {
		 if (!is_null($data))
	{
		$item= $data->params->item;
		
		
			if (is_object($item))
			{
				
				$keyfield = getkeyfield($tablename); 
				
					
					$fields=array();
					$values=array();
					foreach ($item as $key => $value) {
							 if ($key!=$keyfield)
							 {
								array_push($fields,"`$key`");
								array_push($values,":$key");
							 }
						}
					
					$str_fields = implode (",", $fields);
					$str_values = implode (",", $values);
					
					$sql = "INSERT INTO $tablename ($str_fields) VALUES ($str_values)";
					$db = getConnection();
					$stmt = $db->prepare($sql); 
										
					foreach ($item as $key => &$value) {
						  if ($key!=$keyfield)
							$stmt->bindParam($key, $value);	
								}
					
					//$stmt->debugDumpParams();
					$stmt->execute();
					$db = null;
					EvenLog("Insert","Insert successfully",$data);
					echo "inserted";	
				
			}
	}
			
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
		EvenLog("Insert","Insert unsuccessfully", $e->getMessage());
	}
}	

function deleteGeneral($tablename) {
	checkAuthentication();
	//$request = $_REQUEST;
	$data = json_decode(file_get_contents('php://input')); // should change to proper way in slim request

	


	try {
		 if (!is_null($data))
	{
		$items= $data->params->itemids;
		
		
			if (is_array($items))
			{
				
		
				
				$keyfield = getkeyfield($tablename); 
				$qMarks = str_repeat('?,', count($items) - 1) . '?';
				$sql = "DELETE FROM `".$tablename."` WHERE ".$keyfield." IN($qMarks)";
				$db = getConnection();
				$stmt = $db->prepare($sql);  
				//$stmt->bindParam('i', $id);
				$stmt->execute($items);
				$db = null;
				echo "Deleted";	
				EvenLog("Delete","Delete successfully",$data);		
			}
	}
			
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
		EvenLog("Delete","Delete unsuccessfully",$e->getMessage(),"E");	
	}
}

function listGeneral(){
	checkAuthentication();

	$request = $_REQUEST;
	$array= array();
		try {
				
	$tablename = isset($request["table"])?$request["table"]:"";
	$pagesize = isset($request["pagesize"])?(int)$request["pagesize"]:100;
	$pageno = isset($request["pageno"])?(int)$request["pageno"]:0;
	$sort=  isset($request["sort"])?json_decode(urldecode($request["sort"])):null;
	if ($tablename)
	{
		$key=getkeyfield($tablename);
		$sortfield=$key;
		$sortdirection="DESC";
		if ($sort){
			$sortfield= isset($sort->field)?$sort->field:$key;
			$sortdirection=isset($sort->asc)?(($sort->field)?"ASC":"DESC"):"DESC";
		}
		
	$offset = $pageno*$pagesize;
	$sql = "SELECT * FROM `$tablename` ORDER BY $sortfield $sortdirection LIMIT $pagesize  OFFSET $offset";
	
$db = getConnection();
		$stmt = $db->query($sql);  
		$data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;

			echo json_encode(array('success' => true,'data' => $data,'propeties'=>get_columns_propeties($tablename),'sort'=>$sort,'key'=>$key,'row_count'=>get_total_rows($tablename)));
		 
	}
	else
	{
		echo json_encode(array('success' => false,'data' =>null));
	}
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getmessage() .'}}'; 
	}
}

function getListLinkTable($tablename){
	checkAuthentication();

	$request = $_REQUEST;
	$array= array();
		try {
   $display = isset($request["display"])?$request["display"]:"";
	if ($tablename)
	{
	$field="*";
	$keyfield = getkeyfield($tablename);
	if ($keyfield & $display)
	$field= $keyfield." as id , ".$display ." as name";
		
	
	$sql = "SELECT $field FROM `$tablename` ";

		$db = getConnection();
		$stmt = $db->query($sql);  
		$data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;

		echo json_encode(array('success' => true,'data' => $data,'key'=>getkeyfield($tablename)));
		 
	}
	else
	{
		echo json_encode(array('success' => false,'data' =>null));
	}
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getmessage() .'}}'; 
	}
}


function searchGeneral(){
	$request = $_REQUEST;
	$array= array();
		try {
	$tablename = isset($request["table"])?$request["table"]:"";
	$pagesize = isset($request["pagesize"])?(int)$request["pagesize"]:100;
	$pageno = isset($request["pageno"])?(int)$request["pageno"]:0;
	$keyword = isset($request["keyword"])?strtolower($request["keyword"]):"";
	$searchby = isset($request["searchby"])?json_decode($request["searchby"]):[];

    
	if ($tablename && ($keyword !="") && ($searchby) )
	{
		for($i=0;$i<count($searchby);$i++) {
			 $searchby[$i]="LOWER(".$searchby[$i].") LIKE CONCAT('%', :keyword, '%')";
       }
	$where = implode (" OR ", $searchby);
	
	$sql = "SELECT * FROM `$tablename` WHERE $where LIMIT $pagesize  OFFSET $pageno";

   	$db = getConnection();
	$stmt = $db->prepare($sql); 
		$stmt->bindParam('keyword', $keyword);
		$stmt->execute();
		
		$data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode(array('success' => true,'data' => $data,'propeties'=>get_columns_propeties($tablename),'key'=>getkeyfield($tablename),'row_count'=>get_total_rows_search($tablename,$where,$keyword)));
		 
	}
	else
	{
		echo json_encode(array('success' => false,'data' =>null));
	}
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getmessage() .'}}'; 
	}
}

function get_string_between_2string($string,$start,$finish)
{	

 $string = " ".$string;
    $position = strpos($string, $start);
    if ($position == 0) return "";
    $position += strlen($start);
    $length = strpos($string, $finish, $position) - $position;
    return substr($string, $position, $length);
		
}
function getJsonComment($string)
{
	$start="{#define#}";
	$finish="{/#define#}";
 return get_string_between_2string($string,$start,$finish);
	
}
function get_create_table($tablename)
{
	$sql= "SHOW CREATE TABLE `$tablename`";
		$db = getConnection();
		$stmt = $db->query($sql);  
		$stmt->execute();
		$res = $stmt->fetch(PDO::FETCH_OBJ);
		$db = null;
		if ($res)
		{
			
		return $res->{"Create Table"};
		}
		else
		{
		return "";	
			
		}
	
}
function str_replace_first($search, $replace, $subject) {
    $pos = strpos($subject, $search);
    if ($pos !== false) {
        return substr_replace($subject, $replace, $pos, strlen($search));
    }
    return $subject;
}
function get_edit_comment_column_sql($tablename,$colunm)
	{
		$thedata=get_create_table($tablename);	
		$thedata=str_replace_first("`" . $tablename . "`","",$thedata);  // in case if a field have same name as table
		
		$columnname = "`" . $colunm . "`";
		$start = strpos($thedata, $columnname);
		$thedata= substr($thedata, $start);
		
		$comapos= strpos($thedata, ',');
		$commentpos= strpos($thedata, 'COMMENT');
		$newpos=  min($comapos, $commentpos);
		$thedata= substr($thedata,0, $newpos);
		return  $thedata;
		
	}


function save_columns_propeties($tablename,$columnname,$value)
{
	$field= get_edit_comment_column_sql($tablename,$columnname);
	
	$value="{#define#}".json_encode($value)."{/#define#}";
	
		try{
	   $sql= "ALTER TABLE `$tablename` CHANGE `$columnname` $field COMMENT '$value'";

		$db = getConnection();
		$stmt = $db->prepare($sql);
		//$stmt->bindParam('tablename', $tablename);
		$stmt->bindParam('value', $value);
		$stmt->execute();
		$db = null;

				
	}
catch(PDOException $e) { echo $field;}
	
	

}
function save_table_propeties($tablename,$objectvalue)
{
$value="{#define#}".json_encode($objectvalue)."{/#define#}";
	
		try{
	    $sql= "ALTER TABLE `$tablename` COMMENT = :value";
		$db = getConnection();
		$stmt = $db->prepare($sql);
		//$stmt->bindParam('tablename', $tablename);
		$stmt->bindParam('value', $value);
		$stmt->execute();
		$db = null;
	   //echo "saved";
				
	}
catch(PDOException $e) { echo $e->getmessage();}
	
}
function get_columns_propeties($tablename)
{
	try{
		 $database=DBNAME;// get this from config
		
	$sql= "SELECT COLUMN_NAME as name, COLUMN_COMMENT as value FROM information_schema.COLUMNS WHERE  TABLE_NAME='$tablename' AND TABLE_SCHEMA='$database'";

		$db = getConnection();
		$stmt = $db->query($sql);  
		$stmt->execute();
		$items = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
	
		if ($items)
		{
			foreach ($items as $row)
				{
					
				$row->value = json_decode(getJsonComment($row->value));	
				}
		
		return $items;	
		}
		else
		{
			return null;
		}
			
				
	}
catch(PDOException $e) { }
}




function trygetkey_methord1($tablename){
	try{
	$sql= "SHOW KEYS FROM `".$tablename."` WHERE Key_name = 'PRIMARY' OR Non_unique = 0";
		$db = getConnection();
		$stmt = $db->query($sql);  
		$stmt->execute();
		$res = $stmt->fetchObject();
		$db = null;
		if($res)
		return $res->Column_name;
		else
		return null;	
				
	}
catch(PDOException $e) { }
}
function getkeyfield($tablename){
try{
$sql= "SELECT column_name FROM   information_schema.key_column_usage WHERE  table_schema = schema() AND    constraint_name = 'PRIMARY' AND    table_name = '$tablename'";
        $db = getConnection();
		$stmt = $db->query($sql);  
		$stmt->execute();
		$res = $stmt->fetchObject();
		$db = null;
		if($res)
		return $res->column_name;
		else
		return trygetkey_methord1($tablename);	
		
}
catch(PDOException $e) {}

}



function login() 
{
	try
	{
		
	
	$data = json_decode(file_get_contents('php://input')); // should change to proper way in slim request
	if (!is_null($data))
	{
	
				$username = $data->username;
				$password = $data->password;
				
				   $sql = "SELECT username, password,`group`.name as group_name FROM user INNER JOIN `group` ON user.group_id=`group`.id WHERE username = :username";
					$db = getConnection();
					$stmt = $db->prepare($sql);  
					$stmt->bindParam(":username", $username);
					$stmt->execute();
					$res = $stmt->fetchObject();
					$db = null;
					
					if($res)
					{
						$password_hash_output = $res->password;
						if((hash_equals($password_hash_output, crypt($password, $password_hash_output))))
						{
						echo json_encode(array('success' => true,'data' =>$username));
						$_SESSION['username'] = $username;
						$_SESSION['group_name'] = $res->group_name;	
						EvenLog("Login","User login successfully");						
						}
						else
						{
						echo json_encode(array('success' => false,'data' =>null));	
						}
					}
					else
					{
					echo json_encode(array('success' => false,'data' =>null));
					}
	}
	}catch(PDOException $e) {
		
		error_log($e->getMessage());
	}
	
}

function logout() {
		unset($_SESSION['username']);
		echo json_encode(array('success' => true,'data' =>"logged out"));
	
}


function checkAuthentication()
{
if(!isset($_SESSION['username']))
	{
	echo json_encode(array('success' => false,'data' =>"unauthenticated"));
	die;
	

} 

}


function get_total_rows($tablename)
{
	$sql= "SELECT COUNT(*) as row_count FROM  `$tablename`";
        $db = getConnection();
		$stmt = $db->query($sql);  
	
		$res = $stmt->fetchObject();
		$db = null;
		if($res)
		return $res->row_count;
		else
		return 0;
	
}
function get_total_rows_search($tablename,$where,$keyword)
{
	$sql = "SELECT  COUNT(*) as row_count FROM `$tablename` WHERE $where";

   	$db = getConnection();
	$stmt = $db->prepare($sql); 
		$stmt->bindParam('keyword', $keyword);
		$stmt->execute();
  
		$res = $stmt->fetchObject();
		$db = null;
		if($res)
		return $res->row_count;
		else
		return 0;
	
}

function EvenLog($name,$description,$debug=null,$type="I",$source=null,$user_name=null,$ip_address=null)
{
	$ip=empty($ip_address)? $_SERVER['REMOTE_ADDR']:$ip_address;
	$username=empty($user_name)? $_SESSION['username']:$user_name;
	$source=empty($source)?$_SERVER['REQUEST_URI']:$source;
	$debug=empty($debug)?null:json_encode($debug);
	
	try {
	    $tablename  ='event_log';

	
		$sql = "INSERT INTO $tablename (`name`,`description`,`type`,`source`,`user_name`,`ip_address`,`debug`) VALUES (:name,:description,:type,:source,:username,:ipaddress,:debug)";
		$db = getConnection();
		$stmt = $db->prepare($sql);
		$stmt->bindParam('name', $name);
		$stmt->bindParam('description', $description);
		$stmt->bindParam('type', $type);
		$stmt->bindParam('source', $source);
		$stmt->bindParam('username', $username);
		$stmt->bindParam('ipaddress', $ip);
		$stmt->bindParam('debug', $debug);
		$stmt->execute();
		$db = null;
	
	} catch(PDOException $e) {
		
		error_log($e->getMessage());
	}
}


function getGroupName()
{
	$sql = "SELECT name FROM `group`";
	try {

		$db = getDB();
		$stmt = $db->prepare($sql);
		$stmt->execute();
		$group = $stmt->fetchAll(PDO::FETCH_OBJ);
		return $group;
	} catch(PDOException $e) {
		return null;
	}
}
function getExtrasMenuItem()
{
	
	
	$obj= new stdClass();
	$obj->name="settings";
	$obj->value='{#define#}{"enable":true,"title":"Settings","icon":"fa-cog","link":"/tablesetting","group":{"Admin":true,"User":false}}{/#define#}';

	return $obj;
}


function getMenuItem()
{
	checkAuthentication();
	try{
		 $database=DBNAME;// get this from config
		
	$sql= "SELECT TABLE_NAME as name, TABLE_COMMENT as value FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$database'";
		$db = getConnection();

		$stmt = $db->query($sql);  
		$stmt->execute();
		$items = $stmt->fetchALL(PDO::FETCH_OBJ);
		$db = null;
		$group=getGroupName();
		$arrayreturn = array();
		
		if ($items)
		{
			
			array_push($items,getExtrasMenuItem());
		
			foreach ($items as $row)
				{
					
				$row->value   = json_decode(getJsonComment($row->value));
					if (!is_null($group))
					{
					
						if (isset($row->value->group->{$_SESSION['group_name']}))
							{
								if ($row->value->group->{$_SESSION['group_name']}==true)
								{
								array_push($arrayreturn, $row);
								 
								}
								
							}				
						
					}
					else
					{
						if (isset($row->value->enable))
						{
							if ($row->value->enable==true)
							{
								array_push($arrayreturn, $row);
							}
						}
						
					}
				}
				
		echo json_encode(array('success' => true,'data' => $arrayreturn,'group'=>$group));
		 
		}
		else
		{
			echo json_encode(array('success' => false,'data' =>null));
		}
		} catch(PDOException $e) {
			echo '{"error":{"text":'. $e->getmessage() .'}}'; 
		}
}
function getViews()
{
 $database=DBNAME;// get this from config
$sql= "SELECT TABLE_NAME as name FROM information_schema.`TABLES` WHERE TABLE_TYPE LIKE 'VIEW' AND TABLE_SCHEMA = '$database'";	
	try {
		$db = getDB();
		$stmt = $db->prepare($sql);
		$stmt->execute();
		$group = $stmt->fetchAll(PDO::FETCH_OBJ);
		return $group;
	} catch(PDOException $e) {
		return null;
	}
	
}
function getTable()
{
	checkAuthentication();
	try{
		 $database=DBNAME;// get this from config
		
	$sql= "SELECT TABLE_NAME as name, TABLE_COMMENT as value FROM information_schema.TABLES WHERE TABLE_TYPE NOT LIKE 'VIEW' AND TABLE_SCHEMA = '$database'";
		$db = getConnection();

		$stmt = $db->query($sql);  
		$stmt->execute();
		$items = $stmt->fetchALL(PDO::FETCH_OBJ);
		$db = null;
		$group=getGroupName();
		$views=getViews();
		if ($items)
		{
			foreach ($items as $row)
				{
					
				$row->value   = json_decode(getJsonComment($row->value));	
				}
		echo json_encode(array('success' => true,'data' => $items,'group'=>$group,'views'=>$views));
		 
		}
		else
		{
			echo json_encode(array('success' => false,'data' =>null));
		}
		} catch(PDOException $e) {
			echo '{"error":{"text":'. $e->getmessage() .'}}'; 
		}
}
function saveTable()
{
    checkAuthentication();
	$data = json_decode(file_get_contents('php://input'));
	if (!is_null($data))
	{
		$items= $data->params->object;
		if (is_array($items))
		{
			foreach ($items as $row)
				{
					if (is_object($row->value))
						{
							
							save_table_propeties($row->name,$row->value);
						}
						
						  
				}
			echo json_encode(array('success' => true,'data' =>null));	
		}
	}
}
function getColumn($tablename)
{
	checkAuthentication();
	echo json_encode(array('success' => true,'data' => get_columns_propeties($tablename)));
}

function saveColumn($tablename)
{
	checkAuthentication();
	$data = json_decode(file_get_contents('php://input'));

	if (!is_null($data))
	{
		$items= $data->params->object;
			if (is_array($items))
			{
			foreach ($items as $row)
				{
					if (is_object($row->value))
						{
							save_columns_propeties($tablename,$row->name,$row->value);
							
						}
						
						  
				}
			echo "saved";
		}
	}



}


?>