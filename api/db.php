<?phpdefine("DBNAME", "demo");
function getDB() {	$dbhost="localhost";	$dbuser="root";	$dbpass="root";	$dbname=DBNAME;	$dbConnection = new PDO("mysql:host=$dbhost;dbname=$dbname;charset=utf8", $dbuser, $dbpass);    $dbConnection -> exec("SET CHARACTER SET utf8");		$dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);	return $dbConnection;}

?>