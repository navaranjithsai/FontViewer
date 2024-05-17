<?php
if (isset($_GET['url'])) {
    $url = $_GET['url'];

    // Ensure the URL is properly encoded
    $url = filter_var($url, FILTER_SANITIZE_URL);

    // Use cURL to fetch the file
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL certificate verification

    $file = curl_exec($ch);

    if ($file === false) {
        $error = curl_error($ch);
        header("HTTP/1.1 500 Internal Server Error");
        echo "Failed to fetch the file. cURL Error: " . $error;
        curl_close($ch);
        exit();
    }

    curl_close($ch);

    // Detect the MIME type of the file
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->buffer($file);

    // Set appropriate headers and output the file contents
    header('Content-Type: ' . $mimeType);
    echo $file;
} else {
    header("HTTP/1.1 400 Bad Request");
    echo "No URL provided.";
}
