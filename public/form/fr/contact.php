<?php
if(isset($_POST['mail'])) {
 
    $email_to = "jerome@tremenz.com";
    $email_subject = "Demande d'informations";
 
    function died($error) {
        echo "Nous sommes d&eacute;sol&eacute;s, mais il semble y avoir une ou des erreurs dans le formulaire.<br><br>";
        echo $error."<br><br>";
        echo "Veuillez r&eacute;viser le formulaire. Merci!.<br><br>";
        die();
    }
 
    if (!isset($_POST['name']) ||
        !isset($_POST['mail']) ||
        !isset($_POST['body'])) {
        died('Nous sommes d&eacute;sol&eacute;s, mais il semble y avoir un probl&egrave;me avec le formulaire envoy&eacute;.');       
    }
 
    $name = $_POST['name']; // required
    $mail = $_POST['mail']; // required
    $body = $_POST['body']; // required
 
    $error_message = "";
    $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
	
  if(!preg_match($email_exp,$mail)) {
    $error_message .= 'Cette adresse courriel ne semble pas &ecirc;tre valide.<br>';
  }
 
    $string_exp = "/^[A-Za-z .'-]+$/";
 
  if(!preg_match($string_exp,$name)) {
    $error_message .= 'Le nom ne semble pas &ecirc;tre valide.<br>';
  }
 
  if(strlen($body) < 2) {
    $error_message .= 'Le message r&eacute;dig&eacute; ne semble pas &ecirc;tre valide.<br>';
  }
 
  if(strlen($error_message) > 0) {
    died($error_message);
  }
 
    $email_message = "D&eacute;tails du formulaire ci-dessous.\n\n";
     
    function clean_string($string) {
      $bad = array("content-type","bcc:","to:","cc:","href");
      return str_replace($bad,"",$string);
    }
 
    $email_message .= "Nom: ".clean_string($name)."\n";
    $email_message .= "Courriel: ".clean_string($mail)."\n";
    $email_message .= "Message: ".clean_string($body)."\n";
 
$headers = 'From: '.$mail."\r\n".
'Reply-To: '.$mail."\r\n" .
'X-Mailer: PHP/' . phpversion();
@mail($email_to, $email_subject, $email_message, $headers);  
?>
Merci de nous avoir contacter! Nous vous r&eacute;pondrons sous peu.
<?php
}
?>